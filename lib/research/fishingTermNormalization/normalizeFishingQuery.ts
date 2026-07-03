import { FISHING_TERM_ALIASES } from './fishingTermAliases';
import { fuzzyMatchScore, levenshteinDistance, maxAllowedEditDistance } from './levenshtein';
import {
  cleanFishingQueryText,
  isStopWord,
  normalizeForMatching,
  stripHebrewPrefixes,
  tokenizeFishingQuery,
  tokenMatchVariants,
} from './textUtils';
import type {
  DetectedTermMatch,
  FishingTermAliasEntry,
  NormalizedFishingQuery,
  TermConfidenceLevel,
} from './types';

interface AliasLookupRow {
  entry: FishingTermAliasEntry;
  alias: string;
  normalizedAlias: string;
}

const ALIAS_ROWS: AliasLookupRow[] = FISHING_TERM_ALIASES.flatMap((entry) => {
  const unique = new Set<string>();
  const rows: AliasLookupRow[] = [];
  const add = (alias: string) => {
    const normalizedAlias = normalizeForMatching(alias);
    if (!normalizedAlias || unique.has(normalizedAlias)) return;
    unique.add(normalizedAlias);
    rows.push({ entry, alias, normalizedAlias });
  };
  add(entry.canonical);
  for (const alias of entry.aliases) add(alias);
  for (const alias of entry.english) add(alias);
  return rows;
});

const PHRASE_ROWS = [...ALIAS_ROWS].sort((a, b) => b.normalizedAlias.length - a.normalizedAlias.length);

function scoreToConfidence(score: number, wasFuzzy: boolean): TermConfidenceLevel {
  if (score >= 0.92) return wasFuzzy ? 'medium' : 'high';
  if (score >= 0.72) return wasFuzzy ? 'medium' : 'high';
  if (score >= 0.58) return 'medium';
  return 'low';
}

function includesPhrase(haystack: string, phrase: string): boolean {
  if (phrase.includes(' ')) return haystack.includes(phrase);
  const pattern = new RegExp(`(^|\\s)${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s|$)`);
  return pattern.test(haystack);
}

function findExactMatches(cleanedQuestion: string): DetectedTermMatch[] {
  const haystack = normalizeForMatching(cleanedQuestion);
  const matches: DetectedTermMatch[] = [];
  const covered = new Set<string>();

  for (const row of PHRASE_ROWS) {
    if (covered.has(row.normalizedAlias)) continue;
    if (!includesPhrase(haystack, row.normalizedAlias)) continue;

    matches.push({
      matchedText: row.alias,
      matchedAlias: row.alias,
      canonical: row.entry.canonical,
      score: 1,
      confidence: 'high',
      wasFuzzy: false,
      entry: row.entry,
    });
    covered.add(row.normalizedAlias);

    for (const other of PHRASE_ROWS) {
      if (other.normalizedAlias.length < row.normalizedAlias.length &&
          row.normalizedAlias.includes(other.normalizedAlias)) {
        covered.add(other.normalizedAlias);
      }
    }
  }

  // Prefixed Hebrew tokens: בזירזור, לדיג, etc.
  for (const token of tokenizeFishingQuery(cleanedQuestion)) {
    const stripped = stripHebrewPrefixes(token);
    if (stripped === token) continue;

    for (const row of PHRASE_ROWS) {
      if (covered.has(row.normalizedAlias)) continue;
      if (normalizeForMatching(stripped) !== row.normalizedAlias) continue;

      matches.push({
        matchedText: token,
        matchedAlias: row.alias,
        canonical: row.entry.canonical,
        score: 1,
        confidence: 'high',
        wasFuzzy: false,
        entry: row.entry,
      });
      covered.add(row.normalizedAlias);
      break;
    }
  }

  return matches;
}

