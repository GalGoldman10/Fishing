/**
 * Fishing-only web search helpers — shared between client and edge function logic.
 */

const FISHING_TERMS_EN = [
  'fish', 'fishing', 'angler', 'angling', 'bait', 'lure', 'rod', 'reel', 'tackle',
  'shore', 'pier', 'marina', 'harbor', 'harbour', 'catch', 'species', 'seabass',
  'bream', 'surfcasting', 'fly fishing', 'spearfishing', 'aquaculture',
];

const FISHING_TERMS_HE = [
  'דיג', 'דייג', 'דג', 'דגים', 'חכה', 'פיתיון', 'חוף', 'מזח', 'נמל', 'לוכד',
  'לוקוס', 'דניס', 'ציוד דיג', 'דיג חופי', 'דיג מסירה',
];

const EXCLUDED_TERMS = [
  'phishing', 'fish market restaurant', 'aquarium ticket', 'fishing game',
  'cooking recipe', 'restaurant menu', 'video game',
];

export function buildFishingSearchQuery(
  userQuery: string,
  language: string,
  locationHint?: string,
): string {
  const parts = [userQuery.trim()];
  if (locationHint) parts.push(locationHint);

  if (language === 'he') {
    parts.push('דיג דגים חוף ים ציוד דייג');
  } else {
    parts.push('fishing angling shore fish catch bait tackle');
  }

  const core = parts.filter(Boolean).join(' ');
  // Exclude non-fishing noise
  const exclusions = language === 'he'
    ? '-מסעדה -מתכון -משחק'
    : '-restaurant -recipe -game -phishing -cryptocurrency';

  return `${core} ${exclusions}`.trim();
}

export function isFishingRelatedText(text: string, language: string): boolean {
  const lower = text.toLowerCase();
  const terms = language === 'he' ? FISHING_TERMS_HE : FISHING_TERMS_EN;

  if (EXCLUDED_TERMS.some((ex) => lower.includes(ex))) return false;

  return terms.some((term) =>
    language === 'he' ? text.includes(term) : lower.includes(term.toLowerCase()),
  );
}

export function filterFishingResults<T extends { title: string; snippet: string; url?: string }>(
  results: T[],
  language: string,
): T[] {
  return results.filter((r) => {
    const combined = `${r.title} ${r.snippet} ${r.url ?? ''}`;
    return isFishingRelatedText(combined, language);
  });
}

export function buildWikipediaFishingQuery(userQuery: string, language: string): string {
  const base = userQuery.trim();
  return language === 'he' ? `${base} דיג` : `${base} fishing`;
}
