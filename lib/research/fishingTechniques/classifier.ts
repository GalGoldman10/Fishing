/**
 * Question classification and technique topic matching.
 */

import { TECHNIQUE_TOPICS } from './registry';
import type { QuestionClass, TechniqueAnswerContext, TechniqueMatch } from './types';

const BEGINNER_PATTERN =
  /beginner|first time|new to|how do i|how to|what is|explain|never fished|מתחיל|איך|מה זה|פעם ראשונה|לא יודע/i;

const EXPERT_PATTERN =
  /advanced|presentation|cadence|retrieve angle|strike zone|hook exposure|leader material|tide stage|structure reading|מקצוע|מתקדם|cadence|presentation/i;

export function classifyFishingQuestion(question: string): QuestionClass[] {
  const classes = new Set<QuestionClass>();

  if (/how to|technique|method|cast|strike|hook set|rig|knot|retrieve|jig|fish with|fish using|טכניק|שיט|הטלה|הכאה|קשר|ריג|ג'?יג|ג׳יג|דיג עם|איך/i.test(question)) {
    classes.add('technique');
  }
  if (/rod|reel|line|leader|hook|sinker|gear|equipment|setup|buy|חכה|סליל|חוט|ציוד|לקנות/i.test(question)) {
    classes.add('gear');
  }
  if (/beach|pier|harbor|rock|shore|spot|location|where|חוף|מזח|נמל|סלע|איפה|מקום/i.test(question)) {
    classes.add('location');
  }
  if (/species|catch|what fish|target|לכוד|מין|איזה דג/i.test(question)) {
    classes.add('species');
  }
  if (/bait|shrimp|squid|worm|bread|sardine|crab|פיתiון|שרימפס|דיונון|תולע|סרדין/i.test(question)) {
    classes.add('bait');
  }
  if (/lure|jig|spoon|popper|minnow|spinner|soft plastic|לור|ג'?יג|כפית|פופר/i.test(question)) {
    classes.add('lure');
  }
  if (/weather|wind|wave|tide|condition|today|now|רוח|גל|גאות|מזג|היום|עכשיו/i.test(question)) {
    classes.add('conditions');
  }
  if (/safe|danger|slip|storm|בטיח|סכנ|מסוכן/i.test(question)) {
    classes.add('safety');
  }
  if (/regulat|license|legal|protected|minimum|תקנ|רישיון|חוק|מוגן/i.test(question)) {
    classes.add('regulation');
  }
  if (BEGINNER_PATTERN.test(question)) {
    classes.add('beginner');
  }

  if (classes.size === 0) classes.add('technique');
  return [...classes];
}

export function detectSkillLevel(question: string): { isBeginner: boolean; isExpert: boolean } {
  return {
    isBeginner: BEGINNER_PATTERN.test(question) && !EXPERT_PATTERN.test(question),
    isExpert: EXPERT_PATTERN.test(question),
  };
}

/** Score and return the best-matching technique topic, if any. */
export function matchTechniqueTopic(question: string): TechniqueMatch | null {
  const text = question.toLowerCase();
  let best: TechniqueMatch | null = null;

  const baitFocus = /bait|פיתיון|שרימפס|דיונון|squid|shrimp/i.test(question);
  const rigFocus = /\brig\b|ריג|חסקה/i.test(question);
  const lureFocus = /lure|jarjour|zirzur|minnow|popper|jig|דמוי|ג['׳]?רג|ז['׳]?ירז|topwater|סיליקon/i.test(question);
  const methodsOverviewFocus = /list.*(method|technique|style)|fishing methods|שיטות דיג|שיטות דייג|רשום.*שיט|אילו שיטות|מה השיטות/i.test(question);

  for (const topic of TECHNIQUE_TOPICS) {
    for (const pattern of topic.patterns) {
      if (pattern.test(question) || pattern.test(text)) {
        let score = pattern.source.length;
        if (topic.category === 'rig') score += 5;
        if (methodsOverviewFocus && topic.id === 'fishing-methods-overview') score += 55;
        if (baitFocus && topic.category === 'bait') score += 40;
        if (rigFocus && topic.category === 'rig') score += 40;
        if (lureFocus && topic.category === 'lure') score += 45;
        if (topic.id === 'jarjour-lure-guide') score += 30;
        if (baitFocus && topic.category === 'location' && !/how|איך|fish from|לדוג/i.test(question)) score -= 20;
        if (!best || score > best.score) {
          best = { topic, score };
        }
      }
    }
  }

  return best;
}

export function buildTechniqueContext(question: string, habitat?: TechniqueAnswerContext['habitat']): TechniqueAnswerContext {
  const { isBeginner, isExpert } = detectSkillLevel(question);
  return {
    habitat,
    isBeginner,
    isExpert,
    questionClasses: classifyFishingQuestion(question),
  };
}
