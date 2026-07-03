/**
 * Fishing research platform — core type definitions.
 */

export type FishingSourceType =
  | 'government'
  | 'regulation'
  | 'weather'
  | 'marine'
  | 'scientific'
  | 'fishing-organization'
  | 'local-report'
  | 'tackle-shop'
  | 'charter'
  | 'forum'
  | 'social'
  | 'map'
  | 'other';

export type FishingSearchCategory =
  | 'location'
  | 'species'
  | 'equipment'
  | 'technique'
  | 'regulation'
  | 'conditions'
  | 'report'
  | 'safety'
  | 'general';

export type FishingFreshness = 'live' | 'day' | 'week' | 'month' | 'year' | 'any';

export type ResearchConfidence = 'high' | 'medium' | 'limited';

export interface FishingSearchQuery {
  query: string;
  language: 'en' | 'he';
  country?: string;
  region?: string;
  coordinates?: { latitude: number; longitude: number };
  category?: FishingSearchCategory;
  freshness?: FishingFreshness;
  sourceCategory?: 'official' | 'fishing' | 'local' | 'community' | 'scientific' | 'any';
}

export interface RawSearchResult {
  title: string;
  url: string;
  snippet: string;
  provider: string;
  publishedAt?: string;
  updatedAt?: string;
}

export interface FishingSource {
  id: string;
  title: string;
  url: string;
  domain: string;
  sourceType: FishingSourceType;
  publishedAt?: string;
  updatedAt?: string;
  accessedAt: string;
  country?: string;
  language?: string;
  reliabilityScore: number;
  freshnessScore: number;
  relevanceScore: number;
  fishingRelevanceScore: number;
  isPrimarySource: boolean;
  duplicateFamilyId?: string;
  snippet: string;
  provider: string;
}

export interface SourceConflict {
  topic: string;
  claims: Array<{ claim: string; sourceIds: string[]; reliability: ResearchConfidence }>;
  resolution: string;
}

export interface FishingLocation {
  name?: string;
  country?: string;
  region?: string;
  city?: string;
  waterType?: 'freshwater' | 'saltwater' | 'brackish' | 'unknown';
  terrainType?: string;
  latitude?: number;
  longitude?: number;
}

export interface FishingConditions {
  summary?: string;
  wind?: string;
  waves?: string;
  tide?: string;
  waterTemperature?: string;
  suitability?: 'good' | 'acceptable' | 'poor' | 'unknown';
  retrievedAt?: string;
  isLive?: boolean;
}

export interface FishRecommendation {
  commonName: string;
  localName?: string;
  scientificName?: string;
  likelihood: 'high' | 'medium' | 'low' | 'unknown';
  season?: string;
  preferredArea?: string;
  technique?: string;
  baitOrLure?: string;
  sourceIds?: string[];
}

export interface EquipmentRecommendation {
  rod?: string;
  reel?: string;
  mainLine?: string;
  leader?: string;
  hookOrLure?: string;
  sinker?: string;
  rig?: string;
  bait?: string;
  castingMethod?: string;
  sourceIds?: string[];
}

export interface TechniqueRecommendation {
  name: string;
  description: string;
  sourceIds?: string[];
}

export interface RegulationItem {
  title: string;
  summary: string;
  authority?: string;
  effectiveDate?: string;
  sourceId?: string;
  isOfficial: boolean;
}

export interface FishingAnswer {
  question: string;
  language: 'en' | 'he';
  directAnswer: string;
  summary: string;
  quickAnswer?: string;
  location?: FishingLocation;
  conditions?: FishingConditions;
  species?: FishRecommendation[];
  equipment?: EquipmentRecommendation[];
  techniques?: TechniqueRecommendation[];
  regulations?: RegulationItem[];
  safetyWarnings?: string[];
  confidence: ResearchConfidence;
  confidenceReason: string;
  sources: FishingSource[];
  conflicts?: SourceConflict[];
  searchQueriesUsed: string[];
  providersUsed: string[];
  generatedAt: string;
  lastVerifiedAt: string;
  refused?: boolean;
  refusalReason?: string;
}

export interface ResearchOrchestratorInput {
  question: string;
  language: 'en' | 'he';
  location?: { latitude: number; longitude: number };
  locationHint?: string;
  spotId?: string;
  country?: string;
}

export interface ResearchOrchestratorOutput {
  answer: FishingAnswer;
  rawResultCount: number;
  uniqueSourceCount: number;
  duplicateFamiliesFiltered: number;
}
