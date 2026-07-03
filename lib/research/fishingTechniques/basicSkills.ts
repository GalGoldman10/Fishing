/**
 * Basic fishing skills — casting, hookset, fighting, drag, landing, reading water, etc.
 */

import type { TechniqueTopic } from './types';

export const BASIC_SKILL_TOPICS: TechniqueTopic[] = [
  {
    id: 'fishing-methods-overview',
    patterns: [
      /list.*(fishing )?(method|technique|style)|fishing methods|types of fishing|kinds of fishing|what are the (main )?(fishing )?(method|technique)/i,
      /שיטות דיג|שיטות דייג|רשום.*שיט|רשימ.*שיט|אילו שיטות|מה השיטות|תרשום.*שיט|תוכל.*רשום.*שיט/i,
    ],
    name: { en: 'Fishing methods overview', he: 'שיטות דיג' },
    category: 'skill',
    questionClasses: ['technique', 'beginner'],
    directAnswer: {
      en: 'The main shore fishing methods in Israel are: (1) Jarjour/spinning with artificial lures, (2) natural-bait bottom fishing with rigs, (3) surf casting on wide sandy beaches, (4) shore jigging with metal jigs, (5) float fishing from piers and rocks, and (6) light lure work at dawn/dusk on breakwaters. Pick one method first — ask me about any for gear and step-by-step technique.',
      he: 'שיטות הדיג העיקריות מהחוף בישראל: (1) ג\'רג\'ור/ז\'ירז\'ור עם דמויים, (2) דיג תחתית עם פיתיון טבעי וריגים, (3) הטלת סרף בחופים חוליים, (4) ג\'יגינג מהחוף עם ג\'יג מתכת, (5) דיג עם צף ממזחים וסלעים, (6) דיג קל עם דמויים בשחר/דמדומים על שוברים. בחרו שיטה אחת להתחיל — שאלו אותי על כל אחת לציוד וטכניקה צעד-אחר-צעד.',
    },
    steps: [
      {
        en: 'Jarjour (spinning): light rod 5–25g, small reel, quality braid + fluoro leader, minnow/jig/topwater — hundreds of retrieves per session. Best for predators: bass, bluefish, barracuda, sargo.',
        he: 'ג\'רג\'ור (ז\'ירז\'ור): מקל light 5–25 גרם, סליל קטן, בד איכותי + מוביל פלואורו, minnow/jig/topwater — מאות הובלות ביציאה. מתאים לטורפים: לוקוס, גומבר, ברקודה, סרגוס.',
      },
      {
        en: 'Natural bait bottom fishing: surf or medium rod, paternoster or running-sinker rig, shrimp/squid/worms. Best on sandy and mixed shores for bream, mullet, grouper (release protected species).',
        he: 'דיג תחתית עם פיתיון: חכת סרף או בינונית, ריג פטרנוסטר או ריצה, שרימפס/דיונון/תולעים. מתאים לחול ומעורב — דניס, בורי, לוקוס (שחררו מינים מוגנים).',
      },
      {
        en: 'Surf casting: long rod 3.6–4.5m, heavy sinker 100–150g, cast beyond the first bar on wide beaches.',
        he: 'הטלת סרף: חכה ארוכה 3.6–4.5 מ\', משקולת 100–150 גרם, הטלה מעבר לשבר הראשון בחופים רחבים.',
      },
      {
        en: 'Shore jigging: medium rod, metal jig, lift-and-drop retrieve — strikes often on the fall.',
        he: 'ג\'יגינג מהחוף: מקל בינוני, ג\'יג מתכת, הרמה-הורדה — נגיעות לרוב בנפילה.',
      },
      {
        en: 'Float fishing: fixed or sliding float, live or dead bait — excellent from piers and rocky coves.',
        he: 'דיג עם צף: צף קבוע או מחליק, פיתיון חי או מת — מצוין ממזחים ומפרצונים סלעיים.',
      },
    ],
    setup: {
      en: 'Beginner starter path: pick ONE method. For all-round shore start with natural bait + paternoster; for active fishing try jarjour with one light rod and 2–3 lures.',
      he: 'מסלול מתחילים: בחרו שיטה אחת. לדיג כללי מהחוף — פיתיון טבעי + פטרנוסטר; לדיג אקטיבי — ג\'רג\'ור עם מקל light ו-2–3 דמויים.',
    },
    beginnerNote: {
      en: 'Ask follow-ups like "how do I start jarjour?" or "what rig for shrimp on a rocky beach?" — I\'ll give full setup and steps.',
      he: 'שאלו המשך כמו "איך מתחילים ג\'רג\'ור?" או "איזה ריג לשרימפס בחוף סלעי?" — אתן ציוד מלא ושלבים.',
    },
  },
  {
    id: 'cast-better',
    patterns: [/cast better|how to cast|improve.*cast|casting distance|surf cast|הטלה|איך להטיל|להטיל טוב/i],
    name: { en: 'Surf casting', he: 'הטלת סרף' },
    category: 'skill',
    questionClasses: ['technique', 'beginner', 'gear'],
    directAnswer: {
      en: 'Good beach casting is about timing the wave, loading the rod, and releasing at 45° — not brute force.',
      he: 'הטלה טובה מהחוף היא תזמון עם הגל, טעינת החכה ושחרור ב-45° — לא כוח גס.',
    },
    steps: [
      { en: 'Stand sideways to the target with feet shoulder-width apart; keep the sinker hanging 30–50cm below the tip.', he: 'עמדו בצד ליעד, רגליים ברוחב כתפיים; השאירו את המשקולת 30–50 ס"מ מתחת לקצה.' },
      { en: 'Swing the rod back smoothly — on surf rods, use a pendulum swing or overhead cast; never snap the tip.', he: 'הניעו את החכה לאחור בחלקות — בחכות סרף, תנועת מטוטלת או הטלה מעל הראש; לעולם אל תשברו את הקצה.' },
      { en: 'Accelerate forward and release when the rod passes ~45° — the sinker should pull line off the spool, not the rod whipping empty.', he: 'האיצו קדימה ושחררו כשהחכה עוברת ~45° — המשקולת צריכה למשוך חוט מהסליל, לא שהחכה תצלף ריקה.' },
      { en: 'Follow through toward the target; tighten the bail immediately and keep the rod high so line clears the waves.', he: 'המשיכו את התנועה לכיוון היעד; סגרו את הבייל מיד והחזיקו את החכה גבוהה כדי שהחוט יעבור מעל הגלים.' },
    ],
    setup: {
      en: '3.6–4.5m surf rod, braid or mono 0.30–0.35mm, pyramid sinker matched to wind (100–150g typical).',
      he: 'חכת סרף 3.6–4.5 מ\', חוט קלוע או מונו 0.30–0.35 מ"מ, משקולת פירמידה לפי הרוח (100–150 גרם בדרך כלל).',
    },
    mistakes: {
      en: 'Casting into onshore wind with too light a sinker; releasing too late (sinker flies up); fishing with loops on the spool.',
      he: 'הטלה לרוח קדמית עם משקולת קלה מדי; שחרור מאוחר (משקולת עפה למעלה); דיג עם לולאות על הסליל.',
    },
    whenBest: {
      en: 'Practice on calm days first. Long casts matter most on wide sandy beaches where fish feed beyond the first bar.',
      he: 'תרגלו בימים רגועים קודם. הטלות ארוכות חשובות ביותר בחופים חוליים רחבים שבהם הדגים אוכלים מעבר לשבר הראשון.',
    },
    beginnerNote: {
      en: 'Start with a 3.6m rod and 120g sinker — shorter rods are easier to control while you learn timing.',
      he: 'התחילו עם חכה 3.6 מ\' ומשקולת 120 גרם — חכות קצרות יותר קלות לשליטה בזמן שלומדים תזמון.',
    },
  },
  {
    id: 'hookset',
    patterns: [/set the hook|hook set|when to strike|strike timing|הכאה|מתי להכות|איך להכות/i],
    name: { en: 'Hook setting', he: 'הכאת דג' },
    category: 'skill',
    questionClasses: ['technique', 'beginner'],
    directAnswer: {
      en: 'Most lost fish come from striking too early or too hard — feel the weight of the fish before you lift.',
      he: 'רוב הדגים שמתפספסים — הכאה מוקדמת מדי או חזקה מדי. הרגישו את משקל הדג לפני שמרימים.',
    },
    steps: [
      { en: 'Bottom fishing: wait for two distinct taps or a steady pull — then lift the rod firmly 30–50cm, don\'t yank overhead.', he: 'דיג תחתית: המתינו לשתי נגיעות ברורות או משיכה יציבה — ואז הרימו את החכה 30–50 ס"מ, אל תמשכו חזק מעל הראש.' },
      { en: 'Lure fishing: strike on the change in resistance when the fish turns — often a sudden heaviness, not every tap.', he: 'דיג לורים: הכו בשינוי ההתנגדות כשהדג פונה — לרוב כבדות פתאומית, לא בכל נגיעה.' },
      { en: 'Keep the line tight before and after the strike — slack line means missed hooks.', he: 'שמרו על חוט מתוח לפני ואחרי ההכאה — חוט רופף = קרסים מפספסים.' },
    ],
    mistakes: {
      en: 'Striking on the first nibble (often a small picker); striking with slack line; using a rod that is too soft for the hook size.',
      he: 'הכאה על הנגיסה הראשונה (לרוב דג קטן); הכאה עם חוט רופף; חכה רכה מדי לגודל הקרס.',
    },
  },
  {
    id: 'lose-fish',
    patterns: [/lose fish|losing fish|fish get away|fish escape|release.*hook|משתחרר|משחררים|מפספס|למה.*משתחרר/i],
    name: { en: 'Why fish get off the hook', he: 'למה דגים משתחררים' },
    category: 'skill',
    questionClasses: ['technique', 'beginner'],
    directAnswer: {
      en: 'Fish usually escape because of dull hooks, wrong drag, slack line during the fight, or lifting too early before the hook is set.',
      he: 'דגים בדרך כלל משתחררים בגלל קרסים קהים, דראג לא נכון, חוט רופף במהלך המאבק, או הרמה מוקדמת לפני שהקרס ננעץ.',
    },
    steps: [
      { en: 'Check hook points — they should catch on your thumbnail. Replace or sharpen often.', he: 'בדקו חודי קרסים — הם צריכים להיתפס על הציפורן. החליפו או חדדו לעיתים קרובות.' },
      { en: 'Set drag to ~25–30% of line strength — the fish should pull line smoothly, not snap or stall.', he: 'כוונו דראג ל-~25–30% מחוזק החוט — הדג צריך למשוך חוט בחלקות, לא להינתק או להיתקע.' },
      { en: 'Keep constant pressure — pump the rod down and reel on the way up; never point the rod at the fish with slack.', he: 'שמרו לחץ קבוע — הורידו את החכה וסללו בדרך למעלה; לעולם אל תכוונו את החכה לדג עם חוט רופף.' },
      { en: 'Use a landing net for fish over 1kg — lifting on the line alone pulls hooks free.', he: 'השתמשו ברשת מעל 1 ק"ג — הרמה על החוט בלבד מוציאה קרסים.' },
    ],
    mistakes: {
      en: 'Drag too tight (break-offs) or too loose (fish spits hook); reeling while the fish runs; lifting fish vertically on light hooks.',
      he: 'דראג חזק מדי (ניתוקים) או רופף מדי (דג פולט); סלילה בזמן שהדג בורח; הרמת דג אנכית על קרסים קלים.',
    },
  },
  {
    id: 'drag-setting',
    patterns: [/drag|how.*drag|set drag|דראג/i],
    name: { en: 'Drag setting', he: 'כיוון דראג' },
    category: 'skill',
    questionClasses: ['technique', 'gear'],
    directAnswer: {
      en: 'Drag should let the fish pull line under steady pressure without breaking — start at 25–30% of line breaking strength.',
      he: 'הדראג צריך לאפשר לדג למשוך חוט תחת לחץ יציב בלי להינתק — התחילו ב-25–30% מחוזק שבירת החוט.',
    },
    steps: [
      { en: 'Pull line by hand with the rod tip up — you should feel steady resistance, not sudden lock or free spin.', he: 'משכו חוט ביד עם קצה החכה למעלה — צריך להרגיש התנגדות יציבה, לא נעילה פתאומית או סיבוב חופשי.' },
      { en: 'Increase slightly for snaggy rock; decrease for light leaders and small hooks.', he: 'הגבירו מעט בסלעים עם הסתבכויות; הורידו למובילים קלים וקרסים קטנים.' },
    ],
  },
  {
    id: 'read-water',
    patterns: [/read the water|reading water|where fish hide|where to cast|איפה לזרוק|איך לקרוא.*מים|איפה הדגים/i],
    name: { en: 'Reading the water', he: 'קריאת המים' },
    category: 'skill',
    questionClasses: ['technique', 'location'],
    directAnswer: {
      en: 'Fish concentrate where food and cover meet — look for color changes, ripples, white water, and structure edges, not random open water.',
      he: 'דגים מתרכזים where מזון ומחסה נפגשים — חפשו שינויי צבע, קמטים, קצף וקצוות מבנה, לא מים פתוחים אקראיים.',
    },
    steps: [
      { en: 'Sandy beach: darker water = deeper troughs between bars — cast there, not onto the bar itself.', he: 'חוף חולי: מים כהים = תעלות עמוקות בין שברים — הטילו שם, לא על השבר עצמו.' },
      { en: 'Rocky shore: fish the white-water edge, gullies, and where waves break differently — not the flat open sea.', he: 'חוף סלעי: דגו בקצה הקצף, בגומות, וwhere הגלים נשברים אחרת — לא בים פתוח שטוח.' },
      { en: 'Pier: shadow lines, pylons, and the seam where structure meets sand.', he: 'מזח: קווי צל, עמודים, והתפר שבו המבנה פוגש חול.' },
    ],
  },
  {
    id: 'wind-fishing',
    patterns: [/fish.*wind|wind.*fish|onshore|offshore wind|רוח.*דיג|דיג.*רוח/i],
    name: { en: 'Fishing with wind', he: 'דיג ברוח' },
    category: 'skill',
    questionClasses: ['technique', 'conditions'],
    directAnswer: {
      en: 'Light offshore wind (from land) often improves fishing by pushing bait toward shore; strong onshore wind makes casting hard and stirs sand — use heavier sinkers or fish the lee side.',
      he: 'רוח קלה מהיבשה (offshore) לרוב משפרת דיג כי דוחפת פיתיון לחוף; רוח קדמית חזקה מקשה על הטלה ומערבבת חול — השתמשו במשקולות כבדות יותר או דגו בצד המוגן.',
    },
    whenBest: {
      en: 'NW or light breeze is ideal on the Israeli coast. Avoid casting into strong onshore wind — fish the sheltered end of the beach instead.',
      he: 'צפון-מערב או בריזה קלה אידיאליים בחוף הישראלי. הימנעו מהטלה לרוח קדמית חזקה — דגו בקצה המוגן של החוף.',
    },
  },
  {
    id: 'waves-fishing',
    patterns: [/wave.*affect|how.*wave|fish.*wave|גלים.*דיג|דיג.*גלים|גל.*משפיע/i],
    name: { en: 'How waves affect fishing', he: 'איך גלים משפיעים על הדיג' },
    category: 'behavior',
    questionClasses: ['technique', 'conditions'],
    directAnswer: {
      en: 'Moderate surf (0.3–0.8m) stirs food into the water and activates predators — flat glassy sea is often slower on sand; heavy surf is dangerous on rocks.',
      he: 'גלים בינוניים (0.3–0.8 מ\') מערבבים מזון במים ומעירים טורפים — ים "שמן" לגמרי לרוב איטי בחול; גלים כבדים מסוכנים על סלעים.',
    },
    steps: [
      { en: 'Sandy beaches: fish the trough behind the first breaker — waves push sand worms and crabs there.', he: 'חופים חוליים: דגו בתעלה מאחורי הגל הראשון — גלים דוחפים תולעים וסרטנים לשם.' },
      { en: 'After a storm, the first calm day is prime — the surf has churned the bottom.', he: 'אחרי סערה, היום הרגוע הראשון הוא זמן זהב — הגלים הפכו את הקרקעית.' },
      { en: 'Rock platforms: do not fish if waves wash over your spot — wait for swell under ~0.5m.', he: 'מרפסות סלע: אל תדגו אם גלים שוטפים את העמדה — המתינו לגל מתחת ~0.5 מ\'.' },
    ],
    safety: [
      { en: 'Never turn your back on the sea on rocks — rogue sets happen without warning.', he: 'לעולם אל תפנו גב לים על סלעים — סטים פתאומיים קורים בלי אזהרה.' },
    ],
  },
  {
    id: 'tide-current',
    patterns: [/tide|current|גאות|שפל|זרם|current.*fish/i],
    name: { en: 'Tide and current', he: 'גאות, שפל וזרם' },
    category: 'behavior',
    questionClasses: ['technique', 'conditions'],
    directAnswer: {
      en: 'Moving water brings food — fish often feed hardest on the change of tide and where current hits structure (breakwater ends, river mouths, channel edges).',
      he: 'מים נ moving מביאים מזון — דגים לרוב אוכלים הכי חזק בשינוי גאות/שפל וwhere זרם פוגע במבנה (קצות שוברים, שפכי נחל, קצוות תעלה).',
    },
    steps: [
      { en: 'Outgoing tide: predators wait at channel exits where bait is pulled out.', he: 'שפל יורד: טורפים ממתינים ביציאות תעלה שwhere פיתיון נמשך החוצה.' },
      { en: 'Incoming tide: fish move onto flats and shallows to feed — good for surf casting onto rising water.', he: 'גאות עולה: דגים נכנסים למישורים רדודים — טוב להטלת סרף על מים עולים.' },
      { en: 'Use heavier sinkers when current is strong so bait stays in the strike zone.', he: 'השתמשו במשקולות כבדות יותר כשהזרם חזק כדי שהפיתיון יישאר באזור הנגיעות.' },
    ],
  },
  {
    id: 'avoid-snags',
    patterns: [/snag|stuck.*rock|lose.*rig|avoid.*rock|הסתבכ|נתקע.*סלע|איך לא להיתקע/i],
    name: { en: 'Avoiding snags on rocks', he: 'הימנעות מהסתבכות בסלעים' },
    category: 'skill',
    questionClasses: ['technique', 'safety', 'location'],
    directAnswer: {
      en: 'Use a weak-link ("rotten bottom") sinker attachment, keep the rod tip high, and cast short into gullies — not blindly into open rocky bottom.',
      he: 'השתמשו בחיבור משקולת "חוליה מקריבה", החזיקו קצה חכה גבוה, והטילו קצר לגומות — לא עיוור לקרקעית סלעית פתוחה.',
    },
    steps: [
      { en: 'Tie sinker to lighter line (6–8lb) that breaks before your main rig — saves hooks and swivels.', he: 'קשרו משקולת לחוט קל יותר (6–8 ליברות) שנשבר לפני החסקה — חוסך קרסים וסביבלים.' },
      { en: 'Float rig lifts bait above snags; paternoster keeps hooks slightly off bottom.', he: 'חסקת מצוף מרימה פיתיון מעל הסתבכויות; פטרנוסטר שומר קרסים מעט מעל הקרקעית.' },
      { en: 'If snagged, point rod at the snag and pull steady — jerking buries hooks deeper.', he: 'אם נתקע, כוונו חכה לנקודה ומשכו יציב — jerk קובר קרסים עמוק יותר.' },
    ],
    safety: [
      { en: 'Do not wade onto wet rocks to free a snag — waves plus slippery rock are the #1 rock-fishing accident.', he: 'אל תיכנסו לסלעים רטובים לשחרר הסתבכות — גלים + סלע חלק = תאונה מספר 1 בדיג סלעים.' },
    ],
  },
  {
    id: 'leader-length',
    patterns: [/leader length|how long.*leader|מוביל.*אורך|אורך.*מוביל/i],
    name: { en: 'Leader length', he: 'אורך מוביל' },
    category: 'skill',
    questionClasses: ['gear', 'technique'],
    directAnswer: {
      en: 'Surf: 3–4m shock leader of 0.35–0.45mm fluoro; rock: 1–2m heavy 0.40–0.50mm; lure: 0.8–1.5m 0.30–0.40mm.',
      he: 'סרף: מוביל הלם 3–4 מ\' 0.35–0.45 מ"מ פלואורו; סלע: 1–2 מ\' עבה 0.40–0.50 מ"מ; לור: 0.8–1.5 מ\' 0.30–0.40 מ"מ.',
    },
  },
  {
    id: 'sinker-weight',
    patterns: [/sinker weight|how heavy.*sinker|משקולת|כמה.*משקול/i],
    name: { en: 'Sinker weight choice', he: 'בחירת משקולת' },
    category: 'skill',
    questionClasses: ['gear', 'technique'],
    directAnswer: {
      en: 'Match sinker to wind and current — too light drifts out of the zone; too heavy kills natural bait movement.',
      he: 'התאימו משקולת לרוח ולזרם — קלה מדי נסחפת מהאזור; כבדה מדי הורגת תנועת פיתיון טבעית.',
    },
    steps: [
      { en: 'Calm sand: 80–120g pyramid. Moderate surf: 120–150g. Strong wind/onshore: 150–200g grip leads.', he: 'חול רגוע: פירמידה 80–120 גרם. גלים בינוניים: 120–150. רוח קדמית חזקה: קפיצים 150–200.' },
      { en: 'Rock fishing in calm water: 60–100g breakout or running sinker.', he: 'דיג סלעים במים רגועים: breakout או ריצה 60–100 גרם.' },
    ],
  },
  {
    id: 'hook-size',
    patterns: [/hook size|which hook|what size hook|גודל קרס|איזה קרס/i],
    name: { en: 'Hook size choice', he: 'בחירת גודל קרס' },
    category: 'skill',
    questionClasses: ['gear', 'technique'],
    directAnswer: {
      en: 'Match hook to bait size and target mouth — small baits on #6–#2, surf sardine on 1/0–4/0, bream on #2–1/0 long shank.',
      he: 'התאימו קרס לגודל פיתיון ולפה של המטרה — פיתיונות קטנים 6#–2#, סרדין סרף 1/0–4/0, דניס 2#–1/0 רגל ארוכה.',
    },
  },
  {
    id: 'shore-line',
    patterns: [/line.*shore|what line.*beach|shore fishing line|איזה חוט.*חוף|חוט.*דיג חוף/i],
    name: { en: 'Line for shore fishing', he: 'חוט לדיג מהחוף' },
    category: 'skill',
    questionClasses: ['gear'],
    directAnswer: {
      en: 'Mediterranean shore: mono 0.30–0.35mm or braid 20–30lb with 3–4m fluoro shock leader; go heavier near rocks.',
      he: 'חוף ים תיכון: מונו 0.30–0.35 מ"מ או קלוע 20–30 ליברות עם מוביל פלואורו 3–4 מ\' — עבה יותר ליד סלעים.',
    },
    setup: {
      en: 'Braid for distance and feel; mono for abrasion on rock. Never fish rocks with thin braid alone — always fluoro leader.',
      he: 'קלוע למרחק ותחושה; מונו לעמידות בסלע. לעולם אל תדגו סלעים עם קלוע דק בלבד — תמיד מוביל פלואורו.',
    },
  },
  {
    id: 'release-fish',
    patterns: [/release fish|catch and release|שחרור דג|לשחרר דג/i],
    name: { en: 'Safe fish release', he: 'שחרור דג בטוח' },
    category: 'skill',
    questionClasses: ['technique', 'safety', 'regulation'],
    directAnswer: {
      en: 'Wet your hands, support the belly, remove the hook quickly with pliers, and revive the fish in the water before letting go — never hold protected species out of water long.',
      he: 'הרטיבו ידיים, תמכו בבטן, הוציאו קרס מהר עם פלייר, והחיו את הדג במים לפני שחרור — לעולם אל תחזיקו מינים מוגנים מחוץ למים זמן רב.',
    },
    steps: [
      { en: 'Use barbless or crushed-barb hooks for easier release.', he: 'השתמשו בקרסים ללא barb או עם barb מרוסק לשחרור קל.' },
      { en: 'If deeply hooked, cut the line close — do not tear gills.', he: 'אם נבלע עמוק, חתכו את החוט קרוב — אל תקרעו זימים.' },
    ],
  },
];
