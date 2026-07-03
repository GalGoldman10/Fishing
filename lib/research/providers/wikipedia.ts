import type { FishingSearchProvider } from '@/lib/research/providers/types';
import type { FishingSearchQuery, RawSearchResult } from '@/types/research';
import { buildWikipediaFishingQuery } from '@/lib/localization/fishingSearch';

export const wikipediaProvider: FishingSearchProvider = {
  name: 'wikipedia',

  async search(query: FishingSearchQuery): Promise<RawSearchResult[]> {
    const lang = query.language === 'he' ? 'he' : 'en';
    const fishingQ = buildWikipediaFishingQuery(query.query, query.language);

    try {
      const searchRes = await fetch(
        `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(fishingQ)}&srlimit=4&format=json&origin=*`,
      );
      if (!searchRes.ok) return [];

      const searchData = await searchRes.json();
      const items = searchData?.query?.search ?? [];
      const results: RawSearchResult[] = [];

      for (const item of items.slice(0, 3)) {
        const title = item.title as string;
        const summaryRes = await fetch(
          `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
          { headers: { Accept: 'application/json' } },
        );
        if (!summaryRes.ok) continue;
        const summary = await summaryRes.json();
        results.push({
          title: summary.title ?? title,
          url: summary.content_urls?.desktop?.page ?? `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title)}`,
          snippet: summary.extract ?? '',
          provider: 'wikipedia',
        });
      }
      return results;
    } catch {
      return [];
    }
  },
};
