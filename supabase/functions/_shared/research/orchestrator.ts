/**
 * Server-side fishing research orchestrator (Deno).
 */

import { searchAllProviders, type RawSearchResult, type FishingSearchQuery } from './providers.ts';
import { isFishingQuestion, validateFishingScope } from './scopeGuard.ts';

function isFishingRelated(text: string): boolean {
  if (text.toLowerCase().includes('phishing')) return false;
  return isFishingQuestion(text, 'en') || isFishingQuestion(text, 'he');
}

function generateQueries(question: string, language: string, locationHint?: string): FishingSearchQuery[] {
  const queries: FishingSearchQuery[] = [
    { query: question, language: language as 'en' | 'he' },
  ];
  if (locationHint) {
    queries.push({ query: `${locationHint} fishing species shore`, language: 'en' });
    if (language === 'he') {
      queries.push({ query: `${locationHint} דיג מינים`, language: 'he' });
    }
    queries.push({ query: `${locationHint} fishing regulations`, language: 'en', category: 'regulation' });
    queries.push({ query: `${locationHint} shore fishing report`, language: 'en', category: 'report' });
  }
  if (/israel|ישראל/i.test(question + (locationHint ?? ''))) {
    queries.push({ query: 'Israel Mediterranean fishing regulations license', language: 'en', category: 'regulation' });
    queries.push({ query: 'תקנות דיג ישראל ים תיכון', language: 'he', category: 'regulation' });
  }
  return queries.slice(0, 8);
}

function classifyDomain(url: string): { type: string; authority: number } {
  if (/\.gov|fisheries|ministry/i.test(url)) return { type: 'government', authority: 95 };
  if (/wikipedia|fishbase/i.test(url)) return { type: 'scientific', authority: 85 };
  if (/reddit|forum/i.test(url)) return { type: 'forum', authority: 50 };
  if (/facebook|instagram|twitter/i.test(url)) return { type: 'social', authority: 25 };
  if (/fishing|angling|דיג/i.test(url)) return { type: 'fishing-organization', authority: 70 };
  return { type: 'other', authority: 40 };
}

function extractDomain(url: string): string {
  try { return new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace(/^www\./, ''); }
  catch { return url; }
}

export interface ServerFishingSource {
  id: string;
  title: string;
  url: string;
  domain: string;
  sourceType: string;
  accessedAt: string;
  reliabilityScore: number;
  freshnessScore: number;
  relevanceScore: number;
  fishingRelevanceScore: number;
  isPrimarySource: boolean;
  snippet: string;
  provider: string;
}

export interface ServerResearchOutput {
  question: string;
  language: string;
  directAnswer: string;
  summary: string;
  confidence: 'high' | 'medium' | 'limited';
  confidenceReason: string;
  sources: ServerFishingSource[];
  searchQueriesUsed: string[];
  providersUsed: string[];
  safetyWarnings: string[];
  regulations: Array<{ title: string; summary: string; isOfficial: boolean }>;
  generatedAt: string;
  lastVerifiedAt: string;
  refused?: boolean;
  refusalReason?: string;
}

const REFUSAL_EN = 'This assistant specializes only in fishing and fishing-related information. Please ask me about a fishing location, fish species, equipment, technique, conditions, or regulations.';
const REFUSAL_HE = 'עוזר זה מתמחה רק בדיג ובמידע הקשור לדיג. שאל אותי על מקום דיג, מין דג, ציוד, טכניקה, תנאים או תקנות.';

