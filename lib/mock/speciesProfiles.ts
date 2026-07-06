import { resolveLang } from '@/lib/localization/localizedText';
import {
  LEGACY_SPECIES_ID_MAP,
  MEDITERRANEAN_FISH_BY_ID,
  MEDITERRANEAN_FISH_GUIDE,
  resolveSpeciesGuideId,
  type MediterraneanFishGuideEntry,
} from '@/lib/mock/mediterraneanFishGuide';

export interface SpeciesProfile {
  id: string;
  description: { en: string; he: string };
  habitat: { en: string; he: string };
  identificationNotes: { en: string; he: string };
  handlingNotes: { en: string; he: string };
  consumptionWarning: { en: string; he: string };
  aliases: string[];
  diet: { en: string; he: string };
  sizeSeason: { en: string; he: string };
  cookingMethods: { en: string; he: string };
  sourceUrl: string;
  infoStatus: string;
}

function entryToProfile(entry: MediterraneanFishGuideEntry, id = entry.id): SpeciesProfile {
  return {
    id,
    description: entry.description,
    habitat: entry.habitat,
    identificationNotes: entry.identificationNotes,
    handlingNotes: entry.handlingNotes,
    consumptionWarning: entry.cookingMethods,
    aliases: [entry.hebrewName, ...entry.aliases],
    diet: entry.diet,
    sizeSeason: entry.sizeSeason,
    cookingMethods: entry.cookingMethods,
    sourceUrl: entry.sourceUrl,
    infoStatus: entry.infoStatus,
  };
}

export const SPECIES_PROFILES: Record<string, SpeciesProfile> = Object.fromEntries(
  MEDITERRANEAN_FISH_GUIDE.map((entry) => [entry.id, entryToProfile(entry)]),
);

for (const [legacyId, guideId] of Object.entries(LEGACY_SPECIES_ID_MAP)) {
  const entry = MEDITERRANEAN_FISH_BY_ID[guideId];
  if (entry) SPECIES_PROFILES[legacyId] = entryToProfile(entry, legacyId);
}

export function getSpeciesProfile(id: string): SpeciesProfile | undefined {
  return SPECIES_PROFILES[id] ?? SPECIES_PROFILES[resolveSpeciesGuideId(id)];
}

export function getLocalizedSpeciesText(
  id: string,
  field: keyof Omit<SpeciesProfile, 'id' | 'aliases' | 'sourceUrl' | 'infoStatus'>,
  language: string,
): string | undefined {
  const profile = getSpeciesProfile(id);
  if (!profile) return undefined;
  const value = profile[field];
  if (!value || typeof value !== 'object') return undefined;
  const lang = resolveLang(language);
  return value[lang];
}
