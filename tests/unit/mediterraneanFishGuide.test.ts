import { MEDITERRANEAN_FISH_GUIDE, findFishGuideEntry } from '@/lib/mock/mediterraneanFishGuide';

describe('mediterraneanFishGuide', () => {
  it('contains 44 species from the Hebrew Excel guide', () => {
    expect(MEDITERRANEAN_FISH_GUIDE).toHaveLength(44);
  });

  it('finds fish by Hebrew name and alias', () => {
    expect(findFishGuideEntry('דניס')?.id).toBe('mf-018');
    expect(findFishGuideEntry('שולה')?.hebrewName).toBe('אינטיאס');
  });
});
