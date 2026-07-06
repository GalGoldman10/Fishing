import type { SupportedLanguage } from './i18n';

/** Normalize i18n / device language codes to a supported app language. */
export function resolveLang(language: string | undefined): SupportedLanguage {
  return language?.startsWith('he') ? 'he' : 'en';
}

/** Localized database content: every field carries all supported languages. */
export interface LocalizedText {
  en: string;
  he?: string;
  [key: string]: string | undefined;
}

/**
 * Resolve a localized field to a plain string.
 * Falls back to English, then to the first non-empty value — never renders
 * "[object Object]" or an empty page when a translation is missing.
 */
export function getLocalizedText(
  value: LocalizedText | string | null | undefined,
  language: SupportedLanguage | string,
): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  const preferred = value[language];
  if (preferred && preferred.trim().length > 0) return preferred;
  if (value.en && value.en.trim().length > 0) return value.en;
  const firstNonEmpty = Object.values(value).find((v) => v && v.trim().length > 0);
  return firstNonEmpty ?? '';
}

/** True when the given language has a real (non-empty) translation. */
export function hasTranslation(
  value: LocalizedText | string | null | undefined,
  language: SupportedLanguage | string,
): boolean {
  if (value == null) return false;
  if (typeof value === 'string') return language === 'en';
  const text = value[language];
  return !!text && text.trim().length > 0;
}
