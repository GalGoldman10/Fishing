export interface WebPlaceEnrichment {
  placeName: string;
  summary: string;
  description?: string;
  wikipediaUrl?: string;
  wikipediaTitle?: string;
  address?: string;
  municipality?: string;
  region?: string;
  country?: string;
  nearbyFeatures: WebNearbyFeature[];
  terrainHints: string[];
  sources: WebSourceAttribution[];
  fetchedAt: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface WebNearbyFeature {
  name: string;
  type: string;
  distanceM?: number;
}

export interface WebSourceAttribution {
  provider: 'wikipedia' | 'openstreetmap' | 'nominatim' | 'tavily' | 'serper' | 'jina' | 'wikipedia-client';
  title: string;
  url?: string;
  fetchedAt: string;
}

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  score?: number;
}

export interface WebSearchResponse {
  query: string;
  results: WebSearchResult[];
  provider: string;
  searchedAt: string;
}