function findFuzzyTokenMatch(token: string): DetectedTermMatch | null {
  if (token.length < 4 || isStopWord(token)) return null;

  const normalizedToken = normalizeForMatching(token);
  let best: DetectedTermMatch | null = null;

  for (const row of ALIAS_ROWS) {
    if (row.normalizedAlias.length < 3) continue;
    if (normalizedToken === row.normalizedAlias) continue;

    const distance = levenshteinDistance(normalizedToken, row.normalizedAlias);
    const maxDist = maxAllowedEditDistance(Math.max(normalizedToken.length, row.normalizedAlias.length));
    if (distance > maxDist) continue;

    const score = fuzzyMatchScore(normalizedToken, row.normalizedAlias);
    const wasFuzzy = distance > 0;
    const confidence = scoreToConfidence(score, wasFuzzy);

    if (!best || score > best.score) {
      best = {
        matchedText: token,
        matchedAlias: row.alias,
        canonical: row.entry.canonical,
        score,
        confidence,
        wasFuzzy,
        entry: row.entry,
      };
    }
  }

  return best;
}

function findFuzzyMatches(cleanedQuestion: string, exactMatches: DetectedTermMatch[]): DetectedTermMatch[] {
  const exactNormalized = new Set(
    exactMatches.flatMap((m) => [normalizeForMatching(m.matchedText), normalizeForMatching(m.matchedAlias)]),
  );
  const fuzzyMatches: DetectedTermMatch[] = [];

  for (const token of tokenizeFishingQuery(cleanedQuestion)) {
    for (const variant of tokenMatchVariants(token)) {
      const normalizedToken = normalizeForMatching(variant);
      if (exactNormalized.has(normalizedToken)) continue;

      const fuzzy = findFuzzyTokenMatch(variant);
      if (fuzzy && fuzzy.confidence !== 'low') {
        fuzzyMatches.push({
          ...fuzzy,
          matchedText: token,
        });
        break;
      }
    }
  }

  return fuzzyMatches;
}

function dedupeByCanonical(matches: DetectedTermMatch[]): DetectedTermMatch[] {
  const byCanonical = new Map<string, DetectedTermMatch>();
  for (const match of matches) {
    const prev = byCanonical.get(match.canonical);
    if (!prev || match.score > prev.score) {
      byCanonical.set(match.canonical, match);
    }
  }
  return [...byCanonical.values()];
}

