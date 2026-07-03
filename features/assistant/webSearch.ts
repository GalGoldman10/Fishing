import { WebSearchResponse, WebSearchResult } from '@/types/webInfo';
import { supabase } from '@/lib/api/supabase';
import { env } from '@/lib/config/env';
import {
  buildFishingSearchQuery,
  buildWikipediaFishingQuery,
  filterFishingResults,
} from '@/lib/localization/fishingSearch';
import { israeliSourcesProvider } from '@/lib/research/providers/israeliSources';

async function searchWikipediaClient(query: string, language: string): Promise<WebSearchResult[]> {
  const lang = language === 'he' ? 'he' : 'en';
  const fishingQuery = buildWikipediaFishingQuery(query, language);

  const searchRes = await fetch(
    `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(fishingQuery)}&srlimit=6&format=json&origin=*`,
  );
  if (!searchRes.ok) return [];

  const searchData = await searchRes.json();
  const items = searchData?.query?.search ?? [];
  const results: WebSearchResult[] = [];

  for (const item of items.slice(0, 4)) {
    const title = item.title as string;
    const summaryRes = await fetch(
      `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      { headers: { Accept: 'application/json' } },
    );
    if (!summaryRes.ok) continue;
    const summary = await summaryRes.json();
    results.push({
      title: summary.title ?? title,
      url: summary.content_urls?.desktop?.page ?? '',
      snippet: summary.extract ?? '',
      source: 'wikipedia',
    });
  }

  const filtered = filterFishingResults(results, language);
  return filtered.length > 0 ? filtered : results;
}

export async function performWebSearch(
  query: string,
  language = 'en',
  locationHint?: string,
): Promise<WebSearchResponse> {
  const fishingQuery = buildFishingSearchQuery(query, language, locationHint);

  if (env.supabaseUrl && env.supabaseAnonKey) {
    try {
      const { data, error } = await supabase.functions.invoke('web-search', {
        body: { query: fishingQuery, language, locationHint },
      });
      if (!error && data?.results?.length > 0) {
        return data as WebSearchResponse;
      }
    } catch {
      // fall through to client Wikipedia
    }
  }

  const lang = language === 'he' ? 'he' : 'en';
  const [curatedRaw, wiki] = await Promise.all([
    israeliSourcesProvider.search({ query, language: lang }),
    searchWikipediaClient(fishingQuery, language),
  ]);
  const curated: WebSearchResult[] = curatedRaw.map((r) => ({
    title: r.title,
    url: r.url,
    snippet: r.snippet,
    source: 'israeli-fishing-sites',
  }));

  return {
    query: fishingQuery,
    results: [...curated, ...wiki],
    provider: curated.length > 0 ? 'israeli-sites+wikipedia' : 'wikipedia-client',
    searchedAt: new Date().toISOString(),
  };
}

export function synthesizeAnswerFromWeb(
  userMessage: string,
  search: WebSearchResponse,
  language: string,
): { answer: string; sources: Array<{ title: string; url?: string; authority?: string }> } {
  const isHe = language === 'he';
  const top = search.results.slice(0, 3);

  if (top.length === 0) {
    return {
      answer: isHe
        ? 'חיפשתי באינטרנט (דיג בלבד) אך לא מצאתי מידע מספיק. נסה לציין שם חוף, עיר או מיקום מדויק יותר.'
        : 'I searched the web (fishing only) but could not find enough information. Try specifying a beach name, city, or more precise location.',
      sources: [],
    };
  }

  const snippets = top.map((r) => r.snippet).join('\n\n');
  const intro = isHe
    ? `חיפשתי באינטרנט על דיג (${search.provider}) ומצאתי את המידע הבא:\n\n`
    : `I searched the web for fishing information (${search.provider}) and found the following:\n\n`;

  const disclaimer = isHe
    ? '\n\n⚠️ מידע מהאינטרנט — לא מאומת. אשר במקום לפני דיג.'
    : '\n\n⚠️ Information from the web — not verified. Confirm on site before fishing.';

  const synthesized = `${intro}${snippets.slice(0, 1200)}${disclaimer}`;

  return {
    answer: synthesized,
    sources: top.map((r) => ({ title: r.title, url: r.url, authority: r.source })),
  };
}
