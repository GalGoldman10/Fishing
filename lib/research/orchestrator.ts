/**
 * Research orchestrator — search-before-answer pipeline.
 *
 * Every fishing question flows through: scope guard → query understanding →
 * location resolution (coordinates, HE/EN, misspellings) → multi-query
 * multi-provider search → sanitization (untrusted content) → relevance filter
 * → dedup → scoring → diverse selection → synthesis → local-knowledge
 * enrichment → live marine conditions (for current-condition questions).
 *
 * Failure policy: when search providers fail the answer says so explicitly
 * (searchFailed=true, limited confidence) — the bot never silently answers
 * time-sensitive questions from memory.
 */

import type {
  FishingAnswer,
  FishingSource,
  RawSearchResult,
  ResearchOrchestratorInput,
  ResearchOrchestratorOutput,
} from '@/types/research';
import { validateFishingScope, getRefusalMessage } from '@/lib/research/scopeGuard';
import { turnsToScopeContext, enrichQuestionWithConversation } from '@/lib/research/conversationContext';
import { understandQuery } from '@/lib/research/queryUnderstanding';
import { generateSearchQueries } from '@/lib/research/queryGenerator';
import { filterByRelevance } from '@/lib/research/contentClassifier';
import { groupDuplicates } from '@/lib/research/duplicateDetection';
import { scoreAndRankSources, selectDiverseSources } from '@/lib/research/sourceScoring';
import { synthesizeAnswer } from '@/lib/research/answerSynthesis';
import { enrichAnswerWithLocalKnowledge } from '@/lib/research/localAnswerEngine';
import { resolveLocation } from '@/lib/research/locationResolver';
import { sanitizeWebContent, isSafeUrl } from '@/lib/research/contentSanitizer';
import { getCachedResearch, researchCacheKey, setCachedResearch } from '@/lib/research/researchCache';
import { getLiveConditionsAdvice } from '@/lib/research/conditionsAdvisor';
import { findSpotFromQuestion } from '@/lib/research/spotMatcher';
import { DEMO_SPOTS } from '@/lib/mock/demoData';
import { normalizeFishingQuery } from '@/lib/research/fishingTermNormalization';
import type { FishingSearchProvider } from '@/lib/research/providers/types';
import { wikipediaProvider } from '@/lib/research/providers/wikipedia';
import { israeliSourcesProvider } from '@/lib/research/providers/israeliSources';

export interface OrchestratorOptions {
  providers?: FishingSearchProvider[];
  minSources?: number;
  maxSources?: number;
  /** Bypass the research cache (manual refresh). */
  skipCache?: boolean;
}

function liveDataUnavailableNote(language: 'en' | 'he'): string {
  return language === 'he'
    ? 'לא הצלחתי לאחזר מידע חי מהאינטרנט כרגע. ההנחיות הבאות הן כלליות בלבד ואינן משקפות תנאים או תקנות עדכניים — נסה שוב בעוד רגע.'
    : 'I could not retrieve live information from the web right now. The guidance below is general only and does not reflect current conditions or regulations — please try again shortly.';
}

