/**
 * Per-beach fishing profiles — species, equipment, aliases, and local notes.
 * Used by the AI assistant for accurate location-specific answers.
 */

export interface BeachProfile {
  spotId: string;
  aliases: string[];
  description: { en: string; he: string };
  speciesIds: Array<{ id: string; likelihood: 'high' | 'medium' | 'low' }>;
  fishingMethods: string[];
  parkingInformation: { en: string; he: string };
  hazardNotes?: { en: string; he: string };
  equipmentOverride?: {
    rod?: string;
    reel?: string;
    mainLine?: string;
    leader?: string;
    hooks?: string;
    weights?: string;
    baits?: string[];
    castingTip?: { en: string; he: string };
  };
  localTips: { en: string; he: string };
}

/** species id references DEMO_SPECIES in demoData.ts */
export const BEACH_PROFILES: Record<string, BeachProfile> = {
  'demo-1': {
    spotId: 'demo-1',
    aliases: ['gordon', 'גורדון', 'gordon beach', 'חוף גורדון', 'tel aviv beach', 'חוף תל אביב', 'frishman', 'פרישמן', 'hilton tel aviv', 'חוף הילטון', 'alma beach', 'חוף עלמה', 'charles clore', 'צ׳ארלס קלור', 'tel baruch', 'תל ברוך', 'חוף תל ברוך'],
    description: {
      en: 'Central Tel Aviv sandy beach. Wide flat shore, gentle slope. Very popular urban fishing — crowded in summer. Best at dawn before swimmers arrive.',
      he: 'חוף חולי מרכזי בתל אביב. שיפוע עדין, חוף רחב. דיג עירוני פופולרי — עמוס בקיץ. הכי טוב בשחר לפני הרחצה.',
    },
    speciesIds: [
      { id: 'sp-1', likelihood: 'high' },
      { id: 'sp-2', likelihood: 'medium' },
      { id: 'sp-7', likelihood: 'high' },
      { id: 'sp-15', likelihood: 'medium' },
    ],
    fishingMethods: ['surf_casting', 'bottom_fishing', 'float_fishing'],
    parkingInformation: { en: 'Paid parking along Herbert Samuel St. Arrive early on weekends.', he: 'חניה בתשלום לאורך הרברט סמואל. הגיעו מוקדם בסופ"ש.' },
    equipmentOverride: {
      rod: 'surf rod 3.6–4.0m, 80–120g casting weight',
      weights: '100–150g pyramid sinkers',
      baits: ['sardine', 'squid', 'bread for mullet'],
      castingTip: { en: 'Cast beyond the first breaker line into deeper water.', he: 'הטל מעבר לקו הגל הראשון למים עמוקים יותר.' },
    },
    localTips: {
      en: 'Mullet often feed in the surf zone close to shore. Sea bass at dawn near the breakwater south of Gordon.',
      he: 'בורי ניזון לעיתים קרובות באזור הגלים. לברק בשעות השחר ליד השובר דרומית לגורדון.',
    },
  },

  'demo-2': {
    spotId: 'demo-2',
    aliases: ['herzliya marina', 'מרינה הרצליה', 'herzliya pier', 'רציף הרצליה', 'sidna ali', 'סידנא עלי', 'sidna ali beach', 'חוף סידנא עלי'],
    description: {
      en: 'Herzliya marina pier and breakwater. Sandy bottom near pier, deeper water access. Good for bottom fishing and lure casting from the pier.',
      he: 'מזח ומרינה בהרצליה. קרקעית חולית ליד המזח, גישה למים עמוקים יותר. מתאים לדיג תחתית והטלת דמויי-טרף מהרציף.',
    },
    speciesIds: [
      { id: 'sp-1', likelihood: 'high' },
      { id: 'sp-4', likelihood: 'medium' },
      { id: 'sp-5', likelihood: 'medium' },
      { id: 'sp-11', likelihood: 'low' },
    ],
    fishingMethods: ['bottom_fishing', 'lure_fishing', 'float_fishing'],
    parkingInformation: { en: 'Marina parking lot — paid. Pier access on foot.', he: 'חניון המרינה — בתשלום. גישה ברגל לרציף.' },
    equipmentOverride: {
      rod: 'medium-heavy rod 2.7–3.3m or pier rod',
      reel: 'spinning 4000–5000',
      weights: '80–120g for bottom, lighter for float',
      baits: ['sardine', 'squid', 'live shrimp'],
    },
    localTips: {
      en: 'Fish the pier edges and shadow lines. Barracuda occasionally patrols near the entrance channel.',
      he: 'דוגו בקצוות הרציף ובאזורי הצל. ברקודה מדי פעם סורקת ליד תעלת הכניסה.',
    },
  },

  'demo-3': {
    spotId: 'demo-3',
    aliases: ['jaffa', 'יפו', 'yafo', 'old jaffa', 'יפו העתיקה', 'jaffa port', 'נמל יפו', 'jaffa rocks', 'סלעי יפו'],
    description: {
      en: 'Rocky Jaffa coastline below the old city. Uneven volcanic rock, pockets and channels. Excellent for bream and grouper but slippery and wave-exposed.',
      he: 'חוף סלעי ביפו מתחת לעיר העתיקה. סלעים מחוספסים, גומות ותעלות. מצוין לדניס ולוקוס אך חלק וחשוף לגלים.',
    },
    speciesIds: [
      { id: 'sp-2', likelihood: 'high' },
      { id: 'sp-8', likelihood: 'medium' },
      { id: 'sp-4', likelihood: 'high' },
      { id: 'sp-14', likelihood: 'medium' },
    ],
    fishingMethods: ['rock_fishing', 'bottom_fishing', 'float_fishing'],
    parkingInformation: { en: 'Old Jaffa parking — limited. Walk down to rocks.', he: 'חניה ביפו העתיקה — מוגבלת. ירידה ברגל לסלעים.' },
    hazardNotes: { en: 'Very slippery rocks. Never fish alone in swell. Watch sudden waves.', he: 'סלעים חלקים מאוד. אל תדגו לבד בגלים. שימו לב לגלים פתאומיים.' },
    equipmentOverride: {
      rod: 'stiff rock-fishing rod 3.0–3.6m',
      weights: '60–100g breakout sinkers',
      baits: ['squid', 'crab', 'local shrimp'],
      castingTip: { en: 'Short casts into gullies and rock edges — do not need long distance.', he: 'הטלות קצרות לגומות ולשפת הסלע — לא צריך מרחק.' },
    },
    localTips: {
      en: 'Best at night for bream. Grouper is protected — check size limits. Use headlamp and non-slip boots.',
      he: 'הכי טוב בלילה לדניס. לוקוס מוגן — בדקו מגבלות גודל. פנס ראש ונעליים מונעות החלקה.',
    },
  },

  'demo-4': {
    spotId: 'demo-4',
    aliases: ['ashdod', 'אשדוד', 'ashdod port', 'נמל אשדוד', 'ashdod harbor', 'ashdod marina', 'מרינה אשדוד'],
    description: {
      en: 'Ashdod harbor and breakwater area. Mixed sand and structure. Strong currents near channel — experienced anglers only near port entrance.',
      he: 'אזור נמל אשדוד ושובר הגלים. חול מעורב עם מבנים. זרמים חזקים ליד התעלה — דייגים מנוסים בלבד ליד כניסת הנמל.',
    },
    speciesIds: [
      { id: 'sp-1', likelihood: 'medium' },
      { id: 'sp-7', likelihood: 'high' },
      { id: 'sp-5', likelihood: 'medium' },
      { id: 'sp-6', likelihood: 'medium' },
    ],
    fishingMethods: ['bottom_fishing', 'surf_casting', 'float_fishing'],
    parkingInformation: { en: 'Harbor area parking. Check restricted zones near military/port facilities.', he: 'חניה באזור הנמל. בדקו אזורים מוגבלים ליד מתקנים צבאיים/נמל.' },
    hazardNotes: { en: 'Port traffic and strong currents. Stay clear of ship channels.', he: 'תנועת ספינות וזרמים חזקים. היזהרו מתעפולי ספינות.' },
    localTips: {
      en: 'Mullet and mackerel near the outer breakwater. Early morning best before port activity increases.',
      he: 'בורי ומקרל ליד שובר הגלים החיצוני. שעות הבוקר המוקדמות הכי טובות.',
    },
  },

  'demo-5': {
    spotId: 'demo-5',
    aliases: ['caesarea', 'קיסריה', 'caesarea beach', 'חוף קיסריה', 'sdot yam', 'שדות ים', 'maagan michael', 'מעגן מיכאל'],
    description: {
      en: 'Caesarea and Sdot Yam sandy beaches. Clear water, gradual sandy slope. Popular family fishing spot. Ancient reef remnants offshore in some sections.',
      he: 'חופי חול קיסריה ושדות ים. מים צלולים, שיפוע חולי הדרגתי. מקום דיג משפחתי פופולרי. שרידי שונית בחלק מהאזורים.',
    },
    speciesIds: [
      { id: 'sp-1', likelihood: 'high' },
      { id: 'sp-3', likelihood: 'high' },
      { id: 'sp-9', likelihood: 'medium' },
      { id: 'sp-15', likelihood: 'medium' },
    ],
    fishingMethods: ['surf_casting', 'bottom_fishing'],
    parkingInformation: { en: 'Beach parking at Caesarea national park area — fee may apply.', he: 'חניה בחוף קיסריה/שדות ים — ייתכן תשלום.' },
    localTips: {
      en: 'Sand steenbras (marmor) common on sandy bottom. Dawn and dusk productive for sea bass.',
      he: 'מרמור נפוץ על קרקעית חולית. שחר ודמדומים פרודוקטיביים ללוקוס.',
    },
  },

  'demo-6': {
    spotId: 'demo-6',
    aliases: ['netanya', 'נתניה', 'netanya cliffs', 'צוקי נתניה', 'sironit', 'סירונית', 'netanya beach', 'חוף נתניה'],
    description: {
      en: 'Netanya cliff and rocky shore sections. Elevated rock platforms with drop-offs. Experienced anglers only — dangerous in medium swell.',
      he: 'צוקים וחופים סלעיים בנתניה. מרפסות סלע מוגבהות עם מדרונות תלולים. לדייגים מנוסים בלבד — מסוכן בגל בינוני.',
    },
    speciesIds: [
      { id: 'sp-2', likelihood: 'high' },
      { id: 'sp-4', likelihood: 'high' },
      { id: 'sp-8', likelihood: 'low' },
      { id: 'sp-14', likelihood: 'medium' },
    ],
    fishingMethods: ['rock_fishing', 'bottom_fishing'],
    parkingInformation: { en: 'Cliff-top parking along Netanya promenade.', he: 'חניה בראש הצוק לאורך הטיילת.' },
    hazardNotes: { en: 'High fall risk from cliffs. Slippery rock. Check wave forecast — do not fish if waves >1m.', he: 'סכנת נפילה מהצוק. סלע חלק. בדקו תחזית גלים — אל תדגו מעל גל 1מ.' },
    equipmentOverride: {
      rod: 'strong rock rod 3.3–3.9m',
      weights: '80–150g depending on swell',
      baits: ['squid', 'crab', 'sardine'],
    },
    localTips: {
      en: 'Red porgy and bream target species on rocky bottom. Night sessions productive in calm conditions.',
      he: 'פארידה ודניס הם מיני מטרה על קרקעית סלעית. דיג לילה פרודוקטיבי בתנאים שקטים.',
    },
  },

  'demo-7': {
    spotId: 'demo-7',
    aliases: ['haifa', 'חיפה', 'haifa breakwater', 'שובר גלים חיפה', 'dado beach', 'חוף דדו', 'bat galim', 'בת גלים', 'haifa port', 'נמל חיפה'],
    description: {
      en: 'Haifa breakwater and Bat Galim area. Deep water close to shore on the breakwater. Mixed rocky and sandy sections along the bay.',
      he: 'שובר הגלים חיפה ואזור בת גלים. מים עמוקים קרוב לחוף על השובר. אזורים מעורבים סלע וחול לאורך המפרץ.',
    },
    speciesIds: [
      { id: 'sp-1', likelihood: 'high' },
      { id: 'sp-5', likelihood: 'high' },
      { id: 'sp-10', likelihood: 'medium' },
      { id: 'sp-6', likelihood: 'medium' },
    ],
    fishingMethods: ['bottom_fishing', 'lure_fishing', 'surf_casting'],
    parkingInformation: { en: 'Bat Galim beach parking. Breakwater access on foot.', he: 'חניה בחוף בת גלים. גישה לשובר ברגל.' },
    localTips: {
      en: 'Bluefish runs in autumn. Amberjack possible from breakwater in summer. Strong currents on outgoing tide.',
      he: 'גומבר פעיל בסתיו. אינטיאס אפשרי מהשובר בקיץ. זרמים חזקים בשפל יורד.',
    },
  },

  'demo-8': {
    spotId: 'demo-8',
    aliases: ['ashkelon', 'אשקלון', 'ashkelon beach', 'חוף אשקלון', 'ashkelon south', 'דרום אשקלון'],
    description: {
      en: 'Ashkelon southern beaches. Mixed sand and rock sections. Relatively quiet compared to central coast. Good surf casting beach.',
      he: 'חופי דרום אשקלון. קטעים מעורבים חול וסלע. שקט יחסית לעומת המרכז. חוף טוב להטלת סרף.',
    },
    speciesIds: [
      { id: 'sp-1', likelihood: 'high' },
      { id: 'sp-2', likelihood: 'medium' },
      { id: 'sp-15', likelihood: 'high' },
      { id: 'sp-3', likelihood: 'medium' },
    ],
    fishingMethods: ['surf_casting', 'bottom_fishing'],
    parkingInformation: { en: 'Free parking near southern beach access roads.', he: 'חניה חינם ליד כבישי הגישה לחוף הדרומי.' },
    localTips: {
      en: 'Leerfish possible in surf during warm months. Less crowded — good for long casting practice.',
      he: 'ליציה אפשרית בגלים בחודשים חמים. פחות עמוס — טוב לתרגול הטלות ארוכות.',
    },
  },

  'demo-9': {
    spotId: 'demo-9',
    aliases: ['palmachim', 'פלמחים', 'palmachim beach', 'חוף פלמחים', 'palmachim coast'],
    description: {
      en: 'Palmachim Beach — long natural sandy beach south of Rishon. Open Mediterranean shore, moderate waves. One of the best surf-casting beaches in central Israel.',
      he: 'חוף פלמחים — חוף חולי טבעי ארוך דרומית לרישון. חוף פתוח לים התיכון, גלים בינוניים. אחד מחופי הסרף הטובים במרכז הארץ.',
    },
    speciesIds: [
      { id: 'sp-1', likelihood: 'high' },
      { id: 'sp-15', likelihood: 'high' },
      { id: 'sp-5', likelihood: 'medium' },
      { id: 'sp-3', likelihood: 'medium' },
    ],
    fishingMethods: ['surf_casting', 'bottom_fishing'],
    parkingInformation: { en: 'Beach parking lot at Palmachim — fills early on weekends.', he: 'חניון חוף פלמחים — מתמלא מוקדם בסופ"ש.' },
    equipmentOverride: {
      rod: 'long surf rod 4.0–4.5m, 150–200g casting weight',
      weights: '150–200g pyramid or grip leads',
      baits: ['sardine', 'squid', 'mackerel strips'],
      castingTip: { en: 'Long casts needed — sand shelf extends far. Target beyond the bar.', he: 'נדרשות הטלות ארוכות — מדף החול רחוק. כוונו מעבר לשבר הגלים.' },
    },
    localTips: {
      en: 'Famous for leerfish and sea bass in spring-autumn. Strong onshore wind makes casting difficult — best with NW or light wind.',
      he: 'מפורסם בליציה ולוקוס באביב-סתיו. רוח קדמית חזקה מקשה על הטלה — הכי טוב ברוח צפון-מערב או קלה.',
    },
  },

  'demo-10': {
    spotId: 'demo-10',
    aliases: ['bat yam', 'בת ים', 'bat yam beach', 'חוף בת ים', 'rambla bat yam'],
    description: {
      en: 'Bat Yam urban sandy beach. Wide shore, easy access. Family-friendly but crowded. Mullet and sea bass in season.',
      he: 'חוף חולי עירוני בבת ים. חוף רחב, גישה קלה. ידידותי למשפחות אך עמוס. בורי ולוקוס בעונה.',
    },
    speciesIds: [
      { id: 'sp-7', likelihood: 'high' },
      { id: 'sp-1', likelihood: 'medium' },
      { id: 'sp-3', likelihood: 'medium' },
      { id: 'sp-15', likelihood: 'low' },
    ],
    fishingMethods: ['surf_casting', 'float_fishing', 'bottom_fishing'],
    parkingInformation: { en: 'Street parking along Bat Yam promenade.', he: 'חניה ברחוב לאורך הטיילת.' },
    localTips: {
      en: 'Float fishing for mullet near shore works well. Avoid peak swimming hours.',
      he: 'דיג עם פלואט לבורי קרוב לחוף עובד היטב. הימנעו משעות שיא רחצה.',
    },
  },

  'demo-11': {
    spotId: 'demo-11',
    aliases: ['rishon', 'ראשון', 'rishon lezion', 'ראשון לציון', 'rishon beach', 'חוף ראשון', 'palmachim north'],
    description: {
      en: 'Rishon LeZion beach area north of Palmachim. Sandy open shore, similar conditions to Palmachim but more urban access.',
      he: 'אזור חוף ראשון לציון צפונית לפלמחים. חוף חולי פתוח, תנאים דומים לפלמחים עם גישה עירונית.',
    },
    speciesIds: [
      { id: 'sp-1', likelihood: 'high' },
      { id: 'sp-15', likelihood: 'medium' },
      { id: 'sp-7', likelihood: 'medium' },
      { id: 'sp-3', likelihood: 'medium' },
    ],
    fishingMethods: ['surf_casting', 'bottom_fishing'],
    parkingInformation: { en: 'Paid beach parking at Rishon promenade.', he: 'חניה בתשלום בטיילת ראשון.' },
    localTips: {
      en: 'Good alternative when Palmachim parking is full. Similar species profile.',
      he: 'חלופה טובה כשחניון פלמחים מלא. פרופיל מינים דומה.',
    },
  },

  'demo-12': {
    spotId: 'demo-12',
    aliases: ['beit yanai', 'בית ינאי', 'beit yanai beach', 'חוף בית ינאי', 'michmoret', 'מיכמור', 'mikhmoret', 'apollonia', 'אפולוניה'],
    description: {
      en: 'Beit Yanai and Michmoret beaches. Sandy with rocky sections at Apollonia ruins. Nature reserve nearby — respect protected zones.',
      he: 'חופי בית ינאי ומיכמור. חולי עם קטעים סלעיים ליד שרידי אפולוניה. שמורת טבע בקרבת מקום — כבדו אזורים מוגנים.',
    },
    speciesIds: [
      { id: 'sp-1', likelihood: 'high' },
      { id: 'sp-2', likelihood: 'medium' },
      { id: 'sp-14', likelihood: 'medium' },
      { id: 'sp-3', likelihood: 'high' },
    ],
    fishingMethods: ['surf_casting', 'rock_fishing', 'bottom_fishing'],
    parkingInformation: { en: 'Beit Yanai beach parking — popular, arrive early.', he: 'חניה בחוף בית ינאי — פופולרי, הגיעו מוקדם.' },
    localTips: {
      en: 'Rocky section near Apollonia good for bream. Sandy main beach for surf casting.',
      he: 'הקטע הסלעי ליד אפולוניה טוב לדניס. החוף החולי הראשי להטלת סרף.',
    },
  },

  'demo-13': {
    spotId: 'demo-13',
    aliases: ['nahariya', 'נהריה', 'nahariya beach', 'חוף נהריה', 'akko', 'acre', 'עכו', 'ako beach', 'חוף עכו'],
    description: {
      en: 'Northern coast — Nahariya and Acre rocky/sandy mix. Cooler water, different seasonal patterns. Rocky Acre old city walls area for experienced rock fishers.',
      he: 'החוף הצפוני — נהריה ועכו מעורב סלע וחול. מים קרירים יותר, דפוסים עונתיים שונים. אזור חומות עכו העתיקה לדייג סלעים מנוסים.',
    },
    speciesIds: [
      { id: 'sp-1', likelihood: 'medium' },
      { id: 'sp-2', likelihood: 'high' },
      { id: 'sp-4', likelihood: 'high' },
      { id: 'sp-9', likelihood: 'medium' },
    ],
    fishingMethods: ['rock_fishing', 'bottom_fishing', 'surf_casting'],
    parkingInformation: { en: 'Nahariya promenade parking. Acre old city — walk to rocks.', he: 'חניה בטיילת נהריה. עכו העתיקה — הליכה לסלעים.' },
    hazardNotes: { en: 'Rocky shores slippery. Northern swells can be larger in winter.', he: 'חופים סלעיים חלקים. גלים צפוניים גדולים יותר בחורף.' },
    localTips: {
      en: 'Bream and red porgy common on rocky north coast. Spring and autumn most productive.',
      he: 'דניס ופארידה נפוצים בחוף הסלעי הצפוני. אביב וסתיו הכי פרודוקטיביים.',
    },
  },

  'demo-14': {
    spotId: 'demo-14',
    aliases: ['nitzanim', 'ניצנים', 'nitzanim beach', 'חוף ניצנים', 'nitzanim dunes'],
    description: {
      en: 'Nitzanim sandy beach and dunes south of Ashdod. Natural undeveloped shore. Long shallow sandy shelf — excellent surf beach.',
      he: 'חוף ניצנים ודיונות דרומית לאשדוד. חוף טבעי לא מפותח. מדף חולי רדוד ארוך — חוף סרף מצוין.',
    },
    speciesIds: [
      { id: 'sp-1', likelihood: 'high' },
      { id: 'sp-15', likelihood: 'high' },
      { id: 'sp-3', likelihood: 'medium' },
      { id: 'sp-5', likelihood: 'low' },
    ],
    fishingMethods: ['surf_casting', 'bottom_fishing'],
    parkingInformation: { en: 'Nitzanim nature area parking — check reserve rules.', he: 'חניה באזור שמורת ניצנים — בדקו תקנות השמורה.' },
    localTips: {
      en: 'Less pressure from anglers than Palmachim. Leerfish and sea bass primary targets.',
      he: 'פחות לחץ דייגים מפלמחים. ליציה ולוקוס הם מיני מטרה עיקריים.',
    },
  },

  'demo-15': {
    spotId: 'demo-15',
    aliases: ['zikim', 'זיקים', 'zikim beach', 'חוף זיקים', 'kibbutz zikim'],
    description: {
      en: 'Zikim beach near Gaza border area. Sandy open shore. Check current security/access advisories before visiting.',
      he: 'חוף זיקים ליד אזור הגבול. חוף חולי פתוח. בדקו הנחיות ביטחון/גישה עדכניות לפני ביקור.',
    },
    speciesIds: [
      { id: 'sp-1', likelihood: 'high' },
      { id: 'sp-15', likelihood: 'medium' },
      { id: 'sp-2', likelihood: 'low' },
      { id: 'sp-3', likelihood: 'medium' },
    ],
    fishingMethods: ['surf_casting', 'bottom_fishing'],
    parkingInformation: { en: 'Kibbutz Zikim beach access parking.', he: 'חניה בגישה לחוף קיבוץ זיקים.' },
    hazardNotes: { en: 'Remote area — always check official access and security status.', he: 'אזור מרוחק — תמיד בדקו סטטוס גישה וביטחון רשמי.' },
    localTips: {
      en: 'Quiet beach when accessible. Similar species to Ashkelon/Palmachim zone.',
      he: 'חוף שקט כשהגישה פתוחה. מינים דומים לאזור אשקלון/פלמחים.',
    },
  },

  'demo-16': {
    spotId: 'demo-16',
    aliases: ['dor', 'דור', 'dor beach', 'חוף דור', 'habonim', 'הבונים', 'habonim beach', 'חוף הבונים'],
    description: {
      en: 'Dor and Habonim beaches — nature reserve coastline. Sandy coves between rocky headlands. Beautiful but check reserve fishing rules.',
      he: 'חופי דור והבונים — קו חוף שמורת טבע. מפרצונות חוליים בין ראשי סלע. יפה אך בדקו תקנות דיג בשמורה.',
    },
    speciesIds: [
      { id: 'sp-1', likelihood: 'high' },
      { id: 'sp-2', likelihood: 'medium' },
      { id: 'sp-14', likelihood: 'medium' },
      { id: 'sp-9', likelihood: 'medium' },
    ],
    fishingMethods: ['surf_casting', 'rock_fishing', 'bottom_fishing'],
    parkingInformation: { en: 'Dor beach national park parking.', he: 'חניה בפארק חוף דור.' },
    localTips: {
      en: 'Rocky headlands between coves hold bream. Sandy coves good for surf casting at dawn.',
      he: 'ראשי סלעים בין המפרצונות מחזיקים דניס. מפרצונות חוליים טובים לסרף בשחר.',
    },
  },

  'demo-17': {
    spotId: 'demo-17',
    aliases: ['eilat', 'אילת', 'eilat beach', 'חוף אילת', 'coral beach eilat', 'חוף האלמוגים', 'north beach eilat', 'חוף צפון אילת'],
    description: {
      en: 'Eilat — Red Sea (not Mediterranean). Pier and shore fishing for different species: barracuda, grouper, emperor fish. Warm water year-round.',
      he: 'אילת — ים סוף (לא ים תיכון). דיג ממזח וחוף למינים שונים: ברקודה, לוקוס, פלגאוס. מים חמים כל השנה.',
    },
    speciesIds: [
      { id: 'sp-11', likelihood: 'high' },
      { id: 'sp-8', likelihood: 'medium' },
      { id: 'sp-10', likelihood: 'medium' },
      { id: 'sp-12', likelihood: 'medium' },
    ],
    fishingMethods: ['pier_fishing', 'lure_fishing', 'bottom_fishing'],
    parkingInformation: { en: 'North beach and Coral Beach area parking.', he: 'חניה בחוף הצפון ואזור חוף האלמוגים.' },
    hazardNotes: { en: 'Marine reserve zones — fishing prohibited in coral reserve. Check maps.', he: 'אזורי שמורה ימית — דיג אסור בשמורת האלמוגים. בדקו מפות.' },
    equipmentOverride: {
      rod: 'medium spinning rod 2.4–3.0m',
      reel: 'spinning 3000–4000',
      mainLine: 'PE 1–1.5 or mono 0.25mm',
      baits: ['squid', 'shrimp', 'lures — metals and jigs'],
    },
    localTips: {
      en: 'Completely different from Mediterranean coast. Barracuda on lures from pier. Respect marine park boundaries.',
      he: 'שונה לחלוטין מחוף הים התיכון. ברקודה על דמויי-טרף מהמזח. כבדו גבולות הפארק הימי.',
    },
  },

  'demo-18': {
    spotId: 'demo-18',
    aliases: ['kinneret', 'כנרת', 'sea of galilee', 'ים כנרת', 'tiberias', 'טבריה', 'tiberias beach', 'חוף טבריה', 'ein gev', 'עין גב'],
    description: {
      en: 'Sea of Galilee (Kinneret) — freshwater lake. Species: tilapia (amnun), catfish (coridani), carp. Completely different tackle from sea fishing.',
      he: 'ים כנרת — אגם מים מתוקים. מינים: מושט (אמנון), ברבוש, קרפיון. ציוד שונה לחלוטין מדיג ים.',
    },
    speciesIds: [
      { id: 'sp-7', likelihood: 'high' },
    ],
    fishingMethods: ['float_fishing', 'bottom_fishing', 'feeder_fishing'],
    parkingInformation: { en: 'Tiberias promenade or Ein Gev beach parking.', he: 'חניה בטיילת טבריה או חוף עין גב.' },
    equipmentOverride: {
      rod: 'light-medium float rod 3.6–4.5m',
      reel: 'spinning 2000–3000',
      mainLine: 'mono 0.20–0.25mm',
      hooks: '#6–10',
      weights: 'small split shot or feeder',
      baits: ['bread', 'corn', 'worms', 'dough'],
      castingTip: { en: 'Freshwater — no sea sinkers needed. Float or feeder methods.', he: 'מים מתוקים — לא צריך משקולות ים. פלואט או פידר.' },
    },
    localTips: {
      en: 'NOT Mediterranean — tilapia (amnun) main target. License still required. Different regulations apply.',
      he: 'לא ים תיכון — מושט (אמנון) מין מטרה עיקרי. עדיין נדרש רישיון. תקנות שונות חלות.',
    },
  },
};

/** Build alias → spotId map, longest aliases first for accurate matching */
export function buildAliasMap(): Array<{ pattern: RegExp; spotId: string }> {
  const entries: Array<{ alias: string; spotId: string }> = [];
  for (const profile of Object.values(BEACH_PROFILES)) {
    for (const alias of profile.aliases) {
      entries.push({ alias: alias.toLowerCase().trim(), spotId: profile.spotId });
    }
  }
  entries.sort((a, b) => b.alias.length - a.alias.length);
  return entries.map((e) => ({
    pattern: new RegExp(escapeRegex(e.alias), 'i'),
    spotId: e.spotId,
  }));
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const ALIAS_MAP = buildAliasMap();

export function getBeachProfile(spotId: string): BeachProfile | undefined {
  return BEACH_PROFILES[spotId];
}

export function findSpotIdFromText(text: string): string | null {
  for (const { pattern, spotId } of ALIAS_MAP) {
    if (pattern.test(text)) return spotId;
  }
  return null;
}
