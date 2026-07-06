import { resolveLang } from '@/lib/localization/localizedText';
import {
  buildSpeciesProfilesRecord,
  resolveUnifiedSpeciesId,
  type SpeciesProfile,
} from '@/lib/mock/speciesCatalog';

export type { SpeciesProfile };

export const SPECIES_PROFILES: Record<string, SpeciesProfile> = buildSpeciesProfilesRecord();

export function getSpeciesProfile(id: string): SpeciesProfile | undefined {
  const resolved = resolveUnifiedSpeciesId(id);
  return SPECIES_PROFILES[id] ?? SPECIES_PROFILES[resolved];
}

export function getLocalizedSpeciesText(
  id: string,
  field: keyof Omit<SpeciesProfile, 'id' | 'aliases' | 'sourceUrl' | 'infoStatus' | 'familyHe' | 'familyLatin'>,
  language: string,
): string | undefined {
  const profile = getSpeciesProfile(id);
  if (!profile) return undefined;
  const value = profile[field];
  if (!value || typeof value !== 'object') return undefined;
  const lang = resolveLang(language);
  return value[lang];
}
