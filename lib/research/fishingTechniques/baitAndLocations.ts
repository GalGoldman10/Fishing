/**
 * Bait fishing techniques and location-based techniques.
 */

import type { TechniqueTopic } from './types';

export const BAIT_TECHNIQUE_TOPICS: TechniqueTopic[] = [
  {
    id: 'fish-with-shrimp',
    patterns: [/fish.*shrimp|shrimp.*fish|how.*shrimp|דיג.*שרימפס|איך.*שרימפס|פיתiון.*שרימפס/i],
    name: { en: 'Fishing with shrimp', he: 'דיג עם שרימפס' },
    category: 'bait',
    questionClasses: ['technique', 'bait', 'beginner'],
    directAnswer: {
      en: 'Shrimp is the most versatile Mediterranean bait — live for bass at dawn, dead threaded on light running rig for bream near rocks.',
      he: 'שרימפס הוא הפיתiון הכי ורסטילי בים התיכון — חי ללוקוס בשחר, מת על חסקת ריצה קלה לדניס ליד סלעים.',
    },
    steps: [
      { en: 'Live: hook through 2nd tail segment from tail — keeps kicking.', he: 'חי: קרס דרך פרק זנב 2 מהסוף — ממשיך לבעוט.' },
      { en: 'Dead: thread hook tail-to-head on #4–#2 long shank for straight presentation.', he: 'מת: השחלת קרס מזנב לראש על 4#–2# רגל ארוכה.' },
      { en: 'Use minimal weight — shrimp works best when it drifts naturally.', he: 'משקolת מינימלית — שרימפס עובד הכי טוב כשנסחף טבעי.' },
    ],
    setup: { en: 'Hooks #6–#2, running sinker or float, leader 0.30–0.40mm.', he: 'קרסים 6#–2#, ריצה או מצוף, מוביל 0.30–0.40 מ"מ.' },
    whenBest: { en: 'Year-round; peel shell in winter for extra scent.', he: 'כל השנה; קליפה בחורף לריח נוסף.' },
    mistakes: { en: 'Hook too large (shrimp tears off); fishing heavy sinker in calm rock pools.', he: 'קרס גדול מדי (שרימפס נקרע); משקolת כבדה בגומות סלע רגועות.' },
    targetFish: { en: 'Bream, sea bass, marmor, red mullet.', he: 'דניס, לוקוס, מרמור, ברבוניה.' },
  },
  {
    id: 'fish-with-squid',
    patterns: [/fish.*squid|how.*squid|squid.*rig|דיג.*דיונון|איך.*דיונון/i],
    name: { en: 'Fishing with squid', he: 'דיג עם דיונון' },
    category: 'bait',
    questionClasses: ['technique', 'bait'],
    directAnswer: {
      en: 'Cut 1–2cm strips along the body — hook once at the top so strip flutters. Tougher than soft bait for night rock fishing and pickers.',
      he: 'חתכו רצועות 1–2 ס"מ לאורך הגוף — קרס פעם אחת בקצה לרipple. קשיח יותר מפיתiון רך לדיג סלע בלילה.',
    },
    steps: [
      { en: 'Night + rock: single running rig, 0.40mm leader, strips on #2–1/0.', he: 'לילה + סלע: ריצה בודדת, מוביל 0.40, רצועות על 2#–1/0.' },
      { en: 'Surf dawn: half squid on pulley rig for bass.', he: 'שחר סרף: חצי דיונון על pulley ללוקוס.' },
    ],
    whenBest: { en: 'Murky water, night, anywhere crabs steal soft bait.', he: 'מים עכורים, לילה, בכל מקום שסרטנים גונבים פיתiון רך.' },
  },
  {
    id: 'fish-with-worms',
    patterns: [/sandworm|lugworm|worm.*fish|תולע.*דיג|דיג.*תולע/i],
    name: { en: 'Fishing with worms', he: 'דיג עם תולעי חול' },
    category: 'bait',
    questionClasses: ['technique', 'bait'],
    directAnswer: {
      en: 'Thread worm up a long-shank #4–#8 hook like a sock — essential for marmor and sole on sandy bottom. Long cast over clean sand.',
      he: 'השחילו תולעת על קרס רגל ארוכה 4#–8# כמו גרב — חיוני למרמור ודג לשון על חול. הטלה ארוכה מעל חול נקי.',
    },
    whenBest: { en: 'Daytime sand; first calm day after storms.', he: 'חול ביום; יום רגוע ראשון אחרי סערות.' },
  },
  {
    id: 'live-bait',
    patterns: [/live bait|live shrimp|live mullet|פיתiון חי/i],
    name: { en: 'Live bait fishing', he: 'דיג בפיתiון חי' },
    category: 'bait',
    questionClasses: ['technique', 'bait'],
    directAnswer: {
      en: 'Keep bait alive in aerated bucket; hook lightly so it swims — live shrimp at dawn in surf, live mullet on float for leerfish.',
      he: 'שמרו פיתיון חי בדלי מאוורר; עגנו קל כדי שישחה — שרימפס חי בשחר בגלים, בורי חי במצוף לאריאן.',
    },
    setup: { en: 'Circle or live-bait hooks, light drag, do not strike too hard — fish hooks themselves.', he: 'קרסים circle או live-bait, דראג קל, אל תכu חזק — דג ננעץ בעצmo.' },
  },
];

