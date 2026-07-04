/**
 * Mediterranean fish species catalog sourced from parks.org.il
 * ("דע את הדג: דגי הים התיכון" family guides).
 *
 * Legal minimum lengths cross-referenced with the INPA minimum-size page
 * (parks.org.il/article/fish-length/). Protected status per INPA regulations.
 */

import type { Lang } from '@/lib/research/fishingKnowledge';

export const PARKS_MEDITERRANEAN_FISH_URL = 'https://www.parks.org.il/category/sea/fish/';

export interface MediterraneanFishEntry {
  id: string;
  /** Regex patterns for Hebrew/English common names and aliases. */
  patterns: RegExp[];
  name: { en: string; he: string };
  aliases: { en: string; he: string };
  scientificName: string;
  family: { en: string; he: string };
  /** Typical size range from parks.org.il (informational). */
  typicalSizeCm: string;
  /** Official INPA minimum keep length; null when not listed. */
  legalMinimumCm: number | null;
  /** True when the species must not be kept (protected species). */
  protectedSpecies: boolean;
  habitat: { en: string; he: string };
  description: { en: string; he: string };
  sourcePageId: string;
}

/** Twelve fish families featured on the parks.org.il Mediterranean fish page. */
export const MEDITERRANEAN_FISH_FAMILIES: { en: string; he: string; pageId: string }[] = [
  { en: 'Mugilidae (mullets)', he: 'משפחת הקיפוניים', pageId: 'parks-fish-mugilidae' },
  { en: 'Nemipteridae (threadfin breams)', he: 'משפחת הנימיים', pageId: 'parks-fish-nemipteridae' },
  { en: 'Scombridae (mackerels & tunas)', he: 'משפחת הקוליסיים', pageId: 'parks-fish-scombridae' },
  { en: 'Carangidae (jacks)', he: 'משפחת הצניניתיים', pageId: 'parks-fish-carngidae' },
  { en: 'Siganidae (rabbitfish)', he: 'משפחת הסיכניים', pageId: 'parks-fish-siganidae' },
  { en: 'Balistidae (triggerfish)', he: 'משפחת הנצרניים', pageId: 'parks-fish-balistidae' },
  { en: 'Sciaenidae (croakers)', he: 'משפחת המוסריים', pageId: 'parks-fish-sciaenidae' },
  { en: 'Mullidae (goatfish)', he: 'משפחת המוליתיים', pageId: 'parks-fish-mullidae' },
  { en: 'Serranidae (groupers)', he: 'משפחת הדקריים', pageId: 'parks-fish-serranidae' },
  { en: 'Pomatomidae (bluefish)', he: 'משפחת הגומבריים', pageId: 'parks-fish-pomatomidae' },
  { en: 'Sphyraenidae (barracuda)', he: 'משפחת האספירניתיים', pageId: 'parks-fish-sphyrnidae' },
  { en: 'Sparidae (seabream & porgy)', he: 'משפחת הספרוסיים', pageId: 'parks-fish-sparidae' },
];

