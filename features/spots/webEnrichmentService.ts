import { WebPlaceEnrichment, WebNearbyFeature, WebSourceAttribution } from '@/types/webInfo';
import { isMockMode } from '@/lib/config/env';
import { supabase } from '@/lib/api/supabase';
import { buildWikipediaFishingQuery } from '@/lib/localization/fishingSearch';

const USER_AGENT = 'FishGuideAI/1.0 (fishing assistant app)';

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        Accept: 'application/json',
        'User-Agent': USER_AGENT,
        ...(init?.headers ?? {}),
      },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function fetchWikipedia(
  latitude: number,
  longitude: number,
  spotName: string,
  language: string,
): Promise<Partial<WebPlaceEnrichment>> {
  const wikiLang = language === 'he' ? 'he' : 'en';
  const geo = await fetchJson<{
    query?: { geosearch?: Array<{ title: string; dist: number }> };
  }>(
    `https://${wikiLang}.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${latitude}|${longitude}&gsradius=3000&gslimit=3&format=json&origin=*`,
  );

  const titles = geo?.query?.geosearch?.map((g) => g.title) ?? [];
  const searchTitle = titles[0] ?? buildWikipediaFishingQuery(spotName.split('(')[0].trim(), language);

  const summary = await fetchJson<{
    title?: string;
    extract?: string;
    description?: string;
    content_urls?: { desktop?: { page?: string } };
  }>(`https://${wikiLang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchTitle)}`);

  if (!summary?.extract) return {};

  return {
    placeName: summary.title ?? spotName,
    summary: summary.extract,
    description: summary.description,
    wikipediaUrl: summary.content_urls?.desktop?.page,
    wikipediaTitle: summary.title,
    sources: [
      {
        provider: 'wikipedia',
        title: `Wikipedia (${wikiLang})`,
        url: summary.content_urls?.desktop?.page,
        fetchedAt: new Date().toISOString(),
      },
    ],
    confidence: 'medium',
  };
}

async function fetchViaEdgeFunction(
  latitude: number,
  longitude: number,
  spotName: string,
  language: string,
): Promise<WebPlaceEnrichment | null> {
  const { data, error } = await supabase.functions.invoke('place-enrichment', {
    body: { latitude, longitude, spotName, language },
  });
  if (error || !data) return null;
  return data as WebPlaceEnrichment;
}

function buildTerrainHints(features: WebNearbyFeature[], language: string): string[] {
  const hints: string[] = [];
  const types = new Set(features.map((f) => f.type.toLowerCase()));
  const isHe = language === 'he';

  if (types.has('beach') || types.has('sand')) {
    hints.push(isHe ? 'אזור חוף ים לדיג חופי' : 'Coastal beach area suitable for shore fishing');
  }
  if (types.has('pier') || types.has('jetty')) {
    hints.push(isHe ? 'מזח או רציף לדיג — מתאים לדיג מעל המים' : 'Pier or jetty nearby — good for pier fishing');
  }
  if (types.has('marina') || types.has('harbour')) {
    hints.push(isHe ? 'נמל או מרינה בקרבת מקום' : 'Marina or harbour nearby');
  }
  if (types.has('rock') || types.has('cliff')) {
    hints.push(isHe ? 'חוף סלעי או צוק — זהירות בהליכה, דיג מהסלעים' : 'Rocky or cliff coastline — careful footing, rock fishing');
  }
  if (types.has('breakwater')) {
    hints.push(isHe ? 'שובר גלים בקרבת מקום' : 'Breakwater structure nearby');
  }

  return hints;
}

function mergeEnrichment(
  base: Partial<WebPlaceEnrichment>,
  spotName: string,
  language: string,
): WebPlaceEnrichment {
  const isHe = language === 'he';
  return {
    placeName: base.placeName ?? spotName,
    summary: base.summary ?? (isHe ? 'אין עדיין סיכום מהאינטרנט למיקום זה.' : 'No web summary available for this location yet.'),
    description: base.description,
    wikipediaUrl: base.wikipediaUrl,
    wikipediaTitle: base.wikipediaTitle,
    address: base.address,
    municipality: base.municipality,
    region: base.region,
    country: base.country,
    nearbyFeatures: base.nearbyFeatures ?? [],
    terrainHints: base.terrainHints ?? buildTerrainHints(base.nearbyFeatures ?? [], language),
    sources: base.sources ?? [],
    fetchedAt: new Date().toISOString(),
    confidence: base.confidence ?? 'low',
  };
}

export async function fetchWebPlaceInfo(
  latitude: number,
  longitude: number,
  spotName: string,
  language = 'en',
): Promise<WebPlaceEnrichment> {
  if (!isMockMode()) {
    const edge = await fetchViaEdgeFunction(latitude, longitude, spotName, language);
    if (edge) return edge;
  }

  const wiki = await fetchWikipedia(latitude, longitude, spotName, language);
  return mergeEnrichment(wiki, spotName, language);
}

export function formatWebSources(sources: WebSourceAttribution[]): string {
  return sources.map((s) => s.title).join(' · ');
}
