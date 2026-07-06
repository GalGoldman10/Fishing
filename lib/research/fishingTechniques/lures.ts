/**
 * Lure fishing techniques — jigging, retrieves, topwater, spoons, etc.
 */

import type { TechniqueTopic } from './types';

const ISRAEL_FISHING_JARJOUR_URL =
  'https://israelfishing.co.il/%D7%9B%D7%AA%D7%91%D7%95%D7%AA/%D7%94%D7%9E%D7%93%D7%A8%D7%99%D7%9A-%D7%94%D7%A9%D7%9C%D7%9D-%D7%9C%D7%92%D7%A8%D7%92%D7%95%D7%A8/';

export const LURE_TOPICS: TechniqueTopic[] = [
  {
    id: 'jarjour-lure-guide',
    patterns: [
      /jar?jou?r|zirzur|z'?irzur|lure retrieve|artificial lure|lure fishing|spinning lure|ג['׳]?רג['׳]?ור|ז['׳]?ירז['׳]?ור|גרירת דמוי|דמוי.*מלאכות|דיג.*דמוי|איך.*ג['׳]?רג|מה זה ג['׳]?רג/i,
    ],
    name: { en: 'Jarjour (lure retrieve)', he: 'ג\'רג\'ור / ז\'ירז\'ור (Jarjour)' },
    termEn: 'Jarjour',
    category: 'lure',
    questionClasses: ['technique', 'lure', 'gear', 'beginner'],
    directAnswer: {
      en: 'Jarjour (Hebrew ז\'ירז\'ור, from Arabic "to drag") means working an artificial lure with the rod so it mimics a wounded, struggling fish — predators strike because the lure looks like easy prey. Use lighter rods, small reels, and thin braid because you retrieve hundreds of times per session.',
      he: 'ג\'רג\'ור (ז\'ירז\'ור — מהמילה הערבית "לגרור") הוא עבודה עם דמוי-דג מלאכותי בעזרת החכה, כדי לדמות דג פצוע וחלש שזז במים. משתמשים במקלות קלים, רולרים קטנים וחוט בד דק — כי מבצעים מאות גרירות ביציאה.',
    },
    steps: [
      {
        en: 'Pick lure type: Minnow (twitch = injured fish, check F floating vs S sinking), metal Jig (hops off bottom), Topwater popper/pencil (surface strike), or Soft plastic on jig head (slow roll + pauses).',
        he: 'בחרו סוג דמוי: Minnow (טוויץ\' = דג פצוע, שימו ל-F צף או S שוקע), Jig מתכת (קפיצות מהקרקעית), Topwater פופר/פנסיל (תקיפה על פני המים), או סיליקון על Jig head (גלגול איטי + עצירות).',
      },
      {
        en: 'Match rod weight: Ultra-light 0–10g (reel 1000–2000) for small fish; Light 5–25g (2000–2500) for most Israeli shore predators; Medium 10–30g (3000–4000) for heavier lures and bigger fish.',
        he: 'התאימו משקל מקל: Ultra-light 0–10 גרם (רולר 1000–2000) לדגים קטנים; Light 5–25 גרם (2000–2500) לרוב הטורפים מהחוף; Medium 10–30 גרם (3000–4000) לדמויים כבדים ודגים גדולים.',
      },
      {
        en: 'Line: quality braid (cheap braid causes wind knots and break-offs on rocks). Add 50–100cm fluoro shock leader with FG or PR knot — never pull that knot through rod guides.',
        he: 'חוט: בד איכותי (בד זול = פלונטרים וקריעות בסלעים). הוסיפו שוק-לידר פלואורו 50–100 ס"מ עם קשר FG או PR — לעולם אל תעבירו את הקשר בין המדריכים.',
      },
      {
        en: 'Retrieve: reel while twitching rod side-to-side (minnow), or lift-and-drop (jig), or walk-the-dog zigzag (pencil), or steady roll with pauses (soft plastic). Pause after each movement — many strikes come on the pause.',
        he: 'הובלה: סלילה עם טוויץ\' ימינה-שמאלה (minnow), או הרמה-הורדה (jig), או zigzag walk-the-dog (pencil), או גלגול יציב עם pause (סיליקון). עצרו אחרי כל תנועה — הרבה נגיעות מגיעות ב-pause.',
      },
    ],
    setup: {
      en: 'Beginner jarjour set: light rod 5–25g, spinning reel 2500, quality 8-strand braid 12–20lb, 80cm fluoro leader 0.28–0.35mm, Palomar to lure, FG/PR braid-to-leader.',
      he: 'סט מתחילים: מקל light 5–25 גרם, סליל 2500, בד 8 גידים איכותי 12–20 ליברות, מוביל פלואורו 80 ס"מ 0.28–0.35 מ"מ, Palomar לדמוי, FG/PR לחיבור בד-מוביל.',
    },
    mistakes: {
      en: 'Cheap braid; leader knot passing through guides; constant retrieve with no pauses; wrong S/F lure (sinking minnow when you need it to hang in mid-water).',
      he: 'בד זול; קשר מוביל עובר במדריכים; הובלה רציפה בלי pause; דמוי S/F לא מתאים (minnow שוקע כשצריך תלייה באמצע המים).',
    },
    whenBest: {
      en: 'Dawn and dusk on breakwaters, reefs, and surf edges when predators hunt. Calm to moderate sea for topwater; jig works in light chop.',
      he: 'שחר ודמדומים על שוברים, שונית וקצוות גלים כשטורפים צדים. ים רגוע-בינוני ל-topwater; jig עובד גם בגל קל.',
    },
    targetFish: {
      en: 'Sea bass, bluefish, barracuda, sargo, mackerel, leerfish — varies by lure type and retrieve speed.',
      he: 'לברק, גומבר, ברקודה, סרגוס, מקרל, אריאן — משתנה לפי סוג דמוי ומהירות הובלה.',
    },
    beginnerNote: {
      en: 'Start with one medium light rod (5–25g), a few minnows (one F, one S), and practice twitch-pause on a breakwater before buying more lures.',
      he: 'התחילו עם מקל light אחד (5–25 גרם), כמה minnow (אחד F, אחד S), ותרגלו twitch-pause על שובר לפני שקונים עוד דמויים.',
    },
    expertNote: {
      en: 'Cadence and pause length matter more than lure color. For grouper holes, slow jig sink near structure; for pelagics, fast jig retrieve. Source: Israel Fishing complete jarjour guide.',
      he: 'Cadence ואורך pause חשובים יותר מצבע. לחורי לוקוס — jig איטי ליד מבנה; לפלגיים — retrieve מהיר. מקור: המדריך השלם לג\'רג\'ור — Israel Fishing.',
    },
  },
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
    whenBest: { en: 'Calm dawn/dusk, leerfish and bluefish in surf, barracuda near piers.', he: 'שחר/דמדומים רגועים, אריאן וגומבר בגלים, ברקודה ליד מזחים.' },
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
