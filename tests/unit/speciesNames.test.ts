import { DEMO_SPECIES } from '@/lib/mock/demoData';
import { getLocalizedSpeciesText, getSpeciesProfile } from '@/lib/mock/speciesProfiles';
import { LEGACY_SPECIES_TO_PARKS, PARKS_FISH_BY_ID } from '@/lib/mock/parksFishCatalog';
import { resolveUnifiedSpeciesId } from '@/lib/mock/speciesCatalog';

/** Legacy beach-profile species ids mapped to colloquial Hebrew names. */
const EXPECTED_LEGACY_HEBREW_NAMES: Record<string, string> = {
  'sp-2': 'דניס',
  'sp-3': 'מרמיר',
  'sp-4': 'פארידה',
  'sp-5': 'גומבר',
  'sp-6': 'פלמידה',
  'sp-7': 'בורי',
  'sp-8': 'לוקוס',
  'sp-10': 'אינטיאס',
  'sp-11': 'ברקודה',
  'sp-13': 'ברבוניה',
  'sp-14': 'סרגוס',
};

function legacyNameMatches(names: (string | undefined)[], expected: string): boolean {
  return names.some((name) => {
    if (!name) return false;
    if (name === expected || name.includes(expected) || expected.includes(name)) return true;
    const stem = expected.split(/\s+/)[0];
    return stem.length >= 3 && name.includes(stem);
  });
}

describe('Fish Guide species Hebrew names', () => {
  it('maps legacy spot species ids to Parks catalog Hebrew names', () => {
    for (const [legacyId, parksId] of Object.entries(LEGACY_SPECIES_TO_PARKS)) {
      const entry = PARKS_FISH_BY_ID[parksId];
      const expected = EXPECTED_LEGACY_HEBREW_NAMES[legacyId];
      expect(expected).toBeTruthy();
      const names = [entry?.officialNameHe, ...(entry?.colloquialNames ?? [])];
      expect(legacyNameMatches(names, expected!)).toBe(true);
    }
  });

  it('does not duplicate Hebrew display names across catalog entries', () => {
    const names = DEMO_SPECIES.map((s) => s.localizedNames?.he);
    expect(new Set(names).size).toBe(names.length);
  });

  it('shows Hebrew habitat text for mullet via profile lookup', () => {
    const habitat = getLocalizedSpeciesText('sp-7', 'habitat', 'he');
    expect(habitat).toBeTruthy();
    expect(habitat).not.toMatch(/Coastal|rocky and sandy/i);
  });

  it('uses Hebrew colloquial name for leerfish (אריען) from the cooking guide', () => {
    const profile = getSpeciesProfile(resolveUnifiedSpeciesId('sp-15'));
    expect(profile?.aliases.some((name) => name.includes('אריע'))).toBe(true);
  });
});
