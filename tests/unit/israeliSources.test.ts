import {
  israeliSourcesProvider,
  ISRAELI_CURATED_ENTRIES,
} from '@/lib/research/providers/israeliSources';
import { classifySource } from '@/lib/research/sourceClassification';

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
      expect(entry.url).toMatch(/^https:\/\/(www\.)?(shvilist\.com|parks\.org\.il|tiulim\.net)\//);
      expect(entry.keywords.length).toBeGreaterThan(2);
    }
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
