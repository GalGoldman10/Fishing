/**
 * Generate multiple targeted fishing search queries from user question.
 */

import type { FishingSearchQuery } from '@/types/research';
import type { QueryUnderstanding } from '@/lib/research/queryUnderstanding';

export function generateSearchQueries(
  question: string,
  understanding: QueryUnderstanding,
  language: 'en' | 'he',
): FishingSearchQuery[] {
  const queries: FishingSearchQuery[] = [];
  const loc = understanding.locationName ?? understanding.city;
  const country = understanding.country ?? 'IL';

  const base: Omit<FishingSearchQuery, 'query'> = {
    language,
    country,
    region: understanding.region,
    freshness: understanding.needsWeather ? 'live' : 'any',
  };

  // Primary intent query (normalized spelling).
  queries.push({
    ...base,
    query: question,
    category: understanding.category,
    sourceCategory: 'any',
  });

  // Expand search with all alias variants for detected fishing terms.
  if (understanding.termNormalization?.searchTerms.length) {
    for (const term of understanding.termNormalization.searchTerms.slice(0, 6)) {
      queries.push({
        ...base,
        query: language === 'he' ? `${term} דיג` : `${term} fishing`,
        category: understanding.category,
        sourceCategory: 'fishing',
      });
    }
  }

  if (loc) {
    queries.push({
      ...base,
      query: `${loc} fishing species shore`,
      category: 'species',
      sourceCategory: 'fishing',
      language: 'en',
    });

    if (understanding.isIsraeliLocation) {
      queries.push({
        ...base,
        query: `${loc} דיג מינים חוף`,
        category: 'species',
        sourceCategory: 'fishing',
        language: 'he',
      });
    }

    queries.push({
      ...base,
      query: `${loc} shore fishing seabed rocky sandy`,
      category: 'location',
      sourceCategory: 'local',
      language: 'en',
    });

    queries.push({
      ...base,
      query: `${loc} fishing report`,
      category: 'report',
      sourceCategory: 'local',
      freshness: 'day',
      language: 'en',
    });
  }

  if (understanding.needsRegulations || understanding.isIsraeliLocation) {
    queries.push({
      ...base,
      query: understanding.isIsraeliLocation
        ? 'Israel fishing regulations Mediterranean license size limits'
        : `${loc ?? country} fishing regulations license`,
      category: 'regulation',
      sourceCategory: 'official',
      freshness: 'week',
      language: 'en',
    });

    if (understanding.isIsraeliLocation) {
      queries.push({
        ...base,
        query: 'תקנות דיג ישראל ים תיכון רישיון',
        category: 'regulation',
        sourceCategory: 'official',
        language: 'he',
      });
    }
  }

  if (understanding.needsWeather && loc) {
    queries.push({
      ...base,
      query: `${loc} waves wind marine forecast fishing`,
      category: 'conditions',
      sourceCategory: 'official',
      freshness: 'live',
      language: 'en',
    });
  }

  if (understanding.needsEquipment) {
    queries.push({
      ...base,
      query: loc
        ? `${loc} shore fishing equipment rod reel bait recommendations`
        : 'shore fishing equipment beginner setup rod reel',
      category: 'equipment',
      sourceCategory: 'fishing',
      language: 'en',
    });
  }

  if (understanding.needsSpecies && loc) {
    queries.push({
      ...base,
      query: `${loc} Mediterranean fish species season`,
      category: 'species',
      sourceCategory: 'scientific',
      language: 'en',
    });
  }

  if (understanding.needsLocalReports && loc) {
    queries.push({
      ...base,
      query: `${loc} fishing forum report`,
      category: 'report',
      sourceCategory: 'community',
      freshness: 'day',
      language: 'en',
    });
  }

  // Deduplicate by query string
  const seen = new Set<string>();
  return queries.filter((q) => {
    const key = q.query.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 14);
}
