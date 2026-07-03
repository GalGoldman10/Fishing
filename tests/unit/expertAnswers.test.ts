/**
 * Anti-generic answer tests — the bot must give specific, expert-level
 * answers (setup, technique, timing, fish, tips), never template filler.
 * Covers the four required example questions plus follow-up behavior.
 */

import { buildLocalAnswer } from '@/lib/research/localAnswerEngine';
import { understandQuery } from '@/lib/research/queryUnderstanding';

const ask = (question: string, language: 'en' | 'he' = 'en') =>
  buildLocalAnswer(question, language, understandQuery(question, language), []);

describe('Example 1: bait for a rocky beach', () => {
  const result = ask('What bait should I use from a rocky beach?');

  it('recommends specific rocky-shore baits, not "use the right bait"', () => {
    expect(result.directAnswer).toMatch(/squid|crab|shrimp/i);
    expect(result.directAnswer).not.toMatch(/use the right bait/i);
  });

  it('includes a concrete rig and leader specification', () => {
    expect(result.directAnswer).toMatch(/0\.\d{2}\s*mm|fluorocarbon/i);
    expect(result.directAnswer).toContain('Best setup:');
  });

  it('lists fish with what each one bites', () => {
    expect(result.directAnswer).toContain('Fish you can catch:');
    expect(result.directAnswer).toMatch(/bream/i);
    expect(result.species?.length).toBeGreaterThan(1);
  });

  it('gives step-by-step technique and safety warnings', () => {
    expect(result.directAnswer).toContain('Best technique:');
    expect(result.directAnswer).toMatch(/\n1\. /);
    expect(result.safetyWarnings?.length).toBeGreaterThan(0);
    expect(result.safetyWarnings?.join(' ')).toMatch(/slip|swell|wave/i);
  });
});

describe('Example 2: can I fish today in Ashdod', () => {
  const result = ask('Can I fish today in Ashdod beach?');

  it('addresses current conditions and best time', () => {
    expect(result.directAnswer).toContain('Current conditions');
    expect(result.directAnswer).toContain('Best time and conditions:');
  });

  it('includes a recommended setup and target fish for the spot', () => {
    expect(result.directAnswer).toContain('Best setup:');
    expect(result.directAnswer).toMatch(/• Rod: /);
    expect(result.directAnswer).toContain('Fish you can catch:');
  });

  it('mentions Ashdod specifically', () => {
    expect(result.directAnswer).toMatch(/ashdod/i);
  });
});

describe('Example 3: what fish can I catch with squid', () => {
  const result = ask('What fish can I catch with squid?');

  it('lists the fish squid actually catches', () => {
    expect(result.directAnswer).toMatch(/bream/i);
    expect(result.directAnswer).toMatch(/sea bass/i);
    expect(result.species?.length).toBeGreaterThanOrEqual(3);
  });

  it('explains how to hook squid and the best rig', () => {
    expect(result.directAnswer).toContain('How to hook it:');
    expect(result.directAnswer).toMatch(/strips?/i);
    expect(result.directAnswer).toContain('Best rig:');
  });

  it('explains when squid works best', () => {
    expect(result.directAnswer).toMatch(/night|murky/i);
  });
});

describe('Example 4: tell me about Tel Baruch beach fishing', () => {
  const result = ask('Tell me about Tel Baruch beach fishing');

  it('describes the beach structure', () => {
    expect(result.directAnswer).toMatch(/sandy/i);
    expect(result.directAnswer).toContain('Tel Baruch');
  });

  it('gives the full expert structure: setup, technique, time, fish, tips', () => {
    expect(result.directAnswer).toContain('Best setup:');
    expect(result.directAnswer).toContain('Best technique:');
    expect(result.directAnswer).toContain('Best time and conditions:');
    expect(result.directAnswer).toContain('Fish you can catch:');
    expect(result.directAnswer).toContain('Extra tips:');
  });

  it('cites sources checked', () => {
    expect(result.directAnswer).toContain('Sources checked:');
  });
});

describe('No generic answers rule', () => {
  it('different questions produce different, substantial answers', () => {
    const questions = [
      'What bait should I use from a rocky beach?',
      'Can I fish today in Ashdod beach?',
      'What fish can I catch with squid?',
      'Tell me about Tel Baruch beach fishing',
    ];
    const answers = questions.map((q) => ask(q).directAnswer);

    for (const answer of answers) {
      expect(answer.length).toBeGreaterThan(300);
    }
    expect(new Set(answers).size).toBe(answers.length);
  });

  it('sandy and rocky beach advice differ (terrain-specific tactics)', () => {
    const rocky = ask('What equipment for a rocky beach?');
    const sandy = ask('What equipment for a sandy beach?');
    expect(rocky.directAnswer).not.toBe(sandy.directAnswer);
    expect(rocky.equipment?.[0]?.rod).not.toBe(sandy.equipment?.[0]?.rod);
    // Rocky advice warns about abrasion; sandy advice talks casting distance.
    expect(rocky.directAnswer).toMatch(/abrasion|rock/i);
    expect(sandy.directAnswer).toMatch(/cast|trough|breaker/i);
  });

  it('species-target questions get species-specific tactics', () => {
    const result = ask('How do I catch bream?');
    expect(result.directAnswer).toMatch(/shrimp|squid|crab/i);
    expect(result.directAnswer).toMatch(/rock|seam/i);
  });
});

describe('Smart follow-up questions', () => {
  it('asks 1-3 short questions when key info is missing', () => {
    const result = ask('What bait should I use?');
    expect(result.followUpQuestions).toBeDefined();
    expect(result.followUpQuestions!.length).toBeGreaterThanOrEqual(1);
    expect(result.followUpQuestions!.length).toBeLessThanOrEqual(3);
    expect(result.directAnswer).toMatch(/shore, rocks|beach or city/i);
  });

  it('still gives useful interim advice while asking', () => {
    const result = ask('What bait should I use?');
    expect(result.directAnswer).toMatch(/shrimp/i);
  });

  it('does not ask follow-ups when the location is already known', () => {
    const result = ask('Tell me about Tel Baruch beach fishing');
    expect(result.followUpQuestions).toBeUndefined();
  });
});

describe('Hebrew expert answers', () => {
  it('answers a Hebrew rocky-bait question with the full structure in Hebrew', () => {
    const result = ask('איזה פיתיון כדאי לחוף סלעי?', 'he');
    expect(result.directAnswer).toContain('הציוד המומלץ:');
    expect(result.directAnswer).toContain('הטכניקה:');
    expect(result.directAnswer).toMatch(/דניס/);
    expect(result.directAnswer).toMatch(/דיונון|סרטן|שרימפס/);
  });

  it('answers a Hebrew squid question with fish and hooking advice', () => {
    const result = ask('אילו דגים אפשר לתפוס עם דיונון?', 'he');
    expect(result.directAnswer).toMatch(/דניס/);
    expect(result.directAnswer).toContain('איך לעגן את הפיתיון:');
  });

  it('Hebrew follow-up questions are in Hebrew', () => {
    const result = ask('איזה פיתיון כדאי?', 'he');
    expect(result.followUpQuestions?.join(' ')).toMatch(/[א-ת]/);
  });
});