export const LOCATION_TECHNIQUE_TOPICS: TechniqueTopic[] = [
  {
    id: 'rocky-beach-fishing',
    patterns: [/fish.*rocky beach|rocky beach fishing|rock fishing|from rocks|דיג.*סלע|חוף סלעי|איך לדוג.*סלע/i],
    name: { en: 'Rocky beach fishing', he: 'דיג בחוף סלעי' },
    category: 'location',
    questionClasses: ['technique', 'location', 'safety'],
    directAnswer: {
      en: 'For rocky beaches: stronger leader (rocks cut line), cast into white water and gullies not open sea, shrimp/squid/small jigs, rod tip high, paternoster or float if bottom is very snaggy.',
      he: 'לחוף סלעי: מוביל חזק יותר (סלעים חותכים), הטלה לקצף וגומות לא לים פתוח, שרימפס/דיונון/ג\'יגים קטנים, קצה חכה גבוה, פטרנוסטר או מצוף אם קרקעית מסתbכת.',
    },
    steps: [
      { en: 'Scout in daylight before night sessions — know escape routes.', he: 'סיירu באור יום לפני דיג לילה — דעu דרכי יציאה.' },
      { en: 'Fish the change in wave pattern — edges where foam meets clear water.', he: 'דגו בשינוי דפוס גלים — קצוות שwhere קצף פוגש מים צלולים.' },
      { en: 'Strike on second tap; lift fish away from holes quickly.', he: 'הכu בטפיחה שנייה; הרימu דג מהחורים מהר.' },
    ],
    mistakes: {
      en: 'Standing too close to water; light leaders; long blind casts into snags.',
      he: 'עמידה קרוב מדי למים; מובילים דקים; הטלות עיוורות ארוכות להסתbכויות.',
    },
    safety: [
      { en: 'Non-slip boots; never fish alone on wet rock; check swell forecast.', he: 'נעליים מונעות החלקה; לעולם לא לבד על סלע רטוב; בדקu תחזית גלים.' },
    ],
    beginnerNote: {
      en: 'Start on low platforms in calm sea only — build experience before cliff edges.',
      he: 'התחילu על מרפסות נמוכות בים רגוע בלבד — צברu ניסיון לפני קצוות צוק.',
    },
  },
  {
    id: 'sandy-beach-fishing',
    patterns: [/sandy beach|sand fishing|surf fishing|דיג חול|חוף חולי/i],
    name: { en: 'Sandy beach / surf fishing', he: 'דיג חוף חולי / סרף' },
    category: 'location',
    questionClasses: ['technique', 'location'],
    directAnswer: {
      en: 'Read dark troughs between bars, cast beyond first breaker, paternoster or pulley rig with sandworm/shrimp/sardine, move every 10–15 min without bites.',
      he: 'קראu תעלות כהות בין שברים, הטילu מעבר לגל ראשון, פטרנוסטר או pulley עם תולעת/שרימפס/סרדין, זוזu כל 10–15 דק בלי נגיעות.',
    },
  },
  {
    id: 'pier-fishing',
    patterns: [/pier fishing|fish.*pier|jetty|harbor fishing|דיג.*מזח|רציף|נמל/i],
    name: { en: 'Pier / harbor fishing', he: 'דיג ממזח / נמל' },
    category: 'location',
    questionClasses: ['technique', 'location'],
    directAnswer: {
      en: 'Fish shadow lines and pylons vertically — mullet on bread float, bream on shrimp drop, predators on spoons at dawn along outer edge.',
      he: 'דגu קווי צל ועמודים אנכית — בורי בלחם+מצוף, דניס בשרימפס מורד, טורפים בכפיות בשחר לאורך הקצה.',
    },
    safety: [{ en: 'Stay clear of ship channels and mooring lines.', he: 'התרחקu מנתיבי ספינות וחבלי עגינה.' }],
  },
  {
    id: 'boat-kayak',
    patterns: [/boat fishing|kayak fish|from a boat|דיג.*סירה|קayak|קayak/i],
    name: { en: 'Boat / kayak fishing', he: 'דיג מסירה / קayak' },
    category: 'location',
    questionClasses: ['technique', 'location', 'safety'],
    directAnswer: {
      en: 'Anchor up-current of structure; vertical jigging and live bait over reefs; always wear PFD on kayak — offshore wind pushes kayaks out fast.',
      he: 'עגנu upstream ממבנה; jigging אנכי ופיתiון חי מעל שונit; תמיד PFD בקayak — רוח offshore דוחפת קayak החוצה מהר.',
    },
    safety: [
      { en: 'Check marine forecast; file float plan; carry VHF or phone in dry bag.', he: 'בדקu תחזית יam; דווחu מסלול; VHF או טלפון בשק יבש.' },
    ],
  },
];

