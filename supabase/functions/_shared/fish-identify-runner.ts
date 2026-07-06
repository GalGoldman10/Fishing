/**
 * OpenAI vision-based fish identification for Israeli Mediterranean anglers.
 */
import { getModel } from './system-prompt.ts';

export interface FishIdentifyRequest {
  imageBase64: string;
  mimeType: string;
  language: 'en' | 'he';
}

export interface FishMatchResult {
  speciesId?: string;
  name: string;
  scientificName?: string;
  confidence: number;
  description: string;
  commonInIsrael?: boolean;
  habitat: string;
  bestBait: string;
  techniques: string;
  safetyWarning?: string;
}

export interface FishIdentifyResult {
  status: 'success' | 'uncertain' | 'no_fish' | 'blurry' | 'error';
  primaryMatch?: FishMatchResult;
  alternativeMatches?: FishMatchResult[];
  uncertainMessage?: string;
  errorMessage?: string;
}

const IDENTIFY_PROMPT = `You are an expert Israeli Mediterranean shore fishing guide analyzing a fish photo.

Analyze the image and respond ONLY with valid JSON matching this schema:
{
  "status": "success" | "uncertain" | "no_fish" | "blurry",
  "uncertainMessage": "optional string when status is uncertain",
  "primaryMatch": {
    "name": "common name in requested language",
    "scientificName": "Latin name",
    "confidence": 0-100,
    "description": "2-3 practical sentences for anglers",
    "commonInIsrael": true/false,
    "habitat": "specific habitats: rocky breakwaters, sandy beach, pier, harbor, deep water, etc.",
    "bestBait": "specific baits and lures that work for this fish in Israel",
    "techniques": "shore fishing technique: rig type, casting distance, time of day",
    "safetyWarning": "protected species, poisonous, dangerous spines, or consumption warning — omit if none"
  },
  "alternativeMatches": [ /* 2-3 matches when uncertain, each with same fields */ ]
}

Rules:
- If no fish is visible or the subject is not a fish: status "no_fish"
- If the image is too blurry/dark to identify: status "blurry"
- If confidence for top match is under 65%: status "uncertain" with 2-3 alternatives
- Be practical for Israeli Mediterranean shore anglers — mention breakwaters, marinas, sandy beaches, rocky shores
- Mention protected species (e.g. dusky grouper/lokus) when relevant
- Never invent species not plausible for the Mediterranean
- All text fields must be in the requested response language`;

export async function runFishIdentify(request: FishIdentifyRequest): Promise<FishIdentifyResult> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  const langInstruction = request.language === 'he' ? 'Hebrew' : 'English';
  const dataUrl = `data:${request.mimeType};base64,${request.imageBase64}`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: getModel(),
      messages: [
        {
          role: 'system',
          content: `${IDENTIFY_PROMPT}\n\nRespond in ${langInstruction}. Return ONLY JSON, no markdown.`,
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Identify this fish for a shore angler in Israel.' },
            { type: 'image_url', image_url: { url: dataUrl, detail: 'low' } },
          ],
        },
      ],
      temperature: 0.3,
      max_tokens: 1200,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI vision error ${res.status}: ${errText.slice(0, 300)}`);
  }

  const json = await res.json();
  const content = json.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('OpenAI returned empty vision response');

  const parsed = JSON.parse(content) as FishIdentifyResult;
  if (!parsed.status) {
    return { status: 'error', errorMessage: 'Invalid AI response' };
  }
  return parsed;
}
