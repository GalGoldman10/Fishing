/**
 * Shared types for the fishing techniques knowledge system.
 */

import type { Lang } from '@/lib/research/fishingKnowledge';

export type { Lang };

export type Bilingual = { en: string; he: string };

export type TechniqueCategory =
  | 'skill'
  | 'rig'
  | 'knot'
  | 'lure'
  | 'bait'
  | 'location'
  | 'behavior'
  | 'species';

/** Multi-label question classification (requirement §3). */
export type QuestionClass =
  | 'technique'
  | 'gear'
  | 'location'
  | 'species'
  | 'bait'
  | 'lure'
  | 'conditions'
  | 'beginner'
  | 'safety'
  | 'regulation';

export interface TechniqueTopic {
  id: string;
  /** Regex patterns — first match wins by score (longer pattern = higher priority). */
  patterns: RegExp[];
  name: Bilingual;
  /** English term shown in parentheses in Hebrew answers when useful. */
  termEn?: string;
  category: TechniqueCategory;
  questionClasses: QuestionClass[];
  directAnswer: Bilingual;
  /** Step-by-step practical instructions. */
  steps?: Bilingual[];
  setup?: Bilingual;
  /** Common mistakes to avoid. */
  mistakes?: Bilingual;
  whenBest?: Bilingual;
  safety?: Bilingual[];
  beginnerNote?: Bilingual;
  expertNote?: Bilingual;
  /** Target fish or species keys (optional). */
  targetFish?: Bilingual;
}

export interface TechniqueMatch {
  topic: TechniqueTopic;
  score: number;
}

export interface TechniqueAnswerContext {
  habitat?: 'sandy' | 'rocky' | 'pier' | 'mixed';
  isBeginner: boolean;
  isExpert: boolean;
  questionClasses: QuestionClass[];
}

export interface TechniqueAnswerResult {
  directAnswer: string;
  safetyWarnings?: string[];
  grounded: boolean;
  topicId: string;
}
