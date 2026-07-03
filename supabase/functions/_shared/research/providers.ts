/**
 * Server-side multi-provider search (Tavily, Serper, Jina, Wikipedia).
 * Deno-compatible — used by fishing-research edge function.
 */

export interface RawSearchResult {
  title: string;
  url: string;
  snippet: string;
  provider: string;
  publishedAt?: string;
  updatedAt?: string;
}

export interface FishingSearchQuery {
  query: string;
  language: 'en' | 'he';
  country?: string;
  region?: string;
  category?: string;
  sourceCategory?: string;
  freshness?: string;
}

/**
 * Trusted Israeli fishing sites the bot should always consult:
 * - parks.org.il — Israel Nature and Parks Authority (official regulations)
 * - shvilist.com — Mediterranean fishing beaches guide
 * - tiulim.net — recommended fishing places in Israel
 */
const ISRAELI_FISHING_DOMAINS = ['parks.org.il', 'shvilist.com', 'tiulim.net'];

function fishingQuery(base: string, language: string): string {
  const suffix = language === 'he' ? ' דיג דגים חוף' : ' fishing angling shore';
  const exclusions = language === 'he' ? '-מסעדה -מתכון' : '-restaurant -recipe -phishing';
  return `${base.trim()}${suffix} ${exclusions}`.trim();
}

async function searchTavily(query: string, includeDomains?: string[]): Promise<RawSearchResult[]> {
  const apiKey = Deno.env.get('TAVILY_API_KEY');
  if (!apiKey) return [];
  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: 'advanced',
      max_results: 5,
      ...(includeDomains ? { include_domains: includeDomains } : {}),
    }),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results ?? []).map((r: { title: string; url: string; content: string }) => ({
    title: r.title, url: r.url, snippet: r.content?.slice(0, 500) ?? '', provider: 'tavily',
  }));
}

async function searchSerper(query: string, siteRestrict?: string[]): Promise<RawSearchResult[]> {
  const apiKey = Deno.env.get('SERPER_API_KEY');
  if (!apiKey) return [];
  const q = siteRestrict?.length
    ? `${query} (${siteRestrict.map((d) => `site:${d}`).join(' OR ')})`
    : query;
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-KEY': apiKey },
    body: JSON.stringify({ q, num: 5 }),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.organic ?? []).map((r: { title: string; link: string; snippet: string }) => ({
    title: r.title, url: r.link, snippet: r.snippet ?? '', provider: 'serper',
  }));
}

async function searchWikipedia(query: string, language: string): Promise<RawSearchResult[]> {
  const lang = language === 'he' ? 'he' : 'en';
  const q = language === 'he' ? `${query} דיג` : `${query} fishing`;
  const searchRes = await fetch(
    `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&srlimit=3&format=json`,
  );
  if (!searchRes.ok) return [];
  const searchData = await searchRes.json();
  const items = searchData?.query?.search ?? [];
  const results: RawSearchResult[] = [];
  for (const item of items.slice(0, 2)) {
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
      provider: 'wikipedia',
    });
  }
  return results;
}

export async function searchAllProviders(query: FishingSearchQuery): Promise<RawSearchResult[]> {
  const enriched = fishingQuery(query.query, query.language);
  const provider = Deno.env.get('WEB_SEARCH_PROVIDER') ?? 'auto';
  const tasks: Promise<RawSearchResult[]>[] = [];

  if (provider === 'tavily' || provider === 'auto') {
    tasks.push(searchTavily(enriched));
    // Dedicated pass over trusted Israeli fishing sites so they are always considered
    tasks.push(searchTavily(enriched, ISRAELI_FISHING_DOMAINS));
  }
  if (provider === 'serper' || provider === 'auto') {
    tasks.push(searchSerper(enriched));
    tasks.push(searchSerper(enriched, ISRAELI_FISHING_DOMAINS));
  }
  tasks.push(searchWikipedia(query.query, query.language));

  const settled = await Promise.allSettled(tasks);
  const all: RawSearchResult[] = [];
  for (const r of settled) {
    if (r.status === 'fulfilled') all.push(...r.value);
  }

  const seen = new Set<string>();
  return all.filter((item) => {
    const key = item.url || item.title;
    if (seen.has(key)) return false;
    seen.add(key);
    return item.snippet.length > 15;
  });
}
