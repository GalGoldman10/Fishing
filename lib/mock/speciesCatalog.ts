/**
 * Unified species catalog — merges Parks.org.il family data with the cooking guide.
 */

import {
  MEDITERRANEAN_FISH_BY_ID,
  MEDITERRANEAN_FISH_GUIDE,
  type MediterraneanFishGuideEntry,
} from '@/lib/mock/mediterraneanFishGuide';
import {
  LEGACY_SPECIES_TO_PARKS,
  PARKS_FISH_CATALOG,
  PARKS_FISH_BY_ID,
  type ParksFishSpecies,
} from '@/lib/mock/parksFishCatalog';
import type { SpeciesSummary } from '@/types/fishing';

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
  reproduction: { en: string; he: string };
  familyHe?: string;
  familyLatin?: string;
  sourceUrl: string;
  infoStatus: string;
}

export interface UnifiedSpeciesEntry {
  id: string;
  parks?: ParksFishSpecies;
  guide?: MediterraneanFishGuideEntry;
  primaryNameHe: string;
  primaryNameEn: string;
  scientificName?: string;
  familyHe?: string;
  familyLatin?: string;
  protected: boolean;
}

function normalizeName(name: string): string {
  return name.trim().replace(/[''"׳]/g, '').toLowerCase();
}

function allGuideNames(entry: MediterraneanFishGuideEntry): string[] {
  return [entry.hebrewName, ...entry.aliases].map(normalizeName);
}

function allParksNames(entry: ParksFishSpecies): string[] {
  return [entry.officialNameHe, ...entry.colloquialNames].map(normalizeName);
}

function guideMatchesParks(guide: MediterraneanFishGuideEntry, parks: ParksFishSpecies): boolean {
  const parkNames = new Set(allParksNames(parks));
  return allGuideNames(guide).some((name) => parkNames.has(name));
}

function findGuideForParks(parks: ParksFishSpecies): MediterraneanFishGuideEntry | undefined {
  return MEDITERRANEAN_FISH_GUIDE.find((guide) => guideMatchesParks(guide, parks));
}

function isMissingHe(text: string | undefined): boolean {
  if (!text) return true;
  const t = text.trim();
  return !t || t.startsWith('לא צוין') || t.startsWith('העמוד מציין');
}

function bilingualHe(text: string, enFallback: string): { en: string; he: string } {
  const he = text.trim() || 'לא צוין במקור.';
  const en = isMissingHe(text) ? enFallback : text;
  return { en, he };
}

function buildUnifiedList(): UnifiedSpeciesEntry[] {
  const matchedGuideIds = new Set<string>();
  const unified: UnifiedSpeciesEntry[] = [];

  for (const parks of PARKS_FISH_CATALOG) {
    const guide = findGuideForParks(parks);
    if (guide) matchedGuideIds.add(guide.id);
    const colloquial = parks.colloquialNames[0];
    unified.push({
      id: parks.id,
      parks,
      guide,
      primaryNameHe: colloquial ?? parks.officialNameHe,
      primaryNameEn: guide?.englishName ?? parks.scientificName,
      scientificName: parks.scientificName,
      familyHe: parks.familyHe,
      familyLatin: parks.familyLatin,
      protected: parks.protected,
    });
  }

  for (const guide of MEDITERRANEAN_FISH_GUIDE) {
    if (matchedGuideIds.has(guide.id)) continue;
    unified.push({
      id: guide.id,
      guide,
      primaryNameHe: guide.hebrewName,
      primaryNameEn: guide.englishName,
      protected: /לוקוס|דקר|מוגן/i.test(`${guide.hebrewName} ${guide.description.he}`),
    });
  }

  return unified;
}

export const UNIFIED_SPECIES: UnifiedSpeciesEntry[] = buildUnifiedList();

export const UNIFIED_SPECIES_BY_ID: Record<string, UnifiedSpeciesEntry> = Object.fromEntries(
  UNIFIED_SPECIES.map((entry) => [entry.id, entry]),
);

/** Resolve legacy sp-*, mf-*, or pf-* ids to a unified catalog entry. */
export function resolveUnifiedSpeciesId(id: string): string {
  if (UNIFIED_SPECIES_BY_ID[id]) return id;
  const parksLegacy = LEGACY_SPECIES_TO_PARKS[id];
  if (parksLegacy && UNIFIED_SPECIES_BY_ID[parksLegacy]) return parksLegacy;

  const fromOldGuideMap: Record<string, string> = {
    'sp-1': 'mf-028',
    'sp-2': 'mf-018',
    'sp-3': 'mf-036',
    'sp-4': 'mf-040',
    'sp-5': 'mf-014',
    'sp-6': 'mf-043',
    'sp-7': 'mf-005',
    'sp-8': 'mf-030',
    'sp-9': 'mf-024',
    'sp-10': 'mf-001',
    'sp-11': 'mf-013',
    'sp-12': 'mf-041',
    'sp-13': 'mf-011',
    'sp-14': 'mf-019',
    'sp-15': 'mf-004',
  };

  const mapped = parksLegacy ?? fromOldGuideMap[id];
  if (!mapped) return id;
  if (UNIFIED_SPECIES_BY_ID[mapped]) return mapped;

  const guide = MEDITERRANEAN_FISH_BY_ID[mapped];
  if (guide) {
    const parksMatch = PARKS_FISH_CATALOG.find((p) => guideMatchesParks(guide, p));
    if (parksMatch) return parksMatch.id;
  }
  return mapped;
}

export function findUnifiedSpecies(query: string): UnifiedSpeciesEntry | undefined {
  const q = query.trim();
  if (!q) return undefined;
  const lower = q.toLowerCase();
  return UNIFIED_SPECIES.find((entry) => {
    if (entry.primaryNameHe.includes(q)) return true;
    if (entry.primaryNameEn.toLowerCase().includes(lower)) return true;
    if (entry.scientificName?.toLowerCase().includes(lower)) return true;
    if (entry.parks?.officialNameHe.includes(q)) return true;
    if (entry.parks?.colloquialNames.some((n) => n.includes(q))) return true;
    if (entry.guide?.aliases.some((n) => n.includes(q))) return true;
    return false;
  });
}

function inferEnvironmentTypes(habitatHe: string): SpeciesSummary['environmentTypes'] {
  const types = new Set<SpeciesSummary['environmentTypes'][number]>();
  if (/נמל|מזח|רציף|שובר/i.test(habitatHe)) types.add('pier');
  if (/סלע|שונית|צוק|מער/i.test(habitatHe)) types.add('rocks');
  if (/סירה|עומק|פתוח|פלגי|ים פתוח|360/i.test(habitatHe)) types.add('boat');
  if (/נמל|מעגן/i.test(habitatHe)) types.add('harbor');
  types.add('shore');
  return [...types];
}

export function unifiedToSpeciesSummary(entry: UnifiedSpeciesEntry): SpeciesSummary {
  const habitatHe = entry.parks?.habitat ?? entry.guide?.habitat.he ?? '';
  return {
    id: entry.id,
    commonName: entry.primaryNameEn,
    scientificName: entry.scientificName,
    localizedNames: { en: entry.primaryNameEn, he: entry.primaryNameHe },
    habitat: habitatHe,
    familyHe: entry.familyHe,
    familyLatin: entry.familyLatin,
    environmentTypes: inferEnvironmentTypes(habitatHe),
    conservationStatus: entry.protected ? 'vulnerable' : 'least_concern',
  };
}

export function unifiedToSpeciesProfile(entry: UnifiedSpeciesEntry, id = entry.id): SpeciesProfile {
  const parks = entry.parks;
  const guide = entry.guide;

  const descriptionHe = parks?.details ?? guide?.description.he ?? entry.primaryNameHe;
  const habitatHe = parks?.habitat ?? guide?.habitat.he ?? 'לא צוין.';
  const dietHe = parks?.diet ?? guide?.diet.he ?? 'לא צוין.';
  const sizeHe = parks?.size ?? guide?.sizeSeason.he ?? 'לא צוין.';
  const reproductionHe = parks?.reproduction ?? 'לא צוין במקור.';
  const handlingHe = guide?.handlingNotes.he ?? (parks?.protected ? 'מין מוגן — בדקו תקנות לפני שמירה.' : 'לא צוין.');
  const cookingHe = guide?.cookingMethods.he ?? 'לא צוין במדריך הבישול.';

  const aliases = [
    entry.primaryNameHe,
    parks?.officialNameHe,
    ...(parks?.colloquialNames ?? []),
    ...(guide?.aliases ?? []),
  ].filter((name): name is string => Boolean(name))
    .filter((name, index, arr) => arr.indexOf(name) === index);

  return {
    id,
    description: bilingualHe(descriptionHe, 'See Hebrew species details.'),
    habitat: bilingualHe(habitatHe, 'Habitat not specified.'),
    identificationNotes: bilingualHe(descriptionHe, 'Identification details not specified.'),
    handlingNotes: bilingualHe(handlingHe, 'Handling notes not specified.'),
    consumptionWarning: bilingualHe(cookingHe, 'Preparation methods not specified.'),
    aliases,
    diet: bilingualHe(dietHe, 'Diet not specified.'),
    sizeSeason: bilingualHe(sizeHe, 'Size/season not specified.'),
    cookingMethods: bilingualHe(cookingHe, 'Preparation methods not specified.'),
    reproduction: bilingualHe(reproductionHe, 'Reproduction not specified.'),
    familyHe: parks?.familyHe,
    familyLatin: parks?.familyLatin,
    sourceUrl: parks?.sourceUrl ?? guide?.sourceUrl ?? '',
    infoStatus: guide?.infoStatus ?? (parks ? 'מקור רשמי — רשות הטבע והגנים' : 'מדריך בישול'),
  };
}

export const DEMO_SPECIES: SpeciesSummary[] = UNIFIED_SPECIES.map(unifiedToSpeciesSummary);

export function buildSpeciesProfilesRecord(): Record<string, SpeciesProfile> {
  const profiles: Record<string, SpeciesProfile> = {};
  for (const entry of UNIFIED_SPECIES) {
    profiles[entry.id] = unifiedToSpeciesProfile(entry);
  }
  for (const [legacyId, parksId] of Object.entries(LEGACY_SPECIES_TO_PARKS)) {
    const unified = UNIFIED_SPECIES_BY_ID[parksId];
    if (unified) profiles[legacyId] = unifiedToSpeciesProfile(unified, legacyId);
  }
  return profiles;
}