function replaceMatchedTerm(text: string, match: DetectedTermMatch): string {
  const aliasNorm = normalizeForMatching(match.matchedAlias);
  const textNorm = normalizeForMatching(text);

  for (const token of tokenizeFishingQuery(text)) {
    const tokenNorm = normalizeForMatching(token);
    if (tokenNorm === aliasNorm || tokenNorm === normalizeForMatching(match.matchedText)) {
      return text.replace(token, match.canonical);
    }
  }

  if (textNorm.includes(aliasNorm)) {
    const candidates = [match.matchedText, match.matchedAlias];
    for (const candidate of candidates) {
      if (!candidate) continue;
      const pattern = new RegExp(candidate.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      if (pattern.test(text)) {
        return text.replace(pattern, match.canonical);
      }
    }
  }

  return text;
}

export function expandSearchTerms(matches: DetectedTermMatch[]): string[] {
  const terms = new Set<string>();
  for (const match of matches) {
    terms.add(match.canonical);
    terms.add(match.matchedAlias);
    for (const alias of match.entry.aliases) terms.add(alias);
    for (const en of match.entry.english) terms.add(en);
  }
  return [...terms];
}

export function buildTermAssumptionPrefix(match: DetectedTermMatch, language: 'en' | 'he'): string | undefined {
  if (match.confidence === 'low') return undefined;

  const aliasNorm = normalizeForMatching(match.matchedAlias);
  const canonicalNorm = normalizeForMatching(match.canonical);
  if (aliasNorm === canonicalNorm && !match.wasFuzzy) return undefined;

  return language === 'he'
    ? `אני מניח שהתכוונת ל${match.canonical} — `
    : `I assume you meant ${match.canonical} — `;
}

export function buildTermClarificationQuestion(language: 'en' | 'he', guess?: string): string {
  if (language === 'he') {
    return guess
      ? `לא בטוח שהבנתי — התכוונת ל${guess}? כתוב/י במילה אחת: ג'רג'ור, ג'יג, פיתיון, ריג, קרס, או דמוי.`
      : 'לא בטוח שהבנתי את המונח — התכוונת לג\'רג\'ור/דמויים, ג\'יג, פיתיון, ריג, או משהו אחר?';
  }
  return guess
    ? `I'm not sure I understood — did you mean ${guess}? Reply with one word: spinning, jig, bait, rig, hook, or lure.`
    : 'I\'m not sure which fishing term you mean — spinning/lures, jig, bait, rig, or something else?';
}

function logNormalizationDebug(result: NormalizedFishingQuery): void {
  const isDev =
    (typeof __DEV__ !== 'undefined' && __DEV__) ||
    (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development');

  if (!isDev) return;

  console.debug('[fishing-term-normalization]', {
    original: result.originalQuestion,
    cleaned: result.cleanedQuestion,
    normalized: result.normalizedQuestion,
    matches: result.matches.map((m) => ({
      alias: m.matchedAlias,
      canonical: m.canonical,
      confidence: m.confidence,
      score: Number(m.score.toFixed(2)),
      fuzzy: m.wasFuzzy,
    })),
    confidence: Number(result.confidence.toFixed(2)),
    confidenceLevel: result.confidenceLevel,
    searchTerms: result.searchTerms,
    shouldClarify: result.shouldClarify,
  });
}

/**
 * Normalize a user fishing question: clean text, map aliases to canonical
 * terms, expand search terms, and score confidence for clarification UX.
 */
export function normalizeFishingQuery(
  question: string,
  _language: 'en' | 'he' = 'he',
): NormalizedFishingQuery {
  const originalQuestion = question;
  const cleanedQuestion = cleanFishingQueryText(question);

  const exactMatches = findExactMatches(cleanedQuestion);
  const fuzzyMatches = findFuzzyMatches(cleanedQuestion, exactMatches);
  const matches = dedupeByCanonical([...exactMatches, ...fuzzyMatches]);

  let normalizedQuestion = cleanedQuestion;
  const sortedForReplace = [...matches].sort(
    (a, b) => normalizeForMatching(b.matchedAlias).length - normalizeForMatching(a.matchedAlias).length,
  );
  for (const match of sortedForReplace) {
    normalizedQuestion = replaceMatchedTerm(normalizedQuestion, match);
  }

  const confidence = matches.length > 0 ? Math.max(...matches.map((m) => m.score)) : 0;
  const bestMatch = [...matches].sort((a, b) => b.score - a.score)[0];
  const confidenceLevel: TermConfidenceLevel =
    matches.length === 0 ? 'none' : (bestMatch?.confidence ?? 'low');

  const searchTerms = expandSearchTerms(matches);
  const assumptionPrefix =
    bestMatch && buildTermAssumptionPrefix(bestMatch, 'he')
      ? {
          he: buildTermAssumptionPrefix(bestMatch, 'he') ?? '',
          en: buildTermAssumptionPrefix(bestMatch, 'en') ?? '',
        }
      : undefined;

  const hasFishingContext = /דיג|דגים|דג\b|fish|fishing|חוף|shore|rod|חכה|sea|ים/i.test(cleanedQuestion);
  const shouldClarify =
    confidenceLevel === 'low' &&
    !!bestMatch &&
    !hasFishingContext &&
    matches.length === 1;

  const result: NormalizedFishingQuery = {
    originalQuestion,
    cleanedQuestion,
    normalizedQuestion,
    matches,
    searchTerms,
    confidence,
    confidenceLevel,
    shouldClarify,
    assumptionPrefix:
      assumptionPrefix && (assumptionPrefix.he || assumptionPrefix.en) ? assumptionPrefix : undefined,
  };

  logNormalizationDebug(result);
  return result;
}

/** Convenience helper — returns the normalized question string. */
export function normalizeFishingQueryText(question: string, language: 'en' | 'he' = 'he'): string {
  return normalizeFishingQuery(question, language).normalizedQuestion;
}

/** Return the best canonical term detected in a question, if any. */
export function detectCanonicalFishingTerm(question: string, language: 'en' | 'he' = 'he'): string | undefined {
  const { matches } = normalizeFishingQuery(question, language);
  if (matches.length === 0) return undefined;
  return [...matches].sort((a, b) => b.score - a.score)[0]?.canonical;
}
