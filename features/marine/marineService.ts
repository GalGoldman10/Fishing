import type { ShoreType } from '@/types/fishing';
import type { MarineForecast } from '@/types/marine';
import { openMeteoProvider } from './openMeteoProvider';

/** Cache duration for current conditions (25 minutes). */
const CACHE_TTL_MS = 25 * 60 * 1000;
/** Data older than this is flagged as outdated in the UI. */
const STALE_AFTER_MS = 90 * 60 * 1000;
/** Minimum interval between manual refreshes per location. */
const REFRESH_COOLDOWN_MS = 60 * 1000;

interface CacheEntry {
  forecast: MarineForecast;
  cachedAt: number;
}

const cache = new Map<string, CacheEntry>();
const lastManualRefresh = new Map<string, number>();

function cacheKey(latitude: number, longitude: number): string {
  // ~1km grid so nearby requests share a cache slot.
  return `${latitude.toFixed(2)},${longitude.toFixed(2)}`;
}

export class MarineDataUnavailableError extends Error {
  constructor() {
    super('Marine data is currently unavailable');
    this.name = 'MarineDataUnavailableError';
  }
}

export class RefreshRateLimitedError extends Error {
  constructor(public retryAfterMs: number) {
    super('Refresh rate limited');
    this.name = 'RefreshRateLimitedError';
  }
}

export async function getMarineForecast(input: {
  latitude: number;
  longitude: number;
  shoreType?: ShoreType;
  forceRefresh?: boolean;
}): Promise<MarineForecast> {
  const key = cacheKey(input.latitude, input.longitude);
  const cached = cache.get(key);
  const now = Date.now();

  if (input.forceRefresh) {
    const last = lastManualRefresh.get(key) ?? 0;
    const elapsed = now - last;
    if (elapsed < REFRESH_COOLDOWN_MS) {
      throw new RefreshRateLimitedError(REFRESH_COOLDOWN_MS - elapsed);
    }
    lastManualRefresh.set(key, now);
  } else if (cached && now - cached.cachedAt < CACHE_TTL_MS) {
    return cached.forecast;
  }

  try {
    const forecast = await openMeteoProvider.getConditions(input);
    cache.set(key, { forecast, cachedAt: now });
    return forecast;
  } catch (error) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) console.warn('[marine] provider failed:', error);
    // Serve stale cache rather than nothing — UI flags it as outdated.
    if (cached) return cached.forecast;
    throw new MarineDataUnavailableError();
  }
}

/** True when the fetched data is old enough that it should be marked outdated. */
export function isMarineDataStale(fetchedAt: string, now: Date = new Date()): boolean {
  const fetched = new Date(fetchedAt).getTime();
  if (!Number.isFinite(fetched)) return true;
  return now.getTime() - fetched > STALE_AFTER_MS;
}

/** Test hook. */
export function __clearMarineCache(): void {
  cache.clear();
  lastManualRefresh.clear();
}
