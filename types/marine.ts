import type { ShoreType } from '@/types/fishing';

export type SeaLevel = 'calm' | 'low' | 'moderate' | 'high' | 'dangerous';

export type SuitabilityLabel = 'excellent' | 'good' | 'fair' | 'poor' | 'notRecommended';

/** Warning identifiers — translated in the UI via `marine.warnings.*`. */
export type MarineWarningKey =
  | 'highWaves'
  | 'strongWind'
  | 'dangerousGusts'
  | 'strongCurrent'
  | 'rockDanger'
  | 'pierDanger'
  | 'poorVisibility'
  | 'heavyRain'
  | 'generalDanger';

/**
 * Normalized live marine conditions.
 * Every measurement is optional: a field is present only when the provider
 * returned it. Missing values are never estimated or invented.
 */
export interface LiveMarineConditions {
  latitude: number;
  longitude: number;
  waveHeightMeters?: number;
  wavePeriodSeconds?: number;
  waveDirectionDegrees?: number;
  swellHeightMeters?: number;
  swellPeriodSeconds?: number;
  swellDirectionDegrees?: number;
  windSpeedKph?: number;
  windGustKph?: number;
  windDirectionDegrees?: number;
  seaTemperatureCelsius?: number;
  airTemperatureCelsius?: number;
  currentSpeedKph?: number;
  currentDirectionDegrees?: number;
  tideHeightMeters?: number;
  nextHighTide?: string;
  nextLowTide?: string;
  visibilityKm?: number;
  rainProbability?: number;
  pressureHpa?: number;
  sunrise?: string;
  sunset?: string;
  seaLevel: SeaLevel;
  fishingSuitabilityScore: number;
  suitabilityLabel: SuitabilityLabel;
  /** Warning keys, translated in the UI. */
  safetyWarnings: MarineWarningKey[];
  source: string;
  observedAt?: string;
  forecastTime: string;
  fetchedAt: string;
}

/** One point on the hourly forecast timeline. */
export interface MarineForecastHour {
  time: string;
  waveHeightMeters?: number;
  windSpeedKph?: number;
  windGustKph?: number;
  seaLevel: SeaLevel;
  fishingSuitabilityScore: number;
}

export interface MarineForecast {
  current: LiveMarineConditions;
  hourly: MarineForecastHour[];
}

export interface MarineConditionsProvider {
  name: string;
  getConditions(input: {
    latitude: number;
    longitude: number;
    shoreType?: ShoreType;
  }): Promise<MarineForecast>;
}

/** Configurable thresholds — adjustable in the admin panel, not safety guarantees. */
export interface SeaLevelThresholds {
  calmMaxWaveM: number;
  lowMaxWaveM: number;
  moderateMaxWaveM: number;
  highMaxWaveM: number;
  strongWindKph: number;
  dangerousGustKph: number;
  shortPeriodSeconds: number;
  strongCurrentKph: number;
  poorVisibilityKm: number;
}

export const DEFAULT_SEA_THRESHOLDS: SeaLevelThresholds = {
  calmMaxWaveM: 0.3,
  lowMaxWaveM: 0.7,
  moderateMaxWaveM: 1.2,
  highMaxWaveM: 2.0,
  strongWindKph: 30,
  dangerousGustKph: 50,
  shortPeriodSeconds: 5,
  strongCurrentKph: 3,
  poorVisibilityKm: 2,
};
