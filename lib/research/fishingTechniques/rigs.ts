/**
 * Fishing rigs — paternoster, running sinker, drop shot, float, surf, rock, etc.
 */

import type { TechniqueTopic } from './types';

export const RIG_TOPICS: TechniqueTopic[] = [
  {
    id: 'paternoster',
    patterns: [/paternoster|two.?hook rig|high.?low|fish finder rig|פטרנוסטר|חסקה.*שני/i],
    name: { en: 'Paternoster rig', he: 'ריג פטרנוסטר (Paternoster)' },
    termEn: 'Paternoster',
    category: 'rig',
    questionClasses: ['technique', 'gear'],
    directAnswer: {
      en: 'A paternoster keeps hooks above the bottom on short droppers — ideal for sandy surf and mixed ground where you want bait off the seabed.',
      he: 'פטרנוסטר מחזיק קרסים מעל הקרקעית על י短 droppers — אידיאלי לגלים חוליים וקרקע מעורבת שwhere רוצים פיתיון מעל הקרקעית.',
    },
    steps: [
      { en: 'Main line → swivel → 40–60cm leader to sinker; 2 dropper loops 15–25cm apart with hooks #4–1/0.', he: 'חוט ראשי → סביבל → מוביל 40–60 ס"מ למשקולת; 2 לולאות dropper במרחק 15–25 ס"מ עם קרסים 4#–1/0.' },
      { en: 'Cast beyond the breakers; let sinker anchor and keep line tight.', he: 'הטילו מעבר לגלים; תנו למשקולת לעגן ושמרו חוט מתוח.' },
    ],
    whenBest: { en: 'Sandy beaches, marmor fishing, multiple baits at different heights.', he: 'חופים חוליים, דיג מרמור, כמה פיתיונות בגבהים שונים.' },
    mistakes: { en: 'Dropper loops too long (tangles); hooks too small for surf crabs.', he: 'לולאות dropper ארוכות מדי (סבכים); קרסים קטנים מדי לסרטני גלים.' },
  },
  {
    id: 'running-sinker',
    patterns: [/running sinker|carolina rig|fish finder|חסקת ריצה|ריג ריצה/i],
    name: { en: 'Running sinker rig', he: 'ריג ריצה (Running Sinker)' },
    termEn: 'Running Sinker',
    category: 'rig',
    questionClasses: ['technique', 'gear'],
    directAnswer: {
      en: 'The sinker slides on the main line so fish feel less resistance — best for shy biters like bream on rock and sand.',
      he: 'המשקולת מחליקה על החוט הראשי כך שהדג מרגיש פחות התנגדות — הכי טוב לנושכים חששנים כמו דניס על סלע וחול.',
    },
    steps: [
      { en: 'Bead → sliding sinker → swivel → 50–100cm fluoro leader → hook.', he: 'חרוז → משקולת מחליקה → סביבל → מוביל פלואורו 50–100 ס"מ → קרס.' },
      { en: 'Use lighter sinker than fixed rig — fish should not feel the weight when biting.', he: 'משקולת קלה יותר מחסקה קבועה — הדג לא צריך להרגיש את המשקל בנגיעה.' },
    ],
    whenBest: { en: 'Bream, marmor, sole — anywhere fish drop bait on feeling weight.', he: 'דניס, מרמור, דג לשון — בכל מקום שדגים פולטים על משקolת.' },
  },
  {
    id: 'drop-shot',
    patterns: [/drop shot|drop.?shot|דרופ.?שוט|dropper shot/i],
    name: { en: 'Drop shot rig', he: 'ריג דרופ שוט (Drop Shot)' },
    termEn: 'Drop Shot',
    category: 'rig',
    questionClasses: ['technique', 'lure', 'gear'],
    directAnswer: {
      en: 'Weight on the bottom, hook tied 30–50cm above — bait or soft plastic swims naturally above structure. Excellent for finicky fish near rocky bottom.',
      he: 'משקolת בתחתית, קרס 30–50 ס"מ מעל — פיתיון או סיליקון שוחה טבעי מעל מבנה. מצוין לדגים בררניים ליד קרקעית סלעית.',
    },
    setup: {
      en: 'Light rod 2.1–2.7m, braid 8–15lb, palomar knot hook, sinker clip at tag end.',
      he: 'חכה קלה 2.1–2.7 מ\', קלוע 8–15 ליברות, קשר Palomar לקרס, קליפ משקolת בקצה.',
    },
    expertNote: {
      en: 'Adjust hook height to strike zone — higher in tall weeds, lower on clean sand patches between rocks.',
      he: 'התאימו גובה קרס ל-strike zone — גבוה יותר בעשbיה, נמוך יותר על patches חול נקיים בין סלעים.',
    },
  },
  {
    id: 'float-rig',
    patterns: [/float rig|waggler|bobber|מצוף|חסקת מצוף|דיג.*מצוף/i],
    name: { en: 'Float rig', he: 'חסקת מצוף (Float Rig)' },
    termEn: 'Float Rig',
    category: 'rig',
    questionClasses: ['technique', 'gear', 'bait'],
    directAnswer: {
      en: 'A float suspends bait at a set depth — essential for mullet, shallow bream, and fishing over snaggy rock without losing rigs.',
      he: 'מצוף מרחיק פיתיון בעומק קבוע — חיוני לבורי, דניס רדוד, ודיג מעל סלעים עם הסתbכויות בלי לאבד חסקות.',
    },
    steps: [
      { en: 'Set depth so bait sits just above bottom or mid-water; use smallest float that still casts.', he: 'כוונו עומק כך שהפיתiון מעל הקרקעית או באמצע המים; מצוף קטן ביותר שעדיין מאפשר הטלה.' },
      { en: 'Mullet: bread under tiny float, line 0.20–0.25mm, hook #8–#12.', he: 'בורי: לחם מתחת למצוף זעיר, חוט 0.20–0.25 מ"מ, קרס 8#–12#.' },
    ],
  },
  {
    id: 'rocky-beach-rig',
    patterns: [/rig.*rocky|rocky beach rig|what rig.*rock|ריג.*סלע|איזה ריג.*חוף/i, /איזה ריג מתאים/i],
    name: { en: 'Rocky beach rigs', he: 'ריגים לחוף סלעי' },
    category: 'rig',
    questionClasses: ['technique', 'location', 'gear'],
    directAnswer: {
      en: 'On rocky beaches use a stronger leader, short casts into white water, and either a float rig or running sinker with weak-link — paternoster if bottom is mixed sand pockets.',
      he: 'בחוף סלעי: מוביל חזק יותר, הטלות קצרות לקצף, וחסקת מצוף או ריצה עם חוליה מקריבה — פטרנוסטר אם יש כיסי חול.',
    },
    steps: [
      { en: 'Leader 0.40–0.50mm fluoro minimum — rocks cut thin line instantly.', he: 'מוביל 0.40–0.50 מ"מ פלואורו מינימום — סלעים חותכים חוט דק מיד.' },
      { en: 'Cast near channels and rock edges, not open water.', he: 'הטילו ליד תעלות וקצוות סלע, לא למים פתוחים.' },
      { en: 'Keep rod tip high to lift line over ledges.', he: 'החזיקו קצה חכה גבוה כדי להרים חוט מעל מדפים.' },
    ],
    setup: {
      en: 'Stiff rod 3.0–3.9m, hooks #2–2/0, baits: shrimp, squid strips, small jigs.',
      he: 'חכה קשיחה 3.0–3.9 מ\', קרסים 2#–2/0, פיתiון: שרימפס, דיונון, ג\'יגים קטנים.',
    },
    mistakes: {
      en: 'Long surf casts into snag city; light leaders; fishing too close to dumping waves.',
      he: 'הטלות סרף ארוכות לעיר הסתbכויות; מובילים דקים; דיג קרוב מדי לגלים שוברים.',
    },
    safety: [
      { en: 'Non-slip boots mandatory; never fish alone on wet rock at night.', he: 'נעליים מונעות החלקה חובה; לעולם אל תדגו לבד על סלע רטוב בלילה.' },
    ],
  },
  {
    id: 'surf-rig',
    patterns: [/surf rig|surfcasting rig|surf cast rig|ריג סרף|חסקה.*סרף/i],
    name: { en: 'Surfcasting rig', he: 'ריג סרף (Surfcasting)' },
    termEn: 'Surfcasting',
    category: 'rig',
    questionClasses: ['technique', 'gear', 'location'],
    directAnswer: {
      en: 'Classic sandy-beach rig: long shock leader, pyramid or grip sinker 100–200g, one or two hooks on droppers or a single pulley rig for big baits.',
      he: 'ריג קלאסי לחוף חולי: מוביל הלם ארוך, משקolת פירמידה או קפיצים 100–200 גרם, קרס אחד או שניים על droppers או pulley לפיתiונות גדולים.',
    },
    setup: {
      en: '4m rod, 5000–8000 reel, 20–30lb braid + 4m 0.40mm leader.',
      he: 'חכה 4 מ\', סליל 5000–8000, קלוע 20–30 ליברות + מוביל 4 מ\' 0.40 מ"מ.',
    },
  },
  {
    id: 'sabiki',
    patterns: [/sabiki|סabiki|סabiki|סביקי/i],
    name: { en: 'Sabiki rig', he: 'ריג סabiki (Sabiki)' },
    termEn: 'Sabiki',
    category: 'rig',
    questionClasses: ['technique', 'bait'],
    directAnswer: {
      en: 'Multi-hook feather/flasher rig for catching live bait (sardines, mackerel) — fish vertically from pier or boat, gentle jigging motion.',
      he: 'ריג רב-קרסים עם נוצות/פלאshers ללכידת פיתiון חי (סרדין, מקרל) — דיג אנכי ממזח או סירה, תנועת jigging עדינה.',
    },
    whenBest: { en: 'Piers and calm water; check local rules — some areas restrict multi-hook rigs.', he: 'מזחים ומים רגועים; בדקו תקנות מקומיות — באזורים מסוימים מגבילים ריגים רב-קרסים.' },
  },
  {
    id: 'texas-carolina',
    patterns: [/texas rig|carolina rig|טקסס|קרולינה/i],
    name: { en: 'Texas / Carolina rig', he: 'ריג טקסס / קarolina (Texas / Carolina)' },
    termEn: 'Texas Rig',
    category: 'rig',
    questionClasses: ['technique', 'lure'],
    directAnswer: {
      en: 'Texas: bullet weight + weedless hook for soft plastics in snags. Carolina: sliding weight + leader for bottom crawling — both work for bass-style presentations in Israeli harbors and sand patches.',
      he: 'Texas: משקolת bullet + קרס weedless לסיליקon בהסתbכויות. Carolina: משקolת מחליקה + מוביל לזחילה על הקרקעית — שניהם לsoft plastics בנמלים וכיסי חול.',
    },
  },
];
