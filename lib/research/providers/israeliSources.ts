/**
 * Curated Israeli fishing knowledge provider.
 *
 * Content sourced from three Israeli sites:
 * - shvilist.com  — Mediterranean fishing beaches guide
 * - parks.org.il  — Israel Nature and Parks Authority (official regulations)
 * - tiulim.net    — recommended fishing places in Israel
 * - israelfishing.co.il — lure techniques and Israeli shore fishing guides
 *
 * The sites cannot be scraped live from the browser (CORS). Instead, a daily
 * GitHub Action (scripts/refresh-sources.mjs) fetches the pages at build time
 * into lib/research/data/sourcePages.json. For Hebrew queries the provider
 * searches within that fresh page text; hand-curated bilingual snippets are
 * the fallback when fresh text is unavailable (e.g. a site blocks the bot).
 */

import type { FishingSearchProvider } from '@/lib/research/providers/types';
import type { FishingSearchQuery, RawSearchResult } from '@/types/research';
import sourcePagesJson from '@/lib/research/data/sourcePages.json';

interface SourcePage {
  id: string;
  url: string;
  title: string;
  fetchedAt: string;
  text: string;
}

const SOURCE_PAGES: Map<string, SourcePage> = new Map(
  ((sourcePagesJson as { pages: SourcePage[] }).pages ?? []).map((p) => [p.id, p]),
);

interface CuratedEntry {
  id: string;
  url: string;
  /** Page id inside sourcePages.json holding this entry's fresh full text. */
  pageId?: string;
  title: { en: string; he: string };
  snippet: { en: string; he: string };
  /** Lowercase keywords in both languages used for matching. */
  keywords: string[];
}

const SHVILIST_URL =
  'https://shvilist.com/%D7%97%D7%95%D7%A4%D7%99-%D7%93%D7%99%D7%92-%D7%91%D7%99%D7%9D-%D7%94%D7%AA%D7%99%D7%9B%D7%95%D7%9F/';
const PARKS_URL =
  'https://www.parks.org.il/sea/%d7%93%d7%92%d7%99%d7%9d-%d7%97%d7%9b%d7%9d-%d7%a9%d7%95%d7%9e%d7%a8%d7%99%d7%9d-%d7%a2%d7%9c-%d7%94%d7%99%d7%9d/';
const TIULIM_URL =
  'https://tiulim.net/%D7%9E%D7%A7%D7%95%D7%9E%D7%95%D7%AA-%D7%93%D7%99%D7%92-%D7%A9%D7%9E%D7%95%D7%9E%D7%9C%D7%A6%D7%99%D7%9D-%D7%91%D7%99%D7%A9%D7%A8%D7%90%D7%9C/';
const ISRAEL_FISHING_JARJOUR_URL =
  'https://israelfishing.co.il/%D7%9B%D7%AA%D7%91%D7%95%D7%AA/%D7%94%D7%9E%D7%93%D7%A8%D7%99%D7%9A-%D7%94%D7%A9%D7%9C%D7%9D-%D7%9C%D7%92%D7%A8%D7%92%D7%95%D7%A8/';
const TAHVIVIM_SPECIES_URL =
  'https://tahvivim.com/%d7%a1%d7%95%d7%92%d7%99-%d7%93%d7%92%d7%99%d7%9d/';
const PARKS_MEDITERRANEAN_FISH_URL = 'https://www.parks.org.il/category/sea/fish/';

