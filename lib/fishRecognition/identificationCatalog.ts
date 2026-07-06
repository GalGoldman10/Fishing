import { UNIFIED_SPECIES, unifiedToSpeciesProfile } from '@/lib/mock/speciesCatalog';
import { resolveScientificName } from '@/lib/mock/speciesEnrichment';
import { getSpeciesProfile } from '@/lib/mock/speciesProfiles';
import {
  SPECIES_ID_TO_TACTICS,
  SPECIES_TACTICS,
} from '@/lib/research/fishingKnowledge';
import type {
  FishIdentificationCatalogEntry,
  IdentificationRegion,
} from '@/lib/fishRecognition/types';
import { defaultVisualProfile, VISUAL_TRAIT_OVERRIDES } from '@/lib/fishRecognition/visualTraits';

function inferConfusedWith(speciesId: string, familyLatin?: string): string[] {
  return UNIFIED_SPECIES.filter(
    (other) =>
      other.id !== speciesId &&
      other.familyLatin &&
      familyLatin &&
      other.familyLatin === familyLatin,
  )
    .slice(0, 3)
    .map((o) => o.id);
}

function buildVisual(entryId: string, hebrewName: string, familyLatin?: string) {
  const base = defaultVisualProfile(hebrewName, familyLatin);
  const override = VISUAL_TRAIT_OVERRIDES[entryId] ?? {};
  return { ...base, ...override };
}

function isCommonInIsrael(entry: (typeof UNIFIED_SPECIES)[number]): boolean {
  if (entry.parks) return true;
  return /לברק|דניס|בורי|סרגוס|ברבונ|גומבר|פלמיד|אינטיאס|ברקוד|מרמיר|אריע|לוקוס|סרדין|טונ/i.test(
    `${entry.primaryNameHe} ${entry.primaryNameEn}`,
  );
}

export function buildFishIdentificationCatalog(): FishIdentificationCatalogEntry[] {
  return UNIFIED_SPECIES.map((entry) => {
    const profile = unifiedToSpeciesProfile(entry);
    const tacticsKey = SPECIES_ID_TO_TACTICS[entry.id];
    const tactics = tacticsKey ? SPECIES_TACTICS[tacticsKey] : undefined;
    const scientificName = resolveScientificName(entry) ?? entry.primaryNameEn;
    const habitat =
      profile.habitat.he.length > 5 ? profile.habitat.he : profile.habitat.en;
    const referenceImageUrls = [
      entry.parks?.sourceUrl,
      entry.guide?.sourceUrl,
    ].filter((url): url is string => Boolean(url));

    const region: IdentificationRegion[] = isCommonInIsrael(entry)
      ? ['mediterranean_israel', 'mediterranean']
      : ['mediterranean'];

    return {
      speciesId: entry.id,
      commonNameEn: entry.primaryNameEn,
      commonNameHe: entry.primaryNameHe,
      scientificName,
      familyHe: entry.familyHe,
      familyLatin: entry.familyLatin,
      habitat,
      region,
      commonInIsrael: isCommonInIsrael(entry),
      confusedWithSpeciesIds: inferConfusedWith(entry.id, entry.familyLatin),
      referenceImageUrls,
      visual: buildVisual(entry.id, entry.primaryNameHe, entry.familyLatin),
    };
  });
}

export const FISH_IDENTIFICATION_CATALOG: FishIdentificationCatalogEntry[] =
  buildFishIdentificationCatalog();

export const FISH_IDENTIFICATION_BY_ID: Record<string, FishIdentificationCatalogEntry> =
  Object.fromEntries(FISH_IDENTIFICATION_CATALOG.map((e) => [e.speciesId, e]));

export function getAllowedSpeciesIds(): string[] {
  return FISH_IDENTIFICATION_CATALOG.map((e) => e.speciesId);
}

export function buildMatchPresentation(
  speciesId: string,
  confidence: number,
  matchReason: string,
  keyIdentifyingSigns: string[],
  language: 'en' | 'he',
): import('@/lib/fishRecognition/types').FishMatchPresentation | null {
  const catalog = FISH_IDENTIFICATION_BY_ID[speciesId];
  const profile = getSpeciesProfile(speciesId);
  if (!catalog) return null;

  const tacticsKey = SPECIES_ID_TO_TACTICS[speciesId];
  const tactics = tacticsKey ? SPECIES_TACTICS[tacticsKey] : undefined;

  const name = language === 'he' ? catalog.commonNameHe : catalog.commonNameEn;
  const description =
    language === 'he'
      ? (profile?.description.he ?? catalog.visual.identifyingSigns.he)
      : (profile?.description.en ?? catalog.visual.identifyingSigns.en);
  const identificationNotes =
    language === 'he'
      ? (profile?.identificationNotes.he ?? catalog.visual.identifyingSigns.he)
      : (profile?.identificationNotes.en ?? catalog.visual.identifyingSigns.en);
  const habitat =
    language === 'he'
      ? (profile?.habitat.he ?? catalog.habitat)
      : (profile?.habitat.en ?? catalog.habitat);
  const bestBait = tactics
    ? language === 'he'
      ? tactics.bites.he
      : tactics.bites.en
    : language === 'he'
      ? 'שרימפס, דיונון או פיתיון מקומי'
      : 'Shrimp, squid, or local bait';
  const techniques = tactics
    ? language === 'he'
      ? `${tactics.where.he}. ${tactics.when.he}`
      : `${tactics.where.en}. ${tactics.when.en}`
    : language === 'he'
      ? 'דיג מהחוף'
      : 'Shore fishing';

  let safetyWarning: string | undefined;
  if (catalog.commonInIsrael && /לוקוס|דקר|grouper/i.test(catalog.commonNameEn + catalog.commonNameHe)) {
    safetyWarning =
      language === 'he'
        ? 'ייתכן שמדובר בדקר/לוקוס — בדקו אם המין מוגן לפני שמירה.'
        : 'May be a grouper — verify protection status before keeping.';
  }
  if (profile?.handlingNotes && !profile.handlingNotes.he.startsWith('לא צוין')) {
    safetyWarning =
      language === 'he' ? profile.handlingNotes.he : profile.handlingNotes.en;
  }

  const confusedWith = catalog.confusedWithSpeciesIds
    .map((id) => {
      const other = FISH_IDENTIFICATION_BY_ID[id];
      if (!other) return null;
      return {
        speciesId: id,
        name: language === 'he' ? other.commonNameHe : other.commonNameEn,
      };
    })
    .filter(Boolean) as { speciesId: string; name: string }[];

  return {
    speciesId,
    name,
    nameHe: catalog.commonNameHe,
    nameEn: catalog.commonNameEn,
    scientificName: catalog.scientificName,
    familyHe: catalog.familyHe,
    familyLatin: catalog.familyLatin,
    confidence: Math.round(confidence),
    description,
    identificationNotes,
    matchReason,
    keyIdentifyingSigns,
    confusedWith,
    commonInIsrael: catalog.commonInIsrael,
    habitat,
    bestBait,
    techniques,
    safetyWarning,
  };
}