export async function runServerResearch(
  question: string,
  language: string,
  locationHint?: string,
  conversationContext: string[] = [],
): Promise<ServerResearchOutput> {
  const now = new Date().toISOString();
  const lang = language === 'he' ? 'he' : 'en';

  if (!validateFishingScope(question, lang, conversationContext)) {
    return {
      question, language: lang,
      directAnswer: lang === 'he' ? REFUSAL_HE : REFUSAL_EN,
      summary: lang === 'he' ? REFUSAL_HE : REFUSAL_EN,
      confidence: 'limited',
      confidenceReason: 'Out of scope',
      sources: [], searchQueriesUsed: [], providersUsed: [],
      safetyWarnings: [], regulations: [],
      generatedAt: now, lastVerifiedAt: now,
      refused: true, refusalReason: lang === 'he' ? REFUSAL_HE : REFUSAL_EN,
    };
  }

  const queries = generateQueries(question, lang, locationHint);
  const searchTasks = queries.map((q) => searchAllProviders(q));
  const settled = await Promise.allSettled(searchTasks);

  const allRaw: RawSearchResult[] = [];
  for (const r of settled) {
    if (r.status === 'fulfilled') allRaw.push(...r.value);
  }

  const fishingFiltered = allRaw.filter((r) => isFishingRelated(`${r.title} ${r.snippet} ${r.url}`));
  const results = fishingFiltered.length > 0 ? fishingFiltered : allRaw;

  const seen = new Set<string>();
  const unique = results.filter((r) => {
    const key = r.url || r.title;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const sources: ServerFishingSource[] = unique.slice(0, 8).map((r, i) => {
    const { type, authority } = classifyDomain(r.url);
    const relevance = 50 + (locationHint && r.snippet.toLowerCase().includes(locationHint.toLowerCase().split(' ')[0]) ? 20 : 0);
    return {
      id: `src-${i}`,
      title: r.title, url: r.url, domain: extractDomain(r.url),
      sourceType: type, accessedAt: now,
      reliabilityScore: authority * 0.4 + relevance * 0.35 + 60 * 0.25,
      freshnessScore: 60, relevanceScore: relevance,
      fishingRelevanceScore: 75, isPrimarySource: authority >= 85,
      snippet: r.snippet, provider: r.provider,
    };
  }).sort((a, b) => b.reliabilityScore - a.reliabilityScore);

  const official = sources.filter((s) => s.isPrimarySource);
  const confidence = sources.length >= 4 && official.length >= 1 ? 'high' as const
    : sources.length >= 2 ? 'medium' as const : 'limited' as const;

  const snippets = sources.slice(0, 3).map((s) => s.snippet).join('\n\n');
  const intro = lang === 'he'
    ? `לפי ${sources.length} מקורות עצמאיים:\n\n`
    : `Based on ${sources.length} independent sources:\n\n`;
  const disclaimer = lang === 'he'
    ? '\n\n⚠️ מידע מהאינטרנט — לא מאומת. אשר במקום לפני דיג.'
    : '\n\n⚠️ Web information — not verified. Confirm on site before fishing.';

  const providersUsed = [...new Set(sources.map((s) => s.provider))];

  return {
    question, language: lang,
    directAnswer: `${intro}${snippets.slice(0, 900)}${disclaimer}`,
    summary: `${intro}${snippets.slice(0, 400)}`,
    confidence,
    confidenceReason: lang === 'he'
      ? `מבוסס על ${sources.length} מקורות (${official.length} רשמיים/מדעיים).`
      : `Based on ${sources.length} sources (${official.length} official/scientific).`,
    sources,
    searchQueriesUsed: queries.map((q) => q.query),
    providersUsed,
    safetyWarnings: [lang === 'he' ? 'בדוק תנאי ים ורוח עדכניים לפני דיג.' : 'Check current sea and wind conditions before fishing.'],
    regulations: [{
      title: lang === 'he' ? 'תקנות דיג' : 'Fishing regulations',
      summary: lang === 'he' ? 'תקנות עשויות להשתנות. אשר עם הרשות המוסמכת.' : 'Regulations may change. Confirm with fisheries authority.',
      isOfficial: official.length > 0,
    }],
    generatedAt: now, lastVerifiedAt: now,
  };
}

export function formatResearchForPrompt(research: ServerResearchOutput): string {
  const sourceBlock = research.sources.map((s, i) =>
    `[${i + 1}] ${s.title} (${s.sourceType}, score: ${Math.round(s.reliabilityScore)})\nURL: ${s.url}\n${s.snippet}`,
  ).join('\n\n');
  return `=== MULTI-SOURCE RESEARCH (${research.sources.length} sources, confidence: ${research.confidence}) ===\nQueries: ${research.searchQueriesUsed.join(' | ')}\n\n${sourceBlock}`;
}
