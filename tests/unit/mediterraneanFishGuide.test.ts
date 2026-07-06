import { MEDITERRANEAN_FISH_GUIDE, findFishGuideEntry, resolveSpeciesGuideId } from '@/lib/mock/mediterraneanFishGuide';
import { getSpeciesProfile } from '@/lib/mock/speciesProfiles';
import { DEMO_SPECIES } from '@/lib/mock/demoData';

describe('mediterraneanFishGuide', () => {
  it('contains 44 species from the Hebrew Excel guide', () => {
    expect(MEDITERRANEAN_FISH_GUIDE).toHaveLength(44);
  });

  it('finds fish by Hebrew name and alias', () => {
    expect(findFishGuideEntry('דניס')?.id).toBe('mf-018');
    expect(findFishGuideEntry('שולה')?.hebrewName).toBe('אינטיאס');
  });

  it('maps legacy spot species ids to guide entries', () => {
    expect(resolveSpeciesGuideId('sp-2')).toBe('mf-018');
    expect(getSpeciesProfile('sp-2')?.aliases).toContain('דניס');
  });

  it('exposes all guide species in DEMO_SPECIES', () => {
    expect(DEMO_SPECIES).toHaveLength(44);
    expect(DEMO_SPECIES.some((s) => s.localizedNames?.he === 'גומבר')).toBe(true);
  });
});
