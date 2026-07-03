import {
  isValidCoordinates,
  toLatLngArray,
  toLngLatArray,
  parseCoordinate,
  filterValidCoordinates,
} from '@/lib/utils/coordinates';
import { DEMO_SPOTS } from '@/lib/mock/demoData';

describe('coordinate validation', () => {
  it('accepts valid coordinates', () => {
    expect(isValidCoordinates(32.0849, 34.768)).toBe(true);
    expect(isValidCoordinates(-33.9, 151.2)).toBe(true);
  });

  it('rejects out-of-range coordinates', () => {
    expect(isValidCoordinates(91, 34)).toBe(false);
    expect(isValidCoordinates(-91, 34)).toBe(false);
    expect(isValidCoordinates(32, 181)).toBe(false);
    expect(isValidCoordinates(32, -181)).toBe(false);
  });

  it('rejects NaN, Infinity and null island (0,0)', () => {
    expect(isValidCoordinates(NaN, 34)).toBe(false);
    expect(isValidCoordinates(32, Infinity)).toBe(false);
    expect(isValidCoordinates(0, 0)).toBe(false);
  });
});

describe('coordinate order adapters (never reversed)', () => {
  const telAviv = { latitude: 32.0849, longitude: 34.768 };

  it('toLatLngArray puts latitude first (Leaflet order)', () => {
    const [first, second] = toLatLngArray(telAviv);
    expect(first).toBe(32.0849);
    expect(second).toBe(34.768);
  });

  it('toLngLatArray puts longitude first (GeoJSON order)', () => {
    const [first, second] = toLngLatArray(telAviv);
    expect(first).toBe(34.768);
    expect(second).toBe(32.0849);
  });
});

describe('parseCoordinate', () => {
  it('parses numeric strings including comma decimal separators', () => {
    expect(parseCoordinate('32.0849')).toBe(32.0849);
    expect(parseCoordinate('32,0849')).toBe(32.0849);
    expect(parseCoordinate('-34.5')).toBe(-34.5);
    expect(parseCoordinate(12.5)).toBe(12.5);
  });

  it('returns undefined instead of guessing for invalid input', () => {
    expect(parseCoordinate('')).toBeUndefined();
    expect(parseCoordinate('abc')).toBeUndefined();
    expect(parseCoordinate('12.3.4')).toBeUndefined();
    expect(parseCoordinate(null)).toBeUndefined();
    expect(parseCoordinate(NaN)).toBeUndefined();
  });
});

describe('filterValidCoordinates (invalid records create no markers)', () => {
  it('separates valid records from invalid ones', () => {
    const records = [
      { id: 'ok', latitude: 32.0, longitude: 34.7 },
      { id: 'reversed-out-of-range', latitude: 134.7, longitude: 32.0 },
      { id: 'null-island', latitude: 0, longitude: 0 },
      { id: 'nan', latitude: NaN, longitude: 34.7 },
    ];
    const { valid, invalid } = filterValidCoordinates(records);
    expect(valid.map((r) => r.id)).toEqual(['ok']);
    expect(invalid.map((r) => r.id)).toEqual(['reversed-out-of-range', 'null-island', 'nan']);
  });
});

describe('demo fishing spot coordinate data', () => {
  it('every spot has valid pin coordinates', () => {
    for (const spot of DEMO_SPOTS) {
      expect(isValidCoordinates(spot.latitude, spot.longitude)).toBe(true);
    }
  });

  it('coordinates are stored in latitude/longitude order for Israel', () => {
    // Israel: latitude ~29.4–33.4, longitude ~34.2–35.9.
    // A reversed record would fail this immediately.
    for (const spot of DEMO_SPOTS) {
      expect(spot.latitude).toBeGreaterThan(29);
      expect(spot.latitude).toBeLessThan(33.5);
      expect(spot.longitude).toBeGreaterThan(34);
      expect(spot.longitude).toBeLessThan(36);
    }
  });

  it('no two spots share the same coordinates', () => {
    const seen = new Set<string>();
    for (const spot of DEMO_SPOTS) {
      const key = `${spot.latitude},${spot.longitude}`;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
  });

  it('every spot has a valid dedicated marine forecast coordinate', () => {
    for (const spot of DEMO_SPOTS) {
      expect(spot.marineCoordinates).toBeDefined();
      expect(
        isValidCoordinates(spot.marineCoordinates!.latitude, spot.marineCoordinates!.longitude),
      ).toBe(true);
      // The marine coordinate must differ from the pin (it is offshore, not inland).
      expect(
        spot.marineCoordinates!.latitude !== spot.latitude ||
          spot.marineCoordinates!.longitude !== spot.longitude,
      ).toBe(true);
    }
  });

  it('mediterranean spots use a marine coordinate west of the shoreline pin', () => {
    const nonMediterranean = new Set(['demo-17', 'demo-18']); // Eilat (Red Sea), Kinneret (lake)
    for (const spot of DEMO_SPOTS) {
      if (nonMediterranean.has(spot.id)) continue;
      expect(spot.marineCoordinates!.longitude).toBeLessThan(spot.longitude);
    }
  });

  it('spots record how and when coordinates were verified', () => {
    for (const spot of DEMO_SPOTS) {
      expect(spot.coordinateSource).toBeTruthy();
      expect(spot.coordinatesVerifiedAt).toBeTruthy();
    }
  });
});
