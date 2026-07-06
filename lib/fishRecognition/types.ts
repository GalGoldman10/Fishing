export type IdentificationRegion = 'mediterranean_israel' | 'mediterranean' | 'global';

export type FishIdentificationStatus =
  | 'success'
  | 'uncertain'
  | 'no_fish'
  | 'blurry'
  | 'error';

export interface ImageQualityAssessment {
  score: number;
  issues: string[];
  recommendation?: string;
}

export interface DetectedVisualFeatures {
  fishDetected: boolean;
  bodyShape?: string;
  primaryColors?: string[];
  patterns?: string[];
  tailShape?: string;
  dorsalFin?: string;
  mouthShape?: string;
  eyePosition?: string;
  estimatedLengthCm?: string;
  environment?: string;
  viewAngle?: string;
}

export interface FishVisualProfile {
  bodyShape: string;
  colorPatterns: string[];
  finShape: string;
  tailShape: string;
  mouthShape: string;
  visualFeatures: string[];
  commonSizeCm: string;
  identifyingSigns: { en: string; he: string };
}

export interface FishIdentificationCatalogEntry {
  speciesId: string;
  commonNameEn: string;
  commonNameHe: string;
  scientificName: string;
  familyHe?: string;
  familyLatin?: string;
  habitat: string;
  region: IdentificationRegion[];
  commonInIsrael: boolean;
  confusedWithSpeciesIds: string[];
  referenceImageUrls: string[];
  visual: FishVisualProfile;
}

export interface RankedSpeciesMatch {
  speciesId: string;
  confidence: number;
  matchReason: string;
  keyIdentifyingSigns: string[];
}

export interface FishMatchPresentation {
  speciesId: string;
  name: string;
  nameHe: string;
  nameEn: string;
  scientificName: string;
  familyHe?: string;
  familyLatin?: string;
  confidence: number;
  description: string;
  identificationNotes: string;
  matchReason: string;
  keyIdentifyingSigns: string[];
  confusedWith: { speciesId: string; name: string }[];
  commonInIsrael: boolean;
  habitat: string;
  bestBait: string;
  techniques: string;
  safetyWarning?: string;
}

export interface IdentificationDebugLog {
  detectedFeatures: DetectedVisualFeatures;
  imageQuality: ImageQualityAssessment;
  region: IdentificationRegion;
  candidateScores: { speciesId: string; nameHe: string; score: number; reasons: string[] }[];
  rejectedCandidates: { speciesId: string; reason: string }[];
  visionRanking?: RankedSpeciesMatch[];
  finalStatus: FishIdentificationStatus;
  confidenceCapApplied: boolean;
}

export interface FishIdentificationResult {
  status: FishIdentificationStatus;
  region: IdentificationRegion;
  primaryMatch?: FishMatchPresentation;
  alternativeMatches?: FishMatchPresentation[];
  uncertainMessage?: string;
  errorMessage?: string;
  imageQuality?: ImageQualityAssessment;
  detectedFeatures?: DetectedVisualFeatures;
  debug?: IdentificationDebugLog;
}

export interface FeatureExtractionResponse {
  imageQuality: ImageQualityAssessment;
  features: DetectedVisualFeatures;
}

export interface VisionClient {
  extractFeatures(
    imageDataUrl: string,
    language: 'en' | 'he',
  ): Promise<FeatureExtractionResponse>;
  rankCandidates(
    imageDataUrl: string,
    language: 'en' | 'he',
    region: IdentificationRegion,
    features: DetectedVisualFeatures,
    imageQuality: ImageQualityAssessment,
    candidatePayload: unknown[],
  ): Promise<RankedSpeciesMatch[]>;
}

export interface FishIdentificationReport {
  id: string;
  imageUri: string;
  reportedAt: string;
  language: 'en' | 'he';
  aiResult: FishIdentificationResult;
  correctFishName?: string;
  notes?: string;
}
