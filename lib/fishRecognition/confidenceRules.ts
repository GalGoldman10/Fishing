import type { CandidateScore } from '@/lib/fishRecognition/candidateScoring';
import type {
  DetectedVisualFeatures,
  FishIdentificationResult,
  FishIdentificationStatus,
  IdentificationDebugLog,
  IdentificationRegion,
  ImageQualityAssessment,
  RankedSpeciesMatch,
} from '@/lib/fishRecognition/types';
import {
  buildMatchPresentation,
  FISH_IDENTIFICATION_BY_ID,
} from '@/lib/fishRecognition/identificationCatalog';

export const CONFIDENCE_VERY_HIGH = 85;
export const CONFIDENCE_SURE = 70;
export const CONFIDENCE_MIN = 50;
export const IMAGE_QUALITY_MIN = 55;

export interface ConfidenceDecisionInput {
  language: 'en' | 'he';
  region: IdentificationRegion;
  imageQuality: ImageQualityAssessment;
  features: DetectedVisualFeatures;
  candidateScores: CandidateScore[];
  visionRanking?: RankedSpeciesMatch[];
}

export function mergeVisionWithScores(
  candidateScores: CandidateScore[],
  visionRanking: RankedSpeciesMatch[] | undefined,
): RankedSpeciesMatch[] {
  const allowed = new Set(candidateScores.map((c) => c.speciesId));
  const scoreMap = Object.fromEntries(candidateScores.map((c) => [c.speciesId, c.score]));

  if (!visionRanking?.length) {
    return candidateScores.slice(0, 4).map((c, index) => ({
      speciesId: c.speciesId,
      confidence: Math.max(20, c.score - index * 8),
      matchReason: c.reasons.join('; ') || 'Visual feature similarity',
      keyIdentifyingSigns: FISH_IDENTIFICATION_BY_ID[c.speciesId]?.visual.visualFeatures ?? [],
    }));
  }

  return visionRanking
    .filter((match) => allowed.has(match.speciesId))
    .map((match) => {
      const featureCap = scoreMap[match.speciesId] ?? 0;
      const capped = Math.min(match.confidence, featureCap + 12);
      return { ...match, confidence: Math.max(0, Math.round(capped)) };
    })
    .sort((a, b) => b.confidence - a.confidence);
}

export function buildIdentificationResult(input: ConfidenceDecisionInput): FishIdentificationResult {
  const { language, region, imageQuality, features, candidateScores } = input;
  const rejectedCandidates = candidateScores
    .slice(8)
    .map((c) => ({ speciesId: c.speciesId, reason: 'Below top candidate cutoff' }));

  const debug: IdentificationDebugLog = {
    detectedFeatures: features,
    imageQuality,
    region,
    candidateScores: candidateScores.slice(0, 10),
    rejectedCandidates,
    visionRanking: input.visionRanking,
    finalStatus: 'error',
    confidenceCapApplied: Boolean(input.visionRanking?.length),
  };

  if (!features.fishDetected) {
    debug.finalStatus = 'no_fish';
    return {
      status: 'no_fish',
      region,
      errorMessage:
        language === 'he'
          ? 'לא זוהה דג בתמונה. העלו תמונה ברורה יותר של דג שלם.'
          : 'No fish detected in the image. Upload a clearer photo of a whole fish.',
      imageQuality,
      detectedFeatures: features,
      debug,
    };
  }

  if (imageQuality.score < IMAGE_QUALITY_MIN) {
    debug.finalStatus = 'blurry';
    return {
      status: 'blurry',
      region,
      uncertainMessage:
        language === 'he'
          ? 'התמונה לא ברורה מספיק לזיהוי מדויק. העלו תמונה חדה יותר של הדג מהצד, בתאורה טובה.'
          : 'The image is not clear enough for accurate identification. Upload a sharper side-view photo in good lighting.',
      imageQuality,
      detectedFeatures: features,
      debug,
    };
  }

  const ranked = mergeVisionWithScores(candidateScores, input.visionRanking);
  const top = ranked[0];
  if (!top || top.confidence < CONFIDENCE_MIN) {
    debug.finalStatus = 'uncertain';
    const alternatives = ranked.slice(0, 3);
    return {
      status: 'uncertain',
      region,
      uncertainMessage:
        language === 'he'
          ? 'התמונה לא ברורה מספיק לזיהוי מדויק של הדג. העלו תמונה ברורה יותר.'
          : 'The image is not clear enough to identify the fish accurately. Please upload a clearer photo.',
      primaryMatch: alternatives[0]
        ? buildMatchPresentation(
            alternatives[0].speciesId,
            alternatives[0].confidence,
            alternatives[0].matchReason,
            alternatives[0].keyIdentifyingSigns,
            language,
          ) ?? undefined
        : undefined,
      alternativeMatches: alternatives
        .slice(1)
        .map((m) =>
          buildMatchPresentation(
            m.speciesId,
            m.confidence,
            m.matchReason,
            m.keyIdentifyingSigns,
            language,
          ),
        )
        .filter(Boolean) as NonNullable<ReturnType<typeof buildMatchPresentation>>[],
      imageQuality,
      detectedFeatures: features,
      debug,
    };
  }

  const alternatives = ranked.slice(1, 4);
  let status: FishIdentificationStatus = 'success';
  let uncertainMessage: string | undefined;

  if (top.confidence < CONFIDENCE_SURE) {
    status = 'uncertain';
    uncertainMessage =
      language === 'he'
        ? 'אני לא בטוח לגמרי. אלה ההתאמות הקרובות ביותר מהמדריך שלנו:'
        : "I'm not fully sure. These are the closest matches from our guide:";
  } else if (top.confidence < CONFIDENCE_VERY_HIGH) {
    status = 'uncertain';
    uncertainMessage =
      language === 'he'
        ? 'ההתאמה הטובה ביותר עם חלופות אפשריות:'
        : 'Best match with possible alternatives:';
  }

  debug.finalStatus = status;

  return {
    status,
    region,
    uncertainMessage,
    primaryMatch:
      buildMatchPresentation(
        top.speciesId,
        top.confidence,
        top.matchReason,
        top.keyIdentifyingSigns,
        language,
      ) ?? undefined,
    alternativeMatches: alternatives
      .map((m) =>
        buildMatchPresentation(
          m.speciesId,
          m.confidence,
          m.matchReason,
          m.keyIdentifyingSigns,
          language,
        ),
      )
      .filter(Boolean) as NonNullable<ReturnType<typeof buildMatchPresentation>>[],
    imageQuality,
    detectedFeatures: features,
    debug,
  };
}

export function validateRankedMatches(
  matches: RankedSpeciesMatch[],
  allowedIds: Set<string>,
): RankedSpeciesMatch[] {
  return matches.filter((m) => allowedIds.has(m.speciesId));
}
