import {
  detectCanonicalFishingTerm,
  expandSearchTerms,
  normalizeFishingQuery,
  normalizeForMatching,
} from '@/lib/research/fishingTermNormalization';
import { understandQuery } from '@/lib/research/queryUnderstanding';
import { matchTechniqueTopic } from '@/lib/research/fishingTechniques';
import { tryBuildTechniqueAnswer } from '@/lib/research/fishingTechniques';

describe('fishing term normalization', () => {
  it('maps גרגור typo to זירזור canonical', () => {
    const result = normalizeFishingQuery('מה זה גרגור?', 'he');
    expect(result.matches[0]?.canonical).toBe("ז'ירז'ור");
    expect(result.normalizedQuestion).toContain("ז'ירז'ור");
  });

  it('maps גרגור variants to the same canonical term', () => {
    for (const q of ["ג'רג'ור", 'זרזור', 'זירזור', "ז'ירז'ור", 'גרגור']) {
      const canonical = detectCanonicalFishingTerm(`מה זה ${q}?`, 'he');
      expect(canonical).toBe("ז'ירז'ור");
    }
  });

  it('maps גירגור to זירזור', () => {
    expect(detectCanonicalFishingTerm('איך עושים גירגור?', 'he')).toBe("ז'ירז'ור");
  });

  it('maps English spinning slang to זירזור', () => {
    expect(detectCanonicalFishingTerm('how to start spinning from shore', 'en')).toBe("ז'ירז'ור");
  });

  it('maps דימוי to דמוי', () => {
    expect(detectCanonicalFishingTerm('איזה דימוי טוב לים?', 'he')).toBe('דמוי');
  });

  it('maps כרס typo to קרס', () => {
    expect(detectCanonicalFishingTerm('איזה כרס להשתמש?', 'he')).toBe('קרס');
  });

  it('maps גיג to גיג canonical', () => {
    expect(detectCanonicalFishingTerm('מה זה גיג?', 'he')).toBe("ג'יג");
  });

  it('maps גיגינג to גיגינג canonical', () => {
    expect(detectCanonicalFishingTerm('איך עושים גיגינג מהחוף?', 'he')).toBe("ג'יגינג");
  });

  it('maps פתיון to פיתיון', () => {
    expect(detectCanonicalFishingTerm('איזה פתיון טוב לסרגוסים?', 'he')).toBe('פיתיון');
  });

  it('expands search terms with aliases and English equivalents', () => {
    const terms = expandSearchTerms(normalizeFishingQuery('איך עושים גרגור?', 'he').matches);
    expect(terms).toEqual(
      expect.arrayContaining(["ז'ירז'ור", 'גרגור', 'spinning', 'lure fishing']),
    );
  });

  it('adds assumption prefix for alternate spellings like גרגור', () => {
    const result = normalizeFishingQuery('איך עושים גרגור?', 'he');
    expect(result.assumptionPrefix?.he).toMatch(/אני מניח שהתכוונת ל/);
    expect(result.assumptionPrefix?.he).toContain("ז'ירז'ור");
  });

  it('cleans punctuation and apostrophe variants', () => {
    const a = normalizeForMatching("ז'ירז'ור");
    const b = normalizeForMatching('ז׳ירזור');
    const c = normalizeForMatching('זירזור');
    expect(a).toBe(b);
    expect(b).toBe(c);
  });

  it('does not alter regulation questions without fishing-term typos', () => {
    const result = normalizeFishingQuery('אילו דגים מוגנים ואסור לדוג בישראל?', 'he');
    expect(result.matches).toHaveLength(0);
    expect(result.normalizedQuestion).toBe('אילו דגים מוגנים ואסור לדוג בישראל');
  });

  it('routes normalized jarjour typos to technique knowledge', () => {
    const q = 'איך מתחילים גרגור?';
    const understanding = understandQuery(q, 'he');
    expect(understanding.termNormalization?.matches[0]?.canonical).toBe("ז'ירז'ור");
    expect(matchTechniqueTopic(understanding.intent)?.topic.id).toBe('jarjour-lure-guide');
    const answer = tryBuildTechniqueAnswer(understanding.intent, 'he');
    expect(answer?.directAnswer).toMatch(/ג'?רג|ז'?ירז|Jarjour/i);
  });

  it('matches prefixed Hebrew form בזירזור', () => {
    const result = normalizeFishingQuery(
      'אני רוצה לדוג בזירזור אני לא יודע כלום בזה מה אני צריך לקנות?',
      'he',
    );
    expect(result.matches[0]?.canonical).toBe("ז'ירז'ור");
    expect(result.normalizedQuestion).toContain("ז'ירז'ור");
  });
});