export const MEDITERRANEAN_FISH_CATALOG: MediterraneanFishEntry[] = [
  {
    id: 'flathead-grey-mullet',
    patterns: [/בורי|קיפון|mullet|buri\b/i],
    name: { en: 'Flathead grey mullet', he: 'קיפון גדול-ראש (בורי)' },
    aliases: { en: 'buri', he: 'בורי' },
    scientificName: 'Mugil cephalus',
    family: { en: 'Mugilidae', he: 'משפחת הקיפוניים' },
    typicalSizeCm: '15–50',
    legalMinimumCm: 20,
    protectedSpecies: false,
    habitat: { en: 'Estuaries, shallow coastal waters and river mouths; schools to 40 m depth', he: 'שפכי נהרות, מים חופיים רדודים ופי נחלים; בלהקות עד עומק 40 מ' },
    description: {
      en: 'Omnivorous, highly tolerant of salinity and temperature. Young concentrate in river mouths; spawning in summer (Jun–Sep). Caught with standing nets, spearfishing and shore rods.',
      he: 'אוכל-כול, עמיד לטווח רחב של מליחות וטמפרטורה. דגיגים מתרכזים בשפכי נהרות; רבייה בקיץ (יוני–ספטמבר). נדוג ברשתות עמידה, רובי דיג וחכות מהחוף.',
    },
    sourcePageId: 'parks-fish-mugilidae',
  },
  {
    id: 'randalls-threadfin-bream',
    patterns: [/נימי|threadfin|randalli/i],
    name: { en: "Randall's threadfin bream", he: 'נימי דו-ימי' },
    aliases: { en: 'false barbounia', he: 'ברבוניה מזויפת, סנפן' },
    scientificName: 'Nemipterus randalli',
    family: { en: 'Nemipteridae', he: 'משפחת הנימיים' },
    typicalSizeCm: '5–20',
    legalMinimumCm: null,
    protectedSpecies: false,
    habitat: { en: 'Sandy bottom, 30–80 m; Lessepsian migrant first recorded in Haifa Bay 2006', he: 'קרקע חולית, 30–80 מ\'; מהגר מים סוף, תועד לראשונה במפרץ חיפה 2006' },
    description: {
      en: 'Pink body with yellow stripes and a long filament on the upper tail fin. Spawning Apr–Sep. Heavily targeted by trawlers; also caught on longlines and standing nets.',
      he: 'גוף ורוד עם פסים צהובים וחוט ארוך על סנפיר הזנב העליון. רבייה אפריל–ספטמבר. נדוג בכמויות בספינות מכמורת; גם במערכי קרסים ורשתות עמידה.',
    },
    sourcePageId: 'parks-fish-nemipteridae',
  },
  {
    id: 'narrow-barred-mackerel',
    patterns: [/פלמידה|סקומברן|narrow.?barred|commerson|palamida/i],
    name: { en: 'Narrow-barred Spanish mackerel', he: 'סקומברן זריז (פלמידה)' },
    aliases: { en: 'palamida, king mackerel', he: 'פלמידה לבנה, טורקיה' },
    scientificName: 'Scomberomorus commerson',
    family: { en: 'Scombridae', he: 'משפחת הקוליסיים' },
    typicalSizeCm: '25–150',
    legalMinimumCm: 30,
    protectedSpecies: false,
    habitat: { en: 'Pelagic schools in open water; Lessepsian migrant since 1935', he: 'להקות פלגיות בגוף המים; מהגר מים סוף מ-1935' },
    description: {
      en: 'Finlets on rear body; hunts sardines, jacks and cephalopods. Matures at ~65 cm; spawning Apr–Aug. One of the most commercially sought species in Israeli waters.',
      he: 'סנפירונים בחלק האחורי; צד סרדינים, צניניתיים וראשרגליים. בגרות מינית ב-65 ס"מ; רבייה אפריל–אוגוסט. מין מסחרי מבוקש מאוד במי ישראל.',
    },
    sourcePageId: 'parks-fish-scombridae',
  },
  {
    id: 'little-tunny',
    patterns: [/טונית|little tunny|alletteratus|פלמידה שחורה/i],
    name: { en: 'Little tunny', he: 'טונית אטלנטית' },
    aliases: { en: 'false albacore', he: 'פלמידה שחורה, טונה קטנה' },
    scientificName: 'Euthynnus alletteratus',
    family: { en: 'Scombridae', he: 'משפחת הקוליסיים' },
    typicalSizeCm: '25–70',
    legalMinimumCm: null,
    protectedSpecies: false,
    habitat: { en: 'Pelagic schools along the coast', he: 'להקות פלגיות לאורך החוף' },
    description: {
      en: 'Three black spots between pectoral and pelvic fins. Spawning May–Sep. Caught in purse and standing nets; commonly used as bait for larger predators.',
      he: '3 נקודות שחורות בין סנפיר החזה לסנפיר הבטן. רבייה מאי–ספטמבר. נדוגה ברשתות הקפה ועמידה; משמשת גם כפיתיון לדגים גדולים.',
    },
    sourcePageId: 'parks-fish-scombridae',
  },
  {
    id: 'pompano',
    patterns: [/כחלון|pompano|trachinotus/i],
    name: { en: 'Mediterranean pompano', he: 'כחלון ים-תיכוני' },
    aliases: { en: 'azabiya', he: 'אטוט, עזבייה' },
    scientificName: 'Trachinotus ovatus',
    family: { en: 'Carangidae', he: 'משפחת הצניניתיים' },
    typicalSizeCm: '10–25',
    legalMinimumCm: null,
    protectedSpecies: false,
    habitat: { en: 'Pelagic near surface; juveniles in shallow sandy nursery areas', he: 'פלגי קרוב לפני השטח; צעירים באזורי אימון חוליים רדודים' },
    description: {
      en: 'Shiny, flat body with forked tail — built for speed. Spawning Aug–Oct. Large schools caught in standing and purse nets; also on shore rods.',
      he: 'גוף מבריק ושטוח עם זנב מזלג — מותאם למהירות. רבייה אוגוסט–אוקטובר. להקות גדולות נתפסות ברשתות עמידה והקפה; גם בחכות מהחוף.',
    },
    sourcePageId: 'parks-fish-carngidae',
  },
  {
    id: 'greater-amberjack',
    patterns: [/אינטיאס|amberjack|seriola|סריול|שולה/i],
    name: { en: 'Greater amberjack', he: 'סריול אטלנטי (אינטיאס)' },
    aliases: { en: 'intias, shoala', he: 'אינטיאס, שולה, אריצ\'ולה' },
    scientificName: 'Seriola dumerili',
    family: { en: 'Carangidae', he: 'משפחת הצניניתיים' },
    typicalSizeCm: '15–150',
    legalMinimumCm: null,
    protectedSpecies: false,
    habitat: { en: 'Pelagic and near-bottom, to 360 m; schools', he: 'פלגי וסמוך לקרקע, עד 360 מ\'; בלהקות' },
    description: {
      en: 'Largest carangid in the eastern Mediterranean. Diagonal eye bar and yellow lateral stripe. Spawning Jun–Jul. Caught by all methods; large spring purse-net schools.',
      he: 'הצניניתי הגדול ביותר בים התיכון המזרחי. פס אלכסוני ליד העין ופס צהוב לאורך הגוף. רבייה יוני–יולי. נדוג בכל שיטות הדיג; באביב להקות גדולות ברשתות הקפה.',
    },
    sourcePageId: 'parks-fish-carngidae',
  },
  {
    id: 'marbled-rabbitfish',
    patterns: [/סיכן|אראס|ארס\b|rabbitfish|siganus/i],
    name: { en: 'Marbled rabbitfish', he: 'סיכן משויש' },
    aliases: { en: 'aras', he: 'אראס, קומוניסט' },
    scientificName: 'Siganus rivulatus',
    family: { en: 'Siganidae', he: 'משפחת הסיכניים' },
    typicalSizeCm: '5–25',
    legalMinimumCm: null,
    protectedSpecies: false,
    habitat: { en: 'Shallow vegetated areas to 30 m; Lessepsian migrant', he: 'אזורים מכוסי צמחייה רדודים עד 30 מ\'; מהגר מים סוף' },
    description: {
      en: 'Herbivorous; venomous dorsal spines. Variable camouflage coloration. Spawning May–Jul. Caught in purse and standing nets and on shore rods.',
      he: 'צמחוני; קוצים ארסיים בסנפיר הגב. צבע משתנה להסוואה. רבייה מאי–יולי. נדוג ברשתות הקפה ועמידה ובחכות מהחוף.',
    },
    sourcePageId: 'parks-fish-siganidae',
  },
  {
    id: 'grey-triggerfish',
    patterns: [/נצרן|triggerfish|balistes|חזיר/i],
    name: { en: 'Grey triggerfish', he: 'נצרן ים-תיכוני' },
    aliases: { en: 'pigfish', he: 'חזיר, אבו חנזיר' },
    scientificName: 'Balistes capriscus',
    family: { en: 'Balistidae', he: 'משפחת הנצרניים' },
    typicalSizeCm: '15–40',
    legalMinimumCm: null,
    protectedSpecies: false,
    habitat: { en: 'Rocky bottom and wrecks, 10–100 m', he: 'קרקע סלעית וספינות טבועות, 10–100 מ\'' },
    description: {
      en: 'Large front dorsal spine; feeds on crabs and mollusks. Male guards eggs for two days. Not kosher. Archaeological remains at Atlit-Yam (~8000 BP).',
      he: 'קוץ גדול בקדמת סנפיר הגב; ניזון מסרטנים ורכיכות. הזכר שומר על הביצים יומיים. אינו כשר. שרידים באתלית-ים (~8000 שנה).',
    },
    sourcePageId: 'parks-fish-balistidae',
  },
  {
    id: 'meagre',
    patterns: [/מוסר\b|meagre|argyrosomus/i],
    name: { en: 'Meagre', he: 'מוסר מלכותי' },
    aliases: { en: 'sea eagle', he: 'מוסר, עיט הים' },
    scientificName: 'Argyrosomus regius',
    family: { en: 'Sciaenidae', he: 'משפחת המוסריים' },
    typicalSizeCm: '15–70',
    legalMinimumCm: 40,
    protectedSpecies: false,
    habitat: { en: 'Near-bottom; forms spawning aggregations in spring', he: 'סמוך לקרקע; מתלהק לרבייה באביב' },
    description: {
      en: 'Large silver fish with rounded snout and blunt (non-forked) tail. Once very common off Israel; populations now greatly reduced.',
      he: 'דג גדול כסוף, אף מעוגל וזנב קדוד. בעבר נפוץ מאוד בחופי הארץ; כיום אוכלוסיותיו קטנו מאוד.',
    },
    sourcePageId: 'parks-fish-sciaenidae',
  },
  {
    id: 'brown-meagre',
    patterns: [/אוכם|brown meagre|sciaena umbra/i],
    name: { en: 'Brown meagre', he: 'אוכם גדול-קוץ' },
    aliases: { en: 'corb', he: 'סאינס' },
    scientificName: 'Sciaena umbra',
    family: { en: 'Sciaenidae', he: 'משפחת המוסריים' },
    typicalSizeCm: '15–50',
    legalMinimumCm: null,
    protectedSpecies: false,
    habitat: { en: 'Rocky holes and caves, 5–40 m; more common in Rosh HaNikra reserve', he: 'כוכים ומערות סלעיות, 5–40 מ\'; שכיח יותר בשמורת ראש הנקרה-אכזיב' },
    description: {
      en: 'Thick anal-fin spine; copper-brown uniform color. Spawning Jul–Aug. Caught on standing nets, longlines, spearfishing and shore rods.',
      he: 'קוץ עבה בסנפיר השת; צבע חום-נחושתי אחיד. רבייה יולי–אוגוסט. נדוג ברשתות עמידה, מערכי קרסים, רובי דיג וחכות.',
    },
    sourcePageId: 'parks-fish-sciaenidae',
  },
  {
    id: 'crescent-moon-bream',
    patterns: [/יבלן|cirrosa|umbrina/i],
    name: { en: 'Crescent moon-bream', he: 'יבלן האדווה' },
    aliases: { en: 'corb', he: 'לבט, סאינס, קורבל' },
    scientificName: 'Umbrina cirrosa',
    family: { en: 'Sciaenidae', he: 'משפחת המוסריים' },
    typicalSizeCm: '15–40',
    legalMinimumCm: null,
    protectedSpecies: false,
    habitat: { en: 'Sandy bottom to 50 m; young enter estuaries', he: 'קרקע חולית עד 50 מ\'; צעירים נכנסים לשפכי נהרות' },
    description: {
      en: 'Wave-pattern body and chin barbel. Burrows in sand when threatened. Spawning Apr–Aug. Caught on standing nets and spearfishing.',
      he: 'דוגמת גוף של גלים ובליטה על הסנטר. מתחפר בחול בסכנה. רבייה אפריל–אוגוסט. נדוג ברשתות עמידה וברובי דיג.',
    },
    sourcePageId: 'parks-fish-sciaenidae',
  },
  {
    id: 'striped-red-mullet',
    patterns: [/ברבוניה|barbounia|mullus surmuletus|מולית הפסים/i],
    name: { en: 'Striped red mullet', he: 'מולית הפסים (ברבוניה)' },
    aliases: { en: 'barbounia', he: 'ברבוניה, מולית הסלעים' },
    scientificName: 'Mullus surmuletus',
    family: { en: 'Mullidae', he: 'משפחת המוליתיים' },
    typicalSizeCm: '9–22',
    legalMinimumCm: 11,
    protectedSpecies: false,
    habitat: { en: 'Sandy bottom to 80 m; small schools', he: 'קרקע חולית עד 80 מ\'; בלהקות קטנות' },
    description: {
      en: 'Two chin barbels used to detect buried prey (crabs, worms, mollusks). Yellow stripes on dorsal fin distinguish from red mullet. Spawning Mar–Jun.',
      he: 'שני בחנינים על הסנטר לזיהוי טרף בחול (סרטנים, תולעים, רכיכות). פסים צהובים על סנפיר הגב. רבייה מרץ–יוני.',
    },
    sourcePageId: 'parks-fish-mullidae',
  },
  {
    id: 'dusky-grouper',
    patterns: [/דקר הסלעים|dusky grouper|marginatus|לוקוס אדום|דאור/i],
    name: { en: 'Dusky grouper', he: 'דקר הסלעים' },
    aliases: { en: 'red lokus', he: 'לוקוס אדום, דאור' },
    scientificName: 'Epinephelus marginatus',
    family: { en: 'Serranidae', he: 'משפחת הדקריים' },
    typicalSizeCm: '15–60',
    legalMinimumCm: 40,
    protectedSpecies: true,
    habitat: { en: 'Rocky caves and reefs, 4–60 m; territorial', he: 'מערות ושוניות סלעיות, 4–60 מ\'; טריטוריאלי' },
    description: {
      en: 'Lives in a permanent cave; mass spawning "weddings" Apr–Jul. Protogynous hermaphrodite. Overfished — release if caught. Minimum 40 cm when regulations allow keeping.',
      he: 'חי במערה קבועה; "חתונות" רבייה אפריל–יולי. הרמפרודיט. סובל מדיג-יתר — יש לשחרר אם נתפס. מינימום 40 ס"מ כשהתקנות מאפשרות שמירה.',
    },
    sourcePageId: 'parks-fish-serranidae',
  },
  {
    id: 'alexandria-grouper',
    patterns: [/דקר אלכסנדרוני|alexandria grouper|costae|חפש/i],
    name: { en: 'Alexandria grouper', he: 'דקר אלכסנדרוני' },
    aliases: { en: 'chafash', he: 'חפש' },
    scientificName: 'Epinephelus costae',
    family: { en: 'Serranidae', he: 'משפחת הדקריים' },
    typicalSizeCm: '15–60',
    legalMinimumCm: null,
    protectedSpecies: true,
    habitat: { en: 'Rocky areas, 5–60 m; alone or small groups', he: 'אזורים סלעיים, 5–60 מ\'; לבד או בקבוצות קטנות' },
    description: {
      en: 'Striped body with yellow back spot in adults. Protected since 2021 — must release immediately if caught. Indicator species for successful marine reserves.',
      he: 'גוף מפוספס עם כתם צהוב על הגב בבוגרים. מוגן מ-2021 — יש לשחרר מיד אם נתפס. מין סמן לשמורות ימיות מוצלחות.',
    },
    sourcePageId: 'parks-fish-serranidae',
  },
  {
    id: 'red-grouper',
    patterns: [/דוקרנית|red grouper|rubra|אירדי/i],
    name: { en: 'Red grouper', he: 'דוקרנית אדומה' },
    aliases: { en: 'irdi', he: 'אירדי' },
    scientificName: 'Mycteroperca rubra',
    family: { en: 'Serranidae', he: 'משפחת הדקריים' },
    typicalSizeCm: '20–50',
    legalMinimumCm: 40,
    protectedSpecies: false,
    habitat: { en: 'Rocky areas, 5–50 m', he: 'אזורים סלעיים, 5–50 מ\'' },
    description: {
      en: 'Elongated grey body with light spots. Spawning aggregations Dec–May. Population increasing — possibly benefiting from rabbitfish prey.',
      he: 'גוף אפור מוארך עם כתמים בהירים. התקבצויות רבייה דצמבר–מאי. האוכלוסייה גדלה — אולי בזכות הסיכן כמקור מזון.',
    },
    sourcePageId: 'parks-fish-serranidae',
  },
  {
    id: 'white-grouper',
    patterns: [/דקר המכמורת|white grouper|aeneus|לוקוס(?!\s*אדום)|\blokus\b/i],
    name: { en: 'White grouper', he: 'דקר המכמורת (לוקוס)' },
    aliases: { en: 'lokus', he: 'לוקוס, לוקוס לבן' },
    scientificName: 'Epinephelus aeneus',
    family: { en: 'Serranidae', he: 'משפחת הדקריים' },
    typicalSizeCm: '20–80',
    legalMinimumCm: 40,
    protectedSpecies: false,
    habitat: { en: 'Sandy areas (unlike other groupers); 5–150 m', he: 'אזורים חוליים (בניגוד לדקרים אחרים); 5–150 מ\'' },
    description: {
      en: '2–4 diagonal lines on gill cover. Caught by trawling — hence the name. Mass spawning "weddings" Jun–Jul. One of the finest sport-fishing targets.',
      he: '2–4 קווים אלכסוניים על מכסה הזימים. נדוג במכמורת — מכאן שמו. "חתונות" רבייה יוני–יולי. אחד מיעדי הדיג המשובחים.',
    },
    sourcePageId: 'parks-fish-serranidae',
  },
  {
    id: 'bluefish',
    patterns: [/גומבר|bluefish|pomatomus/i],
    name: { en: 'Bluefish', he: 'גומבר טורפני' },
    aliases: { en: 'gombar', he: 'גומבר' },
    scientificName: 'Pomatomus saltator',
    family: { en: 'Pomatomidae', he: 'משפחת הגומבריים' },
    typicalSizeCm: '20–50',
    legalMinimumCm: null,
    protectedSpecies: false,
    habitat: { en: 'Pelagic schools; migrates seasonally with water temperature', he: 'להקות פלגיות; נודד עונתית עם טמפרטורת המים' },
    description: {
      en: 'Mirror-image dorsal and anal fins; yellow pectoral fin. Excellent swimmer hunting in packs. Spawning in spring. Caught in standing/purse nets and on lures.',
      he: 'סנפיר גב ושת מקבילים; סנפיר חזה צהבהב. שחיין מעולה שצד בלהקות. רבייה באביב. נדוג ברשתות עמידה/הקפה ובדיג דמויים.',
    },
    sourcePageId: 'parks-fish-pomatomidae',
  },
  {
    id: 'european-barracuda',
    patterns: [/ברקודה|בarracuda|sphyraena/i],
    name: { en: 'European barracuda', he: 'אספירנה חלקה' },
    aliases: { en: 'barracuda', he: 'ברקודה, אספירנה' },
    scientificName: 'Sphyraena sphyraena',
    family: { en: 'Sphyraenidae', he: 'משפחת האספירניתיים' },
    typicalSizeCm: '25–50',
    legalMinimumCm: 20,
    protectedSpecies: false,
    habitat: { en: 'Pelagic; schools or solitary', he: 'פלגי; בלהקות או בודד' },
    description: {
      en: 'Long body with fang-like teeth; hunts in bursts up to 55 km/h. Spawning spring–summer. Caught in purse and standing nets.',
      he: 'גוף מוארך עם שיניים ניביות; צד במהירות עד 55 קמ"ש. רבייה אביב–קיץ. נדוג ברשתות הקפה ועמידה.',
    },
    sourcePageId: 'parks-fish-sphyrnidae',
  },
  {
    id: 'blacktail-bream',
    patterns: [/מנוריון|אובלד|oblada|blacktail/i],
    name: { en: 'Blacktail bream', he: 'אובלד שחור זנב' },
    aliases: { en: 'kachala', he: 'מנוריון, כחלה' },
    scientificName: 'Oblada melanura',
    family: { en: 'Sparidae', he: 'משפחת הספרוסיים' },
    typicalSizeCm: '12–22',
    legalMinimumCm: 11,
    protectedSpecies: false,
    habitat: { en: 'Shallow rocky areas to 30 m; schools', he: 'אזורים סלעיים רדודים עד 30 מ\'; בלהקות' },
    description: {
      en: 'Black spot with white ring on tail stalk. Spawning Jun–Jul. Smart and wary — hard to catch on shore rods.',
      he: 'כתם שחור עם טבעת לבנה על גבעול הזנב. רבייה יוני–יולי. חכם וחשדן — קשה לתפוס בחכות.',
    },
    sourcePageId: 'parks-fish-sparidae',
  },
  {
    id: 'sand-steenbras',
    patterns: [/מרמיר|marmir|mormyrus|steenbras/i],
    name: { en: 'Sand steenbras', he: 'שישן מסורטט (מרמיר)' },
    aliases: { en: 'marmir', he: 'מרמיר' },
    scientificName: 'Lithognathus mormyrus',
    family: { en: 'Sparidae', he: 'משפחת הספרוסיים' },
    typicalSizeCm: '7–20',
    legalMinimumCm: 11,
    protectedSpecies: false,
    habitat: { en: 'Near shore to 50 m; schools', he: 'קרוב לחוף עד 50 מ\'; בלהקות' },
    description: {
      en: 'Pointed snout with thin vertical stripes. Protandrous hermaphrodite; spawning May–Sep. Feeds on mollusks, crabs and echinoderms.',
      he: 'חרטום חד עם פסים דקים לרוחב. הרמפרודיט; רבייה מאי–ספטמבר. ניזון מרכיכות, סרטנים וקווצי עור.',
    },
    sourcePageId: 'parks-fish-sparidae',
  },
  {
    id: 'white-seabream',
    patterns: [/סרגוס(?!\s*(ה)?פסים|כתפי)|white seabream|diplodus sargus/i],
    name: { en: 'White seabream', he: 'סרגוס מסורטט' },
    aliases: { en: 'sargos', he: 'סרגוס' },
    scientificName: 'Diplodus sargus',
    family: { en: 'Sparidae', he: 'משפחת הספרוסיים' },
    typicalSizeCm: '10–22',
    legalMinimumCm: 11,
    protectedSpecies: false,
    habitat: { en: 'Rocky holes and crevices to 50 m', he: 'כוכים וסדקים בסלע עד 50 מ\'' },
    description: {
      en: 'Fine horizontal lines (hence "sargus" = drawing). Protandrous hermaphrodite; winter spawning Jan–Mar. One of the most common nearshore fish.',
      he: 'קווים דקים לרוחב (מכאן "סרגוס" = סרטוט). הרמפרודיט; רבייה בחורף ינואר–מרץ. מהדגים הנפוצים ביותר בקרבת החוף.',
    },
    sourcePageId: 'parks-fish-sparidae',
  },
  {
    id: 'zebra-seabream',
    patterns: [/סרגוס הפסים|zebra seabream|cervinus|פיג.?מה/i],
    name: { en: 'Zebra seabream', he: 'סרגוס הפסים' },
    aliases: { en: 'pajama fish', he: 'פיג\'מה, זברה' },
    scientificName: 'Diplodus cervinus',
    family: { en: 'Sparidae', he: 'משפחת הספרוסיים' },
    typicalSizeCm: '15–40',
    legalMinimumCm: 11,
    protectedSpecies: false,
    habitat: { en: 'Shallow to 50 m; solitary when adult', he: 'רדוד עד 50 מ\'; בוגרים מתבודדים' },
    description: {
      en: 'Five bold horizontal stripes. Spawning Apr–Jul. Caught on standing nets, shore rods, kayaks and spearfishing.',
      he: '5 פסים עבים לרוחב. רבייה אפריל–יולי. נדוג ברשתות עמידה, חכות, קיאק ורובה.',
    },
    sourcePageId: 'parks-fish-sparidae',
  },
  {
    id: 'two-banded-seabream',
    patterns: [/סרגוס כתפי|two.?banded|diplodus vulgaris|חראן/i],
    name: { en: 'Two-banded seabream', he: 'סרגוס כתפי' },
    aliases: { en: 'jag', he: 'ג\'אג\', חראן' },
    scientificName: 'Diplodus vulgaris',
    family: { en: 'Sparidae', he: 'משפחת הספרוסיים' },
    typicalSizeCm: '10–20',
    legalMinimumCm: 11,
    protectedSpecies: false,
    habitat: { en: 'Rocky areas, 5–20 m (to 70 m)', he: 'אזורים סלעיים, 5–20 מ\' (עד 70 מ\')' },
    description: {
      en: 'Broad black spot above gill cover ("shoulder") and spot at tail base. Winter spawning Dec–Feb.',
      he: 'כתם שחור רחב מעל מכסה הזימים ("כתף") וכתם בבסיס הזנב. רבייה בחורף דצמבר–פברואר.',
    },
    sourcePageId: 'parks-fish-sparidae',
  },
  {
    id: 'gilt-head-bream',
    patterns: [/דניס|gilt.?head|sparus aurata|צ.?יפורה/i],
    name: { en: 'Gilt-head bream', he: 'ספרוס זהוב (דניס)' },
    aliases: { en: 'denis, chipora', he: 'דניס, צ\'יפורה, אאורטה' },
    scientificName: 'Sparus aurata',
    family: { en: 'Sparidae', he: 'משפחת הספרוסיים' },
    typicalSizeCm: '15–35',
    legalMinimumCm: 15,
    protectedSpecies: false,
    habitat: { en: 'Sandy/vegetated shallows as juvenile; rocky 5–60 m as adult', he: 'חול/צמחייה בצעירות; סלע 5–60 מ\' בבגרות' },
    description: {
      en: 'Golden spot between eyes; black spot on upper gill cover. Protandrous — all start male, become female after ~3 years. Winter spawning Nov–Feb. Also farmed.',
      he: 'כתם זהוב בין העיניים; כתם שחור על מכסה הזימים. הרמפרודיט — מתחילים זכרים, הופכים לנקבות אחרי ~3 שנים. רבייה בחורף נובמבר–פברואר. מגודל גם בחקלאות ימית.',
    },
    sourcePageId: 'parks-fish-sparidae',
  },
  {
    id: 'bluefin-bream',
    patterns: [/פארידה|bluefin bream|pagrus|caeruleostictus/i],
    name: { en: 'Bluefin bream', he: 'ספרוס מצוי (פארידה)' },
    aliases: { en: 'parida', he: 'פארידה' },
    scientificName: 'Pagrus caeruleostictus',
    family: { en: 'Sparidae', he: 'משפחת הספרוסיים' },
    typicalSizeCm: '15–50',
    legalMinimumCm: 15,
    protectedSpecies: false,
    habitat: { en: 'Sandy as juvenile; rocky 30–100 m as adult', he: 'חול בצעירות; סלע 30–100 מ\' בבוגרים' },
    description: {
      en: 'Extended dorsal spines ("antenna"); blue spots on pink body. Males develop forehead hump. Spawning winter–spring.',
      he: 'קוצים מוארכים בסנפיר הגב ("אנטנה"); כתמים כחולים על גוף ורוד. לזכרים מתפתחת תפיחה על המצח. רבייה חורף–אביב.',
    },
    sourcePageId: 'parks-fish-sparidae',
  },
];

