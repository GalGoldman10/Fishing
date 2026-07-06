/**
 * Fills sparse species profiles from local fishing knowledge when Parks/guide text is missing.
 */

import { ISRAELI_SPECIES_CATCH_GUIDE } from '@/lib/research/israeliSpeciesCatchGuide';
import { SPECIES_TACTICS } from '@/lib/research/fishingKnowledge';

export interface SpeciesEnrichmentInput {
  primaryNameHe: string;
  primaryNameEn: string;
  scientificName?: string;
  guide?: { hebrewName: string; aliases: string[] };
  parks?: { officialNameHe: string; colloquialNames: string[]; scientificName?: string };
}

const PLACEHOLDER_PATTERNS = [
  /^לא צוין/,
  /^העמוד מציג/,
  /^העמוד מציין/,
  /^No detailed/,
  /^Habitat not specified/,
  /^Diet not specified/,
  /^Preparation methods not specified/,
  /^Handling notes not specified/,
  /^Size\/season not specified/,
];

export function isPlaceholderSpeciesText(text: string | undefined): boolean {
  if (!text?.trim()) return true;
  return PLACEHOLDER_PATTERNS.some((re) => re.test(text.trim()));
}

/** Explicit guide → Parks catalog links when Hebrew names differ. */
export const GUIDE_ID_TO_PARKS_ID: Record<string, string> = {
  'mf-043': 'pf-003',
  'mf-038': 'pf-010',
  'mf-037': 'pf-008',
};

export const PARKS_ID_TO_GUIDE_OVERRIDE: Record<string, string> = Object.fromEntries(
  Object.entries(GUIDE_ID_TO_PARKS_ID).map(([guideId, parksId]) => [parksId, guideId]),
);

const SCIENTIFIC_NAMES_HE: Record<string, string> = {
  לברק: 'Dicentrarchus labrax',
  'לברק נקוד': 'Dicentrarchus punctatus',
  אריען: 'Lichia amia',
  פלמידה: 'Trachurus trachurus',
  טרולוס: 'Solea solea',
  סרדין: 'Sardina pilchardus',
  עספור: 'Boops boops',
  סולבי: 'Oblada melanura',
  נצרן: 'Siganus rivulatus',
  סאינאס: 'Siganus luridus',
  גרבידה: 'Belone belone',
  לובוס: 'Pomatomus saltatrix',
  'לוקוס דבה': 'Epinephelus costae',
  'שינן הניבים': 'Dentex dentex',
  טלביזיה: 'Sillago sihama',
};

function searchTextForEntry(entry: SpeciesEnrichmentInput): string {
  return [
    entry.primaryNameHe,
    entry.primaryNameEn,
    entry.guide?.hebrewName,
    ...(entry.guide?.aliases ?? []),
    ...(entry.parks?.colloquialNames ?? []),
    entry.parks?.officialNameHe,
  ]
    .filter(Boolean)
    .join(' ');
}

export function resolveScientificName(entry: SpeciesEnrichmentInput): string | undefined {
  if (entry.scientificName) return entry.scientificName;
  if (entry.parks?.scientificName) return entry.parks.scientificName;
  return SCIENTIFIC_NAMES_HE[entry.primaryNameHe] ?? SCIENTIFIC_NAMES_HE[entry.guide?.hebrewName ?? ''];
}

export interface EnrichmentFields {
  descriptionHe?: string;
  descriptionEn?: string;
  habitatHe?: string;
  habitatEn?: string;
  dietHe?: string;
  dietEn?: string;
  sizeHe?: string;
  sizeEn?: string;
  handlingHe?: string;
  handlingEn?: string;
  identificationHe?: string;
  identificationEn?: string;
}

export function enrichSpeciesFields(entry: SpeciesEnrichmentInput): EnrichmentFields {
  const text = searchTextForEntry(entry);
  const tactics = Object.values(SPECIES_TACTICS).find((t) => t.pattern.test(text));
  const catchProfile = ISRAELI_SPECIES_CATCH_GUIDE.find((p) => p.patterns.some((re) => re.test(text)));
  if (!tactics && !catchProfile) return {};

  const out: EnrichmentFields = {};

  if (tactics) {
    out.habitatHe = tactics.where.he;
    out.habitatEn = tactics.where.en;
    out.dietHe = `פיתיונות מומלצים: ${tactics.bites.he}`;
    out.dietEn = `Recommended baits: ${tactics.bites.en}`;
    out.descriptionHe = `${tactics.name.he}. ${tactics.where.he}. ${tactics.when.he}.`;
    out.descriptionEn = `${tactics.name.en}. ${tactics.where.en}. ${tactics.when.en}.`;
    out.identificationHe = out.descriptionHe;
    out.identificationEn = out.descriptionEn;
    if (tactics.note) {
      out.handlingHe = tactics.note.he;
      out.handlingEn = tactics.note.en;
    }
  }

  if (catchProfile) {
    const legal =
      catchProfile.legalMinimumCm == null
        ? 'ללא מינימום בחוק (לפי מדריך אתיקה)'
        : `מינימום בחוק: ${catchProfile.legalMinimumCm} ס"מ`;
    const rec = `מומלץ מ-${catchProfile.recommendedMinimumCm} ס"מ, עד ${catchProfile.maxPerSession} פריטים בסשן`;
    out.sizeHe = `${legal}. ${rec}.`;
    out.sizeEn = `Recommended from ${catchProfile.recommendedMinimumCm} cm, up to ${catchProfile.maxPerSession} per session.`;
    if (catchProfile.protectedNote && !out.handlingHe) {
      out.handlingHe = catchProfile.protectedNote.he;
      out.handlingEn = catchProfile.protectedNote.en;
    }
    if (catchProfile.role.he && tactics) {
      out.descriptionHe = `${tactics.name.he} — ${catchProfile.role.he}. ${tactics.where.he}. ${tactics.when.he}.`;
      out.descriptionEn = `${tactics.name.en} — ${catchProfile.role.en}. ${tactics.where.en}. ${tactics.when.en}.`;
    }
  }

  return out;
}

export function profileHasSubstantiveContent(fields: {
  descriptionHe: string;
  habitatHe: string;
  dietHe: string;
  reproductionHe: string;
  cookingHe: string;
}): boolean {
  return [fields.descriptionHe, fields.habitatHe, fields.dietHe, fields.reproductionHe, fields.cookingHe].some(
    (f) => !isPlaceholderSpeciesText(f),
  );
}
