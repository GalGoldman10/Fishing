import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { Coordinates, FishingSpotSummary } from '@/types/fishing';
import { isValidCoordinates } from '@/lib/utils/coordinates';
import { DEFAULT_SEA_THRESHOLDS, SeaLevelThresholds } from '@/types/marine';

const OVERRIDES_KEY = 'fishguide_spot_overrides';
const THRESHOLDS_KEY = 'fishguide_sea_thresholds';

export interface SpotCoordinateOverride {
  spotId: string;
  latitude: number;
  longitude: number;
  marineCoordinates?: Coordinates;
  parkingCoordinates?: Coordinates;
  accessPointCoordinates?: Coordinates;
  coordinateSource: string;
  verifiedAt: string;
  verifiedBy?: string;
}

type OverridesMap = Record<string, SpotCoordinateOverride>;

async function readRaw(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
  }
  return SecureStore.getItemAsync(key);
}

async function writeRaw(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

let overridesCache: OverridesMap | null = null;

export async function loadOverrides(): Promise<OverridesMap> {
  if (overridesCache) return overridesCache;
  try {
    const raw = await readRaw(OVERRIDES_KEY);
    overridesCache = raw ? (JSON.parse(raw) as OverridesMap) : {};
  } catch {
    overridesCache = {};
  }
  return overridesCache;
}

export async function saveOverride(override: SpotCoordinateOverride): Promise<void> {
  if (!isValidCoordinates(override.latitude, override.longitude)) {
    throw new Error('invalid-coordinates');
  }
  const overrides = await loadOverrides();
  overrides[override.spotId] = override;
  overridesCache = overrides;
  await writeRaw(OVERRIDES_KEY, JSON.stringify(overrides));
}

export async function clearOverride(spotId: string): Promise<void> {
  const overrides = await loadOverrides();
  delete overrides[spotId];
  overridesCache = overrides;
  await writeRaw(OVERRIDES_KEY, JSON.stringify(overrides));
}

/** Applies admin-corrected coordinates on top of the base spot records. */
export function applyOverrides<T extends FishingSpotSummary>(spots: T[], overrides: OverridesMap): T[] {
  return spots.map((spot) => {
    const o = overrides[spot.id];
    if (!o) return spot;
    return {
      ...spot,
      latitude: o.latitude,
      longitude: o.longitude,
      marineCoordinates: o.marineCoordinates ?? spot.marineCoordinates,
      parkingCoordinates: o.parkingCoordinates ?? spot.parkingCoordinates,
      accessPointCoordinates: o.accessPointCoordinates ?? spot.accessPointCoordinates,
      coordinateSource: o.coordinateSource,
      coordinatesVerifiedAt: o.verifiedAt,
      coordinatesVerifiedBy: o.verifiedBy,
    };
  });
}

/** Admin-configurable sea level thresholds (falls back to defaults). */
export async function loadSeaThresholds(): Promise<SeaLevelThresholds> {
  try {
    const raw = await readRaw(THRESHOLDS_KEY);
    if (!raw) return DEFAULT_SEA_THRESHOLDS;
    return { ...DEFAULT_SEA_THRESHOLDS, ...(JSON.parse(raw) as Partial<SeaLevelThresholds>) };
  } catch {
    return DEFAULT_SEA_THRESHOLDS;
  }
}

export async function saveSeaThresholds(thresholds: SeaLevelThresholds): Promise<void> {
  await writeRaw(THRESHOLDS_KEY, JSON.stringify(thresholds));
}

/** Test hook. */
export function __clearOverridesCache(): void {
  overridesCache = null;
}
