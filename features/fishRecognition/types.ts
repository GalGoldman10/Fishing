import type { FishRecognitionResponse } from '@/lib/validation/schemas';

export interface FishRecognitionHistoryEntry {
  id: string;
  imageUri: string;
  identifiedAt: string;
  language: 'en' | 'he';
  result: FishRecognitionResponse;
}

export type FishRecognitionErrorCode =
  | 'no_fish'
  | 'blurry'
  | 'network'
  | 'api'
  | 'unknown';

export class FishRecognitionError extends Error {
  readonly code: FishRecognitionErrorCode;
  readonly userMessageKey: string;

  constructor(code: FishRecognitionErrorCode, userMessageKey: string) {
    super(userMessageKey);
    this.name = 'FishRecognitionError';
    this.code = code;
    this.userMessageKey = userMessageKey;
  }
}
