/**
 * Expert fishing knowledge base for the Israeli Mediterranean coast.
 *
 * This is the domain knowledge an experienced local fisherman would use:
 * habitat-specific tactics (sandy / rocky / pier), bait profiles (what each
 * bait catches, how to hook it, when it shines), per-species tactics, and
 * seasonal behavior. All content is bilingual (EN/HE) and is composed into
 * structured answers by expertAnswerBuilder.ts — never shown as generic tips.
 */

export type Lang = 'en' | 'he';
export type Bilingual = { en: string; he: string };

// ---------------------------------------------------------------------------
// Habitat tactics
// ---------------------------------------------------------------------------

export type HabitatKey = 'sandy' | 'rocky' | 'pier' | 'mixed';

export interface HabitatSetup {
  rod: Bilingual;
  reel: Bilingual;
  line: Bilingual;
  leader: Bilingual;
  hook: Bilingual;
  bait: Bilingual;
}

export interface HabitatTactics {
  key: HabitatKey;
  structure: Bilingual;
  setup: HabitatSetup;
  techniqueSteps: Bilingual[];
  bestTime: Bilingual;
  typicalFish: string[]; // species keys from SPECIES_TACTICS
  extraTips: Bilingual[];
  safety: Bilingual[];
}

export const HABITAT_TACTICS: Record<HabitatKey, HabitatTactics> = {
  sandy: {
    key: 'sandy',
    structure: {
      en: 'Open sandy beach with a gradual slope. Fish patrol the troughs between sandbars and the first wave break, where food gets stirred up.',
      he: 'חוף חולי פתוח עם שיפוע הדרגתי. הדגים סורקים את התעלות בין שברי החול ואת קו הגל הראשון, שם נחשף מזון.',
    },
    setup: {
      rod: { en: 'Surf rod 3.9–4.5m, casting weight 100–200g', he: 'חכת סרף 3.9–4.5 מ\', משקל הטלה 100–200 גרם' },
      reel: { en: 'Spinning reel 5000–8000 with a long-cast spool', he: 'סליל ספינינג 5000–8000 עם סלילה ארוכת-הטלה' },
      line: { en: 'Braid 20–30lb (0.16–0.20mm) or mono 0.30–0.35mm', he: 'חוט קלוע 20–30 ליברות (0.16–0.20 מ"מ) או מונופילמנט 0.30–0.35 מ"מ' },
      leader: { en: 'Fluorocarbon shock leader 0.35–0.45mm, 3–4m long', he: 'מוביל פלואורוקרבון 0.35–0.45 מ"מ באורך 3–4 מ\'' },
      hook: { en: 'Two-hook paternoster rig, hooks #4–1/0 long shank, pyramid or grip sinker 100–150g', he: 'חסקה עם שני קרסים (פטרנוסטר), קרסים 4#–1/0 רגל ארוכה, משקולת פירמידה או קפיצים 100–150 גרם' },
      bait: { en: 'Sandworms, fresh shrimp, squid strips, or half sardine', he: 'תולעי חול, שרימפס טרי, רצועות דיונון או חצי סרדין' },
    },
    techniqueSteps: [
      { en: 'Read the water first: darker patches between the breakers are deeper troughs — that is where fish feed.', he: 'קראו את המים לפני ההטלה: כתמים כהים בין הגלים הם תעלות עמוקות — שם הדגים אוכלים.' },
      { en: 'Cast beyond the first wave break into the trough, let the sinker settle, then tighten the line.', he: 'הטילו מעבר לקו הגל הראשון אל תוך התעלה, תנו למשקולת להתייצב ומתחו את החוט.' },
      { en: 'Hold the rod or use a tripod with the tip high to keep line above the waves.', he: 'החזיקו את החכה או השתמשו בחצובה עם קצה גבוה כדי לשמור את החוט מעל הגלים.' },
      { en: 'No bites within 10–15 minutes? Move 30–50m along the beach or change casting distance before changing bait.', he: 'אין נגיעות תוך 10–15 דקות? זוזו 30–50 מ\' לאורך החוף או שנו את מרחק ההטלה לפני שמחליפים פיתיון.' },
    ],
    bestTime: {
      en: 'First two hours after sunrise and the last hour before dark. A light onshore breeze and waves of 0.3–0.8m stir food into the water — flat, glassy sea is usually slower on sand.',
      he: 'השעתיים הראשונות אחרי הזריחה והשעה האחרונה לפני החושך. בריזה קלה מהים וגלים של 0.3–0.8 מ\' מערבבים מזון במים — ים "שמן" לגמרי בדרך כלל חלש יותר בחול.',
    },
    typicalFish: ['marmor', 'seabass', 'leerfish', 'sole', 'redmullet'],
    extraTips: [
      { en: 'After a storm, the first calm day is prime time on sandy beaches — the surf has churned up worms and crabs.', he: 'אחרי סערה, היום הרגוע הראשון הוא זמן זהב בחופים חוליים — הים חשף תולעים וסרטנים.' },
      { en: 'Use a rolling sinker instead of a pyramid when you want the bait to drift naturally along the trough.', he: 'השתמשו במשקולת מתגלגלת במקום פירמידה כשרוצים שהפיתיון ייסחף טבעי לאורך התעלה.' },
    ],
    safety: [
      { en: 'Watch for sudden larger sets of waves when standing close to the water line.', he: 'שימו לב לסטים פתאומיים של גלים גדולים כשעומדים קרוב לקו המים.' },
    ],
  },

  rocky: {
    key: 'rocky',
    structure: {
      en: 'Rock platforms, gullies and channels. Fish hold tight to structure — bream and porgy feed on crabs and shellfish washed from the rocks.',
      he: 'מרפסות סלע, גומות ותעלות. הדגים צמודים למבנה — דניס ופארידה ניזונים מסרטנים ורכיכות שנשטפים מהסלעים.',
    },
    setup: {
      rod: { en: 'Stiff rock-fishing rod 3.0–3.9m with strong backbone for lifting fish over ledges', he: 'חכת סלעים קשיחה 3.0–3.9 מ\' עם עמוד שדרה חזק להרמת דגים מעל המדף' },
      reel: { en: 'Spinning reel 4000–5000 with reliable drag', he: 'סליל ספינינג 4000–5000 עם דראג אמין' },
      line: { en: 'Mono 0.30–0.35mm (more abrasion-resistant than braid on rock)', he: 'מונופילמנט 0.30–0.35 מ"מ (עמיד יותר לשפשוף בסלע מחוט קלוע)' },
      leader: { en: 'Heavy fluorocarbon 0.40–0.50mm — rocks destroy thin leaders', he: 'פלואורוקרבון עבה 0.40–0.50 מ"מ — סלעים הורסים מובילים דקים' },
      hook: { en: 'Single strong hook #2–2/0 on a running rig, or a float rig. Use a weak-link ("rotten bottom") sinker attachment to save rigs from snags', he: 'קרס בודד חזק 2#–2/0 על חסקת ריצה, או חסקת מצוף. חברו את המשקולת בחוט חלש ("חוליה מקריבה") כדי להציל חסקות מהסתבכות' },
      bait: { en: 'Squid strips, crab, local shrimp — tough baits that survive nibblers', he: 'רצועות דיונון, סרטן, שרימפס מקומי — פיתיונות קשיחים ששורדים נגיסות' },
    },
    techniqueSteps: [
      { en: 'Short, accurate casts win here — drop the bait into gullies, channels and the white-water edge, not far out.', he: 'הטלות קצרות ומדויקות מנצחות כאן — הניחו את הפיתיון בגומות, בתעלות ובקצה הקצף, לא רחוק.' },
      { en: 'Keep the line semi-tight and the rod high; bream bites are fast taps — strike on the second tap.', he: 'שמרו על חוט מתוח-למחצה וחכה גבוהה; נגיעות דניס הן טפיחות מהירות — הכו בטפיחה השנייה.' },
      { en: 'Lift fish quickly away from the rocks before they dive into holes.', he: 'הרימו את הדג מהר מהסלעים לפני שהוא צולל לחור.' },
      { en: 'Re-bait often — small pickers strip soft bait in minutes on rock.', he: 'החליפו פיתיון לעיתים קרובות — דגים קטנים מפשיטים פיתיון רך תוך דקות בסלע.' },
    ],
    bestTime: {
      en: 'Calm sea is essential (waves under ~0.5m). Night and the first light of dawn are best for bream; dusk for porgy. Avoid rock platforms entirely in swell.',
      he: 'חובה ים רגוע (גלים מתחת ל-0.5 מ\' בערך). לילה ואור ראשון של שחר הכי טובים לדניס; דמדומים לפארידה. הימנעו לחלוטין ממרפסות סלע כשיש גלים.',
    },
    typicalFish: ['bream', 'porgy', 'whitebream', 'grouper', 'seabass'],
    extraTips: [
      { en: 'Crush a few mussels or crabs and drop them near your spot — natural groundbait that pulls bream in.', he: 'רסקו כמה צדפות או סרטנים וזרקו ליד הנקודה — פיתיון קרקע טבעי שמושך דניסים.' },
      { en: 'A small headlamp with a red-light mode preserves night vision and spooks fewer fish.', he: 'פנס ראש עם מצב אור אדום שומר על ראיית לילה ומבריח פחות דגים.' },
    ],
    safety: [
      { en: 'Rocks are extremely slippery when wet — non-slip boots are mandatory, and never fish a rock platform alone at night.', he: 'סלעים רטובים חלקים במיוחד — נעליים מונעות החלקה חובה, ולעולם אל תדוגו לבד על סלעים בלילה.' },
      { en: 'Check the wave forecast before you go: a rising swell can cut off your exit route from low platforms.', he: 'בדקו תחזית גלים לפני היציאה: גל שמתחזק יכול לחסום את דרך היציאה ממרפסות נמוכות.' },
    ],
  },

  pier: {
    key: 'pier',
    structure: {
      en: 'Piers, marinas and breakwaters give access to deeper water and shade lines where predators ambush. Pylons and rock armour hold bream and mullet.',
      he: 'מזחים, מרינות ושוברי גלים נותנים גישה למים עמוקים ולקווי צל שבהם טורפים אורבים. עמודים ואבני השובר מחזיקים דניס ובורי.',
    },
    setup: {
      rod: { en: 'Medium rod 2.7–3.3m — long surf rods are clumsy on a pier', he: 'חכה בינונית 2.7–3.3 מ\' — חכות סרף ארוכות מסורבלות על מזח' },
      reel: { en: 'Spinning reel 3000–5000', he: 'סליל ספינינג 3000–5000' },
      line: { en: 'Braid 15–25lb or mono 0.25–0.30mm', he: 'חוט קלוע 15–25 ליברות או מונופילמנט 0.25–0.30 מ"מ' },
      leader: { en: 'Fluorocarbon 0.30–0.40mm; go heavier near pylons', he: 'פלואורוקרבון 0.30–0.40 מ"מ; עבה יותר ליד עמודים' },
      hook: { en: 'Float rig with #6–#2 hooks for bream/mullet, or a dropshot/jig for predators', he: 'חסקת מצוף עם קרסים 6#–2# לדניס/בורי, או דרופשוט/ג\'יג לטורפים' },
      bait: { en: 'Bread or dough for mullet, shrimp and squid for bream, small live bait or shiny lures for barracuda and bluefish', he: 'לחם או בצק לבורי, שרימפס ודיונון לדניס, פיתיון חי קטן או לורים מבריקים לברקודה וגומבר' },
    },
    techniqueSteps: [
      { en: 'Fish the edges: shadow lines, pylons, and the point where the breakwater meets sand are ambush spots.', he: 'דוגו בקצוות: קווי צל, עמודים והנקודה שבה השובר פוגש חול הם עמדות מארב.' },
      { en: 'For mullet, throw a few pieces of bread as groundbait, then drift a bread-baited size #8 hook under a small float.', he: 'לבורי, זרקו כמה חתיכות לחם כפיתוי, ואז הציפו קרס 8# עם לחם מתחת למצוף קטן.' },
      { en: 'Drop baits vertically along pylons instead of casting far — most pier fish hold within 10m of the structure.', he: 'הורידו פיתיון אנכית לאורך העמודים במקום להטיל רחוק — רוב דגי המזח נמצאים עד 10 מ\' מהמבנה.' },
      { en: 'At dawn, run a shiny spoon or minnow lure along the outer edge for barracuda and bluefish.', he: 'עם שחר, הריצו כפית מבריקה או לור מינו לאורך הקצה החיצוני לברקודה וגומבר.' },
    ],
    bestTime: {
      en: 'Dawn and dusk for predators; mullet feed through the day in calm water. Piers fish well even when beach surf is too rough.',
      he: 'שחר ודמדומים לטורפים; בורי אוכל לאורך היום במים רגועים. מזחים עובדים טוב גם כשהגלים בחוף גבוהים מדי.',
    },
    typicalFish: ['mullet', 'bream', 'barracuda', 'bluefish', 'amberjack'],
    extraTips: [
      { en: 'Use a drop net for landing bigger fish from high piers — lifting on the line breaks off good fish.', he: 'השתמשו ברשת הרמה לדגים גדולים ממזח גבוה — הרמה על החוט מנתקת דגים טובים.' },
    ],
    safety: [
      { en: 'Mind port traffic and restricted zones; stay clear of mooring lines and ship channels.', he: 'שימו לב לתנועת כלי שיט ולאזורים אסורים; התרחקו מחבלי עגינה ומנתיבי ספינות.' },
    ],
  },

  mixed: {
    key: 'mixed',
    structure: {
      en: 'Mixed sand and rock — the most productive shore type. The seam where sand meets rock is a natural feeding lane for both sand and structure fish.',
      he: 'מעורב חול וסלע — סוג החוף הפרודוקטיבי ביותר. התפר שבו החול פוגש סלע הוא נתיב האכלה טבעי גם לדגי חול וגם לדגי מבנה.',
    },
    setup: {
      rod: { en: 'Versatile rod 3.6–4.2m, casting weight 80–150g', he: 'חכה ורסטילית 3.6–4.2 מ\', משקל הטלה 80–150 גרם' },
      reel: { en: 'Spinning reel 5000–6000', he: 'סליל ספינינג 5000–6000' },
      line: { en: 'Mono 0.30–0.35mm for abrasion resistance', he: 'מונופילמנט 0.30–0.35 מ"מ לעמידות בשפשוף' },
      leader: { en: 'Fluorocarbon 0.35–0.45mm', he: 'פלואורוקרבון 0.35–0.45 מ"מ' },
      hook: { en: 'Paternoster over sand, single running rig near rock; hooks #4–1/0', he: 'פטרנוסטר מעל חול, חסקת ריצה בודדת ליד סלע; קרסים 4#–1/0' },
      bait: { en: 'Squid strips and shrimp cover both terrains; sandworm on the sandy side', he: 'רצועות דיונון ושרימפס מכסים את שני סוגי הקרקע; תולעת חול בצד החולי' },
    },
    techniqueSteps: [
      { en: 'Cast along the sand-rock seam rather than straight out — fish patrol that line.', he: 'הטילו לאורך התפר חול-סלע ולא ישר קדימה — הדגים סורקים את הקו הזה.' },
      { en: 'Fish one rod on the sand for marmor and one near the rocks for bream to find where the action is.', he: 'שימו חכה אחת על החול למרמור ואחת ליד הסלעים לדניס כדי לגלות איפה הפעילות.' },
    ],
    bestTime: {
      en: 'Dawn, dusk and night. The rocky side needs calm sea; the sandy side handles moderate surf.',
      he: 'שחר, דמדומים ולילה. הצד הסלעי דורש ים רגוע; הצד החולי מסתדר עם גלים בינוניים.',
    },
    typicalFish: ['bream', 'seabass', 'marmor', 'whitebream', 'mullet'],
    extraTips: [
      { en: 'When waves pick up, switch fully to the sandy side — rock fishing in swell is dangerous and unproductive.', he: 'כשהגלים מתחזקים, עברו לגמרי לצד החולי — דיג סלעים בגלים מסוכן ולא יעיל.' },
    ],
    safety: [
      { en: 'Scout the rock section in daylight before fishing it at night.', he: 'סיירו בקטע הסלעי לאור יום לפני שדגים בו בלילה.' },
    ],
  },
};

