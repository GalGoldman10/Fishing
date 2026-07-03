/**
 * Research result cache.
 *
 * Keyed by question + location + language + date bucket + category so that
 * repeated questions do not re-search, while time-sensitive answers expire
 * quickly:
 *  - conditions / reports:  10 minutes
 *  - regulations:           6 hours (re-checked regularly, date shown in UI)
 *  - species / equipment / techniques: 24 hours
 */

import type { FishingSearchCategory } from '@/types/research';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const CACHE = new Map<string, CacheEntry<unknown>>();
const MAX_ENTRIES = 100;

const TTL_MS: Record<string, number> = {
  conditions: 10 * 60 * 1000,
  report: 10 * 60 * 1000,
  safety: 30 * 60 * 1000,
  regulation: 6 * 60 * 60 * 1000,
  location: 6 * 60 * 60 * 1000,
  species: 24 * 60 * 60 * 1000,
  equipment: 24 * 60 * 60 * 1000,
  technique: 24 * 60 * 60 * 1000,
  general: 60 * 60 * 1000,
};

export function researchCacheKey(input: {
  question: string;
  language: string;
  category: FishingSearchCategory;
  locationId?: string;
}): string {
  const day = new Date().toISOString().slice(0, 10);
  const normalized = input.question.toLowerCase().replace(/\s+/g, ' ').trim();
  return `${normalized}|${input.locationId ?? 'none'}|${input.language}|${day}|${input.category}`;
}

export function getCachedResearch<T>(key: string): T | undefined {
  const entry = CACHE.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    CACHE.delete(key);
    return undefined;
  }
  return entry.value as T;
}

export function setCachedResearch<T>(key: string, category: FishingSearchCategory, value: T): void {
  if (CACHE.size >= MAX_ENTRIES) {
    // Evict the oldest entry (Map preserves insertion order).
    const oldest = CACHE.keys().next().value;
    if (oldest !== undefined) CACHE.delete(oldest);
  }
  CACHE.set(key, { value, expiresAt: Date.now() + (TTL_MS[category] ?? TTL_MS.general) });
}

export function __clearResearchCache(): void {
  CACHE.clear();
}
