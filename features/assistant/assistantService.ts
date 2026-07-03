import { isMockMode, env } from '@/lib/config/env';
import { supabase } from '@/lib/api/supabase';
import { FishingAssistantResponse } from '@/lib/validation/schemas';
import { performFishingResearch } from '@/features/assistant/researchService';
import i18n from '@/lib/localization/i18n';
import { formatDateTime } from '@/lib/localization/format';
import type { FishingAnswer } from '@/types/research';

export interface ChatRequest {
  message: string;
  sessionId?: string;
  language: 'en' | 'he';
  location?: { latitude: number; longitude: number };
  spotId?: string;
  locationHint?: string;
}

export interface ChatResponse {
  answer: string;
  sessionId?: string;
  structured?: FishingAssistantResponse;
  webSearchUsed?: boolean;
  research?: FishingAnswer;
}

function toStructured(research: FishingAnswer): FishingAssistantResponse {
  return {
    answer: research.directAnswer,
    location: research.location
      ? { name: research.location.name, latitude: research.location.latitude, longitude: research.location.longitude }
      : undefined,
    possibleSpecies: (research.species ?? []).map((s) => ({
      name: s.commonName,
      likelihood: s.likelihood,
      seasonNote: s.season,
    })),
    recommendedSetup: research.equipment?.[0]
      ? {
          method: i18n.t('fishingMethods.shore_fishing', { lng: research.language }),
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
      ? { summary: research.conditions.summary ?? '', suitability: research.conditions.suitability ?? 'unknown', retrievedAt: research.conditions.retrievedAt }
      : undefined,
    hazards: research.safetyWarnings ?? [],
    regulations: (research.regulations ?? []).map((r) => r.summary),
    followUpQuestions: [],
    sources: research.sources.map((s) => ({
      title: s.title,
      url: s.url,
      authority: `${s.sourceType} (${s.domain})`,
      checkedAt: s.accessedAt,
    })),
    confidence: research.confidence === 'high' ? 'high' : research.confidence === 'medium' ? 'medium' : 'low',
    freshnessMessage: i18n.t('chat.freshness', {
      lng: research.language,
      count: research.sources.length,
      time: formatDateTime(research.lastVerifiedAt, research.language),
    }),
  };
}

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const canUseEdgeAI =
    env.supabaseUrl &&
    env.supabaseAnonKey &&
    env.supabaseUrl !== 'http://localhost:54321' &&
    !env.supabaseAnonKey.includes('placeholder');

  if (!isMockMode() || canUseEdgeAI) {
    try {
      const { data, error } = await supabase.functions.invoke('fishing-assistant', {
        body: request,
      });
      if (!error && data) return data as ChatResponse;
    } catch {
      // fall through to local research
    }
  }

  return getResearchEnhancedResponse(request);
}

async function getResearchEnhancedResponse(request: ChatRequest): Promise<ChatResponse> {
  const locationHint = request.locationHint ?? (request.location ? 'Israel Mediterranean coast' : undefined);

  const { answer: researchAnswer, structured, researchUsed } = await performFishingResearch({
    question: request.message,
    language: request.language,
    location: request.location,
    locationHint,
    spotId: request.spotId,
  });

  if (researchAnswer.refused) {
    return { answer: researchAnswer.directAnswer, structured, webSearchUsed: false, research: researchAnswer };
  }

  // Ensure structured output matches the enriched local answer
  const finalStructured = toStructured(researchAnswer);
  if (researchAnswer.species?.length) finalStructured.possibleSpecies = researchAnswer.species.map((s) => ({
    name: s.commonName,
    likelihood: s.likelihood,
    seasonNote: s.season,
  }));

  return {
    answer: researchAnswer.directAnswer,
    structured: finalStructured,
    webSearchUsed: researchUsed,
    research: researchAnswer,
  };
}