export function matchMediterraneanFish(text: string): MediterraneanFishEntry | undefined {
  return MEDITERRANEAN_FISH_CATALOG.find((entry) =>
    entry.patterns.some((re) => re.test(text)),
  );
}

export function buildMediterraneanFishDetailAnswer(entry: MediterraneanFishEntry, lang: Lang): string {
  const lines: string[] = [];
  lines.push(
    lang === 'he'
      ? `תשובה ישירה: ${entry.name.he} (${entry.scientificName}) — ${entry.family.he}.`
      : `Direct answer: ${entry.name.en} (${entry.scientificName}) — ${entry.family.en}.`,
  );
  lines.push(
    lang === 'he'
      ? `כינויים: ${entry.aliases.he}. גודל טיפוסי: ${entry.typicalSizeCm} ס"מ.`
      : `Also known as: ${entry.aliases.en}. Typical size: ${entry.typicalSizeCm} cm.`,
  );
  lines.push(entry.description[lang]);
  lines.push(entry.habitat[lang]);

  if (entry.protectedSpecies) {
    lines.push(
      lang === 'he'
        ? 'מין מוגן — אסור לדוג. אם נתפס בטעות יש לשחרר מיד.'
        : 'Protected species — do not keep. Release immediately if caught accidentally.',
    );
  } else if (entry.legalMinimumCm != null) {
    lines.push(
      lang === 'he'
        ? `אורך מינימום חוקי: ${entry.legalMinimumCm} ס"מ (INPA).`
        : `Legal minimum length: ${entry.legalMinimumCm} cm (INPA).`,
    );
  }

  lines.push(
    lang === 'he'
      ? `מקור: parks.org.il/category/sea/fish/`
      : `Source: parks.org.il/category/sea/fish/`,
  );
  return lines.join('\n\n');
}

