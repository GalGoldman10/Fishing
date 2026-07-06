import {
  assessImageQualityFromFeatures,
  scoreCatalogCandidates,
} from '@/lib/fishRecognition/candidateScoring';
import {
  buildIdentificationResult,
  validateRankedMatches,
} from '@/lib/fishRecognition/confidenceRules';
import {
  FISH_IDENTIFICATION_CATALOG,
  getAllowedSpeciesIds,
} from '@/lib/fishRecognition/identificationCatalog';
import { FEATURE_EXTRACTION_PROMPT, buildRankingPrompt } from '@/lib/fishRecognition/prompts';
import type {
  DetectedVisualFeatures,
  FeatureExtractionResponse,
  FishIdentificationResult,
  IdentificationRegion,
  ImageQualityAssessment,
  RankedSpeciesMatch,
  VisionClient,
} from '@/lib/fishRecognition/types';
import { logIdentificationDebug } from '@/lib/fishRecognition/debugLog';

export interface IdentificationPipelineInput {
  imageDataUrl: string;
  language: 'en' | 'he';
  region?: IdentificationRegion;
  visionClient: VisionClient;
  debug?: boolean;
}

function buildCandidatePayload(topIds: string[]) {
  return topIds.map((id) => {
    const entry = FISH_IDENTIFICATION_CATALOG.find((e) => e.speciesId === id);
    if (!entry) return null;
    return {
      speciesId: entry.speciesId,
      commonNameHe: entry.commonNameHe,
      commonNameEn: entry.commonNameEn,
      scientificName: entry.scientificName,
      familyLatin: entry.familyLatin,
      commonInIsrael: entry.commonInIsrael,
      visual: entry.visual,
      habitat: entry.habitat,
    };
  }).filter(Boolean);
}

export async function runIdentificationPipeline(
  input: IdentificationPipelineInput,
): Promise<FishIdentificationResult> {
  const region = input.region ?? 'mediterranean_israel';
  const allowedIds = new Set(getAllowedSpeciesIds());

  const { features, imageQuality: rawQuality } = await input.visionClient.extractFeatures(
    input.imageDataUrl,
    input.language,
  );

  const imageQuality = assessImageQualityFromFeatures(rawQuality, features);
  const candidateScores = scoreCatalogCandidates(features, FISH_IDENTIFICATION_CATALOG, region);
  const topIds = candidateScores.slice(0, 8).map((c) => c.speciesId);
  const candidatePayload = buildCandidatePayload(topIds);

  let visionRanking: RankedSpeciesMatch[] = [];
  if (features.fishDetected && imageQuality.score >= 40 && candidatePayload.length > 0) {
    visionRanking = await input.visionClient.rankCandidates(
      input.imageDataUrl,
      input.language,
      region,
      features,
      imageQuality,
      candidatePayload,
    );
    visionRanking = validateRankedMatches(visionRanking, allowedIds);
  }

  const result = buildIdentificationResult({
    language: input.language,
    region,
    imageQuality,
    features,
    candidateScores,
    visionRanking,
  });

  if (input.debug) {
    logIdentificationDebug(result.debug);
  }

  return result;
}

export { FEATURE_EXTRACTION_PROMPT, buildRankingPrompt };
