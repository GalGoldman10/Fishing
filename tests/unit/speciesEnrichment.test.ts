import { DEMO_SPECIES, isPlaceholderSpeciesText } from '@/lib/mock/speciesCatalog';
import { getSpeciesProfile } from '@/lib/mock/speciesProfiles';

describe('species enrichment', () => {
  it('gives sea bass habitat and diet from local fishing knowledge', () => {
    const profile = getSpeciesProfile('mf-028');
    expect(profile?.habitat.he).toMatch(/גלים|שובר/i);
    expect(profile?.diet.he).toMatch(/שרימפס|פיתיון/i);
    expect(isPlaceholderSpeciesText(profile?.description.he)).toBe(false);
  });

  it('lists enriched species in DEMO_SPECIES browse catalog', () => {
    const seaBass = DEMO_SPECIES.find((s) => s.localizedNames?.he === 'לברק');
    expect(seaBass).toBeTruthy();
    expect(seaBass?.scientificName).toBe('Dicentrarchus labrax');
  });

  it('merges palamida guide entry with Parks catalog data', () => {
    const profile = getSpeciesProfile('pf-003');
    expect(profile?.familyLatin).toBe('SCOMBRIDAE');
    expect(isPlaceholderSpeciesText(profile?.habitat.he)).toBe(false);
    expect(isPlaceholderSpeciesText(profile?.reproduction.he)).toBe(false);
  });
});
