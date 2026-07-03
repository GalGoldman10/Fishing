import {
  israeliSourcesProvider,
  ISRAELI_CURATED_ENTRIES,
  extractRelevantPassage,
} from '@/lib/research/providers/israeliSources';
import { classifySource } from '@/lib/research/sourceClassification';
import sourcePages from '@/lib/research/data/sourcePages.json';

describe('israeliSourcesProvider', () => {
  it('returns Hebrew results for a Hebrew location question', async () => {
    const results = await israeliSourcesProvider.search({
      query: 'איפה כדאי לדוג בנתניה',
      language: 'he',
    });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].title).toContain('נתניה');
    expect(results[0].url).toContain('shvilist.com');
  });

  it('returns English results for an English regulations question', async () => {
    const results = await israeliSourcesProvider.search({
      query: 'do I need a fishing license in israel',
      language: 'en',
    });
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.url.includes('parks.org.il'))).toBe(true);
  });

  it('matches protected species questions to the INPA entry', async () => {
    const results = await israeliSourcesProvider.search({
      query: 'אילו דגים מוגנים ואסור לדוג',
      language: 'he',
    });
    expect(results.some((r) => r.url.includes('parks.org.il'))).toBe(true);
  });

  it('matches family fishing park questions to tiulim.net', async () => {
    const results = await israeliSourcesProvider.search({
      query: 'פארק דיג למשפחה עם ילדים',
      language: 'he',
    });
    expect(results.some((r) => r.url.includes('tiulim.net'))).toBe(true);
  });

  it('matches jarjour lure questions to israelfishing.co.il', async () => {
    const results = await israeliSourcesProvider.search({
      query: 'איך עושים ג\'רג\'ור עם דמוי minnow',
      language: 'he',
    });
    expect(results.some((r) => r.url.includes('israelfishing.co.il'))).toBe(true);
  });

  it('returns no results for unrelated queries', async () => {
    const results = await israeliSourcesProvider.search({
      query: 'completely unrelated query about nothing',
      language: 'en',
    });
    expect(results).toHaveLength(0);
  });

  it('every curated entry has bilingual content and a valid URL', () => {
    for (const entry of ISRAELI_CURATED_ENTRIES) {
      expect(entry.title.en.length).toBeGreaterThan(5);
      expect(entry.title.he.length).toBeGreaterThan(5);
      expect(entry.snippet.en.length).toBeGreaterThan(20);
      expect(entry.snippet.he.length).toBeGreaterThan(20);
      expect(entry.url).toMatch(/^https:\/\/(www\.)?(shvilist\.com|parks\.org\.il|tiulim\.net|israelfishing\.co\.il)\//);
      expect(entry.keywords.length).toBeGreaterThan(2);
    }
  });
});

describe('fresh page content (build-time refresh)', () => {
  it('the committed source-pages file has fetched content with timestamps', () => {
    expect(sourcePages.pages.length).toBeGreaterThanOrEqual(3);
    for (const page of sourcePages.pages) {
      expect(page.text.length).toBeGreaterThan(500);
      expect(new Date(page.fetchedAt).getTime()).not.toBeNaN();
    }
  });

  it('extracts a keyword-relevant passage from page text', () => {
    const text = 'שורה כללית על טיולים.\nבנתניה מומלץ לדוג בחוף ארגמן שבו יש סלעים ומפרצונים קטנים עם דגים רבים.\nעוד שורה על משהו אחר לגמרי בלי קשר.';
    const passage = extractRelevantPassage(text, 'איפה כדאי לדוג בנתניה', ['נתניה', 'ארגמן']);
    expect(passage).toBeDefined();
    expect(passage).toContain('נתניה');
  });

  it('returns undefined when no keyword appears in the query', () => {
    const passage = extractRelevantPassage('טקסט על דיג בחיפה', 'שאלה על אילת', ['חיפה']);
    expect(passage).toBeUndefined();
  });

  it('Hebrew queries get fresh passages with the fetch date attached', async () => {
    const results = await israeliSourcesProvider.search({
      query: 'איפה כדאי לדוג בנתניה',
      language: 'he',
    });
    expect(results.length).toBeGreaterThan(0);
    // Fresh shvilist page is committed, so the fetch timestamp must be present.
    expect(results[0].updatedAt).toBeDefined();
  });
});

describe('source classification for Israeli sites', () => {
  it('classifies parks.org.il as government with high authority', () => {
    const result = classifySource('https://www.parks.org.il/sea/fishing', 'INPA', '');
    expect(result.sourceType).toBe('government');
    expect(result.authorityScore).toBeGreaterThanOrEqual(90);
    expect(result.country).toBe('IL');
  });

  it('classifies shvilist.com and tiulim.net as Israeli local reports', () => {
    const shvilist = classifySource('https://shvilist.com/fishing-beaches', 'Shvilist', '');
    const tiulim = classifySource('https://tiulim.net/fishing-places', 'Tiulim', '');
    expect(shvilist.sourceType).toBe('local-report');
    expect(shvilist.country).toBe('IL');
    expect(tiulim.sourceType).toBe('local-report');
    expect(tiulim.country).toBe('IL');
  });
});
