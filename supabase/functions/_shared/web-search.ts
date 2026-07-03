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

function fishingQuery(base: string, language: string, locationHint?: string): string {
  const parts = [base.trim()];
  if (locationHint) parts.push(locationHint);
  if (language === 'he') {
    parts.push('דיג דגים חוף ים ציוד דייג');
  } else {
    parts.push('fishing angling shore fish catch bait tackle');
  }
  const exclusions = language === 'he' ? '-מסעדה -מתכון -משחק' : '-restaurant -recipe -game -phishing';
  return `${parts.join(' ')} ${exclusions}`.trim();
}

const FISHING_TERMS_EN = ['fish', 'fishing', 'angler', 'bait', 'lure', 'rod', 'catch', 'shore', 'pier', 'marina', 'tackle', 'angling'];
const FISHING_TERMS_HE = ['דיג', 'דייג', 'דג', 'חכה', 'פיתיון', 'חוף', 'מזח', 'נמל', 'לוכד', 'ציוד'];

function isFishingRelated(text: string, language: string): boolean {
  if (text.toLowerCase().includes('phishing')) return false;
  const terms = language === 'he' ? FISHING_TERMS_HE : FISHING_TERMS_EN;
  const hay = language === 'he' ? text : text.toLowerCase();
  return terms.some((t) => (language === 'he' ? hay.includes(t) : hay.includes(t)));
}

function filterFishingOnly(results: WebSearchResult[], language: string): WebSearchResult[] {
  const filtered = results.filter((r) =>
    isFishingRelated(`${r.title} ${r.snippet} ${r.url}`, language),
  );
  return filtered.length > 0 ? filtered : results.filter((r) => r.source === 'wikipedia');
}

async function searchTavily(query: string, maxResults = 6): Promise<WebSearchResult[]> {
  const apiKey = Deno.env.get('TAVILY_API_KEY');
  if (!apiKey) return [];

  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: 'advanced',
      max_results: maxResults,
      include_answer: false,
      topic: 'general',
    }),
  });

  if (!res.ok) return [];
  const data = await res.json();
  return (data.results ?? []).map((r: { title: string; url: string; content: string; score?: number }) => ({
    title: r.title,
    url: r.url,
    snippet: r.content?.slice(0, 500) ?? '',
    source: 'tavily',
    score: r.score,
  }));
}

async function searchSerper(query: string, maxResults = 6): Promise<WebSearchResult[]> {
  const apiKey = Deno.env.get('SERPER_API_KEY');
  if (!apiKey) return [];

  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-KEY': apiKey },
    body: JSON.stringify({ q: query, num: maxResults }),
  });

  if (!res.ok) return [];
  const data = await res.json();
  return (data.organic ?? []).map((r: { title: string; link: string; snippet: string }) => ({
    title: r.title,
    url: r.link,
    snippet: r.snippet ?? '',
    source: 'serper',
  }));
}

async function searchWikipedia(query: string, language: string): Promise<WebSearchResult[]> {
  const lang = language === 'he' ? 'he' : 'en';
  const fishingQ = language === 'he' ? `${query} דיג` : `${query} fishing`;
  const searchRes = await fetch(
    `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(fishingQ)}&srlimit=6&format=json`,
  );
  if (!searchRes.ok) return [];
  const searchData = await searchRes.json();
  const items = searchData?.query?.search ?? [];

  const results: WebSearchResult[] = [];
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
      snippet: summary.extract ?? item.snippet?.replace(/<[^>]+>/g, '') ?? '',
      source: 'wikipedia',
    });
  }
  return filterFishingOnly(results, language);
}

async function searchJina(query: string): Promise<WebSearchResult[]> {
  try {
    const res = await fetch(`https://s.jina.ai/${encodeURIComponent(query)}`, {
      headers: { Accept: 'text/plain', 'X-Return-Format': 'text' },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return [];
    const text = await res.text();
    const chunks = text.split('\n\n').filter((c) => c.trim().length > 40).slice(0, 5);
    return chunks.map((chunk, i) => {
      const lines = chunk.split('\n');
      const titleLine = lines.find((l) => l.startsWith('Title:'))?.replace('Title:', '').trim() ?? `Result ${i + 1}`;
      const urlLine = lines.find((l) => l.startsWith('URL:'))?.replace('URL:', '').trim() ?? '';
      const body = lines.filter((l) => !l.startsWith('Title:') && !l.startsWith('URL:')).join(' ').trim();
      return {
        title: titleLine,
        url: urlLine,
        snippet: body.slice(0, 500),
        source: 'jina',
      };
    });
  } catch {
    return [];
  }
}

function dedupeResults(results: WebSearchResult[]): WebSearchResult[] {
  const seen = new Set<string>();
  return results.filter((r) => {
    const key = r.url || r.title;
    if (seen.has(key)) return false;
    seen.add(key);
    return r.snippet.length > 20 || r.title.length > 3;
  });
}

export async function searchWeb(
  query: string,
  language = 'en',
  options?: { locationHint?: string },
): Promise<WebSearchResponse> {
  const enrichedQuery = fishingQuery(query, language, options?.locationHint);

  const provider = Deno.env.get('WEB_SEARCH_PROVIDER') ?? 'auto';
  let results: WebSearchResult[] = [];
  let usedProvider = 'composite';

  if (provider === 'tavily' || provider === 'auto') {
    results = await searchTavily(enrichedQuery);
    if (results.length > 0) usedProvider = 'tavily';
  }

  if (results.length === 0 && (provider === 'serper' || provider === 'auto')) {
    results = await searchSerper(enrichedQuery);
    if (results.length > 0) usedProvider = 'serper';
  }

  if (results.length === 0 && (provider === 'jina' || provider === 'auto')) {
    results = await searchJina(enrichedQuery);
    if (results.length > 0) usedProvider = 'jina';
  }

  const wiki = await searchWikipedia(query, language);
  results = filterFishingOnly(dedupeResults([...results, ...wiki]), language);

  if (results.length === 0) {
    usedProvider = 'wikipedia';
    results = wiki;
  } else if (wiki.length > 0) {
    usedProvider = `${usedProvider}+wikipedia`;
  }

  return {
    query: enrichedQuery,
    results: results.slice(0, 8),
    provider: usedProvider,
    searchedAt: new Date().toISOString(),
  };
}

export function formatWebResultsForPrompt(search: WebSearchResponse): string {
  if (search.results.length === 0) {
    return 'No web search results found for this query.';
  }

  return search.results
    .map(
      (r, i) =>
        `[${i + 1}] ${r.title}\nURL: ${r.url}\nSource: ${r.source}\nSnippet: ${r.snippet}`,
    )
    .join('\n\n');
}
