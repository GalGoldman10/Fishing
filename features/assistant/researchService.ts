/**
 * Client-side fishing research service.
 * Uses local orchestrator in mock mode, edge function when Supabase is configured.
 */

import { supabase } from '@/lib/api/supabase';
import { hasSupabaseBackend } from '@/lib/config/env';
import i18n from '@/lib/localization/i18n';
import { formatDateTime } from '@/lib/localization/format';
import { runFishingResearch, sourcesToLegacyFormat } from '@/lib/research/orchestrator';
import { normalizeFishingQueryText } from '@/lib/research/fishingTermNormalization';
import type { FishingAnswer, ResearchOrchestratorInput } from '@/types/research';
import { FishingAssistantResponse } from '@/lib/validation/schemas';

function mapServerResearchToAnswer(data: Record<string, unknown>, input: ResearchOrchestratorInput): FishingAnswer {
  return {
    question: String(data.question ?? input.question),
    language: (data.language as 'en' | 'he') ?? input.language,
    directAnswer: String(data.directAnswer ?? data.summary ?? ''),
    summary: String(data.summary ?? data.directAnswer ?? ''),
    confidence: (data.confidence as FishingAnswer['confidence']) ?? 'limited',
    confidenceReason: String(data.confidenceReason ?? ''),
    sources: (data.sources as FishingAnswer['sources']) ?? [],
    searchQueriesUsed: (data.searchQueriesUsed as string[]) ?? [],
    providersUsed: (data.providersUsed as string[]) ?? [],
    safetyWarnings: (data.safetyWarnings as string[]) ?? [],
    regulations: (data.regulations as FishingAnswer['regulations']) ?? [],
    generatedAt: String(data.generatedAt ?? new Date().toISOString()),
    lastVerifiedAt: String(data.lastVerifiedAt ?? new Date().toISOString()),
    refused: Boolean(data.refused),
    refusalReason: data.refusalReason as string | undefined,
  };
}

export interface ResearchResponse {
  answer: FishingAnswer;
  structured: FishingAssistantResponse;
  researchUsed: boolean;
}

function toAssistantResponse(research: FishingAnswer): FishingAssistantResponse {
  return {
    answer: research.directAnswer,
    location: research.location
      ? {
          name: research.location.name,
          latitude: research.location.latitude,
          longitude: research.location.longitude,
        }
      : undefined,
    possibleSpecies: (research.species ?? []).map((s) => ({
      speciesId: undefined,
      name: s.localName ?? s.commonName,
      likelihood: s.likelihood,
      seasonNote: s.season,
    })),
    recommendedSetup: research.equipment?.[0]
      ? {
          method:
            research.techniques?.[0]?.name ??
            i18n.t('fishingMethods.shore_fishing', { lng: research.language }),
          rod: research.equipment[0].rod ?? '',
          reel: research.equipment[0].reel ?? '',
          mainLine: research.equipment[0].mainLine ?? '',
          leader: research.equipment[0].leader ?? '',
          hookOrLure: research.equipment[0].hookOrLure ?? '',
          weight: research.equipment[0].sinker,
          bait: research.equipment[0].bait,
          accessories: [],
        }
      : undefined,
    conditions: research.conditions
      ? {
          summary: research.conditions.summary ?? '',
          suitability: research.conditions.suitability ?? 'unknown',
          retrievedAt: research.conditions.retrievedAt,
        }
      : undefined,
    hazards: research.safetyWarnings ?? [],
    regulations: (research.regulations ?? []).map((r) => r.summary),
    followUpQuestions: [],
    sources: sourcesToLegacyFormat(research.sources),
    confidence:
      research.confidence === 'high' ? 'high' : research.confidence === 'medium' ? 'medium' : 'low',
    freshnessMessage: i18n.t('chat.freshness', {
      lng: research.language,
      count: research.sources.length,
      time: formatDateTime(research.lastVerifiedAt, research.language),
    }),
  };
}

export async function performFishingResearch(
  input: ResearchOrchestratorInput,
): Promise<ResearchResponse> {
  const canUseEdge = hasSupabaseBackend();

  const normalizedQuestion = normalizeFishingQueryText(input.question, input.language);
  const researchInput = { ...input, question: normalizedQuestion };

  if (canUseEdge) {
    try {
      const { data, error } = await supabase.functions.invoke('fishing-research', {
        body: {
          question: normalizedQuestion,
          language: input.language,
          locationHint: input.locationHint,
          location: input.location,
          spotId: input.spotId,
          recentMessages: input.conversationContext,
        },
      });
      if (!error && data && !data.error) {
        const answer = mapServerResearchToAnswer(data, input);
        return {
          answer,
          structured: toAssistantResponse(answer),
          researchUsed: (answer.sources?.length ?? 0) > 0,
        };
      }
    } catch {
      // fall through to local
    }
  }

  const result = await runFishingResearch(researchInput);
  return {
    answer: result.answer,
    structured: toAssistantResponse(result.answer),
    researchUsed: result.uniqueSourceCount > 0 || result.answer.species != null,
  };
}
