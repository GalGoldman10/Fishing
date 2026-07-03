import { getBaseWaveLevel, computeSeaLevel, buildSafetyWarnings } from '@/lib/marine/seaLevel';
import { computeSuitabilityScore, suitabilityLabel } from '@/lib/marine/suitability';
import { DEFAULT_SEA_THRESHOLDS } from '@/types/marine';
import {
  getMarineForecast,
  isMarineDataStale,
  MarineDataUnavailableError,
  RefreshRateLimitedError,
  __clearMarineCache,
} from '@/features/marine/marineService';
import { openMeteoProvider } from '@/features/marine/openMeteoProvider';

describe('sea level rating', () => {
  it('uses the configured wave thresholds', () => {
    expect(getBaseWaveLevel(0.1)).toBe('calm');
    expect(getBaseWaveLevel(0.5)).toBe('low');
    expect(getBaseWaveLevel(1.0)).toBe('moderate');
    expect(getBaseWaveLevel(1.5)).toBe('high');
    expect(getBaseWaveLevel(2.5)).toBe('dangerous');
  });

  it('respects custom (admin-configured) thresholds', () => {
    const strict = { ...DEFAULT_SEA_THRESHOLDS, calmMaxWaveM: 0.1, lowMaxWaveM: 0.2 };
    expect(getBaseWaveLevel(0.15, strict)).toBe('low');
    expect(getBaseWaveLevel(0.15)).toBe('calm');
  });

  it('is not based only on wave height: rocky shore raises the level', () => {
    const sandy = computeSeaLevel({ waveHeightMeters: 1.0, shoreType: 'sandy' });
    const rocky = computeSeaLevel({ waveHeightMeters: 1.0, shoreType: 'rocky' });
    expect(sandy).toBe('moderate');
    expect(rocky).toBe('high');
  });

  it('raises the level for dangerous wind gusts', () => {
    const calmWind = computeSeaLevel({ waveHeightMeters: 1.0, windGustKph: 10 });
    const gusty = computeSeaLevel({ waveHeightMeters: 1.0, windGustKph: 60 });
    expect(calmWind).toBe('moderate');
    expect(gusty).toBe('high');
  });

  it('raises the level for short wave periods (powerful breaking waves)', () => {
    const longPeriod = computeSeaLevel({ waveHeightMeters: 1.0, wavePeriodSeconds: 10 });
    const shortPeriod = computeSeaLevel({ waveHeightMeters: 1.0, wavePeriodSeconds: 3 });
    expect(longPeriod).toBe('moderate');
    expect(shortPeriod).toBe('high');
  });

  it('uses swell height when it exceeds wind-wave height', () => {
    expect(computeSeaLevel({ waveHeightMeters: 0.2, swellHeightMeters: 2.5 })).toBe('dangerous');
  });

  it('raises the level for strong currents', () => {
    expect(computeSeaLevel({ waveHeightMeters: 1.0, currentSpeedKph: 5 })).toBe('high');
  });

  it('never exceeds dangerous', () => {
    expect(
      computeSeaLevel({
        waveHeightMeters: 3,
        windGustKph: 90,
        currentSpeedKph: 10,
        shoreType: 'cliff',
        visibilityKm: 0.5,
      }),
    ).toBe('dangerous');
  });
});

describe('safety warnings', () => {
  it('emits a rock fishing warning in rough conditions on rocks', () => {
    const level = computeSeaLevel({ waveHeightMeters: 1.5, shoreType: 'rocky' });
    const warnings = buildSafetyWarnings({ waveHeightMeters: 1.5, shoreType: 'rocky' }, level);
    expect(warnings).toContain('rockDanger');
  });

  it('emits high wave and gust warnings', () => {
    const warnings = buildSafetyWarnings(
      { waveHeightMeters: 2.5, windGustKph: 60 },
      'dangerous',
    );
    expect(warnings).toContain('highWaves');
    expect(warnings).toContain('dangerousGusts');
  });

  it('has no warnings for a calm sandy beach', () => {
    const level = computeSeaLevel({ waveHeightMeters: 0.2, windSpeedKph: 8, shoreType: 'sandy' });
    expect(level).toBe('calm');
    expect(buildSafetyWarnings({ waveHeightMeters: 0.2, windSpeedKph: 8, shoreType: 'sandy' }, level)).toEqual([]);
  });
});

describe('fishing suitability score', () => {
  it('stays within 0-100', () => {
    const best = computeSuitabilityScore({ seaLevel: 'calm', hourOfDay: 6 });
    const worst = computeSuitabilityScore({
      seaLevel: 'dangerous',
      windSpeedKph: 60,
      windGustKph: 80,
      rainProbability: 90,
    });
    expect(best).toBeGreaterThanOrEqual(0);
    expect(best).toBeLessThanOrEqual(100);
    expect(worst).toBeGreaterThanOrEqual(0);
    expect(worst).toBeLessThanOrEqual(100);
  });

  it('scores calm conditions higher than dangerous conditions', () => {
    const calm = computeSuitabilityScore({ seaLevel: 'calm' });
    const dangerous = computeSuitabilityScore({ seaLevel: 'dangerous' });
    expect(calm).toBeGreaterThan(dangerous);
  });

  it('maps scores to the documented labels', () => {
    expect(suitabilityLabel(90)).toBe('excellent');
    expect(suitabilityLabel(80)).toBe('excellent');
    expect(suitabilityLabel(79)).toBe('good');
    expect(suitabilityLabel(60)).toBe('good');
    expect(suitabilityLabel(59)).toBe('fair');
    expect(suitabilityLabel(40)).toBe('fair');
    expect(suitabilityLabel(39)).toBe('poor');
    expect(suitabilityLabel(20)).toBe('poor');
    expect(suitabilityLabel(19)).toBe('notRecommended');
    expect(suitabilityLabel(0)).toBe('notRecommended');
  });
});

