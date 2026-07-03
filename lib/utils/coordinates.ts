export type Coordinates = {
  latitude: number;
  longitude: number;
};

export function isValidCoordinates(latitude: number, longitude: number): boolean {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180 &&
    // 0,0 ("null island") is always a data error for a fishing spot.
    !(latitude === 0 && longitude === 0)
  );
}

/**
 * Explicit adapter for map systems that expect [latitude, longitude]
 * (Leaflet, react-native-maps arrays).
 */
export function toLatLngArray(coordinates: Coordinates): [number, number] {
  return [coordinates.latitude, coordinates.longitude];
}

/**
 * Explicit adapter for map systems that expect [longitude, latitude]
 * (GeoJSON, Mapbox).
 */
export function toLngLatArray(coordinates: Coordinates): [number, number] {
  return [coordinates.longitude, coordinates.latitude];
}

/**
 * Parses coordinates that may arrive as strings (imports, form input),
 * including values using a comma as the decimal separator.
 * Returns undefined instead of guessing when parsing fails.
 */
export function parseCoordinate(value: unknown): number | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim().replace(',', '.');
  if (!normalized || !/^-?\d+(\.\d+)?$/.test(normalized)) return undefined;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * Filters a list of records to those with valid coordinates and logs the
 * rejected ones (dev only) instead of silently dropping or defaulting them.
 */
export function filterValidCoordinates<T extends { id: string; latitude: number; longitude: number }>(
  records: T[],
): { valid: T[]; invalid: T[] } {
  const valid: T[] = [];
  const invalid: T[] = [];
  for (const record of records) {
    if (isValidCoordinates(record.latitude, record.longitude)) {
      valid.push(record);
    } else {
      invalid.push(record);
    }
  }
  if (invalid.length > 0 && typeof __DEV__ !== 'undefined' && __DEV__) {
    console.warn(
      `[coordinates] ${invalid.length} record(s) skipped due to invalid coordinates:`,
      invalid.map((r) => `${r.id} (${r.latitude}, ${r.longitude})`).join('; '),
    );
  }
  return { valid, invalid };
}
