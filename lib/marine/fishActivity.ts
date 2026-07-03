/**
 * Fish activity index ("success meter") — inspired by BH-Fishing's biological
 * barometer. Combines the physical suitability score with biological signals:
 * barometric pressure, moon phase, and time of day.
 *
 * The result is an estimate of fish feeding activity, NOT a catch guarantee —
 * the UI must always present it as a recommendation only.
 */

import type { LiveMarineConditions } from '@/types/marine';
import { getMoonInfo, type MoonInfo } from '@/lib/marine/moonPhase';

export type ActivityTier = 'slow' | 'challenging' | 'hot';

export interface FishActivityIndex {
  /** 0–100 estimated feeding-activity percentage. */
  percent: number;
  tier: ActivityTier;
  moon: MoonInfo;
  /** Which signals contributed (for transparent UI breakdown). */
  factors: {
    conditionsScore: number;
    pressureAdjustment: number;
    moonAdjustment: number;
    timeOfDayAdjustment: number;
  };
}

/**
 * Barometric pressure effect on fish appetite:
 * stable/high pressure (>= 1015 hPa) is normal; a low reading (< 1005 hPa)
 * usually accompanies a front — feeding often spikes before it and drops
 * during/after, so a mild penalty is applied when we only see the low value.
 */
function pressureAdjustment(pressureHpa: number | undefined): number {
  if (pressureHpa === undefined) return 0;
  if (pressureHpa >= 1015 && pressureHpa <= 1025) return 5;
  if (pressureHpa < 1000) return -10;
  if (pressureHpa < 1005) return -5;
  if (pressureHpa > 1030) return -5;
  return 0;
}

function moonAdjustment(moon: MoonInfo): number {
  switch (moon.activity) {
    case 'high':
      return 8;
    case 'medium':
      return 0;
    case 'low':
      return -5;
  }
}

/** Dawn and dusk are prime feeding windows. */
function timeOfDayAdjustment(hour: number): number {
  if ((hour >= 5 && hour <= 8) || (hour >= 17 && hour <= 20)) return 7;
  if (hour >= 11 && hour <= 14) return -5;
  return 0;
}

export function computeFishActivity(
  conditions: LiveMarineConditions,
  now: Date = new Date(),
): FishActivityIndex {
  const moon = getMoonInfo(now);
  const factors = {
    conditionsScore: conditions.fishingSuitabilityScore,
    pressureAdjustment: pressureAdjustment(conditions.pressureHpa),
    moonAdjustment: moonAdjustment(moon),
    timeOfDayAdjustment: timeOfDayAdjustment(now.getHours()),
  };

  const percent = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        factors.conditionsScore +
          factors.pressureAdjustment +
          factors.moonAdjustment +
          factors.timeOfDayAdjustment,
      ),
    ),
  );

  return { percent, tier: activityTier(percent), moon, factors };
}

export function activityTier(percent: number): ActivityTier {
  if (percent >= 71) return 'hot';
  if (percent >= 41) return 'challenging';
  return 'slow';
}
