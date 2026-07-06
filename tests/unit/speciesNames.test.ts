import { DEMO_SPECIES } from '@/lib/mock/demoData';
import { getLocalizedSpeciesText } from '@/lib/mock/speciesProfiles';
import { LEGACY_SPECIES_ID_MAP, MEDITERRANEAN_FISH_BY_ID } from '@/lib/mock/mediterraneanFishGuide';

/** Legacy beach-profile species ids mapped to guide Hebrew names. */
const EXPECTED_LEGACY_HEBREW_NAMES: Record<string, string> = {
  'sp-1': 'לברק',
  'sp-2': 'דניס',
  'sp-3': 'מרמיר',
  'sp-4': 'סרגוס',
  'sp-5': 'גומבר',
  'sp-6': 'פלמידה',
  'sp-7': 'בורי',
  'sp-8': 'לוקוס אירדי',
  'sp-9': 'טרולוס',
  'sp-10': 'אינטיאס',
  'sp-11': 'ברקודה',
  'sp-12': 'סרדין',
  'sp-13': 'ברבוניה',
  'sp-14': 'חדאד',
  'sp-15': 'אריען',
};

describe('Fish Guide species Hebrew names', () => {
  it('maps legacy spot species ids to guide Hebrew names', () => {
    for (const [legacyId, guideId] of Object.entries(LEGACY_SPECIES_ID_MAP)) {
      const entry = MEDITERRANEAN_FISH_BY_ID[guideId];
      expect(entry?.hebrewName).toBe(EXPECTED_LEGACY_HEBREW_NAMES[legacyId]);
    }
  });

  it('does not duplicate Hebrew names across guide species', () => {
    const names = DEMO_SPECIES.map((s) => s.localizedNames?.he);
    expect(new Set(names).size).toBe(names.length);
  });

  it('shows Hebrew habitat text for legacy sea bass via profile lookup', () => {
    const habitat = getLocalizedSpeciesText('sp-1', 'habitat', 'he');
    expect(habitat).toBeTruthy();
    expect(habitat).not.toMatch(/Coastal|rocky and sandy/i);
  });

  it('uses guide name for leerfish (אריען), not old transliteration ליציה', () => {
    const leerfish = MEDITERRANEAN_FISH_BY_ID[LEGACY_SPECIES_ID_MAP['sp-15']];
    expect(leerfish?.hebrewName).toBe('אריען');
    expect(leerfish?.aliases).toContain('סטיליה');
  });
});