export const ISRAELI_CURATED_ENTRIES: CuratedEntry[] = [
  // ---- shvilist.com — Mediterranean fishing beaches ----
  {
    id: 'shvilist-ashkelon',
    url: SHVILIST_URL,
    pageId: 'shvilist-beaches',
    title: {
      en: 'Fishing beaches in the Ashkelon area — Shvilist',
      he: 'חופי דיג באזור אשקלון — שביליסט',
    },
    snippet: {
      en: 'Around Ashkelon you can fish at Zikim beach, Nitzanim beach (paid entry), or for free at the Ashkelon National Park beach (Katza area) — a sandy section for leisure and a rocky section suited for fishing.',
      he: 'באזור אשקלון אפשר לדוג בחוף זיקים או בחוף ניצנים (כניסה בתשלום), או בחינם בחוף הפארק הלאומי אשקלון (אזור קצא"א) — קטע חולי לפנאי וקטע סלעי המתאים לדיג.',
    },
    keywords: ['אשקלון', 'זיקים', 'ניצנים', 'ashkelon', 'zikim', 'nitzanim', 'פארק לאומי', 'national park'],
  },
  {
    id: 'shvilist-ashdod',
    url: SHVILIST_URL,
    pageId: 'shvilist-beaches',
    title: {
      en: 'Fishing in Ashdod — warm water outlet — Shvilist',
      he: 'דיג באשדוד — שפך המים החמים — שביליסט',
    },
    snippet: {
      en: 'A recommended fishing point in Ashdod is the warm-water outlet next to the power station, which attracts fish year round.',
      he: 'נקודת דיג מומלצת באשדוד היא שפך המים החמים שליד תחנת הכוח, המושך דגים לאורך כל השנה.',
    },
    keywords: ['אשדוד', 'ashdod', 'תחנת הכוח', 'power station', 'מים חמים'],
  },
  {
    id: 'shvilist-netanya',
    url: SHVILIST_URL,
    pageId: 'shvilist-beaches',
    title: {
      en: 'Fishing beaches in Netanya — Argaman beach — Shvilist',
      he: 'חופי דיג בנתניה — חוף ארגמן — שביליסט',
    },
    snippet: {
      en: 'The Netanya coastline is full of reefs and rocky beaches. The recommended spot is Argaman beach at the southern entrance to the city — rocks forming small coves that hold fish, with convenient vehicle access almost to the beach.',
      he: 'רצועת החוף של נתניה משופעת בריפים ובחופים מסולעים. הנקודה המומלצת היא חוף ארגמן בכניסה הדרומית לעיר — סלעים היוצרים מפרצונים קטנים שיש בהם דגים, עם גישה נוחה לרכב כמעט עד החוף.',
    },
    keywords: ['נתניה', 'netanya', 'ארגמן', 'argaman', 'ריף', 'reef', 'מפרצונים'],
  },
  {
    id: 'shvilist-haifa',
    url: SHVILIST_URL,
    pageId: 'shvilist-beaches',
    title: {
      en: 'Fishing in Haifa — Bat Galim, Tantura and Atlit — Shvilist',
      he: 'דיג בחיפה — בת גלים, טנטורה ועתלית — שביליסט',
    },
    snippet: {
      en: 'In Haifa most beaches suffer from port pollution, but Bat Galim is recommended — a rocky beach with rich, clean fish where several methods work. Tantura beach and the rocky Atlit beach are further good options south of the city.',
      he: 'בחיפה רוב החופים מזוהמים מפעילות הנמל, אך חוף בת גלים מומלץ — חוף סלעי עם דגה עשירה ונקייה שבו אפשר לדוג בכמה שיטות. חוף טנטורה וחוף עתלית המסולע הם המלצות נוספות מדרום לעיר.',
    },
    keywords: ['חיפה', 'haifa', 'בת גלים', 'bat galim', 'טנטורה', 'tantura', 'עתלית', 'atlit'],
  },
  {
    id: 'shvilist-north',
    url: SHVILIST_URL,
    pageId: 'shvilist-beaches',
    title: {
      en: 'Fishing in Akko and Nahariya — Shvilist',
      he: 'דיג בעכו ובנהריה — שביליסט',
    },
    snippet: {
      en: 'In Akko you can fish along the whole coastal strip up to the Mazra area. In Nahariya fishing is good along the entire coast up to Rosh HaNikra; the Nahariya pier is a recommended spot for beginners.',
      he: 'בעכו אפשר לדוג לאורך כל רצועת החוף עד אזור מזרעה. בנהריה הדיג טוב לכל אורך החוף ועד ראש הנקרה; המזח של נהריה הוא נקודה מומלצת למתחילים.',
    },
    keywords: ['עכו', 'akko', 'acre', 'נהריה', 'nahariya', 'ראש הנקרה', 'rosh hanikra', 'מזח', 'pier', 'מתחילים', 'beginner'],
  },
  {
    id: 'shvilist-species',
    url: SHVILIST_URL,
    pageId: 'shvilist-beaches',
    title: {
      en: 'Fish species along the Israeli Mediterranean coast — Shvilist',
      he: 'סוגי דגים בחופי הים התיכון בישראל — שביליסט',
    },
    snippet: {
      en: 'Israeli Mediterranean species by habitat: coastal fish in shallow water (grouper/lokus, parida, aras, marmir, sargos), bottom fish (red mullet/barbunia, hake, masar, sultan ibrahim), and pelagic schooling fish (sardine, bonito/palamida, tuna, intias).',
      he: 'מיני הדגים בחופי ישראל לפי בית גידול: דגי חוף במים רדודים (לוקוס, פארידה, ארס, מרמיר, סרגוס), דגי קרקע (ברבוניה, בקלה, מסר, מול אדום/סולטן איברהים), ודגי מים עליונים בלהקות (סרדין, פלמידה, טונה, אינטיאס).',
    },
    keywords: ['סוגי דגים', 'מינים', 'לוקוס', 'ברבוניה', 'סרגוס', 'פלמידה', 'species', 'what fish', 'אילו דגים', 'איזה דגים', 'grouper', 'sardine'],
  },
  {
    id: 'shvilist-season',
    url: SHVILIST_URL,
    pageId: 'shvilist-beaches',
    title: {
      en: 'When fishing is prohibited in the Mediterranean — Shvilist',
      he: 'מתי אסור לדוג בים התיכון — שביליסט',
    },
    snippet: {
      en: 'Fishing is banned during the fish breeding season to let populations recover. The dates change each year — usually between April and June — and are published annually by the Fisheries Department. Check the Nature and Parks Authority guidance before going.',
      he: 'הדיג אסור בתקופת הרבייה של הדגים כדי לאפשר את התחדשות הדגה. התאריכים משתנים בכל שנה — לרוב בין אפריל ליוני — ומתפרסמים על ידי אגף הדיג. מומלץ לבדוק את ההנחיות באתר רשות הטבע והגנים.',
    },
    keywords: ['עונת רבייה', 'איסור דיג', 'מתי אסור', 'breeding season', 'closed season', 'when is fishing banned', 'אסור לדוג'],
  },

  // ---- parks.org.il — official INPA regulations ----
  {
    id: 'parks-license',
    url: PARKS_URL,
    pageId: 'parks-fishing-info',
    title: {
      en: 'Fishing license rules in Israel — Nature and Parks Authority',
      he: 'רישיון דיג בישראל — רשות הטבע והגנים',
    },
    snippet: {
      en: 'Official INPA guidance: rod fishing from the shore without auxiliary aids requires no license. A personal sport fishing license is required for shore fishing with aids (drone, kite, motor), cast nets, rod fishing from any vessel or flotation device, and spearfishing while free-diving. Licenses are issued online through the Ministry of Agriculture.',
      he: 'הנחיות רשות הטבע והגנים: דיג בחכה מהחוף ללא אמצעי עזר אינו מחייב רישיון. רישיון דיג אישי ספורטיבי נדרש לדיג מהחוף עם אמצעי עזר (רחפן, עפיפון, מנוע), רשת זריקה (שבאקה), דיג בחכה מכלי שיט או אמצעי ציפה, ורובה דיג בצלילה חופשית. הנפקת רישיון מתבצעת באופן מקוון באתר משרד החקלאות.',
    },
    keywords: ['רישיון', 'license', 'רישיון דיג', 'fishing license', 'חוקי', 'legal', 'מותר לדוג', 'צריך רישיון', 'permit', 'רחפן', 'שבאקה'],
  },
  {
    id: 'parks-breeding',
    url: PARKS_URL,
    pageId: 'parks-fishing-info',
    title: {
      en: 'Breeding season fishing restrictions — Nature and Parks Authority',
      he: 'הגבלות דיג בעונת הרבייה — רשות הטבע והגנים',
    },
    snippet: {
      en: 'Each year a fishing ban of up to 90 consecutive days applies between March 1 and July 1, as set by the Chief Fisheries Officer and published officially. The ban does not apply to rod fishing from the shore. In the Sea of Galilee, tilapia nesting restrictions apply roughly March 15 – July 15 in defined areas.',
      he: 'בכל שנה חל איסור דיג עד 90 ימים רצופים בין 1 במרץ ל-1 ביולי, כפי שקובע פקיד הדיג הראשי ומתפרסם רשמית. האיסור אינו חל על דיג בחכה מהחוף. בכנרת חלות מגבלות עונת הקינון של אמנון הגליל בין 15 במרץ ל-15 ביולי באזורים מוגדרים.',
    },
    keywords: ['עונת רבייה', 'איסור', 'תקנות', 'regulations', 'breeding', 'closed season', 'מתי מותר', 'קינון', 'אמנון'],
  },
  {
    id: 'parks-protected',
    url: PARKS_URL,
    pageId: 'parks-fishing-info',
    title: {
      en: 'Protected species that must not be caught — Nature and Parks Authority',
      he: 'מינים מוגנים שאסור לדוג — רשות הטבע והגנים',
    },
    snippet: {
      en: 'Protected species in Israel that must never be caught: all sharks and rays, the slipper lobster, all marine mammals, all sea turtles, and the Alexandria grouper (protected since 2021). In the Gulf of Eilat protection is broader: all mollusks and most fish are protected. Released immediately if caught by accident.',
      he: 'ערכי טבע מוגנים שאסור לדוג בישראל: כל מיני הכרישים והבטאים, כפן גושמני (לובסטר), כל היונקים הימיים, כל מיני צבי הים, ודקר אלכסנדרוני (מוגן מ-2021). במפרץ אילת ההגנה רחבה יותר: כל הרכיכות ורוב הדגים מוגנים. דג מוגן שנתפס בטעות יש לשחרר מיד.',
    },
    keywords: ['מוגן', 'מוגנים', 'protected', 'כריש', 'shark', 'צב ים', 'turtle', 'דקר', 'לובסטר', 'אסור לדוג דגים', 'ערכי טבע'],
  },
  {
    id: 'parks-minimum-size',
    url: PARKS_URL,
    pageId: 'parks-fish-length',
    title: {
      en: 'Minimum fish sizes — Nature and Parks Authority',
      he: 'אורכי מינימום של דגים — רשות הטבע והגנים',
    },
    snippet: {
      en: 'Some species may only be kept above a legal minimum length, measured with the fish lying flat from the tip of the mouth to the tip of the tail. Minimum sizes protect young fish that have not yet reproduced. The full official list is on the INPA site.',
      he: 'יש דגים שמותר לדוג רק מעל אורך מינימום חוקי, הנמדד בשכיבה מקצה הפה עד קצה הזנב. אורכי המינימום נועדו להגן על פרטים צעירים שטרם התרבו. הרשימה הרשמית המלאה באתר רשות הטבע והגנים.',
    },
    keywords: ['אורך מינימום', 'minimum size', 'minimum length', 'גודל מינימלי', 'מותר להשאיר', 'keep fish', 'איזה גודל'],
  },
  {
    id: 'parks-reserves',
    url: PARKS_URL,
    pageId: 'parks-fishing-info',
    title: {
      en: 'Marine nature reserves where fishing is banned — Nature and Parks Authority',
      he: 'שמורות טבע ימיות שאסור לדוג בהן — רשות הטבע והגנים',
    },
    snippet: {
      en: 'Fishing is prohibited inside marine nature reserves, including Rosh HaNikra, Shikmona, Rosh Carmel, Dor HaBonim, Gador and the Nitzanim dunes reserves in the Mediterranean, the Coral Reserve in Eilat, and the Bethsaida (Batiha) reserve in the Sea of Galilee. Municipal bylaws also ban fishing at declared bathing beaches, marinas and ports.',
      he: 'הדיג אסור בתוך שמורות טבע ימיות, בהן ראש הנקרה, שקמונה, ראש כרמל, דור הבונים, גדור וחולות ניצנים בים התיכון, שמורת האלמוגים באילת ושמורת הבטיחה בכנרת. חוקי עזר עירוניים אוסרים דיג גם בחופי רחצה מוכרזים, מעגנות ונמלים.',
    },
    keywords: ['שמורה', 'שמורת טבע', 'reserve', 'אסור לדוג איפה', 'where is fishing banned', 'אלמוגים', 'בטיחה', 'דור הבונים', 'שקמונה'],
  },
  {
    id: 'parks-eilat',
    url: PARKS_URL,
    pageId: 'parks-fishing-info',
    title: {
      en: 'Fishing rules in the Gulf of Eilat — Nature and Parks Authority',
      he: 'כללי דיג במפרץ אילת — רשות הטבע והגנים',
    },
    snippet: {
      en: 'In Eilat, rod fishing from the shore is allowed without a license outside banned zones. Beyond 300 m from shore, fishing is allowed only from a flotation device with a rod and a sport license. Fishing is banned near the port, Almog beach and the Coral Reserve. All mollusks are protected and most fish species are protected except specific permitted families.',
      he: 'באילת מותר דיג בחכה מקו החוף ללא רישיון מחוץ לאזורים האסורים. מעבר ל-300 מטר מהחוף מותר לדוג רק מאמצעי ציפה בחכה ועם רישיון ספורטיבי. הדיג אסור באזור הנמל, חוף אלמוג ושמורת האלמוגים. כל הרכיכות מוגנות ורוב מיני הדגים מוגנים למעט משפחות מותרות.',
    },
    keywords: ['אילת', 'eilat', 'מפרץ', 'ים סוף', 'red sea', 'אלמוג', 'coral'],
  },

  // ---- tiulim.net — recommended fishing places ----
  {
    id: 'tiulim-parks',
    url: TIULIM_URL,
    pageId: 'tiulim-fishing-places',
    title: {
      en: 'Family fishing parks in Israel — Tiulim.net',
      he: 'פארקי דיג משפחתיים בישראל — טיולים.נט',
    },
    snippet: {
      en: 'Stocked fishing parks suited to families and beginners, with gear rental: Sifsufa Fishing Park (Upper Galilee), Dag BaKfar in Yokneam, Maayan Zvi Fishing Park near Maagan Michael, and Dag VaGan in Beit Hanan — quiet lakes, shaded corners and kids areas.',
      he: 'פארקי דיג מאוכלסים המתאימים למשפחות ולמתחילים, עם השכרת ציוד: פארק הדיג ספסופה (גליל עליון), דג בכפר ביוקנעם, פארק הדיג מעיין צבי ליד מעגן מיכאל, ודג וגן בבית חנן — אגמים שקטים, פינות מוצלות ומתחמי ילדים.',
    },
    keywords: ['פארק דיג', 'fishing park', 'משפחה', 'family', 'ילדים', 'kids', 'ספסופה', 'יוקנעם', 'מעגן מיכאל', 'דג בכפר', 'השכרת ציוד'],
  },
  {
    id: 'tiulim-kinneret',
    url: TIULIM_URL,
    pageId: 'tiulim-fishing-places',
    title: {
      en: 'Fishing on the Sea of Galilee — recommended beaches — Tiulim.net',
      he: 'דיג בכנרת — חופים מומלצים — טיולים.נט',
    },
    snippet: {
      en: 'The Sea of Galilee offers many fishing options; the Fisheries Department stocks tilapia to support the lake ecosystem. Recommended fishing beaches include Dekel beach, the fishermen\'s marina, Gai beach, Shikmim beach and Ginosar. Note the ~90-day nesting-season ban, usually between March and July, in defined areas.',
      he: 'הכנרת מציעה שלל אפשרויות דיג; אגף הדיג מאכלס דגיגי אמנון לשיפור המערכת האקולוגית. חופים מומלצים לדיג: חוף הדקל, מעגן הדייגים, חוף גיא, חוף שקמים וחוף גינוסר. שימו לב לאיסור דיג של כ-90 יום בעונת ההטלה, לרוב בין מרץ ליולי, באזורים מוגדרים.',
    },
    keywords: ['כנרת', 'kinneret', 'sea of galilee', 'טבריה', 'tiberias', 'אמנון', 'tilapia', 'גינוסר', 'ginosar', 'אגם'],
  },
  {
    id: 'tiulim-telaviv',
    url: TIULIM_URL,
    pageId: 'tiulim-fishing-places',
    title: {
      en: 'Fishing in Tel Aviv — Reading and the Hilton pier — Tiulim.net',
      he: 'דיג בתל אביב — רידינג ומזח הילטון — טיולים.נט',
    },
    snippet: {
      en: 'One of the main fishing points in central Israel is Reading beach in north Tel Aviv, along with the Hilton beach pier. Around 600 fish species live in the Mediterranean, with fewer species reaching the warmer, saltier Israeli coast.',
      he: 'אחת מנקודות הדיג העיקריות במרכז הארץ היא חוף רידינג בצפון תל אביב, וכן המזח בחוף הילטון. בים התיכון ידועים כ-600 מיני דגים, וחלק קטן יותר מגיע לחופי ישראל החמים והמלוחים יותר.',
    },
    keywords: ['תל אביב', 'tel aviv', 'רידינג', 'reading', 'הילטון', 'hilton', 'מרכז', 'גורדון', 'gordon'],
  },
  {
    id: 'tiulim-yeruham',
    url: TIULIM_URL,
    pageId: 'tiulim-fishing-places',
    title: {
      en: 'Yeruham Lake — desert fishing spot — Tiulim.net',
      he: 'אגם ירוחם — נקודת דיג במדבר — טיולים.נט',
    },
    snippet: {
      en: 'Yeruham Lake, west of the town of Yeruham in the Negev, is an artificial lake surrounded by a park with picnic spots and bike trails. Swimming is prohibited, but fishing is popular there — a surprising desert fishing destination.',
      he: 'אגם ירוחם, ממערב לעיר ירוחם בנגב, הוא אגם מלאכותי מוקף פארק עם פינות פיקניק ומסלולי אופניים. הרחצה בו אסורה, אך הוא יעד דיג פופולרי — נקודת דיג מפתיעה במדבר.',
    },
    keywords: ['ירוחם', 'yeruham', 'נגב', 'negev', 'מדבר', 'desert', 'אגם מלאכותי'],
  },
  // ---- israelfishing.co.il — lure retrieve (jarjour) guide ----
  {
    id: 'israelfishing-jarjour',
    url: ISRAEL_FISHING_JARJOUR_URL,
    pageId: 'israelfishing-jarjour',
    title: {
      en: 'Complete guide to jarjour (lure retrieve) — Israel Fishing',
      he: 'המדריך השלם לג\'רג\'ור — Israel Fishing',
    },
    snippet: {
      en: 'Jarjour (ז\'ירז\'ור) is dragging an artificial lure to mimic a wounded fish. Use light rods (5–25g), small reels (2000–2500), quality braid with 50–100cm fluoro leader (FG/PR knot — never through guides). Lure types: minnow (F floating / S sinking, twitch retrieve), metal jig (hops), topwater popper/pencil, soft plastic on jig head. Target: sea bass, bluefish, barracuda, sargo.',
      he: 'ג\'רג\'ור (ז\'ירז\'ור) הוא גרירת דמוי-דג מלאכותי לדמות דג פצוע. מקלות light (5–25 גרם), סלילים 2000–2500, בד איכותי + מוביל פלואורו 50–100 ס"מ (קשר FG/PR — לא דרך המדריכים). סוגי דמויים: minnow (F צף / S שוקע, טוויץ\'), jig מתכת, topwater פופר/פנסיל, סיליקון על jig head. יעדים: לוקוס, גומבר, ברקודה, סרגוס.',
    },
    keywords: [
      'ג\'רג\'ור', 'גרגור', 'ז\'ירז\'ור', 'jarjour', 'zirzur', 'lure', 'דמוי', 'minnow', 'topwater',
      'popper', 'jig', 'סיליקון', 'soft plastic', 'retrieve', 'הובלה', 'בד', 'braid', 'מקל light',
      'לוקוס', 'גומבר', 'ברקודה', 'סרגוס', 'spinning', 'artificial lure',
    ],
  },
  // ---- parks.org.il — Mediterranean fish species guide ----
  {
    id: 'parks-mediterranean-fish',
    url: PARKS_MEDITERRANEAN_FISH_URL,
    pageId: 'parks-fish-category',
    title: {
      en: 'Know Your Fish: Mediterranean species — Nature and Parks Authority',
      he: 'דע את הדג: דגי הים התיכון — רשות הטבע והגנים',
    },
    snippet: {
      en: 'INPA guide to 12 fish families commonly caught off Israel: mullets, mackerels, jacks, rabbitfish, groupers, seabream, barracuda, bluefish, goatfish, croakers and more. Hundreds of species live in the Med; many are native, others arrived from the Red Sea via Suez. Profiles include habitat, size, spawning season and fishing methods.',
      he: 'מדריך רשות הטבע והגנים ל-12 משפחות דגים שדייגים פוגשים לעיתים קרובות: קיפוניים, קוליסיים, צניניתיים, סיכניים, דקריים, ספרוסיים, אספירניתיים, גומבריים, מוליתיים, מוסריים ועוד. מאות מינים בים התיכון; חלקם מקומיים וחלקם הגיעו מים סוף. לכל מין: בית גידול, גודל, עונת רבייה ושיטות דיג.',
    },
    keywords: [
      'דע את הדג', 'דגי הים התיכון', 'mediterranean fish', 'know your fish', 'משפחת',
      'mugilidae', 'serranidae', 'sparidae', 'scombridae', 'carangidae', 'mullidae',
      'לוקוס', 'דניס', 'בורי', 'ברבוניה', 'פלמידה', 'אינטיאס', 'גומבר', 'סרגוס',
      'grouper', 'seabream', 'mullet', 'bonito', 'amberjack', 'bluefish', 'barracuda',
      'species profile', 'fish family', 'מה זה דניס', 'מה זה לוקוס',
    ],
  },
  // ---- tahvivim.com — common Israeli sea fish species ----
  {
    id: 'tahvivim-species',
    url: TAHVIVIM_SPECIES_URL,
    pageId: 'tahvivim-species',
    title: {
      en: 'Types of fish in Israel — Tahvivim',
      he: 'סוגי דגים בישראל — תחביבים',
    },
    snippet: {
      en: 'Common Mediterranean species in Israel include grouper (lokus), red mullet (barbounia), sea bass (levrek), sillago (telvizia/battis), bonito (palamida), amberjack (intias), barracuda, bluefish, sargo, and more. Each species has different habits — rocky vs sandy bottom, day vs night activity, and preferred baits.',
      he: 'דגי ים נפוצים בישראל כוללים לוקוס, ברבוניה, לברק, טלוויזיה (באטיס), פלמידה, אינטיאס, ברקודה, גומבר, סרגוס ועוד. לכל מין הרגלי חיים שונים — סלע מול חול, פעילות יום מול לילה, ופיתיונות מועדפים.',
    },
    keywords: [
      'סוגי דגים', 'fish types', 'species', 'לוקוס', 'grouper', 'ברבוניה', 'barbounia', 'לברק', 'levrek',
      'טלוויזיה', 'sillago', 'באטיס', 'פלמידה', 'bonito', 'אינטיאס', 'amberjack', 'דוראדו', 'dorado',
      'טרכון', 'jack', 'סרגוס', 'sargo', 'גומבר', 'bluefish', 'ברקודה', 'barracuda', 'טונית', 'tunny',
    ],
  },
];

