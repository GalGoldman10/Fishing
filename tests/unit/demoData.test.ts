import { DEMO_SPOTS, getDemoSpotDetails } from '@/lib/mock/demoData';

describe('Demo spot data', () => {
  it('has at least 18 beaches', () => {
    expect(DEMO_SPOTS.length).toBeGreaterThanOrEqual(18);
  });

  it('marks all spots as demo verification status', () => {
    for (const spot of DEMO_SPOTS) {
      expect(spot.verificationStatus).toBe('demo');
    }
  });

  it('includes varied shore types', () => {
    const types = new Set(DEMO_SPOTS.map((s) => s.shoreType));
    expect(types.has('sandy')).toBe(true);
    expect(types.has('rocky')).toBe(true);
    expect(types.has('pier')).toBe(true);
  });

  it('returns spot-specific species for Palmachim', () => {
    const details = getDemoSpotDetails('demo-9');
    expect(details).not.toBeNull();
    expect(details!.name).toContain('Palmachim');
    expect(details!.species.length).toBeGreaterThan(0);
    expect(details!.description).toContain('surf');
  });
});
