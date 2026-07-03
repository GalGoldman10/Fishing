/**
 * Fishing techniques knowledge system — public API.
 *
 * To add a new technique later:
 * 1. Add a TechniqueTopic entry to the relevant file in this folder
 *    (basicSkills.ts, rigs.ts, knots.ts, lures.ts, baitAndLocations.ts).
 * 2. Include regex patterns that match user questions.
 * 3. Fill directAnswer + steps/setup/mistakes at minimum.
 * 4. The registry picks it up automatically — no orchestrator changes needed.
 */

export type { TechniqueTopic, QuestionClass, TechniqueMatch, TechniqueAnswerResult } from './types';
export { TECHNIQUE_TOPICS, TECHNIQUE_TOPIC_COUNT, getTopicById } from './registry';
export {
  classifyFishingQuestion,
  matchTechniqueTopic,
  detectSkillLevel,
  buildTechniqueContext,
} from './classifier';
export { buildTechniqueAnswer } from './answerBuilder';

import type { Lang } from '@/lib/research/fishingKnowledge';
import type { FishingSource } from '@/types/research';
import { matchTechniqueTopic, buildTechniqueContext } from './classifier';
import { buildTechniqueAnswer } from './answerBuilder';

/** Try to answer purely from the technique knowledge base. Returns null if no topic matches. */
export function tryBuildTechniqueAnswer(
  question: string,
  language: Lang,
  habitat?: 'sandy' | 'rocky' | 'pier' | 'mixed',
  sources: FishingSource[] = [],
): ReturnType<typeof buildTechniqueAnswer> | null {
  const match = matchTechniqueTopic(question);
  if (!match) return null;

  const ctx = buildTechniqueContext(question, habitat);
  return buildTechniqueAnswer(match.topic, question, language, ctx, {
    includeUnsureNote: sources.length === 0 && ctx.questionClasses.includes('location'),
  });
}
