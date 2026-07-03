const FINAL_HEBREW_LETTERS: Record<string, string> = {
  'ך': 'כ',
  'ם': 'מ',
  'ן': 'נ',
  'ף': 'פ',
  'ץ': 'צ',
};

/** Strip Hebrew/English punctuation variants used in fishing slang spellings. */
export function stripFishingPunctuation(text: string): string {
  return text.replace(/[''"׳״`*.,!?;:()[\]{}]/g, '');
}

export function normalizeHebrewFinalLetters(text: string): string {
  return text.replace(/[ךםןףץ]/g, (ch) => FINAL_HEBREW_LETTERS[ch] ?? ch);
}

/** Normalize text for alias / fuzzy comparison. */
export function normalizeForMatching(text: string): string {
  return normalizeHebrewFinalLetters(stripFishingPunctuation(text.toLowerCase()))
    .replace(/\s+/g, ' ')
    .trim();
}

/** Clean user question before term detection (preserves Hebrew spelling). */
export function cleanFishingQueryText(question: string): string {
  const lowerEnglish = question.replace(/[A-Za-z]+/g, (word) => word.toLowerCase());
  return stripFishingPunctuation(lowerEnglish)
    .replace(/\s+/g, ' ')
    .trim();
}

/** Extract Hebrew and English word tokens. */
export function tokenizeFishingQuery(text: string): string[] {
  return text.match(/[\u0590-\u05FF]+|[a-z]+/gi) ?? [];
}

export const FISHING_QUERY_STOP_WORDS = new Set([
  'מה', 'איך', 'איזה', 'למה', 'מתי', 'האם', 'זה', 'יש', 'עם', 'על', 'את', 'של', 'אני', 'לי', 'לדיג', 'דיג', 'בדיג',
  'דג', 'דגים', 'מוגנים', 'מוגן', 'ישראל', 'בישראל', 'אסור', 'לדוג', 'אילו',
  'קורה', 'היום', 'מחר', 'רוצה', 'יודע', 'כלום', 'צריך', 'לקנות',
  'what', 'how', 'which', 'why', 'when', 'the', 'for', 'with', 'from', 'about', 'this', 'that', 'you', 'can', 'do',
  'is', 'are', 'to', 'in', 'on', 'good', 'best', 'use', 'using', 'fish', 'fishing', 'shore', 'beach', 'sea',
]);

export function isStopWord(token: string): boolean {
  return FISHING_QUERY_STOP_WORDS.has(normalizeForMatching(token));
}

/** Strip common Hebrew prepositions prefixed to a word (e.g. בזירזור → זירזור). */
export function stripHebrewPrefixes(token: string): string {
  if (token.length <= 3) return token;
  const match = token.match(/^[בלהווכש]([\u0590-\u05FF]{2,})$/);
  return match ? match[1] : token;
}

/** Variants of a token used for alias matching. */
export function tokenMatchVariants(token: string): string[] {
  const stripped = stripHebrewPrefixes(token);
  return stripped === token ? [token] : [token, stripped];
}
