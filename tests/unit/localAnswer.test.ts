import { buildLocalAnswer } from '@/lib/research/localAnswerEngine';
import { understandQuery } from '@/lib/research/queryUnderstanding';
import { findSpotFromQuestion } from '@/lib/research/spotMatcher';

describe('localAnswerEngine', () => {
  const understanding = (q: string) => understandQuery(q, 'en');

  it('answers rocky vs sandy for Gordon beach', () => {
    const result = buildLocalAnswer(
      'Is Gordon beach rocky or sandy?',
      'en',
      understanding('Is Gordon beach rocky or sandy?'),
      [],
    );
    expect(result.directAnswer.toLowerCase()).toContain('sandy');
    expect(result.directAnswer).toContain('Gordon');
    expect(result.usedLocalDb).toBe(true);
  });

  it('lists species for Tel Aviv beach', () => {
    const result = buildLocalAnswer(
      'What can I catch near Tel Aviv beach?',
      'en',
      understanding('What can I catch near Tel Aviv beach?'),
      [],
    );
    expect(result.species?.length).toBeGreaterThan(0);
    expect(result.directAnswer.toLowerCase()).toMatch(/bass|bream|seabass|fish/);
    expect(result.usedLocalDb).toBe(true);
  });

  it('gives equipment recommendations for a named spot', () => {
    const result = buildLocalAnswer(
      'What equipment for shore fishing at Herzliya?',
      'en',
      understanding('What equipment for shore fishing at Herzliya?'),
      [],
    );
    expect(result.directAnswer).toMatch(/rod|reel|3\.6|5000/i);
    expect(result.equipment?.[0]?.rod).toBeDefined();
  });

  it('answers in Hebrew', () => {
    const result = buildLocalAnswer(
      'האם חוף גורדון חולי או סלעי?',
      'he',
      understandQuery('האם חוף גורדון חולי או סלעי?', 'he'),
      [],
    );
    expect(result.directAnswer).toContain('חולי');
    expect(result.usedLocalDb).toBe(true);
  });

  it('maps Palmachim to its own sandy beach', () => {
    const spot = findSpotFromQuestion('fishing at Palmachim beach');
    expect(spot).not.toBeNull();
    expect(spot!.id).toBe('demo-9');
    expect(spot!.shoreType).toBe('sandy');
  });

  it('answers Palmachim equipment with long surf rod', () => {
    const result = buildLocalAnswer(
      'What equipment for Palmachim beach?',
      'en',
      understandQuery('What equipment for Palmachim beach?', 'en'),
      [],
    );
    expect(result.directAnswer).toContain('Palmachim');
    expect(result.directAnswer).toMatch(/4\.0|4\.5|surf/i);
  });

  it('recognizes Jaffa as rocky', () => {
    const result = buildLocalAnswer(
      'Is Jaffa beach rocky or sandy?',
      'en',
      understandQuery('Is Jaffa beach rocky or sandy?', 'en'),
      [],
    );
    expect(result.directAnswer.toLowerCase()).toContain('rocky');
  });

  it('gives different answers to different questions about the same beach', () => {
    const q1 = 'מה אתה חושב על דיג עכשיו בפלמחים?';
    const q2 = 'מה כדאי לי להביא לדיג בפלמחים?';
    const a1 = buildLocalAnswer(q1, 'he', understandQuery(q1, 'he'), []);
    const a2 = buildLocalAnswer(q2, 'he', understandQuery(q2, 'he'), []);

    expect(a1.directAnswer).not.toBe(a2.directAnswer);
    // "what do you think about fishing now" → conditions answer
    expect(a1.directAnswer).toContain('תנאים');
    // "what should I bring" → equipment answer
    expect(a2.directAnswer).toMatch(/ציוד|חכה|סליל/);
  });

  it('treats "what should I bring" as an equipment question in English too', () => {
    const q = 'What should I bring for fishing at Palmachim?';
    const result = buildLocalAnswer(q, 'en', understandQuery(q, 'en'), []);
    expect(result.directAnswer).toMatch(/rod|reel|setup/i);
    expect(result.equipment?.[0]?.rod).toBeDefined();
  });

  it('answers "is it worth going fishing now" with conditions, not a generic overview', () => {
    const q = 'Is it worth going fishing at Gordon beach right now?';
    const result = buildLocalAnswer(q, 'en', understandQuery(q, 'en'), []);
    expect(result.directAnswer).toContain('Current conditions');
  });
});