export const BEHAVIOR_TOPICS: TechniqueTopic[] = [
  {
    id: 'feeding-times',
    patterns: [/feeding time|when fish feed|best time.*fish|שעות.*אכילה|מתי.*אוכלים/i],
    name: { en: 'Fish feeding times', he: 'שעות אכילה של דגים' },
    category: 'behavior',
    questionClasses: ['technique', 'conditions'],
    directAnswer: {
      en: 'Peak feeding: first light, last light, and tide changes. Midday heat suppresses activity in summer — night sessions for bream on rocks.',
      he: 'שיא אכילה: אור ראשון, אור אחרון, שינוי גאות. חום צהריים מדכא בקיץ — דיג לילה לדניס על סלעים.',
    },
  },
  {
    id: 'moon-phase',
    patterns: [/moon.*fish|moon phase|full moon.*fish|ירח.*דיג|phase.*moon/i],
    name: { en: 'Moon phase and fishing', he: 'מ相位 ירח ודיג' },
    category: 'behavior',
    questionClasses: ['technique', 'conditions'],
    directAnswer: {
      en: 'New and full moons often increase night activity (bream, porgy) but can make daytime slower; strong moonlight pushes fish deeper during day.',
      he: 'ירch חדש ומלא לרוב מעלה פעילות לילה (דניס, פארידה) אך מאט יום; אור ירch חזק דוחף דגים עמוק יותר ביום.',
    },
  },
  {
    id: 'water-clarity',
    patterns: [/water clarity|murky|clear water|שקיפות|מים עכur/i],
    name: { en: 'Water clarity', he: 'שקיפות מים' },
    category: 'behavior',
    questionClasses: ['technique', 'conditions'],
    directAnswer: {
      en: 'Clear water: lighter line, natural baits, slower lure presentation. Murky: scent baits (squid, worm), brighter lures, fish closer to shore.',
      he: 'מים צלולים: חוט קל, פיתiון טבעי, לורים איטיים. עכur: פיתiון ריח (דיונון, תולעת), לורים בוהקים, דגים קרוב יותר לחוף.',
    },
  },
  {
    id: 'barometric',
    patterns: [/pressure.*fish|barometric|לחץ.*אוויר|barometer/i],
    name: { en: 'Barometric pressure', he: 'לחץ ברומטרי' },
    category: 'behavior',
    questionClasses: ['technique', 'conditions'],
    directAnswer: {
      en: 'Falling pressure before a front often triggers a feeding window; stable high pressure can slow fishing; after front passes, first calm period can be excellent.',
      he: 'לחץ יורד לפני front לרוב פותח חלון אכילה; high יציב מאט; אחרי front, תקופה רגועה ראשונה מצוינת.',
    },
  },
];
