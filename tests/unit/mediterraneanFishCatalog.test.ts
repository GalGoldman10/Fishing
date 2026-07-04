import {
  MEDITERRANEAN_FISH_CATALOG,
  MEDITERRANEAN_FISH_FAMILIES,
  matchMediterraneanFish,
  buildMediterraneanFishDetailAnswer,
  buildMediterraneanFishCatalogOverview,
  tryBuildMediterraneanFishAnswer,
} from '@/lib/research/mediterraneanFishCatalog';

describe('mediterraneanFishCatalog', () => {
  it('contains 25 species from 12 INPA fish families', () => {
    expect(MEDITERRANEAN_FISH_CATALOG).toHaveLength(25);
    expect(MEDITERRANEAN_FISH_FAMILIES).toHaveLength(12);
  });

  it('matches Hebrew and English fish names', () => {
    expect(matchMediterraneanFish('מה זה דניס')?.id).toBe('gilt-head-bream');
    expect(matchMediterraneanFish('tell me about lokus grouper')?.id).toBe('white-grouper');
    expect(matchMediterraneanFish('ברבוניה')?.id).toBe('striped-red-mullet');
  });

  it('flags protected groupers', () => {
    const alex = MEDITERRANEAN_FISH_CATALOG.find((e) => e.id === 'alexandria-grouper');
    const dusky = MEDITERRANEAN_FISH_CATALOG.find((e) => e.id === 'dusky-grouper');
    expect(alex?.protectedSpecies).toBe(true);
    expect(dusky?.protectedSpecies).toBe(true);
  });

  it('includes INPA legal minimums where applicable', () => {
    expect(matchMediterraneanFish('דניס')?.legalMinimumCm).toBe(15);
    expect(matchMediterraneanFish('בורי')?.legalMinimumCm).toBe(20);
    expect(matchMediterraneanFish('פלמידה')?.legalMinimumCm).toBe(30);
  });

  it('builds detail answer with parks.org.il source', () => {
    const entry = matchMediterraneanFish('סרגוס')!;
    const answer = buildMediterraneanFishDetailAnswer(entry, 'he');
    expect(answer).toMatch(/סרגוס/);
    expect(answer).toMatch(/parks\.org\.il/);
  });

  it('builds catalog overview grouped by family', () => {
    const answer = buildMediterraneanFishCatalogOverview('en');
    expect(answer).toMatch(/25/);
    expect(answer).toMatch(/Sparidae/);
    expect(answer).toMatch(/parks\.org\.il/);
  });

  it('answers "know your fish" questions', () => {
    const result = tryBuildMediterraneanFishAnswer('דע את הדג בים התיכון', 'he');
    expect(result?.directAnswer).toMatch(/25/);
    expect(result?.usedLocalDb).toBe(true);
  });
});
