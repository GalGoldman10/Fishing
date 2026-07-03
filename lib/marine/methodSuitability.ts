/**
 * Per-method fishing readiness ratings (shore / drone / boat) plus a
 * drift-based sinker recommendation. Each method reacts to the conditions
 * that actually limit it: drones are wind-limited, surf casting is
 * wave-limited, boats are swell-limited.
 */

import type { LiveMarineConditions } from '@/types/marine';

export type FishingMethodKey = 'shore' | 'drone' | 'boat';

export type MethodRating = 'good' | 'caution' | 'bad' | 'unknown';

export interface MethodAssessment {
  method: FishingMethodKey;
  rating: MethodRating;
  /** Translation key under marine.methodReasons.* */
  reasonKey: string;
}

export type SinkerRecommendationKey =
  | 'lightSinker'
  | 'mediumSinker'
  | 'heavySinker'
  | 'spiderSinker'
  | 'unknown';

function rate(
  value: number | undefined,
  goodMax: number,
  cautionMax: number,
): MethodRating {
  if (value === undefined) return 'unknown';
  if (value <= goodMax) return 'good';
  if (value <= cautionMax) return 'caution';
  return 'bad';
}

function worst(...ratings: MethodRating[]): MethodRating {
  const known = ratings.filter((r) => r !== 'unknown');
  if (known.length === 0) return 'unknown';
  if (known.includes('bad')) return 'bad';
  if (known.includes('caution')) return 'caution';
  return 'good';
}

/** Drone fishing: dominated by wind and especially gusts. */
function assessDrone(c: LiveMarineConditions): MethodAssessment {
  const windRating = rate(c.windSpeedKph, 20, 32);
  const gustRating = rate(c.windGustKph, 30, 42);
  const rating = worst(windRating, gustRating);
  const reasonKey =
    rating === 'good' ? 'droneGood' : rating === 'caution' ? 'droneCaution' : rating === 'bad' ? 'droneBad' : 'noData';
  return { method: 'drone', rating, reasonKey };
}

/** Shore / surf casting: dominated by wave height, then wind. */
function assessShore(c: LiveMarineConditions): MethodAssessment {
  const waveRating = rate(c.waveHeightMeters, 0.8, 1.4);
  const windRating = rate(c.windSpeedKph, 30, 45);
  const rating = worst(waveRating, windRating);
  const reasonKey =
    rating === 'good' ? 'shoreGood' : rating === 'caution' ? 'shoreCaution' : rating === 'bad' ? 'shoreBad' : 'noData';
  return { method: 'shore', rating, reasonKey };
}

/** Boat / offshore: dominated by swell height and period, then gusts. */
function assessBoat(c: LiveMarineConditions): MethodAssessment {
  const swell = c.swellHeightMeters ?? c.waveHeightMeters;
  const swellRating = rate(swell, 0.9, 1.6);
  const gustRating = rate(c.windGustKph, 35, 50);
  // Short, choppy period makes the same swell far less comfortable.
  const shortChop =
    c.wavePeriodSeconds !== undefined && c.wavePeriodSeconds < 5 && swell !== undefined && swell > 0.6;
  const rating = shortChop && swellRating === 'good' ? 'caution' : worst(swellRating, gustRating);
  const reasonKey =
    rating === 'good' ? 'boatGood' : rating === 'caution' ? 'boatCaution' : rating === 'bad' ? 'boatBad' : 'noData';
  return { method: 'boat', rating, reasonKey };
}

export function assessFishingMethods(conditions: LiveMarineConditions): MethodAssessment[] {
  return [assessShore(conditions), assessDrone(conditions), assessBoat(conditions)];
}

/**
 * Sinker (weight) recommendation from drift strength.
 * Combines current speed with wind-driven surface drift; strong side drift
 * calls for a gripping "spider" sinker, calm water for light leads.
 */
export function recommendSinker(conditions: LiveMarineConditions): SinkerRecommendationKey {
  const current = conditions.currentSpeedKph;
  const wind = conditions.windSpeedKph;
  if (current === undefined && wind === undefined) return 'unknown';

  const drift = (current ?? 0) + (wind ?? 0) * 0.08;
  if (drift >= 2.5) return 'spiderSinker';
  if (drift >= 1.5) return 'heavySinker';
  if (drift >= 0.7) return 'mediumSinker';
  return 'lightSinker';
}
