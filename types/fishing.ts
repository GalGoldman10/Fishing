export type VerificationStatus = 'verified' | 'community' | 'estimated' | 'demo' | 'unknown';
export type ConfidenceLevel = 'verified' | 'high' | 'medium' | 'low' | 'unknown';
export type ShoreType = 'sandy' | 'rocky' | 'mixed' | 'pier' | 'harbor' | 'cliff' | 'unknown';
export type SeabedType = 'sand' | 'rock' | 'reef' | 'mud' | 'mixed' | 'unknown';
export type EnvironmentType = 'shore' | 'pier' | 'harbor' | 'rocks' | 'boat' | 'kayak';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type DifficultyLevel = 'easy' | 'moderate' | 'difficult' | 'expert';
export type Likelihood = 'high' | 'medium' | 'low' | 'unknown';
export type Suitability = 'good' | 'acceptable' | 'poor' | 'unknown';
export type FishingMethod =
  | 'surf_casting'
  | 'bottom_fishing'
  | 'float_fishing'
  | 'lure_fishing'
  | 'fly_fishing'
  | 'jigging'
  | 'trolling';

export interface LocalizedNames {
  en?: string;
  he?: string;
  [key: string]: string | undefined;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface FishingSpotSummary {
  id: string;
  slug: string;
  name: string;
  localizedNames?: LocalizedNames;
  countryCode: string;
  region?: string;
  environmentType: EnvironmentType;
  shoreType: ShoreType;
  seabedType: SeabedType;
  /** Where the fishing pin appears — the actual fishing access point. */
  latitude: number;
  longitude: number;
  /** Nearby sea coordinate used for marine forecast requests (never inland). */
  marineCoordinates?: Coordinates;
  /** Closest suitable parking location. */
  parkingCoordinates?: Coordinates;
  /** Start of walking access. */
  accessPointCoordinates?: Coordinates;
  /** Where the coordinates came from (e.g. 'manual-verification', 'geocoder'). */
  coordinateSource?: string;
  coordinatesVerifiedAt?: string;
  coordinatesVerifiedBy?: string;
  difficultyLevel: DifficultyLevel;
  verificationStatus: VerificationStatus;
  confidenceScore: number;
  distanceKm?: number;
}

export interface FishingSpotDetails extends FishingSpotSummary {
  description?: string;
  municipality?: string;
  accessType?: string;
  parkingInformation?: string;
  accessibilityInformation?: string;
  suitableForChildren?: boolean;
  nightAccess?: boolean;
  boatAccess?: boolean;
  fishingMethods: FishingMethod[];
  hazardLevel?: string;
  hazardNotes?: string;
  verifiedAt?: string;
  species: SpotSpeciesInfo[];
  equipment: EquipmentRecommendation[];
  hazards: HazardInfo[];
  regulations: RegulationInfo[];
  sources: SourceInfo[];
}

export interface SpotSpeciesInfo {
  speciesId: string;
  commonName: string;
  scientificName?: string;
  localizedNames?: LocalizedNames;
  likelihood: Likelihood;
  seasonalMonths?: number[];
  preferredMethods?: string[];
  preferredBaits?: string[];
  confidenceScore: number;
}

export interface SpeciesSummary {
  id: string;
  commonName: string;
  scientificName?: string;
  localizedNames?: LocalizedNames;
  habitat?: string;
  familyHe?: string;
  familyLatin?: string;
  environmentTypes: string[];
  conservationStatus?: string;
}

export interface SpeciesDetails extends SpeciesSummary {
  aliases?: string[];
  description?: string;
  identificationNotes?: string;
  preferredDepthMin?: number;
  preferredDepthMax?: number;
  activeTimes?: string[];
  handlingNotes?: string;
  consumptionWarning?: string;
  localizedContent?: {
    description: { en: string; he: string };
    habitat: { en: string; he: string };
    identificationNotes: { en: string; he: string };
    handlingNotes: { en: string; he: string };
    consumptionWarning: { en: string; he: string };
    diet?: { en: string; he: string };
    sizeSeason?: { en: string; he: string };
    cookingMethods?: { en: string; he: string };
    reproduction?: { en: string; he: string };
    familyHe?: string;
    familyLatin?: string;
    aliases?: string[];
    sourceUrl?: string;
    infoStatus?: string;
  };
}

export interface EquipmentRecommendation {
  id: string;
  fishingMethod: string;
  experienceLevel: ExperienceLevel;
  rodSpecification?: Record<string, unknown>;
  reelSpecification?: Record<string, unknown>;
  lineSpecification?: Record<string, unknown>;
  leaderSpecification?: Record<string, unknown>;
  terminalTackle?: Record<string, unknown>;
  baitAndLures?: Record<string, unknown>;
  accessories?: Record<string, unknown>;
  reasoning?: string;
  confidenceScore: number;
}

export interface HazardInfo {
  id: string;
  type: string;
  severity: string;
  title: string;
  description?: string;
  localizedTitle?: { en: string; he: string };
  localizedDescription?: { en: string; he: string };
  seasonalMonths?: number[];
}

export interface RegulationInfo {
  id: string;
  title: string;
  summary: string;
  localizedSummary?: { en: string; he: string };
  licenseRequired?: boolean;
  minimumSize?: string;
  bagLimit?: string;
  closedSeason?: string;
  effectiveFrom?: string;
  lastCheckedAt?: string;
  source?: SourceInfo;
}

export interface SourceInfo {
  id: string;
  title: string;
  organization?: string;
  url?: string;
  checkedAt?: string;
  reliabilityLevel?: string;
}

export interface MarineConditions {
  weather?: string;
  windSpeed?: number;
  windDirection?: string;
  waveHeight?: number;
  wavePeriod?: number;
  airTemperature?: number;
  waterTemperature?: number;
  tideHeight?: number;
  sunrise?: string;
  sunset?: string;
  provider: string;
  retrievedAt: string;
  suitability: Suitability;
  summary: string;
  localizedSummary?: { en: string; he: string };
}

export interface TripPlan {
  id: string;
  userId: string;
  spotId: string;
  spotName?: string;
  plannedStart: string;
  plannedEnd?: string;
  targetSpeciesIds?: string[];
  selectedMethod?: string;
  equipmentChecklist?: Record<string, unknown>;
  notes?: string;
  notificationEnabled: boolean;
}

export interface CatchLogEntry {
  id: string;
  userId: string;
  spotId?: string;
  speciesId?: string;
  speciesName?: string;
  caughtAt: string;
  estimatedLength?: number;
  estimatedWeight?: number;
  baitOrLure?: string;
  fishingMethod?: string;
  released: boolean;
  notes?: string;
  imagePath?: string;
  visibility: 'private' | 'friends' | 'public';
}

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface SpotFilters {
  radiusKm?: number;
  shoreTypes?: ShoreType[];
  beginnerFriendly?: boolean;
  accessible?: boolean;
  shoreFishing?: boolean;
  nightAccess?: boolean;
  verifiedOnly?: boolean;
  speciesId?: string;
  fishingMethod?: FishingMethod;
}
