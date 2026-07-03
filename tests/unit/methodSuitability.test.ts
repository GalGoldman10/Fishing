import { assessFishingMethods, recommendSinker } from '@/lib/marine/methodSuitability';
import { getMoonInfo } from '@/lib/marine/moonPhase';
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

describe('assessFishingMethods', () => {
  it('rates calm conditions good for all methods', () => {
    const result = assessFishingMethods(
      conditions({ waveHeightMeters: 0.3, windSpeedKph: 10, windGustKph: 15, swellHeightMeters: 0.3, wavePeriodSeconds: 8 }),
    );
    expect(result.map((r) => r.rating)).toEqual(['good', 'good', 'good']);
  });

  it('flags drone fishing as bad in strong gusts while shore may still be fine', () => {
    const result = assessFishingMethods(
      conditions({ waveHeightMeters: 0.5, windSpeedKph: 25, windGustKph: 55, swellHeightMeters: 0.4, wavePeriodSeconds: 8 }),
    );
    const drone = result.find((r) => r.method === 'drone')!;
    const shore = result.find((r) => r.method === 'shore')!;
    expect(drone.rating).toBe('bad');
    expect(shore.rating).toBe('good');
  });

  it('flags boat as caution on short choppy period even with small swell', () => {
    const result = assessFishingMethods(
      conditions({ swellHeightMeters: 0.8, wavePeriodSeconds: 3.5, windGustKph: 20 }),
    );
    const boat = result.find((r) => r.method === 'boat')!;
    expect(boat.rating).toBe('caution');
  });

  it('returns unknown when no data is available', () => {
    const result = assessFishingMethods(conditions({}));
    expect(result.every((r) => r.rating === 'unknown')).toBe(true);
  });

  it('rates shore as bad in high waves', () => {
    const result = assessFishingMethods(conditions({ waveHeightMeters: 2.2 }));
    const shore = result.find((r) => r.method === 'shore')!;
    expect(shore.rating).toBe('bad');
  });
});

describe('recommendSinker', () => {
  it('recommends light lead in calm water', () => {
    expect(recommendSinker(conditions({ currentSpeedKph: 0.2, windSpeedKph: 5 }))).toBe('lightSinker');
  });

  it('recommends spider sinker in strong drift', () => {
    expect(recommendSinker(conditions({ currentSpeedKph: 3.0, windSpeedKph: 20 }))).toBe('spiderSinker');
  });

  it('returns unknown without current or wind data', () => {
    expect(recommendSinker(conditions({}))).toBe('unknown');
  });
});

describe('getMoonInfo', () => {
  it('detects a known full moon date', () => {
    // 2026-07-29 is a full moon.
    const info = getMoonInfo(new Date('2026-07-29T12:00:00Z'));
    expect(info.phase).toBe('fullMoon');
    expect(info.illumination).toBeGreaterThan(0.95);
    expect(info.activity).toBe('high');
  });

  it('detects a known new moon date', () => {
    // 2026-07-14 is a new moon.
    const info = getMoonInfo(new Date('2026-07-14T12:00:00Z'));
    expect(info.phase).toBe('newMoon');
    expect(info.illumination).toBeLessThan(0.05);
    expect(info.activity).toBe('high');
  });

  it('cycle fraction stays within 0..1', () => {
    for (const iso of ['2020-01-01', '2023-06-15', '2026-07-03', '2030-12-31']) {
      const info = getMoonInfo(new Date(iso));
      expect(info.cycleFraction).toBeGreaterThanOrEqual(0);
      expect(info.cycleFraction).toBeLessThan(1);
    }
  });
});
