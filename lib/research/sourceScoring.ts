/**
 * Source reliability, freshness, and relevance scoring.
 */

import type { FishingSource, FishingSearchCategory, RawSearchResult } from '@/types/research';
import type { QueryUnderstanding } from '@/lib/research/queryUnderstanding';
import { classifySource, extractDomain } from '@/lib/research/sourceClassification';
import { classifyFishingRelevance } from '@/lib/research/contentClassifier';

export function computeFreshnessScore(
  publishedAt?: string,
  updatedAt?: string,
  category?: FishingSearchCategory,
): number {
  const dateStr = updatedAt ?? publishedAt;
  if (!dateStr) {
    // Unknown date — penalize for time-sensitive categories
    if (category === 'conditions' || category === 'report') return 30;
    if (category === 'regulation') return 50;
    return 60;
  }

  const age = Date.now() - new Date(dateStr).getTime();
  const days = age / (1000 * 60 * 60 * 24);

  if (days < 1) return 100;
  if (days < 7) return 85;
  if (days < 30) return 70;
  if (days < 180) return 50;
  if (days < 365) return 35;
  return 20;
}

export function computeRelevanceScore(
  result: RawSearchResult,
  understanding: QueryUnderstanding,
  language: 'en' | 'he',
): number {
  const combined = `${result.title} ${result.snippet}`.toLowerCase();
  let score = 40;

  if (understanding.locationName) {
    const locParts = understanding.locationName.toLowerCase().split(' ');
    for (const part of locParts) {
      if (part.length > 3 && combined.includes(part)) score += 15;
    }
  }

  if (understanding.city && combined.includes(understanding.city.toLowerCase())) score += 10;
  if (understanding.country === 'IL' && /israel|ישראל|mediterranean/i.test(combined)) score += 10;

  const fishingScore = classifyFishingRelevance(`${result.title} ${result.snippet}`, language);
  score += fishingScore * 0.3;

  return Math.min(100, score);
}

export function computeFinalScore(
  authorityScore: number,
  relevanceScore: number,
  freshnessScore: number,
  category: FishingSearchCategory,
): number {
  const weights =
    category === 'regulation'
      ? { authority: 0.55, relevance: 0.25, freshness: 0.15, independence: 0.05 }
      : category === 'conditions' || category === 'report'
        ? { authority: 0.3, relevance: 0.3, freshness: 0.35, independence: 0.05 }
        : { authority: 0.4, relevance: 0.35, freshness: 0.2, independence: 0.05 };

  return (
    authorityScore * weights.authority +
    relevanceScore * weights.relevance +
    freshnessScore * weights.freshness +
    80 * weights.independence
  );
}

export function scoreAndRankSources(
  results: RawSearchResult[],
  understanding: QueryUnderstanding,
  language: 'en' | 'he',
  accessedAt: string,
): FishingSource[] {
  const sources: FishingSource[] = results.map((r, i) => {
    const { sourceType, authorityScore, country } = classifySource(r.url, r.title, r.snippet);
    const relevanceScore = computeRelevanceScore(r, understanding, language);
    const freshnessScore = computeFreshnessScore(r.publishedAt, r.updatedAt, understanding.category);
    const fishingRelevanceScore = classifyFishingRelevance(`${r.title} ${r.snippet}`, language);
    const reliabilityScore = computeFinalScore(authorityScore, relevanceScore, freshnessScore, understanding.category);

    const isOfficial = ['government', 'regulation', 'weather', 'marine', 'scientific'].includes(sourceType);

    return {
      id: `src-${i}-${extractDomain(r.url).slice(0, 20)}`,
      title: r.title,
      url: r.url,
      domain: extractDomain(r.url),
      sourceType,
      publishedAt: r.publishedAt,
      updatedAt: r.updatedAt,
      accessedAt,
      country,
      language,
      reliabilityScore,
      freshnessScore,
      relevanceScore,
      fishingRelevanceScore,
      isPrimarySource: isOfficial,
      snippet: r.snippet,
      provider: r.provider,
    };
  });

  return sources.sort((a, b) => b.reliabilityScore - a.reliabilityScore);
}

export function selectDiverseSources(sources: FishingSource[], minCount = 3, maxCount = 8): FishingSource[] {
  const selected: FishingSource[] = [];
  const usedTypes = new Set<string>();
  const usedDomains = new Set<string>();

  // First pass: one official + one fishing specialist + one local
  const priorities: Array<FishingSource['sourceType']> = [
    'government', 'regulation', 'weather', 'marine', 'scientific',
    'fishing-organization', 'local-report', 'tackle-shop', 'forum', 'other',
  ];

  for (const type of priorities) {
    const candidate = sources.find(
      (s) => s.sourceType === type && !selected.includes(s) && !usedDomains.has(s.domain),
    );
    if (candidate) {
      selected.push(candidate);
      usedTypes.add(type);
      usedDomains.add(candidate.domain);
    }
    if (selected.length >= maxCount) break;
  }

  // Fill remaining slots by score
  for (const s of sources) {
    if (selected.length >= maxCount) break;
    if (selected.includes(s) || usedDomains.has(s.domain)) continue;
    selected.push(s);
    usedDomains.add(s.domain);
  }

  return selected.length >= minCount ? selected : sources.slice(0, Math.max(minCount, maxCount));
}
