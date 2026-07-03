/**
 * Research orchestrator — multi-query parallel search with deduplication and scoring.
 */

import type {
  FishingAnswer,
  FishingSource,
  RawSearchResult,
  ResearchOrchestratorInput,
  ResearchOrchestratorOutput,
} from '@/types/research';
import { validateFishingScope, getRefusalMessage } from '@/lib/research/scopeGuard';
import { understandQuery } from '@/lib/research/queryUnderstanding';
import { generateSearchQueries } from '@/lib/research/queryGenerator';
import { filterByRelevance } from '@/lib/research/contentClassifier';
import { groupDuplicates } from '@/lib/research/duplicateDetection';
import { scoreAndRankSources, selectDiverseSources } from '@/lib/research/sourceScoring';
import { synthesizeAnswer } from '@/lib/research/answerSynthesis';
import { enrichAnswerWithLocalKnowledge } from '@/lib/research/localAnswerEngine';
import type { FishingSearchProvider } from '@/lib/research/providers/types';
import { wikipediaProvider } from '@/lib/research/providers/wikipedia';

export interface OrchestratorOptions {
  providers?: FishingSearchProvider[];
  minSources?: number;
  maxSources?: number;
}

export async function runFishingResearch(
  input: ResearchOrchestratorInput,
  options: OrchestratorOptions = {},
): Promise<ResearchOrchestratorOutput> {
  const { language } = input;
  const now = new Date().toISOString();
  const providers = options.providers ?? [wikipediaProvider];
  const minSources = options.minSources ?? 3;
  const maxSources = options.maxSources ?? 8;

  const scope = validateFishingScope(input.question, language);
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
    return {
      answer: refusal,
      rawResultCount: 0,
      uniqueSourceCount: 0,
      duplicateFamiliesFiltered: 0,
    };
  }

  const understanding = understandQuery(input.question, language, input.locationHint);
  const searchQueries = generateSearchQueries(input.question, understanding, language);
  const providersUsed = providers.map((p) => p.name);

  // Run all queries across all providers in parallel
  const searchTasks = searchQueries.flatMap((sq) =>
    providers.map(async (provider) => {
      try {
        const results = await provider.search(sq);
        return results;
      } catch {
        return [] as RawSearchResult[];
      }
    }),
  );

  const settled = await Promise.allSettled(searchTasks);
  const allRaw: RawSearchResult[] = [];
  for (const result of settled) {
    if (result.status === 'fulfilled') {
      allRaw.push(...result.value);
    }
  }

  const relevant = filterByRelevance(allRaw, language, 70);
  const { unique, filteredCount } = groupDuplicates(relevant);
  const scored = scoreAndRankSources(unique, understanding, language, now);
  const diverse = selectDiverseSources(scored, Math.min(minSources, unique.length), maxSources);

  const answer = synthesizeAnswer({
    question: input.question,
    language,
    understanding,
    sources: diverse,
    searchQueriesUsed: searchQueries.map((q) => q.query),
    providersUsed,
    generatedAt: now,
  });

  const enriched = enrichAnswerWithLocalKnowledge(
    answer,
    input.question,
    understanding,
    input.locationHint,
  );

  return {
    answer: enriched,
    rawResultCount: allRaw.length,
    uniqueSourceCount: diverse.length,
    duplicateFamiliesFiltered: filteredCount,
  };
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
