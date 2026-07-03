/**
 * Fishing techniques knowledge system tests — requirement §12.
 */

import { buildLocalAnswer } from '@/lib/research/localAnswerEngine';
import { understandQuery } from '@/lib/research/queryUnderstanding';
import {
  TECHNIQUE_TOPIC_COUNT,
  classifyFishingQuestion,
  matchTechniqueTopic,
  tryBuildTechniqueAnswer,
} from '@/lib/research/fishingTechniques';

const ask = (q: string, lang: 'en' | 'he' = 'en') =>
  buildLocalAnswer(q, lang, understandQuery(q, lang), []);

describe('technique knowledge base coverage', () => {
  it('loads a substantial number of technique topics', () => {
    expect(TECHNIQUE_TOPIC_COUNT).toBeGreaterThanOrEqual(35);
  });

  it('classifies multi-label question types', () => {
    const classes = classifyFishingQuestion('How do I fish with shrimp from a rocky beach?');
    expect(classes).toContain('technique');
    expect(classes.some((c) => ['bait', 'location', 'beginner'].includes(c))).toBe(true);
  });
});

describe('required test questions (English)', () => {
  it('cast better from the beach', () => {
    const r = ask('How do I cast better from the beach?');
    expect(r.grounded).toBe(true);
    expect(r.directAnswer).toMatch(/45°|pendulum|release/i);
    expect(r.directAnswer).toContain('How to do it:');
    expect(r.directAnswer).not.toMatch(/use the right bait/i);
  });

  it('rig for rocky beach', () => {
    const r = ask('What rig should I use on a rocky beach?');
    expect(r.directAnswer).toMatch(/leader|float|paternoster|running sinker/i);
    expect(r.directAnswer).toMatch(/0\.4/i);
  });

  it('how to use a jig', () => {
    const r = ask('How do I use a jig?');
    expect(r.directAnswer).toMatch(/lift|fall|sink/i);
    expect(r.directAnswer).toContain('Recommended setup:');
  });

  it('fish with shrimp', () => {
    const r = ask('How do I fish with shrimp?');
    expect(r.directAnswer).toMatch(/hook|tail|thread/i);
    expect(r.directAnswer).toMatch(/bream|bass|marmor/i);
  });

  it('why fish get away', () => {
    const r = ask('Why do I keep losing fish?');
    expect(r.directAnswer).toMatch(/drag|hook|slack|net/i);
    expect(r.directAnswer).toContain('Common mistakes:');
  });

  it('hook set', () => {
    const r = ask('How do I set the hook?');
    expect(r.directAnswer).toMatch(/tap|lift|tight/i);
  });

  it('line for shore fishing', () => {
    const r = ask('What line should I use for shore fishing?');
    expect(r.directAnswer).toMatch(/0\.3|braid|fluoro|leader/i);
  });

  it('waves affect fishing', () => {
    const r = ask('How do waves affect fishing?');
    expect(r.directAnswer).toMatch(/trough|surf|0\.3/i);
  });

  it('avoid snags on rocks', () => {
    const r = ask('How do I avoid getting stuck in rocks?');
    expect(r.directAnswer).toMatch(/weak.?link|rotten|tip high|float/i);
    expect(r.safetyWarnings?.length).toBeGreaterThan(0);
  });
});

describe('required test questions (Hebrew)', () => {
  it('rocky beach fishing', () => {
    const r = ask('איך לדוג בחוף סלעי?', 'he');
    expect(r.directAnswer).toMatch(/[א-ת]/);
    expect(r.directAnswer).toContain('תשובה ישירה:');
    expect(r.directAnswer).toMatch(/מוביל|קצף|שרימפס|דיונון/);
  });

  it('shore rig in Hebrew', () => {
    const r = ask('איזה ריג מתאים לדיג מהחוף?', 'he');
    expect(r.directAnswer).toMatch(/פטרנוסטר|ריצה|סרף/i);
  });

  it('jig in Hebrew', () => {
    const r = ask('איך משתמשים בג׳יג?', 'he');
    expect(r.directAnswer).toMatch(/ג'?יג|Jigging/i);
    expect(r.directAnswer).toContain('איך לעשות:');
  });

  it('fish escaping in Hebrew', () => {
    const r = ask('למה הדגים משתחררים לי?', 'he');
    expect(r.directAnswer).toMatch(/דראג|קרס|חוט/);
  });

  it('jarjour typo variants in Hebrew', () => {
    const r = ask('איך עושים גרגור?', 'he');
    expect(r.directAnswer).toMatch(/אני מניח שהתכוונת|ז'?ירז'ור|ג'?רג/i);
    expect(r.directAnswer).toContain('תשובה ישירה:');
  });

  it('lists fishing methods in Hebrew', () => {
    const r = ask('אתה יכול לרשום לי שיטות דייג?', 'he');
    expect(r.directAnswer).toContain('תשובה ישירה:');
    expect(r.directAnswer).toMatch(/ג'?רג|ז'?ירז|פטרנוסטר|ג'?יג|צף|סרף/);
    expect(r.directAnswer).not.toMatch(/קיץ.*בוקר/);
  });
});

describe('anti-generic rule', () => {
  it('technique answers differ from each other', () => {
    const a = ask('How do I set the hook?').directAnswer;
    const b = ask('How do I use a jig?').directAnswer;
    const c = ask('What rig should I use on a rocky beach?').directAnswer;
    expect(a).not.toBe(b);
    expect(b).not.toBe(c);
    expect(a.length).toBeGreaterThan(200);
  });

  it('tryBuildTechniqueAnswer returns null for unrelated text', () => {
    expect(tryBuildTechniqueAnswer('who won the election', 'en')).toBeNull();
  });
});

describe('topic matcher', () => {
  it('matches palomar knot questions', () => {
    expect(matchTechniqueTopic('how to tie a palomar knot')?.topic.id).toBe('palomar');
  });

  it('matches drop shot', () => {
    expect(matchTechniqueTopic('explain drop shot rig for soft plastics')?.topic.id).toBe('drop-shot');
  });

  it('matches jarjour / zirzur lure questions', () => {
    expect(matchTechniqueTopic('מה זה ג\'רג\'ור?')?.topic.id).toBe('jarjour-lure-guide');
    expect(matchTechniqueTopic('how to do jarjour lure fishing')?.topic.id).toBe('jarjour-lure-guide');
  });
});
