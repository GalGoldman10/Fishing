/**
 * Lure fishing techniques — jigging, retrieves, topwater, spoons, etc.
 */

import type { TechniqueTopic } from './types';

export const LURE_TOPICS: TechniqueTopic[] = [
  {
    id: 'jigging-basics',
    patterns: [/how.*jig|use a jig|jigging|ג['׳]?יג|משתמש.*ג/i, /metal jig|shore jig/i],
    name: { en: 'Jigging', he: 'ג\'יגינג (Jigging)' },
    termEn: 'Jigging',
    category: 'lure',
    questionClasses: ['technique', 'lure', 'beginner'],
    directAnswer: {
      en: 'Jigging is lifting and dropping a metal or soft jig so it falls through the strike zone — strikes often come on the fall, so stay tight to the line.',
      he: 'ג\'יגינג הוא הרמה והורדה של ג\'יג מתכת או סיליקon דרך strike zone — נגיעות לרוב בנפילה, אז הישארו מתוחים לחוט.',
    },
    steps: [
      { en: 'Cast or drop to depth; let jig sink on semi-slack until you feel bottom or target depth.', he: 'הטילו או הורידו לעומק; תנו לג\'יג לשקוע על חוט semi-slack עד קרקעית או עומק יעד.' },
      { en: 'Sharp lift 30–60cm with rod tip, then controlled fall — watch for tick on slack.', he: 'הרמה חדה 30–60 ס"מ בקצה החכה, נפילה מבוקרת — שימו לב ל-tick בslack.' },
      { en: 'Vary pause length — sometimes fish hit after 2–3 seconds on bottom.', he: 'שנו אורך pause — לפעמים דגים פוגעים אחרי 2–3 שניות על הקרקעית.' },
    ],
    setup: {
      en: 'Rod 2.4–3.0m casting 20–60g, braid 15–20lb, fluoro leader 0.35mm, jig matched to depth/current.',
      he: 'חכה 2.4–3.0 מ\' הטלה 20–60 גרם, קלוע 15–20 ליברות, מוביל 0.35 מ"מ, ג\'יג לפי עומק/זרם.',
    },
    mistakes: {
      en: 'Reeling up constantly (jig never falls); too heavy jig in shallow surf; striking on every bump.',
      he: 'סלילה מתמדת (ג\'יג לא נופל); ג\'יג כבד מדי בגלים רדודים; הכאה על כל bump.',
    },
    whenBest: { en: 'Piers, breakwaters, dawn patrol for bass and bluefish.', he: 'מזחים, שוברים, סיור שחר ללוקוס וגומבר.' },
    targetFish: { en: 'Sea bass, bluefish, barracuda, amberjack (deep).', he: 'לוקוס, גומבר, ברקודה, אינטיאס (עמוק).' },
    expertNote: {
      en: 'Match fall speed to mood — fast current needs heavier jig; lethargic fish want longer pauses and smaller profile.',
      he: 'התאימו מהירות נפילה למצב רוח — זרם מהיר = ג\'יג כבד; דגים עצלים = pause ארוך ופרופיל קטן.',
    },
  },
  {
    id: 'shore-jigging',
    patterns: [/shore jig|shore jigging|ג'?יג.*חוף/i],
    name: { en: 'Shore jigging', he: 'ג\'יגינג מהחוף (Shore Jigging)' },
    termEn: 'Shore Jigging',
    category: 'lure',
    questionClasses: ['technique', 'lure', 'location'],
    directAnswer: {
      en: 'Long casts with metal jigs retrieved through surf troughs and along breakwater edges — fast rips with pauses trigger predators hunting baitfish.',
      he: 'הטלות ארוכות עם ג\'יגים מתכת מושכים דרך תעלות גלים ולאורך שוברים — rips מהירים עם pause מעוררים טורפים.',
    },
    setup: {
      en: '2.7–3.3m jig rod, 4000–6000 reel, braid 20–30lb, jigs 30–80g for Mediterranean surf.',
      he: 'חכת jig 2.7–3.3 מ\', סליל 4000–6000, קלוע 20–30, ג\'יגים 30–80 גרם לגלים ים תיכון.',
    },
  },
  {
    id: 'popper-fishing',
    patterns: [/popper|topwater|פופר|על.?פני/i],
    name: { en: 'Popper / topwater fishing', he: 'דיג פופper / Topwater' },
    termEn: 'Popper',
    category: 'lure',
    questionClasses: ['technique', 'lure'],
    directAnswer: {
      en: 'Popper creates splash and noise on the surface — twitch rod tip to make it "bloop" and pause; strikes are explosive and visual.',
      he: 'פופר יוצר התזה ורעש על פני המים — jerk בקצה החכה ל-"bloop" ו-pause; נגיעות explosive וvisual.',
    },
    whenBest: { en: 'Calm dawn/dusk, leerfish and bluefish in surf, barracuda near piers.', he: 'שחר/דמדומים רגועים, ליציה וגומבר בגלים, ברקודה ליד מזחים.' },
    mistakes: { en: 'Retrieving too fast without pauses; using poppers in heavy chop where fish cannot see them.', he: 'retrieve מהיר בלי pause; פופרים בגלים כבדים שwhere דגים לא רואים.' },
  },
  {
    id: 'spoon-fishing',
    patterns: [/spoon|metal spoon|כפית/i],
    name: { en: 'Spoon fishing', he: 'דיג בכפיות (Spoon)' },
    termEn: 'Spoon',
    category: 'lure',
    questionClasses: ['technique', 'lure'],
    directAnswer: {
      en: 'Cast a shiny spoon and retrieve at steady to fast speed — flash mimics fleeing baitfish. Bluefish and mackerel love fast spoons.',
      he: 'הטילו כפית מבריקה והובילו במהירות יציבה עד מהירה — הבזק מחקה דגיג בורח. גומבר ומקרל אוהבים כפיות מהירות.',
    },
    setup: { en: 'Wire trace if bluefish present — they cut mono.', he: 'מוביל פלדה אם יש גומבר — חותכים מונו.' },
  },
  {
    id: 'soft-plastic',
    patterns: [/soft plastic|silicone|סיליקon|שד\b|shad/i],
    name: { en: 'Soft plastic fishing', he: 'דיג בסיליקon (Soft Plastic)' },
    termEn: 'Soft Plastic',
    category: 'lure',
    questionClasses: ['technique', 'lure'],
    directAnswer: {
      en: 'Rig on jig head or drop shot — slow hops along bottom or steady retrieve mid-water. Match size to local baitfish (5–12cm typical).',
      he: 'על ראש jig או drop shot — קפיצות איטיות על הקרקעית או retrieve יציב באמצע המים. התאימו גודל לדגיג מקומי (5–12 ס"מ).',
    },
  },
  {
    id: 'minnow-retrieve',
    patterns: [/minnow|stickbait|stop.?and.?go|twitch|jerking|walking the dog/i],
    name: { en: 'Minnow / twitch retrieve', he: 'הובלת Minnow / Twitch' },
    termEn: 'Minnow',
    category: 'lure',
    questionClasses: ['technique', 'lure'],
    directAnswer: {
      en: 'Twitch-and-pause retrieve: sharp rod twitches make the lure dart sideways — bass and bluefish hit when the lure suspends. Stop-and-go: reel, pause 2–3 sec, repeat.',
      he: 'Twitch-and-pause: jerks חדים גורמים ללור לזוז הצידה — לוקוס וגומבר פogעים כשהלור תלוי. Stop-and-go: סלילה, pause 2–3 שנ\', חזרה.',
    },
    expertNote: {
      en: 'Cadence beats speed — if no bites, change pause length before changing lure color.',
      he: 'Cadence מנצח מהירות — אם אין נגיעות, שנו pause לפני צבע לור.',
    },
  },
];
