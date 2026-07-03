/**
 * Merged technique topic registry — add new topics by appending to the
 * appropriate category file and importing here.
 */

import { BASIC_SKILL_TOPICS } from './basicSkills';
import { RIG_TOPICS } from './rigs';
import { KNOT_TOPICS } from './knots';
import { LURE_TOPICS } from './lures';
import { BAIT_TECHNIQUE_TOPICS, LOCATION_TECHNIQUE_TOPICS, BEHAVIOR_TOPICS } from './baitAndLocations';

import type { TechniqueTopic } from './types';

export const TECHNIQUE_TOPICS: TechniqueTopic[] = [
  ...BASIC_SKILL_TOPICS,
  ...RIG_TOPICS,
  ...KNOT_TOPICS,
  ...LURE_TOPICS,
  ...BAIT_TECHNIQUE_TOPICS,
  ...LOCATION_TECHNIQUE_TOPICS,
  ...BEHAVIOR_TOPICS,
];

export function getTopicById(id: string): TechniqueTopic | undefined {
  return TECHNIQUE_TOPICS.find((t) => t.id === id);
}

export const TECHNIQUE_TOPIC_COUNT = TECHNIQUE_TOPICS.length;
