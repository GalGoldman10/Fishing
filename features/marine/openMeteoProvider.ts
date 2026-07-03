import type { ShoreType } from '@/types/fishing';
import {
  LiveMarineConditions,
  MarineConditionsProvider,
  MarineForecast,
  MarineForecastHour,
} from '@/types/marine';
import { buildSafetyWarnings, computeSeaLevel } from '@/lib/marine/seaLevel';
import { computeSuitabilityScore, suitabilityLabel } from '@/lib/marine/suitability';

const MARINE_URL = 'https://marine-api.open-meteo.com/v1/marine';
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

type HourlySeries = Record<string, (number | null)[] | string[] | undefined>;

interface MarineApiResponse {
  hourly?: HourlySeries & { time?: string[] };
}

interface WeatherApiResponse {
  hourly?: HourlySeries & { time?: string[] };
  daily?: { time?: string[]; sunrise?: string[]; sunset?: string[] };
}

/** Returns the value at an index only when the provider actually supplied it. */
function at(series: HourlySeries | undefined, key: string, index: number): number | undefined {
  const arr = series?.[key];
  if (!Array.isArray(arr)) return undefined;
  const value = arr[index];
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function findNowIndex(times: string[] | undefined, now: Date): number {
  if (!times?.length) return -1;
  const nowMs = now.getTime();
  let best = -1;
  for (let i = 0; i < times.length; i++) {
    if (new Date(times[i]).getTime() <= nowMs) best = i;
    else break;
  }
  return best === -1 ? 0 : best;
}

/** Next local maximum / minimum in the sea-level series after `fromIndex`. */
function findNextTideExtreme(
  times: string[],
  heights: (number | null)[],
  fromIndex: number,
  kind: 'high' | 'low',
): string | undefined {
  for (let i = Math.max(fromIndex + 1, 1); i < heights.length - 1; i++) {
    const prev = heights[i - 1];
    const cur = heights[i];
    const next = heights[i + 1];
    if (typeof prev !== 'number' || typeof cur !== 'number' || typeof next !== 'number') continue;
    if (kind === 'high' && cur >= prev && cur >= next) return times[i];
    if (kind === 'low' && cur <= prev && cur <= next) return times[i];
  }
  return undefined;
}

async function fetchJson<T>(url: string, timeoutMs = 8000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`Provider responded with status ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

const MARINE_HOURLY = [
  'wave_height',
  'wave_period',
  'wave_direction',
  'swell_wave_height',
  'swell_wave_period',
  'swell_wave_direction',
  'sea_surface_temperature',
  'ocean_current_velocity',
  'ocean_current_direction',
  'sea_level_height_msl',
].join(',');

const WEATHER_HOURLY = [
  'temperature_2m',
  'wind_speed_10m',
  'wind_gusts_10m',
  'wind_direction_10m',
  'precipitation_probability',
  'surface_pressure',
  'visibility',
].join(',');

export const openMeteoProvider: MarineConditionsProvider = {
  name: 'open-meteo',

  async getConditions({ latitude, longitude, shoreType }): Promise<MarineForecast> {
    const marineUrl =
      `${MARINE_URL}?latitude=${latitude}&longitude=${longitude}` +
      `&hourly=${MARINE_HOURLY}&timezone=auto&forecast_days=3`;
    const weatherUrl =
      `${WEATHER_URL}?latitude=${latitude}&longitude=${longitude}` +
      `&hourly=${WEATHER_HOURLY}&daily=sunrise,sunset&wind_speed_unit=kmh&timezone=auto&forecast_days=3`;

    // Weather is required; the marine endpoint may legitimately have no data
    // for inland water (e.g. a lake), so its failure is tolerated.
    const [marineResult, weather] = await Promise.all([
      fetchJson<MarineApiResponse>(marineUrl).catch(() => undefined),
      fetchJson<WeatherApiResponse>(weatherUrl),
    ]);

    const now = new Date();
    const marineTimes = marineResult?.hourly?.time;
    const weatherTimes = weather.hourly?.time;
    const times = weatherTimes ?? marineTimes ?? [];
    const nowIdx = findNowIndex(times, now);
    const marineIdx = marineTimes ? findNowIndex(marineTimes, now) : -1;

    const readMarine = (key: string, idx: number) =>
      marineIdx === -1 ? undefined : at(marineResult?.hourly, key, idx);
    const readWeather = (key: string, idx: number) => at(weather.hourly, key, idx);

    const buildHour = (idx: number, mIdx: number): Omit<MarineForecastHour, 'seaLevel' | 'fishingSuitabilityScore'> & {
      raw: ReturnType<typeof rawInputs>;
    } => {
      const raw = rawInputs(idx, mIdx);
      return {
        time: times[idx],
        waveHeightMeters: raw.waveHeightMeters,
        windSpeedKph: raw.windSpeedKph,
        windGustKph: raw.windGustKph,
        raw,
      };
    };

    const rawInputs = (idx: number, mIdx: number) => ({
      waveHeightMeters: readMarine('wave_height', mIdx),
      wavePeriodSeconds: readMarine('wave_period', mIdx),
      waveDirectionDegrees: readMarine('wave_direction', mIdx),
      swellHeightMeters: readMarine('swell_wave_height', mIdx),
      swellPeriodSeconds: readMarine('swell_wave_period', mIdx),
      swellDirectionDegrees: readMarine('swell_wave_direction', mIdx),
      seaTemperatureCelsius: readMarine('sea_surface_temperature', mIdx),
      currentSpeedKph: readMarine('ocean_current_velocity', mIdx),
      currentDirectionDegrees: readMarine('ocean_current_direction', mIdx),
      tideHeightMeters: readMarine('sea_level_height_msl', mIdx),
      airTemperatureCelsius: readWeather('temperature_2m', idx),
      windSpeedKph: readWeather('wind_speed_10m', idx),
      windGustKph: readWeather('wind_gusts_10m', idx),
      windDirectionDegrees: readWeather('wind_direction_10m', idx),
      rainProbability: readWeather('precipitation_probability', idx),
      pressureHpa: readWeather('surface_pressure', idx),
      visibilityKm: (() => {
        const meters = readWeather('visibility', idx);
        return meters === undefined ? undefined : Math.round((meters / 1000) * 10) / 10;
      })(),
    });

    const nowRaw = rawInputs(nowIdx, marineIdx);
    const seaLevel = computeSeaLevel({ ...nowRaw, shoreType });
    const hourOfDay = times[nowIdx] ? new Date(times[nowIdx]).getHours() : undefined;
    const score = computeSuitabilityScore({ ...nowRaw, seaLevel, shoreType, hourOfDay });

    // Tide extremes from the provider's sea-level series (not estimated).
    let nextHighTide: string | undefined;
    let nextLowTide: string | undefined;
    const tideSeries = marineResult?.hourly?.sea_level_height_msl;
    if (marineTimes && Array.isArray(tideSeries)) {
      nextHighTide = findNextTideExtreme(marineTimes, tideSeries as (number | null)[], marineIdx, 'high');
      nextLowTide = findNextTideExtreme(marineTimes, tideSeries as (number | null)[], marineIdx, 'low');
    }

    const todayIdx = weather.daily?.time
      ? Math.max(0, weather.daily.time.findIndex((d) => d === times[nowIdx]?.slice(0, 10)))
      : -1;

    const current: LiveMarineConditions = {
      latitude,
      longitude,
      ...nowRaw,
      nextHighTide,
      nextLowTide,
      sunrise: todayIdx >= 0 ? weather.daily?.sunrise?.[todayIdx] : undefined,
      sunset: todayIdx >= 0 ? weather.daily?.sunset?.[todayIdx] : undefined,
      seaLevel,
      fishingSuitabilityScore: score,
      suitabilityLabel: suitabilityLabel(score),
      safetyWarnings: buildSafetyWarnings({ ...nowRaw, shoreType }, seaLevel),
      source: 'open-meteo',
      forecastTime: times[nowIdx] ?? now.toISOString(),
      fetchedAt: now.toISOString(),
    };

    // Hourly timeline for the next 72 hours (chart shows a slice).
    const hourly: MarineForecastHour[] = [];
    const end = Math.min(times.length, nowIdx + 72);
    for (let idx = nowIdx; idx < end; idx++) {
      const mIdx = marineTimes
        ? marineTimes.findIndex((t) => t === times[idx])
        : -1;
      const entry = buildHour(idx, mIdx === -1 ? marineIdx : mIdx);
      const hourSeaLevel = computeSeaLevel({ ...entry.raw, shoreType });
      const hourScore = computeSuitabilityScore({
        ...entry.raw,
        seaLevel: hourSeaLevel,
        shoreType,
        hourOfDay: new Date(entry.time).getHours(),
      });
      hourly.push({
        time: entry.time,
        waveHeightMeters: entry.waveHeightMeters,
        windSpeedKph: entry.windSpeedKph,
        windGustKph: entry.windGustKph,
        seaLevel: hourSeaLevel,
        fishingSuitabilityScore: hourScore,
      });
    }

    return { current, hourly };
  },
};
