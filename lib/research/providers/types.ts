import type { FishingSearchQuery, RawSearchResult } from '@/types/research';

export interface FishingSearchProvider {
  name: string;
  search(query: FishingSearchQuery): Promise<RawSearchResult[]>;
}

export interface ProviderSearchOptions {
  maxResultsPerQuery?: number;
  timeoutMs?: number;
}
