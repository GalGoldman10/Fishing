/**
 * Fishing content relevance classifier — score 0-100.
 */

const POSITIVE_EN = [
  'fishing', 'angling', 'fish species', 'fishing rod', 'reel', 'bait', 'lure', 'jig',
  'shore fishing', 'surf fishing', 'rock fishing', 'boat fishing', 'freshwater', 'saltwater',
  'fishing regulations', 'fishing report', 'fishing forecast', 'tide', 'marine weather',
  'catch', 'hook', 'rig', 'tackle', 'spearfishing', 'fly fishing', 'casting',
];

const POSITIVE_HE = [
  'דיג', 'דייג', 'דגים', 'חכה', 'פיתיון', 'דמוי טרף', 'דיג חופי', 'דיג סלעים',
  'תקנות דיג', 'דיווח דיג', 'גאות', 'מזג ים', 'לכידה', 'קרס', 'ציוד דיג',
];

const NEGATIVE = [
  'politics', 'celebrity', 'gambling', 'cryptocurrency', 'recipe', 'restaurant menu',
  'video game', 'movie review', 'fashion', 'unrelated shopping', 'phishing',
  'פוליטיקה', 'סלב', 'הימורים', 'מסעדה', 'מתכון', 'משחק',
];

export function classifyFishingRelevance(text: string, language: 'en' | 'he' = 'en'): number {
  const lower = text.toLowerCase();
  if (NEGATIVE.some((n) => lower.includes(n.toLowerCase()) || text.includes(n))) return 0;
  if (lower.includes('phishing')) return 0;

  const positives = language === 'he' ? POSITIVE_HE : POSITIVE_EN;
  let score = 0;
  let matches = 0;

  for (const term of positives) {
    const found = language === 'he' ? text.includes(term) : lower.includes(term.toLowerCase());
    if (found) {
      matches++;
      score += term.length > 8 ? 15 : 10;
    }
  }

  // Bonus for fishing-specific URL paths
  if (/fishing|angling|דיג|fish-species|marine/i.test(lower)) score += 10;

  return Math.min(100, Math.max(matches > 0 ? 40 : 0, score));
}

export function passesFishingFilter(text: string, language: 'en' | 'he' = 'en', minScore = 70): boolean {
  return classifyFishingRelevance(text, language) >= minScore;
}

export function filterByRelevance<T extends { title: string; snippet: string; url?: string }>(
  results: T[],
  language: 'en' | 'he',
  minScore = 70,
): T[] {
  const scored = results.map((r) => ({
    item: r,
    score: classifyFishingRelevance(`${r.title} ${r.snippet} ${r.url ?? ''}`, language),
  }));

  const passing = scored.filter((s) => s.score >= minScore);
  const passingUrls = new Set(passing.map((s) => s.item.url ?? s.item.title));

  // Count unique pages, not raw copies — the same page returned by several
  // queries must not crowd out other legitimate sources.
  if (passingUrls.size >= 2) {
    const extras = scored
      .filter((s) => s.score >= 40 && !passingUrls.has(s.item.url ?? s.item.title))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
    return [...passing, ...extras].map((s) => s.item);
  }

  // Relax threshold if too few results — keep top scored above 40
  return scored
    .filter((s) => s.score >= 40)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map((s) => s.item);
}
