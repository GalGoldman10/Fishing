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
import {
  enrichSpeciesFields,
  isPlaceholderSpeciesText,
  PARKS_ID_TO_GUIDE_OVERRIDE,
  profileHasSubstantiveContent,
  resolveScientificName,
} from '@/lib/mock/speciesEnrichment';
import type { SpeciesSummary } from '@/types/fishing';

export { isPlaceholderSpeciesText } from '@/lib/mock/speciesEnrichment';

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

function namesOverlap(a: string, b: string): boolean {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (na === nb) return true;
  if (na.length >= 3 && nb.includes(na)) return true;
  if (nb.length >= 3 && na.includes(nb)) return true;
  const stemA = na.split(/\s+/)[0];
  const stemB = nb.split(/\s+/)[0];
  if (stemA.length >= 4 && stemA === stemB) return true;
  return false;
}

function guideMatchesParks(guide: MediterraneanFishGuideEntry, parks: ParksFishSpecies): boolean {
  const parkNames = [parks.officialNameHe, ...parks.colloquialNames];
  const guideNames = [guide.hebrewName, ...guide.aliases];
  return guideNames.some((guideName) => parkNames.some((parkName) => namesOverlap(guideName, parkName)));
}

function findGuideForParks(parks: ParksFishSpecies): MediterraneanFishGuideEntry | undefined {
  const overrideGuideId = PARKS_ID_TO_GUIDE_OVERRIDE[parks.id];
  const parkNames = [parks.officialNameHe, ...parks.colloquialNames];

  const exactMatch = MEDITERRANEAN_FISH_GUIDE.find((guide) =>
    parkNames.some((parkName) => normalizeName(guide.hebrewName) === normalizeName(parkName)),
  );
  if (exactMatch) return exactMatch;

  if (overrideGuideId) {
    const overrideGuide = MEDITERRANEAN_FISH_BY_ID[overrideGuideId];
    if (overrideGuide) return overrideGuide;
  }

  return MEDITERRANEAN_FISH_GUIDE.find((guide) => guideMatchesParks(guide, parks));
}

function isGuideRedundant(guide: MediterraneanFishGuideEntry): boolean {
  return PARKS_FISH_CATALOG.some((parks) => guideMatchesParks(guide, parks));
}

function pickHe(primary: string | undefined, fallback: string | undefined, defaultText: string): string {
  if (primary && !isPlaceholderSpeciesText(primary)) return primary;
  if (fallback && !isPlaceholderSpeciesText(fallback)) return fallback;
  return defaultText;
}

function pickEn(primary: string | undefined, fallback: string | undefined, defaultText: string): string {
  if (primary && !isPlaceholderSpeciesText(primary)) return primary;
  if (fallback && !isPlaceholderSpeciesText(fallback)) return fallback;
  return defaultText;
}

function bilingualField(he: string, en: string): { en: string; he: string } {
  return { he: he.trim() || 'לא צוין במקור.', en: en.trim() || 'Not specified in source.' };
}

