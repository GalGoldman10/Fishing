/**
 * Builds structured technique answers from the knowledge base.
 */

import type { Lang } from '@/lib/research/fishingKnowledge';
import type { TechniqueAnswerContext, TechniqueAnswerResult, TechniqueTopic } from './types';

const H = {
  direct: { en: 'Direct answer:', he: 'תשובה ישירה:' },
  steps: { en: 'How to do it:', he: 'איך לעשות:' },
  setup: { en: 'Recommended setup:', he: 'הציוד המומלץ:' },
  mistakes: { en: 'Common mistakes:', he: 'טעויות נפוצות:' },
  when: { en: 'When this works best:', he: 'מתי זה עובד הכי טוב:' },
  safety: { en: 'Safety:', he: 'בטיחות:' },
  beginner: { en: 'Beginner tip:', he: 'טיפ למתחילים:' },
  expert: { en: 'Advanced tip:', he: 'טיפ מתקדם:' },
  targets: { en: 'Target fish:', he: 'דגי מטרה:' },
  sources: { en: 'Sources checked:', he: 'מקורות שנבדקו:' },
  unsure: {
    en: 'I\'m not fully sure about location-specific details for this exact spot — the guidance below is based on established fishing technique.',
    he: 'אני לא בטוח לגמרi לגבי פרטים ספציפיים למיקום המדויק — ההנחיה למטה מבוססת על טכניקות דיג מוכרות.',
  },
};

function formatTopicName(topic: TechniqueTopic, lang: Lang): string {
  if (lang === 'he' && topic.termEn) {
    return `${topic.name.he} (${topic.termEn})`;
  }
  return topic.name[lang];
}

export function buildTechniqueAnswer(
  topic: TechniqueTopic,
  question: string,
  lang: Lang,
  ctx: TechniqueAnswerContext,
  options?: { includeUnsureNote?: boolean },
): TechniqueAnswerResult {
  const sections: string[] = [];
  const safetyWarnings: string[] = [];

  sections.push(`${H.direct[lang]}\n${topic.directAnswer[lang]}`);

  if (topic.steps?.length) {
    const steps = topic.steps.map((s, i) => `${i + 1}. ${s[lang]}`).join('\n');
    sections.push(`${H.steps[lang]}\n${steps}`);
  }

  if (topic.setup) {
    sections.push(`${H.setup[lang]}\n${topic.setup[lang]}`);
  }

  if (topic.whenBest) {
    sections.push(`${H.when[lang]}\n${topic.whenBest[lang]}`);
  }

  if (topic.mistakes) {
    sections.push(`${H.mistakes[lang]}\n${topic.mistakes[lang]}`);
  }

  if (topic.targetFish) {
    sections.push(`${H.targets[lang]}\n${topic.targetFish[lang]}`);
  }

  if (ctx.isBeginner && topic.beginnerNote) {
    sections.push(`${H.beginner[lang]}\n${topic.beginnerNote[lang]}`);
  } else if (ctx.isExpert && topic.expertNote) {
    sections.push(`${H.expert[lang]}\n${topic.expertNote[lang]}`);
  } else if (ctx.isBeginner && topic.steps && topic.steps.length > 2) {
    sections.push(
      lang === 'he'
        ? `${H.beginner.he}\nהתחילו עם השלבים 1–2 בלבד — אל תנסu הכול בי outing אחד.`
        : `${H.beginner.en}\nStart with steps 1–2 only — do not try everything in one session.`,
    );
  }

  if (topic.safety?.length) {
    sections.push(`${H.safety[lang]}\n${topic.safety.map((s) => `• ${s[lang]}`).join('\n')}`);
    safetyWarnings.push(...topic.safety.map((s) => s[lang]));
  }

  if (options?.includeUnsureNote) {
    sections.push(H.unsure[lang]);
  }

  sections.push(
    `${H.sources[lang]}\n${
      lang === 'he'
        ? `• מערכת ידע טכניקות דיג (${formatTopicName(topic, lang)})\n• ידע דיג ים תיכון ישראלי`
        : `• Fishing techniques knowledge base (${formatTopicName(topic, lang)})\n• Israeli Mediterranean fishing expertise`
    }`,
  );

  return {
    directAnswer: sections.join('\n\n'),
    safetyWarnings: safetyWarnings.length > 0 ? safetyWarnings : undefined,
    grounded: true,
    topicId: topic.id,
  };
}
