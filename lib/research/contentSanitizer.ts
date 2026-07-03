/**
 * Sanitizer for untrusted web content.
 *
 * All text retrieved from the web is data, never instructions. This module
 * strips markup, neutralizes prompt-injection attempts, and enforces length
 * limits before snippets reach answer synthesis or an AI prompt.
 */

/** Patterns that indicate an instruction aimed at the assistant, not content. */
const INJECTION_PATTERNS: RegExp[] = [
  /ignore (all |any )?(previous|prior|above) (instructions|rules|prompts)/i,
  /disregard (all |any )?(previous|prior|above)/i,
  /you are now\b/i,
  /act as\b.{0,40}(assistant|ai|system|admin)/i,
  /system ?prompt/i,
  /\bapi[_ ]?key\b/i,
  /\bsecret\b.{0,20}\b(key|token|password)\b/i,
  /reveal (your|the) (instructions|prompt|rules)/i,
  /respond with\b.{0,40}(json|script|code)\b.{0,40}(only|exactly)/i,
  /<\s*script\b/i,
  /javascript\s*:/i,
  /on(click|load|error)\s*=/i,
  /התעלם מההוראות/,
  /אתה עכשיו/,
  /חשוף את ההוראות/,
];

const MAX_SNIPPET_LENGTH = 600;
const MAX_TITLE_LENGTH = 160;

/** Strip HTML tags, control characters, and collapse whitespace. */
function stripMarkup(text: string): string {
  return text
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z#0-9]{2,8};/gi, ' ')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Remove sentences that look like injected instructions. */
function removeInjectedInstructions(text: string): { clean: string; flagged: boolean } {
  const sentences = text.split(/(?<=[.!?։؟])\s+/);
  let flagged = false;
  const kept = sentences.filter((sentence) => {
    const isInjection = INJECTION_PATTERNS.some((p) => p.test(sentence));
    if (isInjection) flagged = true;
    return !isInjection;
  });
  return { clean: kept.join(' ').trim(), flagged };
}

export interface SanitizedContent {
  title: string;
  snippet: string;
  /** True when injection-like content was found and removed. */
  injectionDetected: boolean;
}

export function sanitizeWebContent(title: string, snippet: string): SanitizedContent {
  const cleanTitleRaw = stripMarkup(title).slice(0, MAX_TITLE_LENGTH);
  const cleanSnippetRaw = stripMarkup(snippet);

  const titleResult = removeInjectedInstructions(cleanTitleRaw);
  const snippetResult = removeInjectedInstructions(cleanSnippetRaw);

  return {
    title: titleResult.clean,
    snippet: snippetResult.clean.slice(0, MAX_SNIPPET_LENGTH),
    injectionDetected: titleResult.flagged || snippetResult.flagged,
  };
}

/** Validate that a URL is a plain http(s) link (no javascript:, data:, etc.). */
export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}
