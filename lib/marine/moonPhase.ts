/**
 * Moon phase calculation — pure astronomy, no external API.
 * Reference new moon: 2000-01-06 18:14 UTC. Synodic month: 29.53058867 days.
 */

export type MoonPhaseKey =
  | 'newMoon'
  | 'waxingCrescent'
  | 'firstQuarter'
  | 'waxingGibbous'
  | 'fullMoon'
  | 'waningGibbous'
  | 'lastQuarter'
  | 'waningCrescent';

export interface MoonInfo {
  phase: MoonPhaseKey;
  /** 0 = new moon, 0.5 = full moon, approaching 1 = next new moon. */
  cycleFraction: number;
  /** Illuminated fraction of the disc, 0..1. */
  illumination: number;
  /**
   * Fishing activity hint from lunar phase: spring tides around new/full moon
   * are traditionally associated with higher fish activity.
   */
  activity: 'high' | 'medium' | 'low';
}

const SYNODIC_MONTH_DAYS = 29.53058867;
const REFERENCE_NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14, 0);

export function getMoonInfo(date: Date = new Date()): MoonInfo {
  const daysSinceRef = (date.getTime() - REFERENCE_NEW_MOON_MS) / 86_400_000;
  const cycleFraction = ((daysSinceRef % SYNODIC_MONTH_DAYS) + SYNODIC_MONTH_DAYS) % SYNODIC_MONTH_DAYS / SYNODIC_MONTH_DAYS;

  const illumination = (1 - Math.cos(2 * Math.PI * cycleFraction)) / 2;

  const phases: MoonPhaseKey[] = [
    'newMoon',
    'waxingCrescent',
    'firstQuarter',
    'waxingGibbous',
    'fullMoon',
    'waningGibbous',
    'lastQuarter',
    'waningCrescent',
  ];
  // Each phase spans 1/8 of the cycle, centered on its exact moment.
  const index = Math.round(cycleFraction * 8) % 8;
  const phase = phases[index];

  const activity: MoonInfo['activity'] =
    phase === 'newMoon' || phase === 'fullMoon'
      ? 'high'
      : phase === 'firstQuarter' || phase === 'lastQuarter'
        ? 'low'
        : 'medium';

  return { phase, cycleFraction, illumination, activity };
}
