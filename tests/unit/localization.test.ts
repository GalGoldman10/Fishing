import en from '@/lib/localization/locales/en.json';
import he from '@/lib/localization/locales/he.json';
import { getLocalizedText, hasTranslation } from '@/lib/localization/localizedText';
import { formatDate, formatDateTime, formatNumber, formatUnit } from '@/lib/localization/format';
import { SPECIES_PROFILES } from '@/lib/mock/speciesProfiles';
import { BEACH_PROFILES } from '@/lib/mock/beachProfiles';

type Json = Record<string, unknown>;

function collectKeys(obj: Json, prefix = ''): string[] {
  const keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...collectKeys(value as Json, path));
    } else {
      keys.push(path);
    }
  }
  return keys;
}

describe('translation key parity', () => {
  const enKeys = collectKeys(en as Json).sort();
  const heKeys = collectKeys(he as Json).sort();

  it('Hebrew has every English key (no missing Hebrew translations)', () => {
    const missing = enKeys.filter((k) => !heKeys.includes(k));
    expect(missing).toEqual([]);
  });

  it('English has every Hebrew key (no orphan Hebrew keys)', () => {
    const orphans = heKeys.filter((k) => !enKeys.includes(k));
    expect(orphans).toEqual([]);
  });

  it('no empty translation values in either language', () => {
    const findEmpty = (obj: Json, prefix = ''): string[] => {
      const empty: string[] = [];
      for (const [key, value] of Object.entries(obj)) {
        const path = prefix ? `${prefix}.${key}` : key;
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
          empty.push(...findEmpty(value as Json, path));
        } else if (typeof value === 'string' && value.trim() === '') {
          empty.push(path);
        }
      }
      return empty;
    };
    expect(findEmpty(en as Json)).toEqual([]);
    expect(findEmpty(he as Json)).toEqual([]);
  });
});

describe('getLocalizedText', () => {
  it('returns the requested language when available', () => {
    expect(getLocalizedText({ en: 'Beach', he: 'חוף' }, 'he')).toBe('חוף');
    expect(getLocalizedText({ en: 'Beach', he: 'חוף' }, 'en')).toBe('Beach');
  });

  it('falls back to English when Hebrew is missing or empty', () => {
    expect(getLocalizedText({ en: 'Beach', he: '' }, 'he')).toBe('Beach');
    expect(getLocalizedText({ en: 'Beach' }, 'he')).toBe('Beach');
  });

  it('handles plain strings and null without breaking', () => {
    expect(getLocalizedText('Just a string', 'he')).toBe('Just a string');
    expect(getLocalizedText(null, 'he')).toBe('');
    expect(getLocalizedText(undefined, 'en')).toBe('');
  });

  it('never returns "[object Object]"', () => {
    expect(getLocalizedText({ en: 'x', he: 'y' }, 'he')).not.toContain('object');
  });

  it('hasTranslation reports missing Hebrew correctly', () => {
    expect(hasTranslation({ en: 'Beach', he: 'חוף' }, 'he')).toBe(true);
    expect(hasTranslation({ en: 'Beach', he: '' }, 'he')).toBe(false);
    expect(hasTranslation({ en: 'Beach' }, 'he')).toBe(false);
  });
});

describe('locale formatters', () => {
  const iso = '2026-07-03T12:30:00.000Z';

  it('formats dates per locale without throwing', () => {
    expect(formatDate(iso, 'en')).toBeTruthy();
    expect(formatDate(iso, 'he')).toBeTruthy();
    expect(formatDateTime(iso, 'he')).toBeTruthy();
  });

  it('returns empty string for invalid dates', () => {
    expect(formatDate('not-a-date', 'en')).toBe('');
  });

  it('formats numbers per locale', () => {
    expect(formatNumber(1234.5, 'en')).toContain('1,234');
    expect(formatNumber(1234.5, 'he')).toBeTruthy();
  });

  it('keeps unit symbols unchanged', () => {
    expect(formatUnit(25, '°C', 'he')).toContain('°C');
    expect(formatUnit(15, 'km/h', 'he')).toContain('km/h');
  });
});

describe('database content localization', () => {
  it('every species profile has non-empty Hebrew and English text', () => {
    for (const profile of Object.values(SPECIES_PROFILES)) {
      expect(profile.description.en.length).toBeGreaterThan(0);
      expect(profile.description.he.length).toBeGreaterThan(0);
      expect(profile.habitat.en.length).toBeGreaterThan(0);
      expect(profile.habitat.he.length).toBeGreaterThan(0);
    }
  });

  it('every beach profile has non-empty Hebrew and English description', () => {
    for (const profile of Object.values(BEACH_PROFILES)) {
      expect(profile.description.en.length).toBeGreaterThan(0);
      expect(profile.description.he.length).toBeGreaterThan(0);
    }
  });
});