describe('stale data detection', () => {
  it('marks old data as outdated', () => {
    const old = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    expect(isMarineDataStale(old)).toBe(true);
  });

  it('does not mark fresh data as outdated', () => {
    expect(isMarineDataStale(new Date().toISOString())).toBe(false);
  });

  it('treats unparseable timestamps as outdated', () => {
    expect(isMarineDataStale('not-a-date')).toBe(true);
  });
});

describe('open-meteo provider (no invented values)', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    __clearMarineCache();
  });

  function mockFetch(marineOk: boolean) {
    const now = new Date();
    const times = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getTime() + (i - 1) * 3600 * 1000);
      return d.toISOString().slice(0, 16);
    });
    const weatherBody = {
      hourly: {
        time: times,
        temperature_2m: [20, 21, 22, 23, 22, 21],
        wind_speed_10m: [10, 12, 14, 15, 13, 11],
        wind_gusts_10m: [15, 18, 20, 22, 19, 16],
        wind_direction_10m: [270, 280, 290, 300, 280, 270],
        // precipitation_probability intentionally missing — must stay undefined
        surface_pressure: [1013, 1013, 1012, 1012, 1011, 1011],
      },
      daily: { time: [times[0].slice(0, 10)], sunrise: [`${times[0].slice(0, 10)}T05:40`], sunset: [`${times[0].slice(0, 10)}T19:30`] },
    };
    const marineBody = {
      hourly: {
        time: times,
        wave_height: [0.5, 0.6, 0.7, 0.8, 0.7, 0.6],
        wave_period: [6, 6, 7, 7, 6, 6],
        // sea_surface_temperature intentionally missing
      },
    };
    globalThis.fetch = jest.fn(async (url: RequestInfo | URL) => {
      const u = String(url);
      if (u.includes('marine-api')) {
        if (!marineOk) throw new Error('marine down');
        return { ok: true, json: async () => marineBody } as Response;
      }
      return { ok: true, json: async () => weatherBody } as Response;
    }) as unknown as typeof fetch;
  }

  it('returns only values the provider supplied', async () => {
    mockFetch(true);
    const forecast = await openMeteoProvider.getConditions({
      latitude: 32.08,
      longitude: 34.77,
      shoreType: 'sandy',
    });
    const c = forecast.current;
    expect(c.waveHeightMeters).toBeDefined();
    expect(c.windSpeedKph).toBeDefined();
    // Missing provider fields must never be invented:
    expect(c.rainProbability).toBeUndefined();
    expect(c.seaTemperatureCelsius).toBeUndefined();
    expect(c.swellHeightMeters).toBeUndefined();
    expect(c.tideHeightMeters).toBeUndefined();
    expect(c.fishingSuitabilityScore).toBeGreaterThanOrEqual(0);
    expect(c.fishingSuitabilityScore).toBeLessThanOrEqual(100);
    expect(c.source).toBe('open-meteo');
  });

  it('still works when the marine endpoint fails (weather only)', async () => {
    mockFetch(false);
    const forecast = await openMeteoProvider.getConditions({
      latitude: 32.79,
      longitude: 35.54,
      shoreType: 'sandy',
    });
    expect(forecast.current.waveHeightMeters).toBeUndefined();
    expect(forecast.current.windSpeedKph).toBeDefined();
  });

  it('provides an hourly timeline for charts', async () => {
    mockFetch(true);
    const forecast = await openMeteoProvider.getConditions({
      latitude: 32.08,
      longitude: 34.77,
    });
    expect(forecast.hourly.length).toBeGreaterThan(0);
    for (const hour of forecast.hourly) {
      expect(hour.fishingSuitabilityScore).toBeGreaterThanOrEqual(0);
      expect(hour.fishingSuitabilityScore).toBeLessThanOrEqual(100);
    }
  });
});

describe('marine service caching and failure handling', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    __clearMarineCache();
  });

  it('throws a translated-friendly error when the provider fails with no cache', async () => {
    globalThis.fetch = jest.fn(async () => {
      throw new Error('network down');
    }) as unknown as typeof fetch;

    await expect(
      getMarineForecast({ latitude: 10, longitude: 10 }),
    ).rejects.toBeInstanceOf(MarineDataUnavailableError);
  });

  it('rate limits repeated manual refreshes', async () => {
    globalThis.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({ hourly: { time: [new Date().toISOString().slice(0, 16)], wind_speed_10m: [10] } }),
    })) as unknown as typeof fetch;

    await getMarineForecast({ latitude: 20, longitude: 20, forceRefresh: true });
    await expect(
      getMarineForecast({ latitude: 20, longitude: 20, forceRefresh: true }),
    ).rejects.toBeInstanceOf(RefreshRateLimitedError);
  });

  it('serves cached data without a second network call', async () => {
    const fetchMock = jest.fn(async () => ({
      ok: true,
      json: async () => ({ hourly: { time: [new Date().toISOString().slice(0, 16)], wind_speed_10m: [10] } }),
    }));
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await getMarineForecast({ latitude: 30, longitude: 30 });
    const callsAfterFirst = fetchMock.mock.calls.length;
    await getMarineForecast({ latitude: 30, longitude: 30 });
    expect(fetchMock.mock.calls.length).toBe(callsAfterFirst);
  });
});