export async function runFishingResearch(
  input: ResearchOrchestratorInput,
  options: OrchestratorOptions = {},
): Promise<ResearchOrchestratorOutput> {
  const { language } = input;
  const now = new Date().toISOString();
  const providers = options.providers ?? [wikipediaProvider, israeliSourcesProvider];
  const minSources = options.minSources ?? 3;
  const maxSources = options.maxSources ?? 8;

  // 0. Normalize Hebrew/English fishing slang and typos before every downstream step.
  const termNormalization = normalizeFishingQuery(input.question, language);
  const question = termNormalization.normalizedQuestion;
  const searchQuestion = input.conversationContext?.length
    ? enrichQuestionWithConversation(question, input.conversationContext, language)
    : question;

  // 1. Topic restriction — refuse non-fishing questions politely.
  const scope = validateFishingScope(question, language, {
    conversationContext: turnsToScopeContext(input.conversationContext ?? []),
  });
  if (!scope.allowed) {
    const refusal: FishingAnswer = {
      question: input.question,
      language,
      directAnswer: scope.reason ?? getRefusalMessage(language),
      summary: scope.reason ?? getRefusalMessage(language),
      confidence: 'limited',
      confidenceReason: 'Question outside fishing scope',
      sources: [],
      searchQueriesUsed: [],
      providersUsed: [],
      generatedAt: now,
      lastVerifiedAt: now,
      refused: true,
      refusalReason: scope.reason,
    };
    return { answer: refusal, rawResultCount: 0, uniqueSourceCount: 0, duplicateFamiliesFiltered: 0 };
  }

  // 2. Understand the question and resolve the location to real coordinates.
  const understanding = understandQuery(searchQuestion, language, input.locationHint);
  if (!understanding.termNormalization) {
    understanding.termNormalization = termNormalization;
  }
  const resolved = resolveLocation(searchQuestion, input.locationHint);
  if (resolved) {
    understanding.locationName = language === 'he' ? resolved.nameHe : resolved.nameEn;
    understanding.city = resolved.city ?? understanding.city;
    understanding.isIsraeliLocation = true;
    understanding.country = 'IL';
  }

  // 3. Cache lookup (query + location + language + day + category).
  const cacheKey = researchCacheKey({
    question,
    language,
    category: understanding.category,
    locationId: resolved?.id,
  });
  if (!options.skipCache) {
    const cached = getCachedResearch<ResearchOrchestratorOutput>(cacheKey);
    if (cached) {
      return { ...cached, answer: { ...cached.answer, fromCache: true } };
    }
  }

  // 4. Multi-query, multi-provider search. Track failures explicitly.
  const searchQueries = generateSearchQueries(searchQuestion, understanding, language);
  const providersUsed = providers.map((p) => p.name);
  let failedTasks = 0;

  const searchTasks = searchQueries.flatMap((sq) =>
    providers.map(async (provider) => {
      try {
        return await provider.search(sq);
      } catch {
        failedTasks += 1;
        return [] as RawSearchResult[];
      }
    }),
  );

  const settled = await Promise.allSettled(searchTasks);
  const allRaw: RawSearchResult[] = [];
  for (const result of settled) {
    if (result.status === 'fulfilled') allRaw.push(...result.value);
  }
  const allSearchesFailed = failedTasks === searchTasks.length && searchTasks.length > 0;

  // 5. Sanitize — web text is untrusted data, never instructions.
  const sanitized: RawSearchResult[] = [];
  for (const raw of allRaw) {
    if (!isSafeUrl(raw.url)) continue;
    const clean = sanitizeWebContent(raw.title, raw.snippet);
    if (clean.snippet.length < 15 && clean.title.length < 5) continue;
    sanitized.push({ ...raw, title: clean.title, snippet: clean.snippet });
  }

  // 6. Relevance filter → dedup → score → diverse selection.
  const relevant = filterByRelevance(sanitized, language, 70);
  const { unique, filteredCount } = groupDuplicates(relevant);
  const scored = scoreAndRankSources(unique, understanding, language, now);
  const diverse = selectDiverseSources(scored, Math.min(minSources, unique.length), maxSources);

  // 7. Synthesize the evidence-based answer.
  const answer = synthesizeAnswer({
    question,
    language,
    understanding,
    sources: diverse,
    searchQueriesUsed: searchQueries.map((q) => q.query),
    providersUsed,
    generatedAt: now,
  });

  // 8. Local verified knowledge (species profiles, demo spot data).
  const enriched = enrichAnswerWithLocalKnowledge(
    answer,
    question,
    understanding,
    input.locationHint,
  );

  // 9. Live marine conditions for current-condition questions with a
  //    resolved coastal spot — real data, explained, never invented.
  const matchedSpot =
    findSpotFromQuestion(question, input.locationHint) ??
    (input.spotId ? DEMO_SPOTS.find((s) => s.id === input.spotId) ?? null : null);

  const marineLocation = matchedSpot
    ? (() => {
        const coords = matchedSpot.marineCoordinates ?? {
          latitude: matchedSpot.latitude,
          longitude: matchedSpot.longitude,
        };
        return {
          id: matchedSpot.id,
          nameEn: matchedSpot.name,
          nameHe: matchedSpot.localizedNames?.he ?? matchedSpot.name,
          city: matchedSpot.region,
          region: 'mediterranean' as const,
          waterType: 'saltwater' as const,
          latitude: coords.latitude,
          longitude: coords.longitude,
          matchType: 'exact' as const,
        };
      })()
    : resolved;

  if (understanding.needsWeather && marineLocation) {
    try {
      const advice = await getLiveConditionsAdvice(marineLocation, language);
      enriched.conditions = advice.conditions;
      enriched.directAnswer = `${advice.explanation}\n\n${enriched.directAnswer}`;
      enriched.summary = enriched.directAnswer;
      if (advice.current.safetyWarnings.length > 0) {
        enriched.safetyWarnings = [
          ...(enriched.safetyWarnings ?? []),
          language === 'he'
            ? 'קיימות אזהרות ים פעילות למיקום הזה — בדוק את כרטיס תנאי הים לפני יציאה.'
            : 'Active marine warnings exist for this location — check the sea-conditions card before heading out.',
        ];
      }
    } catch {
      enriched.conditions = {
        summary:
          language === 'he'
            ? 'נתוני ים חיים אינם זמינים כרגע — לא ניתן לאשר תנאים עדכניים.'
            : 'Live marine data is unavailable right now — current conditions could not be verified.',
        isLive: false,
        suitability: 'unknown',
        retrievedAt: now,
      };
    }
  }

  // 10. Location coordinates from the validated gazetteer (never text-only pins).
  if (resolved && enriched.location) {
    enriched.location.latitude = resolved.latitude;
    enriched.location.longitude = resolved.longitude;
    enriched.location.waterType = resolved.waterType;
  }

  // 11. Search failure policy — say it, downgrade confidence, offer retry.
  if (allSearchesFailed) {
    enriched.searchFailed = true;
    enriched.confidence = 'limited';
    enriched.confidenceReason =
      language === 'he'
        ? 'שירותי החיפוש נכשלו — לא אוחזר מידע חי.'
        : 'Search services failed — no live information was retrieved.';
    enriched.directAnswer = `${liveDataUnavailableNote(language)}\n\n${enriched.directAnswer}`;
    enriched.summary = enriched.directAnswer;
  }

  const output: ResearchOrchestratorOutput = {
    answer: enriched,
    rawResultCount: allRaw.length,
    uniqueSourceCount: diverse.length,
    duplicateFamiliesFiltered: filteredCount,
  };

  // Do not cache failures.
  if (!allSearchesFailed) {
    setCachedResearch(cacheKey, understanding.category, output);
  }

  return output;
}

export function sourcesToLegacyFormat(sources: FishingSource[]): Array<{
  title: string;
  url?: string;
  authority?: string;
  checkedAt?: string;
}> {
  return sources.map((s) => ({
    title: s.title,
    url: s.url,
    authority: `${s.sourceType} (${s.domain})`,
    checkedAt: s.accessedAt,
  }));
}
