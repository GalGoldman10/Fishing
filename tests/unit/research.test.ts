import { validateFishingScope, getRefusalMessage } from '@/lib/research/scopeGuard';
import { understandQuery } from '@/lib/research/queryUnderstanding';
import { generateSearchQueries } from '@/lib/research/queryGenerator';
import { classifyFishingRelevance, filterByRelevance, passesFishingFilter } from '@/lib/research/contentClassifier';
import { groupDuplicates } from '@/lib/research/duplicateDetection';
import { scoreAndRankSources, selectDiverseSources, computeFreshnessScore } from '@/lib/research/sourceScoring';
import { classifySource } from '@/lib/research/sourceClassification';
import { synthesizeAnswer } from '@/lib/research/answerSynthesis';
import { runFishingResearch } from '@/lib/research/orchestrator';

describe('scopeGuard', () => {
  it('refuses unrelated questions', () => {
    const result = validateFishingScope('Who won the election?', 'en');
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('fishing');
  });

  it('allows fishing questions', () => {
    expect(validateFishingScope('What bait for shore fishing?', 'en').allowed).toBe(true);
    expect(validateFishingScope('מה הפיתיון הכי טוב לדיג חוף?', 'he').allowed).toBe(true);
  });

  it('allows fishing-related weather questions', () => {
    expect(validateFishingScope('Is tomorrow good for fishing?', 'en').allowed).toBe(true);
    expect(validateFishingScope('האם הרוח טובה לדיג בחוף גורדון?', 'he').allowed).toBe(true);
  });

  it('allows Hebrew slang like בזירזור and infinitive לדוג', () => {
    expect(
      validateFishingScope(
        'אני רוצה לדוג בזירזור אני לא יודע כלום בזה מה אני צריך לקנות?',
        'he',
      ).allowed,
    ).toBe(true);
  });

  it('allows species location questions like איפה לתפוס בורי', () => {
    expect(validateFishingScope('איפה אפשר לתפוס בורי?', 'he').allowed).toBe(true);
  });

  it('allows general fishing follow-ups with לדוג', () => {
    expect(
      validateFishingScope('באופן כללי לדוג באיזור המרכז', 'he').allowed,
    ).toBe(true);
  });

  it('allows short location follow-ups when prior chat was about fishing', () => {
    const prior = [
      'איפה יש פארקי דייג באיזור המרכז?',
      'לא נמצאו פארקי דייג ספציפיים באיזור המרכז.',
    ];
    expect(
      validateFishingScope('ומה עם חיפה?', 'he', { conversationContext: prior }).allowed,
    ).toBe(true);
  });

  it('still refuses unrelated follow-ups even with fishing context', () => {
    const prior = ['מה הפיתיון הכי טוב לדיג חוף?'];
    expect(
      validateFishingScope('Who won the election?', 'en', { conversationContext: prior }).allowed,
    ).toBe(false);
  });

  it('answers where to catch mullet end-to-end', async () => {
    const result = await runFishingResearch({
      question: 'איפה אפשר לתפוס בורי?',
      language: 'he',
    }, { minSources: 0, skipCache: true });
    expect(result.answer.refused).toBeFalsy();
    expect(result.answer.directAnswer).toMatch(/בורי|מצוף|מרינ|נמל/i);
  }, 15000);

  it('answers beginner zirzur gear question end-to-end', async () => {
    const result = await runFishingResearch({
      question: 'אני רוצה לדוג בזירזור אני לא יודע כלום בזה מה אני צריך לקנות?',
      language: 'he',
    }, { minSources: 0, skipCache: true });
    expect(result.answer.refused).toBeFalsy();
    expect(result.answer.directAnswer).toMatch(/ז'?ירז'ור|ג'?רג|Jarjour|light|בד/i);
  }, 15000);

  it('answers species list with catch ethics overview', async () => {
    const result = await runFishingResearch({
      question: 'סוגי דגים בישראל',
      language: 'he',
    }, { minSources: 0, skipCache: true });
    expect(result.answer.refused).toBeFalsy();
    expect(result.answer.directAnswer).toMatch(/12|לוקוס|סרגוס/);
  }, 15000);

  it('answers barracuda size limit question', async () => {
    const result = await runFishingResearch({
      question: 'מה המינימום לברקודה?',
      language: 'he',
    }, { minSources: 0, skipCache: true });
    expect(result.answer.refused).toBeFalsy();
    expect(result.answer.directAnswer).toMatch(/20|50|4/);
  }, 15000);
});

describe('queryGenerator', () => {
  it('generates multiple search queries for location questions', () => {
    const understanding = understandQuery(
      'What can I catch at Palmachim Beach?',
      'en',
      'Palmachim Beach',
    );
    const queries = generateSearchQueries(
      'What can I catch at Palmachim Beach?',
      understanding,
      'en',
    );
    expect(queries.length).toBeGreaterThanOrEqual(3);
    expect(queries.some((q) => q.query.includes('regulation'))).toBe(true);
  });

  it('generates Hebrew queries for Israeli locations', () => {
    const understanding = understandQuery('דיג בחוף פלמחים', 'he');
    const queries = generateSearchQueries('דיג בחוף פלמחים', understanding, 'he');
    expect(queries.some((q) => q.language === 'he')).toBe(true);
  });
});

describe('contentClassifier', () => {
  it('scores fishing content highly', () => {
    const score = classifyFishingRelevance('Shore fishing with bait and lure at Mediterranean beach', 'en');
    expect(score).toBeGreaterThanOrEqual(50);
    expect(passesFishingFilter('Shore fishing with bait and lure at Mediterranean beach', 'en', 40)).toBe(true);
  });

  it('rejects non-fishing content', () => {
    const score = classifyFishingRelevance('Celebrity gossip and politics news', 'en');
    expect(score).toBeLessThan(70);
  });
});

describe('duplicateDetection', () => {
  it('groups duplicate sources', () => {
    const results = [
      { title: 'Palmachim Fishing Guide', url: 'https://a.com/1', snippet: 'Great spot for seabass fishing at Palmachim beach shore', provider: 'tavily' },
      { title: 'Palmachim Fishing Guide', url: 'https://b.com/2', snippet: 'Great spot for seabass fishing at Palmachim beach shore', provider: 'serper' },
      { title: 'Israel Regulations', url: 'https://gov.il/fish', snippet: 'Fishing license required for Mediterranean shore fishing', provider: 'serper' },
    ];
    const { unique, filteredCount } = groupDuplicates(results);
    expect(unique.length).toBe(2);
    expect(filteredCount).toBe(1);
  });
});

describe('sourceScoring', () => {
  it('prioritizes official sources for regulations', () => {
    const gov = classifySource('https://www.gov.il/fishing', 'Israel Fishing Regulations', 'license required');
    expect(gov.authorityScore).toBeGreaterThanOrEqual(90);

    const forum = classifySource('https://reddit.com/r/fishing', 'My catch today', 'caught a fish');
    expect(forum.authorityScore).toBeLessThan(gov.authorityScore);
  });

  it('penalizes old weather data', () => {
    const old = computeFreshnessScore(undefined, '2020-01-01', 'conditions');
    const recent = computeFreshnessScore(undefined, new Date().toISOString(), 'conditions');
    expect(recent).toBeGreaterThan(old);
  });
});

describe('answerSynthesis', () => {
  it('includes citations in synthesized answer', () => {
    const understanding = understandQuery('shore fishing equipment', 'en');
    const now = new Date().toISOString();
    const sources = scoreAndRankSources(
      [
        { title: 'Rod Guide', url: 'https://fishing.org/rods', snippet: 'Surf rod 3.6m for shore fishing with 120g sinkers', provider: 'wikipedia' },
        { title: 'Bait Tips', url: 'https://fishing.org/bait', snippet: 'Sardine and squid work well for Mediterranean shore fishing', provider: 'wikipedia' },
        { title: 'Regulations', url: 'https://gov.il/fish', snippet: 'Fishing license required for shore fishing in Israel', provider: 'serper' },
      ],
      understanding,
      'en',
      now,
    );
    const answer = synthesizeAnswer({
      question: 'What equipment for shore fishing?',
      language: 'en',
      understanding,
      sources: selectDiverseSources(sources, 3, 8),
      searchQueriesUsed: ['shore fishing equipment'],
      providersUsed: ['wikipedia'],
      generatedAt: now,
    });
    expect(answer.sources.length).toBeGreaterThanOrEqual(2);
    expect(answer.directAnswer.length).toBeGreaterThan(50);
    expect(answer.confidence).toBeDefined();
  });

  it('does not invent missing information', () => {
    const understanding = understandQuery('unknown beach fishing', 'en');
    const now = new Date().toISOString();
    const answer = synthesizeAnswer({
      question: 'What is the seabed at Unknown Beach?',
      language: 'en',
      understanding,
      sources: [],
      searchQueriesUsed: [],
      providersUsed: [],
      generatedAt: now,
    });
    expect(answer.confidence).toBe('limited');
    expect(answer.directAnswer.toLowerCase()).toMatch(/could not|not find|reliable/);
  });
});

describe('orchestrator integration', () => {
  it('refuses non-fishing questions end-to-end', async () => {
    const result = await runFishingResearch({
      question: 'What is the stock market doing today?',
      language: 'en',
    });
    expect(result.answer.refused).toBe(true);
    expect(result.uniqueSourceCount).toBe(0);
  }, 15000);

  it('returns Hebrew refusal for Hebrew non-fishing question', async () => {
    const result = await runFishingResearch({
      question: 'מה קורה בפוליטיקה היום?',
      language: 'he',
    });
    expect(result.answer.refused).toBe(true);
    expect(result.answer.directAnswer).toContain('דיג');
  });
});
