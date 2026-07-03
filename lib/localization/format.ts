/** BCP-47 locale tag for Intl formatting. Pure utility — safe outside React. */
export function getLocaleTag(language?: string): string {
  return language === 'he' ? 'he-IL' : 'en-US';
}

/** Format an ISO timestamp or Date as a localized date (e.g. 3.7.2026 / 7/3/2026). */
export function formatDate(value: string | number | Date, language?: string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(getLocaleTag(language), {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(date);
}

/** Format an ISO timestamp or Date as localized date + time. */
export function formatDateTime(value: string | number | Date, language?: string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(getLocaleTag(language), {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/** Format a time only (e.g. sunrise/sunset). */
export function formatTime(value: string | number | Date, language?: string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(getLocaleTag(language), {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/** Format a number with locale-aware separators. */
export function formatNumber(
  value: number,
  language?: string,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(getLocaleTag(language), options).format(value);
}

/**
 * Format a measurement with its unit symbol. Unit symbols (°C, km/h, m, g, mm, kg)
 * stay in their standard form in both languages; only the number is localized.
 */
export function formatUnit(value: number, unit: string, language?: string): string {
  return `${formatNumber(value, language)} ${unit}`;
}
