import { searchWeb, formatWebResultsForPrompt } from './web-search.ts';
import { runServerResearch, formatResearchForPrompt } from './research/orchestrator.ts';
import { executeTool } from './tools.ts';
import { fishingAssistantResponseSchema, TOOL_DEFINITIONS } from './schemas.ts';
import { SYSTEM_PROMPT, getModel } from './system-prompt.ts';

const MAX_TOOL_ROUNDS = 6;

export interface RunAssistantInput {
  message: string;
  language: string;
  location?: { latitude: number; longitude: number };
  spotId?: string;
  locationHint?: string;
}

export interface RunAssistantOutput {
  answer: string;
  structured?: ReturnType<typeof fishingAssistantResponseSchema.parse>;
  webSearchUsed: boolean;
}

async function callOpenAI(
  apiKey: string,
  instructions: string,
  input: unknown[],
): Promise<Record<string, unknown>> {
  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: getModel(),
      instructions,
      input,
      tools: TOOL_DEFINITIONS,
      tool_choice: 'auto',
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI error: ${res.status} ${errText}`);
  }

  return res.json();
}

function extractFunctionCalls(output: unknown[]): Array<{ name: string; args: Record<string, unknown>; callId: string }> {
  const calls: Array<{ name: string; args: Record<string, unknown>; callId: string }> = [];
  for (const item of output) {
    const o = item as Record<string, unknown>;
    if (o.type === 'function_call') {
      calls.push({
        name: o.name as string,
        callId: o.call_id as string,
        args: typeof o.arguments === 'string' ? JSON.parse(o.arguments as string) : (o.arguments as Record<string, unknown>),
      });
    }
  }
  return calls;
}

function extractTextOutput(output: unknown[]): string {
  for (const item of output) {
    const o = item as Record<string, unknown>;
    if (o.type === 'message') {
      const content = o.content as Array<{ type: string; text?: string }>;
      const textPart = content?.find((c) => c.type === 'output_text' || c.type === 'text');
      if (textPart?.text) return textPart.text;
    }
  }
  return '';
}

export async function runFishingAssistant(input: RunAssistantInput): Promise<RunAssistantOutput> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const langInstruction = input.language === 'he' ? 'Hebrew' : 'English';
  const instructions = `${SYSTEM_PROMPT}\n\nRespond in ${langInstruction}. For the final answer to the user, synthesize the BEST answer from all tool results. Cite web sources in the sources array.`;

  // Multi-source research before AI loop
  const research = await runServerResearch(
    input.message,
    input.language,
    input.locationHint,
  );
  let webSearchUsed = research.sources.length > 0 && !research.refused;

  const contextBlocks: string[] = [
    formatResearchForPrompt(research),
  ];

  if (input.location) {
    const nearby = await executeTool('get_nearby_spots', {
      latitude: input.location.latitude,
      longitude: input.location.longitude,
      radiusKm: 25,
    });
    contextBlocks.push(`=== DATABASE: NEARBY SPOTS ===\n${JSON.stringify(nearby)}`);
  }

  if (input.spotId) {
    const details = await executeTool('get_fishing_spot_details', { spotId: input.spotId });
    contextBlocks.push(`=== DATABASE: SPOT DETAILS ===\n${JSON.stringify(details)}`);
  }

  const conversationInput: unknown[] = [
    {
      role: 'user',
      content: `${input.message}\n\n--- RETRIEVED CONTEXT ---\n${contextBlocks.join('\n\n')}`,
    },
  ];

  let lastResponse: Record<string, unknown> = {};
  let rounds = 0;

  while (rounds < MAX_TOOL_ROUNDS) {
    rounds++;
    lastResponse = await callOpenAI(apiKey, instructions, conversationInput);
    const output = (lastResponse.output ?? []) as unknown[];
    const functionCalls = extractFunctionCalls(output);

    if (functionCalls.length === 0) break;

    conversationInput.push(...output);

    for (const call of functionCalls) {
      let result: unknown;

      if (call.name === 'search_web') {
        const web = await searchWeb(
          String(call.args.query ?? input.message),
          String(call.args.language ?? input.language),
          { locationHint: call.args.locationHint as string | undefined },
        );
        webSearchUsed = true;
        result = web;
      } else {
        result = await executeTool(call.name, call.args);
      }

      conversationInput.push({
        type: 'function_call_output',
        call_id: call.callId,
        output: JSON.stringify(result),
      });
    }
  }

  // Final structured response pass
  const finalRes = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: getModel(),
      instructions: `${instructions}\n\nReturn ONLY valid JSON matching the fishing assistant schema. Base your answer primarily on web search results and database context. Label confidence honestly.`,
      input: [
        ...conversationInput,
        {
          role: 'user',
          content:
            'Now produce the final JSON response for the user. Include sources from web search URLs where used. Never claim web info is verified unless from our database.',
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'fishing_assistant_response',
          schema: {
            type: 'object',
            properties: {
              answer: { type: 'string' },
              confidence: { type: 'string', enum: ['verified', 'high', 'medium', 'low'] },
              possibleSpecies: { type: 'array', items: { type: 'object' } },
              hazards: { type: 'array', items: { type: 'string' } },
              regulations: { type: 'array', items: { type: 'string' } },
              followUpQuestions: { type: 'array', items: { type: 'string' } },
              sources: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    authority: { type: 'string' },
                    url: { type: 'string' },
                    checkedAt: { type: 'string' },
                  },
                  required: ['title'],
                },
              },
              freshnessMessage: { type: 'string' },
            },
            required: ['answer', 'confidence', 'possibleSpecies', 'hazards', 'regulations', 'followUpQuestions', 'sources'],
            additionalProperties: true,
          },
        },
      },
    }),
  });

  const finalJson = await finalRes.json();
  let structured;
  let answerText = extractTextOutput((lastResponse.output ?? []) as unknown[]);

  try {
    const outputText =
      finalJson.output?.[0]?.content?.[0]?.text ??
      finalJson.output_text ??
      '';
    structured = fishingAssistantResponseSchema.parse(JSON.parse(outputText));
    answerText = structured.answer;
  } catch {
    if (!answerText) {
      answerText = 'I searched the web but could not format a complete answer. Please try rephrasing your question.';
    }
    structured = {
      answer: answerText,
      possibleSpecies: [],
      hazards: [],
      regulations: ['Regulations may change. Confirm with the relevant local authority before fishing.'],
      followUpQuestions: [],
      sources: research.sources.slice(0, 6).map((r) => ({
        title: r.title,
        url: r.url,
        authority: `${r.sourceType} (${r.domain})`,
        checkedAt: research.lastVerifiedAt,
      })),
      confidence: research.confidence === 'high' ? 'high' as const : research.confidence === 'medium' ? 'medium' as const : 'low' as const,
      freshnessMessage: `Multi-source research: ${research.providersUsed.join(', ')} at ${research.lastVerifiedAt}`,
    };
  }

  if (structured && research.sources.length > 0) {
    const webSources = research.sources.slice(0, 6).map((r) => ({
      title: r.title,
      url: r.url,
      authority: `${r.sourceType} (${r.domain})`,
      checkedAt: research.lastVerifiedAt,
    }));
    const existing = structured.sources ?? [];
    const merged = [...existing];
    for (const ws of webSources) {
      if (!merged.some((s) => s.url === ws.url)) merged.push(ws);
    }
    structured.sources = merged;
    structured.freshnessMessage =
      structured.freshnessMessage ?? `Answer informed by multi-source research (${research.providersUsed.join(', ')})`;
  }

  if (research.refused) {
    return {
      answer: research.directAnswer,
      structured: {
        answer: research.directAnswer,
        possibleSpecies: [],
        hazards: [],
        regulations: [],
        followUpQuestions: [],
        sources: [],
        confidence: 'low' as const,
      },
      webSearchUsed: false,
    };
  }

  return { answer: answerText, structured, webSearchUsed };
}
