import { activityTier, computeFishActivity } from '@/lib/marine/fishActivity';
import type { LiveMarineConditions } from '@/types/marine';

function conditions(overrides: Partial<LiveMarineConditions>): LiveMarineConditions {
  return {
    latitude: 32,
    longitude: 34.7,
    seaLevel: 'calm',
    fishingSuitabilityScore: 80,
    suitabilityLabel: 'excellent',
    safetyWarnings: [],
    source: 'test',
    forecastTime: '2026-07-03T12:00:00Z',
    fetchedAt: '2026-07-03T12:00:00Z',
    ...overrides,
  };
}

describe('activityTier', () => {
  it('maps percentages to BH-style tiers', () => {
    expect(activityTier(20)).toBe('slow');
    expect(activityTier(40)).toBe('slow');
    expect(activityTier(41)).toBe('challenging');
    expect(activityTier(70)).toBe('challenging');
    expect(activityTier(71)).toBe('hot');
    expect(activityTier(100)).toBe('hot');
  });
});

describe('computeFishActivity', () => {
  // Fixed reference dates: 2026-07-29 full moon, 2026-07-23 first quarter.
  const fullMoonDawn = new Date('2026-07-29T06:00:00');
  const quarterMoonNoon = new Date('2026-07-23T12:30:00');

  it('boosts activity at dawn under a full moon with stable pressure', () => {
    const result = computeFishActivity(
      conditions({ fishingSuitabilityScore: 70, pressureHpa: 1018 }),
      fullMoonDawn,
    );
    expect(result.factors.moonAdjustment).toBe(8);
    expect(result.factors.timeOfDayAdjustment).toBe(7);
    expect(result.factors.pressureAdjustment).toBe(5);
    expect(result.percent).toBe(90);
    expect(result.tier).toBe('hot');
  });

  it('penalizes quarter moon at midday with very low pressure', () => {
    const result = computeFishActivity(
      conditions({ fishingSuitabilityScore: 60, pressureHpa: 995 }),
      quarterMoonNoon,
    );
    expect(result.factors.moonAdjustment).toBe(-5);
    expect(result.factors.timeOfDayAdjustment).toBe(-5);
    expect(result.factors.pressureAdjustment).toBe(-10);
    expect(result.percent).toBe(40);
    expect(result.tier).toBe('slow');
  });

  it('applies no pressure adjustment when the barometer is missing', () => {
    const result = computeFishActivity(conditions({ pressureHpa: undefined }), fullMoonDawn);
    expect(result.factors.pressureAdjustment).toBe(0);
  });

  it('clamps the result to 0..100', () => {
    const high = computeFishActivity(
      conditions({ fishingSuitabilityScore: 100, pressureHpa: 1018 }),
      fullMoonDawn,
    );
    expect(high.percent).toBeLessThanOrEqual(100);

    const low = computeFishActivity(
      conditions({ fishingSuitabilityScore: 5, pressureHpa: 990 }),
      quarterMoonNoon,
    );
    expect(low.percent).toBeGreaterThanOrEqual(0);
  });
});
