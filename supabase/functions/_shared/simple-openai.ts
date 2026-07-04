/**
 * Lightweight ChatGPT call without tools — used when the full assistant pipeline fails.
 */
import { SYSTEM_PROMPT, getModel } from './system-prompt.ts';

export async function runSimpleOpenAIChat(
  message: string,
  language: string,
): Promise<{ answer: string }> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  const langInstruction = language === 'he' ? 'Hebrew' : 'English';
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: getModel(),
      messages: [
        { role: 'system', content: `${SYSTEM_PROMPT}\n\nRespond in ${langInstruction}.` },
        { role: 'user', content: message },
      ],
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${errText.slice(0, 300)}`);
  }

  const json = await res.json();
  const answer = json.choices?.[0]?.message?.content?.trim();
  if (!answer) throw new Error('OpenAI returned empty response');
  return { answer };
}