function scoreEntry(entry: CuratedEntry, queryText: string): number {
  let score = 0;
  for (const keyword of entry.keywords) {
    if (queryText.includes(keyword)) {
      score += keyword.length > 3 ? 2 : 1;
    }
  }
  return score;
}

const MAX_PASSAGE_LENGTH = 480;

/**
 * Find the most relevant passage inside freshly fetched page text.
 * Splits the page into lines/sentences and scores each by overlap with the
 * entry keywords that appear in the query. Returns undefined when nothing
 * scores — callers then fall back to the hand-curated snippet.
 */
export function extractRelevantPassage(
  pageText: string,
  queryText: string,
  keywords: string[],
): string | undefined {
  const activeKeywords = keywords.filter((k) => queryText.includes(k));
  if (activeKeywords.length === 0) return undefined;

  const segments = pageText
    .split(/\n+|(?<=[.!?:])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 30 && s.length <= 700);

  let bestIndex = -1;
  let bestScore = 0;
  for (let i = 0; i < segments.length; i++) {
    const lower = segments[i].toLowerCase();
    let score = 0;
    for (const keyword of activeKeywords) {
      if (lower.includes(keyword)) score += keyword.length > 3 ? 2 : 1;
    }
    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }
  if (bestIndex === -1) return undefined;

  // Include the following segment for context when it fits.
  let passage = segments[bestIndex];
  if (bestIndex + 1 < segments.length && passage.length + segments[bestIndex + 1].length < MAX_PASSAGE_LENGTH) {
    passage = `${passage} ${segments[bestIndex + 1]}`;
  }
  return passage.slice(0, MAX_PASSAGE_LENGTH);
}

export const israeliSourcesProvider: FishingSearchProvider = {
  name: 'israeli-fishing-sites',

  async search(query: FishingSearchQuery): Promise<RawSearchResult[]> {
    const lang = query.language === 'he' ? 'he' : 'en';
    const queryText = query.query.toLowerCase();

    const matches = ISRAELI_CURATED_ENTRIES
      .map((entry) => ({ entry, score: scoreEntry(entry, queryText) }))
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return matches.map(({ entry }) => {
      const page = entry.pageId ? SOURCE_PAGES.get(entry.pageId) : undefined;

      // Fresh page text is Hebrew — use it for Hebrew queries only.
      const freshPassage =
        lang === 'he' && page
          ? extractRelevantPassage(page.text, queryText, entry.keywords)
          : undefined;

      return {
        title: entry.title[lang],
        url: entry.url,
        snippet: freshPassage && freshPassage.length >= 60 ? freshPassage : entry.snippet[lang],
        provider: 'israeli-fishing-sites',
        // Freshness scoring rewards the build-time fetch date.
        updatedAt: page?.fetchedAt,
      };
    });
  },
};
