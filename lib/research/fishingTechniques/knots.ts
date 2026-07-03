/**
 * Fishing knots — when to use, steps, mistakes.
 */

import type { TechniqueTopic } from './types';

export const KNOT_TOPICS: TechniqueTopic[] = [
  {
    id: 'palomar',
    patterns: [/palomar|פalomar|פalומar/i],
    name: { en: 'Palomar knot', he: 'קשר Palomar' },
    termEn: 'Palomar',
    category: 'knot',
    questionClasses: ['technique', 'gear'],
    directAnswer: {
      en: 'Palomar is the strongest easy knot for hooks and lures on braid or mono — double line through the eye, overhand loop, pass hook through loop, wet and tighten.',
      he: 'Palomar הוא הקשר הקל והחזק ביותר לקרסים ולורים על קלוע או מונו — כפל חוט בלולאה, קשר overhand, העבר קרס דרך הלולאה, הרטיבו והדקו.',
    },
    steps: [
      { en: 'Double 15cm of line, pass loop through hook eye.', he: 'כפלו 15 ס"מ חוט, העבירו לולאה דרך עין הקרס.' },
      { en: 'Tie loose overhand knot with the loop — hook hangs inside.', he: 'קשרו overhand רופף עם הלולאה — הקרס בתוך הקשר.' },
      { en: 'Pass hook through the loop; wet line and pull main line and tag to seat.', he: 'העבירו קרס דרך הלולאה; הרטיבו ומשכו חוט ראשי ו-tag לישיבה.' },
    ],
    mistakes: { en: 'Not wetting line (heat weakens); twisting the loop when passing hook.', he: 'לא להרטיב (חום מחליש); פיתול הלולאה בהעברת קרס.' },
    whenBest: { en: 'Hooks, swivels, lures on all line types.', he: 'קרסים, סביבלים, לורים על כל סוגי החוט.' },
  },
  {
    id: 'uni-knot',
    patterns: [/uni knot|uni\b|קשר uni/i],
    name: { en: 'Uni knot', he: 'קשר Uni' },
    termEn: 'Uni Knot',
    category: 'knot',
    questionClasses: ['technique', 'gear'],
    directAnswer: {
      en: 'Uni knot attaches line to swivel or hook — wrap tag 5–7 times through loop, wet, pull tag to tighten, then slide to eye.',
      he: 'קשר Uni מחבר חוט לסביבל או קרס — עיטוף tag 5–7 פעמים דרך לולאה, הרטיבה, משיכת tag, הזזה לעין.',
    },
    steps: [
      { en: 'Pass line through eye; double back parallel; make loop.', he: 'העבירו חוט דרך עין; החזירו parallel; צרו לולאה.' },
      { en: 'Wrap tag around both lines 5–7 times through loop.', he: 'עטפו tag סביב שני החוטים 5–7 פעמים דרך לולאה.' },
      { en: 'Wet and pull tag until coils seat; slide knot to eye.', he: 'הרטיבו ומשכו tag עד שהסלילים יושבים; הזיזו לעין.' },
    ],
    whenBest: { en: 'Mono and fluoro; joining leader to swivel.', he: 'מונו ופלואורו; חיבור מוביל לסביבל.' },
  },
  {
    id: 'fg-knot',
    patterns: [/fg knot|\bfg\b|קשר fg/i],
    name: { en: 'FG knot', he: 'קשר FG' },
    termEn: 'FG Knot',
    category: 'knot',
    questionClasses: ['technique', 'gear'],
    directAnswer: {
      en: 'FG knot joins braid to fluoro leader with a slim profile that passes through guides — essential for long casting with light lures.',
      he: 'קשר FG מחבר קלוע למוביל פלואורo בפרופיל דק שעובר במדריכים — חיוני להטלות ארוכות עם לורים קלים.',
    },
    expertNote: {
      en: 'Practice at home first — a bad FG fails at the worst moment. 20–30 wraps for 20–30lb braid to 0.35mm leader.',
      he: 'תרגלו בבית קודם — FG גרוע נכשל ברגע הגרוע. 20–30 עיטופים לקלוע 20–30 ליברות למוביל 0.35 מ"מ.',
    },
  },
  {
    id: 'improved-clinch',
    patterns: [/clinch knot|improved clinch|קשר clinch/i],
    name: { en: 'Improved clinch knot', he: 'קשר Improved Clinch' },
    termEn: 'Improved Clinch',
    category: 'knot',
    questionClasses: ['technique', 'gear', 'beginner'],
    directAnswer: {
      en: 'Classic beginner knot — thread through eye, wrap 5 times, pass tag through first loop and back through big loop, wet and tighten. Weaker on braid than Palomar.',
      he: 'קשר מתחילים קלאסי — דרך עין, 5 עיטופים, tag דרך לולאה ראשונה וחזרה דרך לולאה גדולה, הרטיבה והדקה. חלש יותר על קלוע מ-Palomar.',
    },
    beginnerNote: {
      en: 'Learn Palomar instead if you use braid — it is simpler and stronger.',
      he: 'למדו Palomar במקום אם משתמשים בקלוע — פשוט וחזק יותר.',
    },
  },
  {
    id: 'loop-knot',
    patterns: [/loop knot|non.?slip loop|קשר לולאה/i],
    name: { en: 'Loop knot (non-slip)', he: 'קשר לולאה (Loop Knot)' },
    termEn: 'Loop Knot',
    category: 'knot',
    questionClasses: ['technique', 'lure'],
    directAnswer: {
      en: 'Loop knot gives lures and flies free movement — tie a fixed loop at the lure eye so action is not killed by a tight knot.',
      he: 'קשר לולאה נותן ללורים תנועה חופשית — לולאה קבועה בעין הלור so שה-action לא נהרג מקשר הדוק.',
    },
    whenBest: { en: 'Minnows, poppers, soft plastics on jig heads.', he: 'Minnows, פופרים, סיליקon על ראשי jig.' },
  },
];
