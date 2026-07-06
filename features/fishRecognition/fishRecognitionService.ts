import { isAiChatAvailable } from '@/lib/config/env';
import { supabase } from '@/lib/api/supabase';
import {
  fishRecognitionResponseSchema,
  type FishRecognitionResponse,
} from '@/lib/validation/schemas';
import { imageUriToBase64 } from '@/features/fishRecognition/imageUtils';
import { mockIdentifyFish } from '@/features/fishRecognition/mockFishRecognition';
import { FishRecognitionError } from '@/features/fishRecognition/types';

export interface IdentifyFishRequest {
  imageUri: string;
  language: 'en' | 'he';
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

export async function identifyFish(request: IdentifyFishRequest): Promise<FishRecognitionResponse> {
  if (!isAiChatAvailable()) {
    const result = await mockIdentifyFish(request.imageUri, request.language);
    throwForStatus(result);
    return result;
  }

  try {
    const { base64, mimeType } = await imageUriToBase64(request.imageUri);
    const { data, error } = await supabase.functions.invoke('fish-identify', {
      body: {
        imageBase64: base64,
        mimeType,
        language: request.language,
      },
    });

    if (error) {
      console.warn('[fish-identify] edge error, falling back to mock:', error.message);
      const fallback = await mockIdentifyFish(request.imageUri, request.language);
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

    console.warn('[fish-identify] failed, using mock fallback:', err);
    const fallback = await mockIdentifyFish(request.imageUri, request.language);
    throwForStatus(fallback);
    return fallback;
  }
}
