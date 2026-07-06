import { PARKS_FISH_CATALOG, findParksFishByText, LEGACY_SPECIES_TO_PARKS } from '@/lib/mock/parksFishCatalog';
import { DEMO_SPECIES, UNIFIED_SPECIES, resolveUnifiedSpeciesId } from '@/lib/mock/speciesCatalog';
import { getSpeciesProfile } from '@/lib/mock/speciesProfiles';

describe('parksFishCatalog', () => {
  it('contains 25 official Parks.org.il species in 12 families', () => {
    expect(PARKS_FISH_CATALOG).toHaveLength(25);
    expect(new Set(PARKS_FISH_CATALOG.map((s) => s.familyLatin)).size).toBe(12);
  });

  it('finds species by colloquial Hebrew name', () => {
    expect(findParksFishByText('דניס')?.scientificName).toBe('Sparus aurata');
    expect(findParksFishByText('בורי')?.scientificName).toBe('Mugil cephalus');
  });

  it('includes scientific names and official habitat text', () => {
    const denis = findParksFishByText('דניס');
    expect(denis?.scientificName).toBe('Sparus aurata');
    expect(denis?.habitat.length).toBeGreaterThan(10);
  });
});

describe('unified species catalog', () => {
  it('merges Parks data with the cooking guide and enriches sparse entries', () => {
    expect(UNIFIED_SPECIES.length).toBeGreaterThan(PARKS_FISH_CATALOG.length);
    expect(DEMO_SPECIES.length).toBeLessThanOrEqual(UNIFIED_SPECIES.length);
    expect(DEMO_SPECIES.length).toBeGreaterThan(PARKS_FISH_CATALOG.length);
  });

  it('maps legacy beach species ids to Parks catalog entries', () => {
    expect(resolveUnifiedSpeciesId('sp-2')).toMatch(/^pf-/);
    expect(getSpeciesProfile('sp-7')?.aliases).toContain('בורי');
  });

  it('maps legacy grouper id to Parks dusky grouper entry', () => {
    const grouper = getSpeciesProfile(resolveUnifiedSpeciesId('sp-8'));
    expect(grouper?.familyLatin).toBe('SERRANIDAE');
    expect(grouper?.aliases.some((name) => /לוקוס|דקר/.test(name))).toBe(true);
    expect(grouper?.habitat.he.length).toBeGreaterThanOrEqual(20);
  });

  it('maps legacy ids through LEGACY_SPECIES_TO_PARKS', () => {
    for (const [legacyId, parksId] of Object.entries(LEGACY_SPECIES_TO_PARKS)) {
      expect(resolveUnifiedSpeciesId(legacyId)).toBe(parksId);
    }
  });
});
