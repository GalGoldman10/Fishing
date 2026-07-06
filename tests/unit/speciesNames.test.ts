import { DEMO_SPECIES } from '@/lib/mock/demoData';
import { getLocalizedSpeciesText } from '@/lib/mock/speciesProfiles';

/** Israeli angler-facing Hebrew names used in the Fish Guide. */
const EXPECTED_HEBREW_NAMES: Record<string, string> = {
  'sp-1': 'לברק',
  'sp-2': 'דניס',
  'sp-3': 'מרמור',
  'sp-4': 'פארידה',
  'sp-5': 'גומבר',
  'sp-6': 'מקרל',
  'sp-7': 'בורי',
  'sp-8': 'לוקוס',
  'sp-9': 'דג לשון',
  'sp-10': 'אינטיאס',
  'sp-11': 'ברקודה',
  'sp-12': 'סרדין',
  'sp-13': 'ברבוניה',
  'sp-14': 'סרגוס',
  'sp-15': 'אריאן',
};

describe('Fish Guide species Hebrew names', () => {
  it('uses accurate Israeli angler names', () => {
    for (const species of DEMO_SPECIES) {
      expect(species.localizedNames?.he).toBe(EXPECTED_HEBREW_NAMES[species.id]);
    }
  });

  it('does not duplicate Hebrew names across species', () => {
    const names = DEMO_SPECIES.map((s) => s.localizedNames?.he);
    expect(new Set(names).size).toBe(names.length);
  });

  it('shows Hebrew habitat text when language is Hebrew', () => {
    const habitat = getLocalizedSpeciesText('sp-1', 'habitat', 'he');
    expect(habitat).toBe('מים חופיים, אזורים סלעיים וחוליים');
    expect(habitat).not.toMatch(/Coastal|rocky and sandy/i);
  });

  it('uses established Hebrew name for Lichia amia, not genus transliteration', () => {
    const leerfish = DEMO_SPECIES.find((s) => s.scientificName === 'Lichia amia');
    expect(leerfish?.localizedNames?.he).toBe('אריאן');
    expect(leerfish?.localizedNames?.he).not.toBe('ליציה');
  });
});
