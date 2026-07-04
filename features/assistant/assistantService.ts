import { isAiChatAvailable } from '@/lib/config/env';
import { supabase } from '@/lib/api/supabase';
import { FishingAssistantResponse } from '@/lib/validation/schemas';
import { performFishingResearch } from '@/features/assistant/researchService';
import { tryAnswerSpotSiteQuestion } from '@/lib/research/spotSiteAnswer';
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
  recentMessages?: string[];
}

export interface ChatResponse {
  answer: string;
  sessionId?: string;
  structured?: FishingAssistantResponse;
  webSearchUsed?: boolean;
  research?: FishingAnswer;
  aiPowered?: boolean;
  /** Set when ChatGPT was requested but local engine answered instead. */
  aiFallbackReason?: 'not_configured' | 'edge_error';
  /** Live marine / spot-page data from the site database. */
  fromSiteData?: boolean;
}

const AI_NOT_CONFIGURED = /OPENAI_API_KEY|not configured|ChatGPT לא מוגדר/i;

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
  const siteAnswer = await tryAnswerSpotSiteQuestion({
    question: request.message,
    language: request.language,
    spotId: request.spotId,
    locationHint: request.locationHint,
  });
  if (siteAnswer) {
    return {
      answer: siteAnswer.answer,
      structured: siteAnswer.structured,
      research: siteAnswer.research,
      webSearchUsed: false,
      aiPowered: false,
      fromSiteData: true,
    };
  }

  if (isAiChatAvailable()) {
    try {
      const { data, error } = await supabase.functions.invoke('fishing-assistant', {
        body: request,
      });
      if (!error && data) {
        const payload = data as ChatResponse & { error?: string };
        if (payload.error) {
          throw new Error(payload.error);
        }
        if (AI_NOT_CONFIGURED.test(payload.answer ?? '')) {
          return {
            answer: payload.answer,
            sessionId: payload.sessionId,
            aiPowered: false,
            aiFallbackReason: 'not_configured',
          };
        }
        return { ...payload, aiPowered: true };
      }
      if (error) {
        console.warn('[chat] fishing-assistant error, falling back to local research:', error.message);
        const local = await getResearchEnhancedResponse(request);
        return { ...local, aiPowered: false, aiFallbackReason: 'edge_error' };
      }
    } catch (err) {
      console.warn('[chat] fishing-assistant unavailable, falling back to local research:', err);
      const local = await getResearchEnhancedResponse(request);
      return { ...local, aiPowered: false, aiFallbackReason: 'edge_error' };
    }
  }

  const local = await getResearchEnhancedResponse(request);
  return { ...local, aiPowered: false, aiFallbackReason: 'not_configured' };
}

async function getResearchEnhancedResponse(request: ChatRequest): Promise<ChatResponse> {
  const locationHint = request.locationHint ?? (request.location ? 'Israel Mediterranean coast' : undefined);

  const { answer: researchAnswer, structured, researchUsed } = await performFishingResearch({
    question: request.message,
    language: request.language,
    location: request.location,
    locationHint,
    spotId: request.spotId,
    conversationContext: request.recentMessages,
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
