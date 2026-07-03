import type { ShoreType } from '@/types/fishing';
import {
  DEFAULT_SEA_THRESHOLDS,
  MarineWarningKey,
  SeaLevel,
  SeaLevelThresholds,
} from '@/types/marine';

const LEVEL_ORDER: SeaLevel[] = ['calm', 'low', 'moderate', 'high', 'dangerous'];

function raiseLevel(level: SeaLevel, steps = 1): SeaLevel {
  const index = Math.min(LEVEL_ORDER.indexOf(level) + steps, LEVEL_ORDER.length - 1);
  return LEVEL_ORDER[index];
}

export function getBaseWaveLevel(
  waveHeightMeters: number,
  thresholds: SeaLevelThresholds = DEFAULT_SEA_THRESHOLDS,
): SeaLevel {
  if (waveHeightMeters < thresholds.calmMaxWaveM) return 'calm';
  if (waveHeightMeters < thresholds.lowMaxWaveM) return 'low';
  if (waveHeightMeters < thresholds.moderateMaxWaveM) return 'moderate';
  if (waveHeightMeters < thresholds.highMaxWaveM) return 'high';
  return 'dangerous';
}

export interface SeaLevelInput {
  waveHeightMeters?: number;
  wavePeriodSeconds?: number;
  swellHeightMeters?: number;
  swellPeriodSeconds?: number;
  windSpeedKph?: number;
  windGustKph?: number;
  currentSpeedKph?: number;
  visibilityKm?: number;
  shoreType?: ShoreType;
}

/**
 * Sea condition level based on waves, swell, wind, current, and location type.
 * Exposed locations (rocks, cliffs, piers, breakwaters) are rated one level
 * more dangerous than a sandy beach in the same sea state.
 */
export function computeSeaLevel(
  input: SeaLevelInput,
  thresholds: SeaLevelThresholds = DEFAULT_SEA_THRESHOLDS,
): SeaLevel {
  // Effective wave height: the larger of wind waves and swell.
  const effectiveWave = Math.max(input.waveHeightMeters ?? 0, input.swellHeightMeters ?? 0);
  let level = getBaseWaveLevel(effectiveWave, thresholds);

  // Short-period waves break harder for the same height.
  const period = input.wavePeriodSeconds ?? input.swellPeriodSeconds;
  if (period !== undefined && period > 0 && period < thresholds.shortPeriodSeconds && effectiveWave >= thresholds.lowMaxWaveM) {
    level = raiseLevel(level);
  }

  if (input.windGustKph !== undefined && input.windGustKph >= thresholds.dangerousGustKph) {
    level = raiseLevel(level);
  } else if (input.windSpeedKph !== undefined && input.windSpeedKph >= thresholds.strongWindKph) {
    level = raiseLevel(level);
  }

  if (input.currentSpeedKph !== undefined && input.currentSpeedKph >= thresholds.strongCurrentKph) {
    level = raiseLevel(level);
  }

  // Rocky / exposed structures are less forgiving than sand.
  const exposed: ShoreType[] = ['rocky', 'cliff', 'pier'];
  if (input.shoreType && exposed.includes(input.shoreType) && level !== 'calm') {
    level = raiseLevel(level);
  }

  if (
    input.visibilityKm !== undefined &&
    input.visibilityKm < thresholds.poorVisibilityKm &&
    LEVEL_ORDER.indexOf(level) >= LEVEL_ORDER.indexOf('moderate')
  ) {
    level = raiseLevel(level);
  }

  return level;
}

export function buildSafetyWarnings(
  input: SeaLevelInput,
  seaLevel: SeaLevel,
  thresholds: SeaLevelThresholds = DEFAULT_SEA_THRESHOLDS,
): MarineWarningKey[] {
  const warnings: MarineWarningKey[] = [];
  const effectiveWave = Math.max(input.waveHeightMeters ?? 0, input.swellHeightMeters ?? 0);

  if (effectiveWave >= thresholds.highMaxWaveM) warnings.push('highWaves');
  if (input.windGustKph !== undefined && input.windGustKph >= thresholds.dangerousGustKph) {
    warnings.push('dangerousGusts');
  } else if (input.windSpeedKph !== undefined && input.windSpeedKph >= thresholds.strongWindKph) {
    warnings.push('strongWind');
  }
  if (input.currentSpeedKph !== undefined && input.currentSpeedKph >= thresholds.strongCurrentKph) {
    warnings.push('strongCurrent');
  }
  if (input.visibilityKm !== undefined && input.visibilityKm < thresholds.poorVisibilityKm) {
    warnings.push('poorVisibility');
  }

  const isExposedRock = input.shoreType === 'rocky' || input.shoreType === 'cliff';
  const isPier = input.shoreType === 'pier';
  if (isExposedRock && (seaLevel === 'high' || seaLevel === 'dangerous' || effectiveWave >= thresholds.moderateMaxWaveM)) {
    warnings.push('rockDanger');
  }
  if (isPier && (seaLevel === 'high' || seaLevel === 'dangerous')) {
    warnings.push('pierDanger');
  }
  if (seaLevel === 'dangerous' && !warnings.includes('highWaves') && !warnings.includes('dangerousGusts')) {
    warnings.push('generalDanger');
  }

  return warnings;
}
