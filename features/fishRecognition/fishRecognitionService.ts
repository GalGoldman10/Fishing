import { isAiChatAvailable } from '@/lib/config/env';
import { supabase } from '@/lib/api/supabase';
import { runIdentificationPipeline } from '@/lib/fishRecognition/identificationEngine';
import { createMockVisionClient } from '@/lib/fishRecognition/mockVisionClient';
import type { FishIdentificationResult } from '@/lib/fishRecognition/types';
import {
  fishRecognitionResponseSchema,
  type FishMatch,
  type FishRecognitionResponse,
} from '@/lib/validation/schemas';
import { imageUriToBase64, prepareImageForRecognition } from '@/features/fishRecognition/imageUtils';
import { FishRecognitionError } from '@/features/fishRecognition/types';

export interface IdentifyFishRequest {
  imageUri: string;
  imageWidth?: number;
  imageHeight?: number;
  language: 'en' | 'he';
  region?: 'mediterranean_israel' | 'mediterranean';
  debug?: boolean;
}

function mapMatch(match: NonNullable<FishIdentificationResult['primaryMatch']>): FishMatch {
  return {
    speciesId: match.speciesId,
    name: match.name,
    nameHe: match.nameHe,
    nameEn: match.nameEn,
    scientificName: match.scientificName,
    familyHe: match.familyHe,
    familyLatin: match.familyLatin,
    confidence: match.confidence,
    description: match.description,
    identificationNotes: match.identificationNotes,
    matchReason: match.matchReason,
    keyIdentifyingSigns: match.keyIdentifyingSigns,
    confusedWith: match.confusedWith,
    commonInIsrael: match.commonInIsrael,
    habitat: match.habitat,
    bestBait: match.bestBait,
    techniques: match.techniques,
    safetyWarning: match.safetyWarning,
  };
}

function mapToClientResponse(result: FishIdentificationResult): FishRecognitionResponse {
  return {
    status: result.status === 'error' ? 'error' : result.status,
    region: result.region,
    uncertainMessage: result.uncertainMessage,
    errorMessage: result.errorMessage,
    imageQuality: result.imageQuality,
    primaryMatch: result.primaryMatch ? mapMatch(result.primaryMatch) : undefined,
    alternativeMatches: result.alternativeMatches?.map(mapMatch),
  };
}

function mapResponse(data: unknown): FishRecognitionResponse {
  const parsed = fishRecognitionResponseSchema.safeParse(data);
  if (!parsed.success) {
    throw new FishRecognitionError('api', 'identify.errors.apiFailed');
  }
  return parsed.data;
}

function throwForStatus(result: FishRecognitionResponse): void {
  if (result.status === 'no_fish') {
    throw new FishRecognitionError('no_fish', 'identify.errors.noFish');
  }
  if (result.status === 'blurry') {
    throw new FishRecognitionError('blurry', 'identify.errors.blurry');
  }
  if (result.status === 'error') {
    throw new FishRecognitionError('api', 'identify.errors.apiFailed');
  }
}

async function runLocalPipeline(request: IdentifyFishRequest, imageDataUrl: string) {
  const visionClient = createMockVisionClient(request.imageUri);
  const result = await runIdentificationPipeline({
    imageDataUrl,
    language: request.language,
    region: request.region ?? 'mediterranean_israel',
    visionClient,
    debug: request.debug ?? __DEV__,
  });
  return mapToClientResponse(result);
}

export async function identifyFish(request: IdentifyFishRequest): Promise<FishRecognitionResponse> {
  const prepared = await prepareImageForRecognition(
    request.imageUri,
    request.imageWidth,
    request.imageHeight,
  );

  if (!isAiChatAvailable()) {
    const { base64, mimeType } = await imageUriToBase64(prepared.uri);
    const dataUrl = `data:${mimeType};base64,${base64}`;
    const result = await runLocalPipeline({ ...request, imageUri: prepared.uri }, dataUrl);
    throwForStatus(result);
    return result;
  }

  try {
    const { base64, mimeType } = await imageUriToBase64(prepared.uri);
    const { data, error } = await supabase.functions.invoke('fish-identify', {
      body: {
        imageBase64: base64,
        mimeType,
        language: request.language,
        region: request.region ?? 'mediterranean_israel',
        debug: request.debug === true,
      },
    });

    if (error) {
      console.warn('[fish-identify] edge error, using constrained local pipeline:', error.message);
      const dataUrl = `data:${mimeType};base64,${base64}`;
      const fallback = await runLocalPipeline({ ...request, imageUri: prepared.uri }, dataUrl);
      throwForStatus(fallback);
      return fallback;
    }

    const result = mapResponse(data);
    throwForStatus(result);
    return result;
  } catch (err) {
    if (err instanceof FishRecognitionError) throw err;

    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('network') || message.includes('fetch') || message.includes('Failed to fetch')) {
      throw new FishRecognitionError('network', 'identify.errors.network');
    }

    throw new FishRecognitionError('api', 'identify.errors.apiFailed');
  }
}