function buildUnifiedList(): UnifiedSpeciesEntry[] {
  const matchedGuideIds = new Set<string>();
  const unified: UnifiedSpeciesEntry[] = [];

  for (const parks of PARKS_FISH_CATALOG) {
    const guide = findGuideForParks(parks);
    if (guide) matchedGuideIds.add(guide.id);
    const colloquial = parks.colloquialNames[0];
    const entry: UnifiedSpeciesEntry = {
      id: parks.id,
      parks,
      guide,
      primaryNameHe: colloquial ?? parks.officialNameHe,
      primaryNameEn: guide?.englishName ?? parks.scientificName,
      scientificName: parks.scientificName,
      familyHe: parks.familyHe,
      familyLatin: parks.familyLatin,
      protected: parks.protected,
    };
    entry.scientificName = resolveScientificName(entry);
    unified.push(entry);
  }

  for (const guide of MEDITERRANEAN_FISH_GUIDE) {
    if (matchedGuideIds.has(guide.id)) continue;
    if (isGuideRedundant(guide)) continue;
    const entry: UnifiedSpeciesEntry = {
      id: guide.id,
      guide,
      primaryNameHe: guide.hebrewName,
      primaryNameEn: guide.englishName,
      protected: /לוקוס|דקר|מוגן/i.test(`${guide.hebrewName} ${guide.description.he}`),
    };
    entry.scientificName = resolveScientificName(entry);
    unified.push(entry);
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

export function unifiedToSpeciesProfile(entry: UnifiedSpeciesEntry, id = entry.id): SpeciesProfile {
  const parks = entry.parks;
  const guide = entry.guide;
  const enrichment = enrichSpeciesFields(entry);

  let descriptionHe = pickHe(parks?.details, guide?.description.he, entry.primaryNameHe);
  let descriptionEn = pickEn(undefined, guide?.description.en, entry.primaryNameEn);
  let habitatHe = pickHe(parks?.habitat, guide?.habitat.he, 'לא צוין.');
  let habitatEn = pickEn(undefined, guide?.habitat.en, 'Habitat not specified.');
  let dietHe = pickHe(parks?.diet, guide?.diet.he, 'לא צוין.');
  let dietEn = pickEn(undefined, guide?.diet.en, 'Diet not specified.');
  let sizeHe = pickHe(parks?.size, guide?.sizeSeason.he, 'לא צוין.');
  let sizeEn = pickEn(undefined, guide?.sizeSeason.en, 'Size/season not specified.');
  const reproductionHe = pickHe(parks?.reproduction, undefined, 'לא צוין במקור.');
  const reproductionEn = pickEn(undefined, undefined, 'Reproduction not specified.');
  let handlingHe = pickHe(guide?.handlingNotes.he, parks?.protected ? 'מין מוגן — בדקו תקנות לפני שמירה.' : undefined, 'לא צוין.');
  let handlingEn = pickEn(undefined, guide?.handlingNotes.en, 'Handling notes not specified.');
  let cookingHe = pickHe(guide?.cookingMethods.he, undefined, 'לא צוין במדריך הבישול.');
  let cookingEn = pickEn(undefined, guide?.cookingMethods.en, 'Preparation methods not specified.');
  let identificationHe = pickHe(parks?.details, guide?.identificationNotes.he, descriptionHe);
  let identificationEn = pickEn(undefined, guide?.identificationNotes.en, descriptionEn);

  descriptionHe = pickHe(enrichment.descriptionHe, descriptionHe, entry.primaryNameHe);
  descriptionEn = pickEn(enrichment.descriptionEn, descriptionEn, entry.primaryNameEn);
  habitatHe = pickHe(enrichment.habitatHe, habitatHe, 'לא צוין.');
  habitatEn = pickEn(enrichment.habitatEn, habitatEn, 'Habitat not specified.');
  dietHe = pickHe(enrichment.dietHe, dietHe, 'לא צוין.');
  dietEn = pickEn(enrichment.dietEn, dietEn, 'Diet not specified.');
  sizeHe = pickHe(enrichment.sizeHe, sizeHe, 'לא צוין.');
  sizeEn = pickEn(enrichment.sizeEn, sizeEn, 'Size/season not specified.');
  handlingHe = pickHe(enrichment.handlingHe, handlingHe, 'לא צוין.');
  handlingEn = pickEn(enrichment.handlingEn, handlingEn, 'Handling notes not specified.');
  identificationHe = pickHe(enrichment.identificationHe, identificationHe, descriptionHe);
  identificationEn = pickEn(enrichment.identificationEn, identificationEn, descriptionEn);

  const aliases = [
    entry.primaryNameHe,
    parks?.officialNameHe,
    ...(parks?.colloquialNames ?? []),
    ...(guide?.aliases ?? []),
  ]
    .filter((name): name is string => Boolean(name))
    .filter((name, index, arr) => arr.indexOf(name) === index);

  const infoStatus =
    parks && guide
      ? 'מקור משולב — רשות הטבע והגנים + מדריך בישול'
      : parks
        ? 'מקור רשמי — רשות הטבע והגנים'
        : enrichment.descriptionHe
          ? 'מדריך דייג מקומי'
          : (guide?.infoStatus ?? 'מדריך בישול');

  return {
    id,
    description: bilingualField(descriptionHe, descriptionEn),
    habitat: bilingualField(habitatHe, habitatEn),
    identificationNotes: bilingualField(identificationHe, identificationEn),
    handlingNotes: bilingualField(handlingHe, handlingEn),
    consumptionWarning: bilingualField(cookingHe, cookingEn),
    aliases,
    diet: bilingualField(dietHe, dietEn),
    sizeSeason: bilingualField(sizeHe, sizeEn),
    cookingMethods: bilingualField(cookingHe, cookingEn),
    reproduction: bilingualField(reproductionHe, reproductionEn),
    familyHe: parks?.familyHe,
    familyLatin: parks?.familyLatin,
    sourceUrl: parks?.sourceUrl ?? guide?.sourceUrl ?? '',
    infoStatus,
  };
}

export function unifiedToSpeciesSummary(entry: UnifiedSpeciesEntry): SpeciesSummary {
  const profile = unifiedToSpeciesProfile(entry);
  const habitatHe = profile.habitat.he;
  return {
    id: entry.id,
    commonName: entry.primaryNameEn,
    scientificName: resolveScientificName(entry),
    localizedNames: { en: entry.primaryNameEn, he: entry.primaryNameHe },
    habitat: isPlaceholderSpeciesText(habitatHe) ? undefined : habitatHe,
    familyHe: entry.familyHe,
    familyLatin: entry.familyLatin,
    environmentTypes: inferEnvironmentTypes(habitatHe),
    conservationStatus: entry.protected ? 'vulnerable' : 'least_concern',
  };
}

export const DEMO_SPECIES: SpeciesSummary[] = UNIFIED_SPECIES.filter((entry) => {
  const profile = unifiedToSpeciesProfile(entry);
  return profileHasSubstantiveContent({
    descriptionHe: profile.description.he,
    habitatHe: profile.habitat.he,
    dietHe: profile.diet.he,
    reproductionHe: profile.reproduction.he,
    cookingHe: profile.cookingMethods.he,
  });
}).map(unifiedToSpeciesSummary);

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
