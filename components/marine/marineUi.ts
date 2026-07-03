import type { TFunction } from 'i18next';
import type { SeaLevel, SuitabilityLabel } from '@/types/marine';

export const SEA_LEVEL_COLORS: Record<SeaLevel, { bg: string; text: string }> = {
  calm: { bg: '#DCFCE7', text: '#047857' },
  low: { bg: '#D1FAE5', text: '#059669' },
  moderate: { bg: '#FEF3C7', text: '#B45309' },
  high: { bg: '#FFEDD5', text: '#C2410C' },
  dangerous: { bg: '#FEE2E2', text: '#B91C1C' },
};

export const SUITABILITY_COLORS: Record<SuitabilityLabel, string> = {
  excellent: '#059669',
  good: '#0891B2',
  fair: '#D97706',
  poor: '#EA580C',
  notRecommended: '#DC2626',
};

export function translateSeaLevel(level: SeaLevel, t: TFunction): string {
  return t(`marine.seaLevels.${level}`);
}

export function translateSuitability(label: SuitabilityLabel, t: TFunction): string {
  return t(`marine.suitabilityLabels.${label}`);
}

/** 16-point compass label translated per language (e.g. 315° -> NW / צפון-מערב). */
export function degreesToCompass(degrees: number, t: TFunction): string {
  const points = ['n', 'nne', 'ne', 'ene', 'e', 'ese', 'se', 'sse', 's', 'ssw', 'sw', 'wsw', 'w', 'wnw', 'nw', 'nnw'];
  const index = Math.round(((degrees % 360) + 360) % 360 / 22.5) % 16;
  return t(`marine.compass.${points[index]}`);
}
