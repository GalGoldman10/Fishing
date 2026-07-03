import type { ShoreType } from '@/types/fishing';
import type { SeaLevel, SuitabilityLabel } from '@/types/marine';

export interface SuitabilityInput {
  seaLevel: SeaLevel;
  waveHeightMeters?: number;
  windSpeedKph?: number;
  windGustKph?: number;
  seaTemperatureCelsius?: number;
  rainProbability?: number;
  pressureHpa?: number;
  shoreType?: ShoreType;
  /** Hour of day 0-23 (for dawn/dusk bonus). */
  hourOfDay?: number;
}

/**
 * Condition-based fishing suitability estimate (0–100).
 * This is NOT a promise of catching fish — only a read of the conditions.
 */
export function computeSuitabilityScore(input: SuitabilityInput): number {
  let score = 100;

  // Sea state is the dominant factor.
  switch (input.seaLevel) {
    case 'calm':
      break;
    case 'low':
      score -= 5;
      break;
    case 'moderate':
      score -= 25;
      break;
    case 'high':
      score -= 55;
      break;
    case 'dangerous':
      score -= 90;
      break;
  }

  // Some wave action helps surf fishing on sand; flat-calm is slightly worse there.
  if (input.shoreType === 'sandy' && input.seaLevel === 'calm') score -= 5;
  if (input.shoreType === 'sandy' && input.seaLevel === 'low') score += 10;

  if (input.windSpeedKph !== undefined) {
    if (input.windSpeedKph > 40) score -= 20;
    else if (input.windSpeedKph > 25) score -= 10;
  }
  if (input.windGustKph !== undefined && input.windGustKph > 50) score -= 10;

  if (input.rainProbability !== undefined) {
    if (input.rainProbability > 70) score -= 15;
    else if (input.rainProbability > 40) score -= 5;
  }

  // Mediterranean comfort band for most target species.
  if (input.seaTemperatureCelsius !== undefined) {
    if (input.seaTemperatureCelsius < 14 || input.seaTemperatureCelsius > 30) score -= 10;
  }

  // Falling/very low pressure often precedes fronts.
  if (input.pressureHpa !== undefined && input.pressureHpa < 1000) score -= 5;

  // Dawn / dusk bonus.
  if (input.hourOfDay !== undefined) {
    const h = input.hourOfDay;
    if ((h >= 5 && h <= 8) || (h >= 17 && h <= 20)) score += 10;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function suitabilityLabel(score: number): SuitabilityLabel {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'fair';
  if (score >= 20) return 'poor';
  return 'notRecommended';
}