export function buildMediterraneanFishCatalogOverview(lang: Lang): string {
  const header =
    lang === 'he'
      ? `תשובה ישירה: ${MEDITERRANEAN_FISH_CATALOG.length} מיני דגים מייצגים מ-12 משפחות בים התיכון (parks.org.il — "דע את הדג"):`
      : `Direct answer: ${MEDITERRANEAN_FISH_CATALOG.length} representative species from 12 Mediterranean fish families (parks.org.il — "Know Your Fish"):`;

  const byFamily = MEDITERRANEAN_FISH_FAMILIES.map((fam) => {
    const members = MEDITERRANEAN_FISH_CATALOG.filter((e) => e.sourcePageId === fam.pageId);
    if (members.length === 0) return null;
    const familyLabel = lang === 'he' ? fam.he : fam.en;
    const names = members.map((m) => {
      const prot = m.protectedSpecies ? (lang === 'he' ? ' 🛡️' : ' 🛡️') : '';
      const legal =
        m.legalMinimumCm != null
          ? lang === 'he'
            ? ` (מינ. ${m.legalMinimumCm} ס"מ)`
            : ` (min ${m.legalMinimumCm} cm)`
          : '';
      return lang === 'he' ? `${m.name.he}${legal}${prot}` : `${m.name.en}${legal}${prot}`;
    });
    return `${familyLabel}:\n  • ${names.join('\n  • ')}`;
  }).filter(Boolean);

  const intro =
    lang === 'he'
      ? 'בים התיכון מכיל מאות מיני דגים; חלקם מקומיים וחלקם הגיעו מים סוף דרך תעלת סואץ. דגים ויצורים ימיים חשופים לזיהום, אשפה, הרשת בתי גידול ודיג-יתר.'
      : 'The Mediterranean holds hundreds of fish species; some are native and others arrived from the Red Sea via the Suez Canal. Marine life faces pollution, habitat loss and overfishing.';

  const footer =
    lang === 'he'
      ? `\nמידע מלא, תמונות ואורח חיים: ${PARKS_MEDITERRANEAN_FISH_URL}\nאורכי מינימום רשמיים: parks.org.il/article/fish-length/`
      : `\nFull profiles with illustrations: ${PARKS_MEDITERRANEAN_FISH_URL}\nOfficial minimum sizes: parks.org.il/article/fish-length/`;

  return `${header}\n\n${intro}\n\n${byFamily.join('\n\n')}${footer}`;
}

const ASKS_MEDITERRANEAN_FISH =
  /דע את הדג|דגי הים התיכון|mediterranean fish|know your fish|משפחת (ה)?(קיפונ|נימ|קוליס|צנינ|סיכנ|נצרנ|מוסר|מולית|דקר|גומבר|אספיר|ספרוס)/i;

const ASKS_FISH_DETAIL =
  /מה זה|what is|ספר לי על|tell me about|הכר|identify|זיהוי|איך נראה|what does.*look/i;

export function tryBuildMediterraneanFishAnswer(
  question: string,
  lang: Lang,
): { directAnswer: string; usedLocalDb: true } | null {
  if (ASKS_MEDITERRANEAN_FISH.test(question) || /fish catalog/i.test(question)) {
    return { directAnswer: buildMediterraneanFishCatalogOverview(lang), usedLocalDb: true };
  }

  const entry = matchMediterraneanFish(question);
  if (!entry) return null;

  if (ASKS_FISH_DETAIL.test(question)) {
    return { directAnswer: buildMediterraneanFishDetailAnswer(entry, lang), usedLocalDb: true };
  }

  return null;
}
