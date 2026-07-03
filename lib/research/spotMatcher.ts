/**
 * Match user questions to fishing spots using the beach alias database.
 */

import { DEMO_SPOTS } from '@/lib/mock/demoData';
import { findSpotIdFromText, getBeachProfile } from '@/lib/mock/beachProfiles';
import { FishingSpotSummary } from '@/types/fishing';

export function findSpotFromQuestion(question: string, locationHint?: string): FishingSpotSummary | null {
  const text = `${question} ${locationHint ?? ''}`;

  const spotId = findSpotIdFromText(text);
  if (spotId) {
    return DEMO_SPOTS.find((s) => s.id === spotId) ?? null;
  }

  const lower = text.toLowerCase();
  return (
    DEMO_SPOTS.find(
      (s) =>
        (s.region && lower.includes(s.region.toLowerCase())) ||
        lower.includes(s.name.toLowerCase().split(' ')[0]) ||
        (s.localizedNames?.he && text.includes(s.localizedNames.he)),
    ) ?? null
  );
}

export function getSpotProfileForQuestion(question: string, locationHint?: string) {
  const spot = findSpotFromQuestion(question, locationHint);
  if (!spot) return { spot: null, profile: undefined };
  return { spot, profile: getBeachProfile(spot.id) };
}

export function shoreTypeLabel(shoreType: string, language: 'en' | 'he'): string {
  const labels: Record<string, { en: string; he: string }> = {
    sandy: { en: 'sandy', he: 'חולי' },
    rocky: { en: 'rocky', he: 'סלעי' },
    cliff: { en: 'cliff/rocky', he: 'צוק/סלעי' },
    pier: { en: 'pier', he: 'מזח' },
    harbor: { en: 'harbor', he: 'נמל' },
    mixed: { en: 'mixed sand and rock', he: 'מעורב חול וסלע' },
  };
  return labels[shoreType]?.[language] ?? shoreType;
}

export function listKnownBeaches(language: 'en' | 'he'): string[] {
  return DEMO_SPOTS.map((s) => s.localizedNames?.[language] ?? s.name);
}