// ---------------------------------------------------------------------------
// Bait profiles
// ---------------------------------------------------------------------------

export interface BaitProfile {
  key: string;
  pattern: RegExp;
  name: Bilingual;
  catches: Array<{ speciesKey: string; note: Bilingual }>;
  howToHook: Bilingual;
  bestRig: Bilingual;
  whenBest: Bilingual;
  tips: Bilingual[];
}

export const BAIT_PROFILES: BaitProfile[] = [
  {
    key: 'squid',
    pattern: /squid|calamari|דיונון|קלמרי/i,
    name: { en: 'Squid', he: 'דיונון' },
    catches: [
      { speciesKey: 'bream', note: { en: 'thin strips near rocks, especially at night', he: 'רצועות דקות ליד סלעים, במיוחד בלילה' } },
      { speciesKey: 'seabass', note: { en: 'whole small squid or wide strips in the surf at dawn', he: 'דיונון קטן שלם או רצועות רחבות בגלים עם שחר' } },
      { speciesKey: 'porgy', note: { en: 'tough strips hold on well over rocky bottom', he: 'רצועות קשיחות מחזיקות טוב מעל קרקעית סלעית' } },
      { speciesKey: 'whitebream', note: { en: 'small strips on #4–#6 hooks', he: 'רצועות קטנות על קרסים 4#–6#' } },
      { speciesKey: 'grouper', note: { en: 'large baits near holes — note: grouper is protected, release it', he: 'פיתיונות גדולים ליד חורים — שימו לב: לוקוס מוגן, שחררו אותו' } },
    ],
    howToHook: {
      en: 'Cut strips 1–2cm wide and 5–8cm long, following the body length. Pass the hook through once at the top so the strip flutters in the current. For whole small squid, hook once through the tip of the mantle.',
      he: 'חתכו רצועות ברוחב 1–2 ס"מ ובאורך 5–8 ס"מ לאורך הגוף. העבירו את הקרס פעם אחת בקצה כך שהרצועה תרפרף בזרם. לדיונון קטן שלם, עגנו פעם אחת בקצה הגלימה.',
    },
    bestRig: {
      en: 'Two-hook paternoster on sand, single running rig with 0.40mm fluorocarbon leader near rocks. Hooks #2–1/0 long shank.',
      he: 'פטרנוסטר שני קרסים על חול, חסקת ריצה בודדת עם מוביל פלואורוקרבון 0.40 מ"מ ליד סלעים. קרסים 2#–1/0 רגל ארוכה.',
    },
    whenBest: {
      en: 'Squid outperforms soft baits at night, in murky water after storms, and anywhere small pickers steal soft bait — it stays on the hook.',
      he: 'דיונון עולה על פיתיונות רכים בלילה, במים עכורים אחרי סערות, ובכל מקום שדגים קטנים גונבים פיתיון רך — הוא נשאר על הקרס.',
    },
    tips: [
      { en: 'Fresh squid from the fish market beats frozen — firmer and more scent.', he: 'דיונון טרי מהשוק עדיף על קפוא — קשיח יותר ועם יותר ריח.' },
      { en: 'Dip strips briefly in the water before casting; softened edges flutter better.', he: 'טבלו רצועות רגע במים לפני ההטלה; קצוות רכים מרפרפים טוב יותר.' },
    ],
  },
  {
    key: 'sardine',
    pattern: /sardine|סרדין/i,
    name: { en: 'Sardine', he: 'סרדין' },
    catches: [
      { speciesKey: 'seabass', note: { en: 'half sardine in the surf — the oily scent trail draws them in', he: 'חצי סרדין בגלים — שובל הריח השמנוני מושך אותם' } },
      { speciesKey: 'bluefish', note: { en: 'whole sardine on a wire or heavy leader — they bite through mono', he: 'סרדין שלם על מוביל פלדה או עבה — הם חותכים מונופילמנט' } },
      { speciesKey: 'leerfish', note: { en: 'live or fresh-dead sardine in the surf zone', he: 'סרדין חי או טרי באזור הגלים' } },
    ],
    howToHook: {
      en: 'For casting, use half a sardine (head or tail section) on a 2/0–4/0 hook through the backbone — whole soft sardines fly off during the cast. Secure with bait elastic if needed.',
      he: 'להטלה, השתמשו בחצי סרדין (ראש או זנב) על קרס 2/0–4/0 דרך עמוד השדרה — סרדין שלם ורך עף בהטלה. חזקו בגומי פיתיון במידת הצורך.',
    },
    bestRig: {
      en: 'Single-hook running rig or pulley rig with 120–150g sinker for distance. Wire trace if bluefish are around.',
      he: 'חסקת ריצה בודדת או חסקת גלגלת עם משקולת 120–150 גרם למרחק. מוביל פלדה אם יש גומברים באזור.',
    },
    whenBest: {
      en: 'Best in the warm months when predators hunt the surf. The fresher the sardine, the better — oily scent is everything.',
      he: 'הכי טוב בחודשים החמים כשטורפים צדים בגלים. ככל שהסרדין טרי יותר — עדיף. הריח השמנוני הוא הכול.',
    },
    tips: [
      { en: 'Buy sardines the same morning and keep them on ice — mushy sardines catch nothing.', he: 'קנו סרדינים באותו בוקר ושמרו על קרח — סרדין רך לא תופס כלום.' },
    ],
  },
  {
    key: 'shrimp',
    pattern: /shrimp|prawn|שרימפס|חסילון|גמבר[יי]/i,
    name: { en: 'Shrimp', he: 'שרימפס' },
    catches: [
      { speciesKey: 'bream', note: { en: 'the number-one bream bait, fished near structure', he: 'פיתיון מספר אחת לדניס, ליד מבנה' } },
      { speciesKey: 'seabass', note: { en: 'live shrimp in the surf is deadly at dawn', he: 'שרימפס חי בגלים קטלני עם שחר' } },
      { speciesKey: 'marmor', note: { en: 'small pieces on fine hooks over sand', he: 'חתיכות קטנות על קרסים דקים מעל חול' } },
      { speciesKey: 'redmullet', note: { en: 'small fresh pieces on the bottom', he: 'חתיכות קטנות וטריות על הקרקעית' } },
    ],
    howToHook: {
      en: 'Live: hook once through the second tail segment from the tail — the shrimp keeps kicking. Dead: thread the hook through the body from tail to head so it sits straight.',
      he: 'חי: עגנו פעם אחת דרך פרק הזנב השני מהסוף — השרימפס ממשיך לבעוט. מת: השחילו את הקרס דרך הגוף מהזנב לראש כך שישב ישר.',
    },
    bestRig: {
      en: 'Light running rig or float rig, hooks #6–#2, minimal weight — shrimp works best presented naturally.',
      he: 'חסקת ריצה קלה או חסקת מצוף, קרסים 6#–2#, משקל מינימלי — שרימפס עובד הכי טוב בהגשה טבעית.',
    },
    whenBest: {
      en: 'Works year-round and on every bottom type. If you can only bring one bait, bring shrimp.',
      he: 'עובד כל השנה ועל כל סוג קרקעית. אם אפשר להביא רק פיתיון אחד — תביאו שרימפס.',
    },
    tips: [
      { en: 'Peel the shell off dead shrimp in cold months — more scent when fish are lazy.', he: 'קלפו את הקליפה משרימפס מת בחודשים קרים — יותר ריח כשהדגים עצלים.' },
    ],
  },
  {
    key: 'sandworm',
    pattern: /sandworm|lugworm|ragworm|worm|תולע/i,
    name: { en: 'Sandworm', he: 'תולעת חול' },
    catches: [
      { speciesKey: 'marmor', note: { en: 'the classic marmor bait — long cast over clean sand', he: 'הפיתיון הקלאסי למרמור — הטלה ארוכה מעל חול נקי' } },
      { speciesKey: 'sole', note: { en: 'fished on the bottom at night', he: 'על הקרקעית בלילה' } },
      { speciesKey: 'redmullet', note: { en: 'small sections on #6–#8 hooks', he: 'קטעים קטנים על קרסים 6#–8#' } },
      { speciesKey: 'whitebream', note: { en: 'near the sand-rock seam', he: 'ליד התפר חול-סלע' } },
    ],
    howToHook: {
      en: 'Thread the worm up a long-shank fine-wire hook (#4–#8) like a sock, leaving a short tail wiggling. Use a baiting needle for delicate worms.',
      he: 'השחילו את התולעת על קרס רגל ארוכה ודק (4#–8#) כמו גרב, והשאירו זנב קצר שמתנועע. השתמשו במחט פיתיונות לתולעים עדינות.',
    },
    bestRig: {
      en: 'Two- or three-hook paternoster with small hooks and 100–150g sinker, cast as far as possible over sand.',
      he: 'פטרנוסטר שניים-שלושה קרסים קטנים עם משקולת 100–150 גרם, הטלה רחוקה ככל האפשר מעל חול.',
    },
    whenBest: {
      en: 'Daytime sand fishing, especially after storms when natural worms wash out. Winter marmor sessions live on sandworm.',
      he: 'דיג חול ביום, במיוחד אחרי סערות כשתולעים טבעיות נחשפות. דיג מרמור חורפי חי על תולעת חול.',
    },
    tips: [
      { en: 'Keep worms cool and dry in vermiculite or newspaper — dead worms turn to mush.', he: 'שמרו תולעים קרירות ויבשות בוורמיקוליט או עיתון — תולעת מתה הופכת לדייסה.' },
    ],
  },
  {
    key: 'crab',
    pattern: /crab|סרטן/i,
    name: { en: 'Crab', he: 'סרטן' },
    catches: [
      { speciesKey: 'bream', note: { en: 'big bream love small whole crabs near rocks', he: 'דניסים גדולים אוהבים סרטנים קטנים שלמים ליד סלעים' } },
      { speciesKey: 'porgy', note: { en: 'half crab on the bottom near structure', he: 'חצי סרטן על הקרקעית ליד מבנה' } },
    ],
    howToHook: {
      en: 'Small crabs: hook through a rear leg socket so it stays alive. Halved crabs: hook through the shell, secure with bait elastic.',
      he: 'סרטנים קטנים: עגנו דרך שקע רגל אחורית כדי שיישאר חי. חצאי סרטן: קרס דרך השריון, חיזוק בגומי פיתיון.',
    },
    bestRig: {
      en: 'Strong single-hook running rig, 0.40mm+ leader, fished tight to rocky structure.',
      he: 'חסקת ריצה בודדת חזקה, מוביל 0.40 מ"מ ומעלה, צמוד למבנה סלעי.',
    },
    whenBest: {
      en: 'Prime bait for big rock-dwelling bream, especially in calm summer nights.',
      he: 'פיתיון מוביל לדניסים גדולים בסלעים, במיוחד בלילות קיץ רגועים.',
    },
    tips: [
      { en: 'Collect small crabs at low tide near the rocks you plan to fish — matching the local menu.', he: 'אספו סרטנים קטנים בשפל ליד הסלעים שבהם תדוגו — התאמה לתפריט המקומי.' },
    ],
  },
  {
    key: 'bread',
    pattern: /bread|dough|pita|לחם|בצק|פיתה/i,
    name: { en: 'Bread / dough', he: 'לחם / בצק' },
    catches: [
      { speciesKey: 'mullet', note: { en: 'the mullet bait — flake or dough ball under a float', he: 'הפיתיון לבורי — פתית או כדור בצק מתחת למצוף' } },
    ],
    howToHook: {
      en: 'Pinch a coin-sized piece of white bread around a #8–#12 hook, leaving the point barely covered. For dough, knead bread with a little water until sticky.',
      he: 'לחצו חתיכת לחם לבן בגודל מטבע סביב קרס 8#–12#, כשהחוד מכוסה בקושי. לבצק, לושו לחם עם מעט מים עד שדביק.',
    },
    bestRig: {
      en: 'Small waggler float, light 0.20–0.25mm line, no weight or one small split shot. Throw free bread as groundbait first.',
      he: 'מצוף קטן, חוט קל 0.20–0.25 מ"מ, בלי משקל או עופרת קטנה אחת. זרקו לחם חופשי כפיתוי לפני.',
    },
    whenBest: {
      en: 'Calm mornings in marinas, harbors and river mouths where mullet school. Useless in surf.',
      he: 'בקרים רגועים במרינות, נמלים ושפכי נחלים שבהם בורי מתלהק. חסר ערך בגלים.',
    },
    tips: [
      { en: 'Mullet are line-shy — the lighter your float and line, the more bites you get.', he: 'בורי חושש מחוט — ככל שהמצוף והחוט קלים יותר, יש יותר נגיעות.' },
    ],
  },
  {
    key: 'lure',
    pattern: /lure|spoon|popper|jig|minnow|spinner|shad|לור|דמוי|כפית|פופר|ג'יג|שד\b/i,
    name: { en: 'Lures', he: 'פיתיונות מלאכותיים (לורים)' },
    catches: [
      { speciesKey: 'seabass', note: { en: 'slim minnows and soft shads worked slowly along troughs at first light', he: 'מינו דקים ושדים רכים בהובלה איטית לאורך תעלות עם אור ראשון' } },
      { speciesKey: 'bluefish', note: { en: 'fast metal spoons and surface poppers during autumn runs', he: 'כפיות מתכת מהירות ופופרים על פני המים בריצות הסתיו' } },
      { speciesKey: 'barracuda', note: { en: 'shiny chrome lures with a fast erratic retrieve near piers', he: 'לורים מבריקים בהובלה מהירה ולא אחידה ליד מזחים' } },
      { speciesKey: 'leerfish', note: { en: 'large poppers and stickbaits in the surf during warm months', he: 'פופרים גדולים וסטיקבייטים בגלים בחודשים החמים' } },
    ],
    howToHook: {
      en: 'Tie lures to a 0.35–0.45mm fluorocarbon leader with a loop knot for maximum action. Add a wire trace only when bluefish are cutting you off.',
      he: 'קשרו לורים למוביל פלואורוקרבון 0.35–0.45 מ"מ בקשר לולאה לתנועה מקסימלית. הוסיפו מוביל פלדה רק כשגומברים חותכים.',
    },
    bestRig: {
      en: 'Lure rod 2.4–3.0m casting 10–40g, reel 3000–4000, braid 15–20lb for direct contact and long casts.',
      he: 'חכת לורים 2.4–3.0 מ\' הטלה 10–40 גרם, סליל 3000–4000, חוט קלוע 15–20 ליברות למגע ישיר והטלות ארוכות.',
    },
    whenBest: {
      en: 'First and last light, and whenever you see birds diving or bait fish scattering — that is predators feeding.',
      he: 'אור ראשון ואחרון, וכל פעם שרואים ציפורים צוללות או דגיגים בורחים — אלו טורפים אוכלים.',
    },
    tips: [
      { en: 'Vary retrieve speed until you find what triggers strikes — steady is rarely best.', he: 'שנו מהירות הובלה עד שמוצאים מה מדליק את הדגים — הובלה אחידה כמעט אף פעם לא הכי טובה.' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Species tactics
// ---------------------------------------------------------------------------

export interface SpeciesTactics {
  key: string;
  pattern: RegExp;
  name: Bilingual;
  bites: Bilingual;
  where: Bilingual;
  when: Bilingual;
  note?: Bilingual;
}

export const SPECIES_TACTICS: Record<string, SpeciesTactics> = {
  seabass: {
    key: 'seabass',
    pattern: /sea ?bass|לברק|לוקוס ים/i,
    name: { en: 'Sea bass', he: 'לברק' },
    bites: { en: 'live shrimp, half sardine, slim minnow lures', he: 'שרימפס חי, חצי סרדין, לורים מסוג מינו' },
    where: { en: 'surf troughs and near breakwaters, often surprisingly close to shore', he: 'תעלות בגלים וליד שוברי גלים, לרוב קרוב לחוף באופן מפתיע' },
    when: { en: 'first light and dusk, best with light surf', he: 'אור ראשון ודמדומים, הכי טוב עם גלים קלים' },
  },
  bream: {
    key: 'bream',
    pattern: /bream|denis|דניס/i,
    name: { en: 'Gilthead bream (denis)', he: 'דניס' },
    bites: { en: 'shrimp, squid strips, small crabs, mussels', he: 'שרימפס, רצועות דיונון, סרטנים קטנים, צדפות' },
    where: { en: 'rocky bottom, gullies, and the sand-rock seam', he: 'קרקעית סלעית, גומות והתפר חול-סלע' },
    when: { en: 'night and early dawn on calm seas', he: 'לילה ושחר מוקדם בים רגוע' },
  },
  marmor: {
    key: 'marmor',
    pattern: /marmor|steenbras|striped seabream|מרמור/i,
    name: { en: 'Sand steenbras (marmor)', he: 'מרמור' },
    bites: { en: 'sandworms first, small shrimp pieces second', he: 'תולעי חול קודם כול, חתיכות שרימפס קטנות אחר כך' },
    where: { en: 'clean sandy bottom, often beyond the second sandbar — long casts pay', he: 'קרקעית חולית נקייה, לרוב מעבר לשבר השני — הטלות ארוכות משתלמות' },
    when: { en: 'daytime, especially after storms churn the sand', he: 'שעות היום, במיוחד אחרי סערות שהפכו את החול' },
  },
  mullet: {
    key: 'mullet',
    pattern: /mullet|בורי/i,
    name: { en: 'Mullet (buri)', he: 'בורי' },
    bites: { en: 'bread flake, dough balls, pita — vegetable baits only', he: 'פתיתי לחם, כדורי בצק, פיתה — פיתיונות צמחיים בלבד' },
    where: { en: 'calm marinas, harbors, river mouths and the shallow surf edge', he: 'מרינות רגועות, נמלים, שפכי נחלים וקצה הגלים הרדוד' },
    when: { en: 'through the day in calm, warm water', he: 'לאורך היום במים רגועים וחמים' },
    note: { en: 'Line-shy — use the lightest float rig you own.', he: 'חושש מחוט — השתמשו בחסקת המצוף הקלה ביותר שיש לכם.' },
  },
  bluefish: {
    key: 'bluefish',
    pattern: /bluefish|גומבר/i,
    name: { en: 'Bluefish (gombar)', he: 'גומבר' },
    bites: { en: 'whole sardine on wire, fast metal spoons, poppers', he: 'סרדין שלם על מוביל פלדה, כפיות מתכת מהירות, פופרים' },
    where: { en: 'open surf and breakwater edges during bait runs', he: 'גלים פתוחים וקצוות שוברי גלים בזמן נדידות דגיגים' },
    when: { en: 'autumn runs (September–November) are the peak', he: 'ריצות הסתיו (ספטמבר–נובמבר) הן השיא' },
    note: { en: 'Razor teeth — always use a wire trace and long pliers.', he: 'שיניים חדות כתער — תמיד מוביל פלדה ופלייר ארוך.' },
  },
  grouper: {
    key: 'grouper',
    pattern: /grouper|לוקוס\b/i,
    name: { en: 'Grouper (lokus)', he: 'לוקוס' },
    bites: { en: 'large squid, crab, octopus pieces near holes', he: 'דיונון גדול, סרטן, חתיכות תמנון ליד חורים' },
    where: { en: 'rocky reefs and holes', he: 'שוניות סלעיות וחורים' },
    when: { en: 'year-round on calm days', he: 'כל השנה בימים רגועים' },
    note: {
      en: 'Dusky grouper is PROTECTED in Israel — if you hook one, release it immediately. Check parks.org.il for current rules.',
      he: 'לוקוס (דקר הסלעים) מוגן בישראל — אם נתפס, שחררו מיד. בדקו את הכללים העדכניים ב-parks.org.il.',
    },
  },
  barracuda: {
    key: 'barracuda',
    pattern: /barracuda|ברקודה/i,
    name: { en: 'Barracuda', he: 'ברקודה' },
    bites: { en: 'shiny chrome lures, live small mullet', he: 'לורים מבריקים, בורי קטן חי' },
    where: { en: 'pier edges, marina entrances and shadow lines', he: 'קצוות מזחים, כניסות מרינה וקווי צל' },
    when: { en: 'dawn, with fast erratic retrieves', he: 'שחר, בהובלה מהירה ולא אחידה' },
  },
  leerfish: {
    key: 'leerfish',
    pattern: /leerfish|garrick|אריאן|אמית.?ארי/i,
    name: { en: 'Leerfish (Arian)', he: 'אריאן' },
    bites: { en: 'live mullet, big poppers and stickbaits', he: 'בורי חי, פופרים גדולים וסטיקבייטים' },
    where: { en: 'the surf zone of long sandy beaches — they hunt in the white water', he: 'אזור הגלים של חופים חוליים ארוכים — הם צדים בתוך הקצף' },
    when: { en: 'spring to autumn, dawn and dusk', he: 'אביב עד סתיו, שחר ודמדומים' },
  },
  porgy: {
    key: 'porgy',
    pattern: /porgy|pagrus|פאריד/i,
    name: { en: 'Red porgy (farida)', he: 'פארידה' },
    bites: { en: 'squid strips, crab, cut fish on the bottom', he: 'רצועות דיונון, סרטן, נתחי דג על הקרקעית' },
    where: { en: 'rocky bottom and deeper structure', he: 'קרקעית סלעית ומבנה עמוק יותר' },
    when: { en: 'dusk and night', he: 'דמדומים ולילה' },
  },
  whitebream: {
    key: 'whitebream',
    pattern: /white seabream|sargo|sargus/i,
    name: { en: 'White seabream (sargos)', he: 'סרגוס' },
    bites: { en: 'small squid strips, worms, mussels', he: 'רצועות דיונון קטנות, תולעים, צדפות' },
    where: { en: 'white water around rocks — right in the foam', he: 'מים לבנים סביב סלעים — ממש בתוך הקצף' },
    when: { en: 'daytime with light surf', he: 'שעות היום עם גלים קלים' },
  },
  sole: {
    key: 'sole',
    pattern: /sole|דג הלשון|לשון/i,
    name: { en: 'Sole', he: 'דג הלשון' },
    bites: { en: 'sandworms fished still on the bottom', he: 'תולעי חול בהגשה נייחת על הקרקעית' },
    where: { en: 'flat sandy or muddy bottom', he: 'קרקעית חולית או בוצית שטוחה' },
    when: { en: 'night', he: 'לילה' },
  },
  redmullet: {
    key: 'redmullet',
    pattern: /red mullet|barbun|ברבוני|סולטן/i,
    name: { en: 'Red mullet (barbunia)', he: 'ברבוניה' },
    bites: { en: 'small pieces of shrimp or worm on fine #6–#8 hooks', he: 'חתיכות קטנות של שרימפס או תולעת על קרסים דקים 6#–8#' },
    where: { en: 'sandy-muddy bottom, often close in', he: 'קרקעית חולית-בוצית, לרוב קרוב' },
    when: { en: 'daytime', he: 'שעות היום' },
  },
  amberjack: {
    key: 'amberjack',
    pattern: /amberjack|אינטיאס/i,
    name: { en: 'Amberjack (intias)', he: 'אינטיאס' },
    bites: { en: 'heavy jigs and live bait in deep water', he: 'ג\'יגים כבדים ופיתיון חי במים עמוקים' },
    where: { en: 'deep breakwater edges and offshore structure', he: 'קצוות שוברי גלים עמוקים ומבנים במים פתוחים' },
    when: { en: 'summer, early morning', he: 'קיץ, בוקר מוקדם' },
  },
};

/** Map DEMO_SPECIES ids to SPECIES_TACTICS keys. */
export const SPECIES_ID_TO_TACTICS: Record<string, string> = {
  'sp-1': 'seabass',
  'sp-2': 'bream',
  'sp-3': 'marmor',
  'sp-4': 'porgy',
  'sp-5': 'bluefish',
  'sp-6': 'mullet',
  'sp-7': 'mullet',
  'sp-8': 'grouper',
  'sp-9': 'sole',
  'sp-10': 'amberjack',
  'sp-11': 'barracuda',
  'sp-12': 'seabass',
  'sp-13': 'redmullet',
  'sp-14': 'whitebream',
  'sp-15': 'leerfish',
};

// ---------------------------------------------------------------------------
// Seasonal behavior (Israeli Mediterranean)
// ---------------------------------------------------------------------------

export function getSeasonalNotes(date: Date, language: Lang): string {
  const month = date.getMonth(); // 0-based
  const isHe = language === 'he';

  if (month === 11 || month <= 1) {
    return isHe
      ? 'עונה נוכחית (חורף): פחות מינים פעילים, אבל לברק בשיא שלו בגלים, ומרמור מצוין ביום הרגוע הראשון אחרי סערה. התמקדו בחלונות רגועים בין החזיתות.'
      : 'Current season (winter): fewer species are active, but sea bass peaks in the surf, and marmor fishing is excellent on the first calm day after a storm. Focus on calm windows between fronts.';
  }
  if (month >= 2 && month <= 4) {
    return isHe
      ? 'עונה נוכחית (אביב): המים מתחממים והפעילות עולה — דניס מתעורר ליד סלעים, אריאן מתחיל להופיע בגלים, ובורי פעיל במרינות.'
      : 'Current season (spring): water is warming and activity rises — bream wake up near rocks, leerfish start showing in the surf, and mullet are active in marinas.';
  }
  if (month >= 5 && month <= 7) {
    return isHe
      ? 'עונה נוכחית (קיץ): חום היום מוריד את הפעילות — דוגו מוקדם בבוקר, בדמדומים או בלילה. דניס בלילה ליד סלעים, בורי ביום במרינות, וים שטוח מאפשר דיג סלעים בטוח.'
      : 'Current season (summer): daytime heat suppresses activity — fish early morning, dusk or night. Bream at night near rocks, mullet by day in marinas, and flat seas make rock platforms safely fishable.';
  }
  return isHe
    ? 'עונה נוכחית (סתיו): העונה החזקה של השנה — ריצות גומבר, שיא האריאן בגלים, ולברק חוזר לחופים. אל תפספסו את השחר.'
    : 'Current season (autumn): the strongest season of the year — bluefish runs, peak leerfish in the surf, and sea bass returning to the beaches. Do not miss first light.';
}

// ---------------------------------------------------------------------------
// Question feature detection
// ---------------------------------------------------------------------------

export function detectHabitat(text: string): HabitatKey | undefined {
  const hasRock = /rock|reef|cliff|boulder|סלע|שונית|צוק/i.test(text);
  const hasSand = /sand|surf beach|חול|חולי/i.test(text);
  if (hasRock && hasSand) return 'mixed';
  if (hasRock) return 'rocky';
  if (hasSand) return 'sandy';
  if (/pier|jetty|marina|harbor|harbour|breakwater|dock|מזח|מרינה|נמל|שובר/i.test(text)) return 'pier';
  // Generic "beach"/"shore" mention with no terrain named — default to sandy,
  // which describes most of the Israeli Mediterranean coastline.
  if (/beach|shore|surf|coast|חוף|חופים|מהחוף/i.test(text)) return 'sandy';
  return undefined;
}

/**
 * The knowledge base covers the Israeli Mediterranean. When a question names a
 * foreign country or region, habitat/seasonal expertise must NOT be applied —
 * the bot should say so honestly and lean on web sources instead.
 */
const FOREIGN_LOCATION_PATTERN =
  /iceland|norway|sweden|denmark|finland|england|scotland|ireland|\buk\b|france|spain|portugal|italy|greece|turkey|cyprus|egypt|jordan|croatia|malta|morocco|tunisia|united states|\busa\b|america|canada|mexico|brazil|argentina|australia|new zealand|thailand|japan|china|india|maldives|seychelles|indonesia|philippines|vietnam|איסלנד|נורבגיה|שוודיה|דנמרק|אנגליה|סקוטלנד|אירלנד|צרפת|ספרד|פורטוגל|איטליה|יוון|טורקיה|קפריסין|מצרים|ירדן|קרואטיה|מלטה|מרוקו|תוניסיה|ארה"ב|אמריקה|קנדה|מקסיקו|ברזיל|אוסטרליה|תאילנד|יפן|סין|הודו|מלדיביים/i;

export function mentionsForeignLocation(text: string): boolean {
  return FOREIGN_LOCATION_PATTERN.test(text);
}

/** True when the habitat was only a generic beach/shore mention (no explicit terrain). */
export function isGenericBeachMention(text: string): boolean {
  return (
    /beach|shore|surf|coast|חוף|חופים|מהחוף/i.test(text) &&
    !/rock|reef|cliff|boulder|סלע|שונית|צוק|sand|חול|pier|jetty|marina|harbor|harbour|breakwater|dock|מזח|מרינה|נמל|שובר/i.test(text)
  );
}

export function detectBait(text: string): BaitProfile | undefined {
  return BAIT_PROFILES.find((b) => b.pattern.test(text));
}

export function detectTargetSpecies(text: string): SpeciesTactics | undefined {
  return Object.values(SPECIES_TACTICS).find((s) => s.pattern.test(text));
}

export function shoreTypeToHabitat(shoreType: string): HabitatKey {
  switch (shoreType) {
    case 'rocky':
    case 'cliff':
      return 'rocky';
    case 'pier':
    case 'harbor':
      return 'pier';
    case 'mixed':
      return 'mixed';
    default:
      return 'sandy';
  }
}
