import { resolveLang } from '@/lib/localization/localizedText';

export interface SpeciesProfile {
  id: string;
  description: { en: string; he: string };
  habitat: { en: string; he: string };
  identificationNotes: { en: string; he: string };
  handlingNotes: { en: string; he: string };
  consumptionWarning: { en: string; he: string };
}

export const SPECIES_PROFILES: Record<string, SpeciesProfile> = {
  'sp-1': {
    id: 'sp-1',
    description: {
      en: 'Popular Mediterranean game fish. Strong fighter on light tackle. Often hunts near structure at dawn and dusk.',
      he: 'דג מטרה פופולרי בים התיכון. לוחם חזק על ציוד קל. נצוד לעיתים קרובות ליד מבנים בשעות השחר והדמדומים.',
    },
    habitat: {
      en: 'Coastal waters, rocky and sandy areas',
      he: 'מים חופיים, אזורים סלעיים וחוליים',
    },
    identificationNotes: {
      en: 'Silver body with dark back. Two dorsal fins. Juveniles may show dark lateral spots.',
      he: 'גוף כסוף עם גב כהה. שני סנפירי גב. לדגים צעירים עשויים להיות כתמים כהים לאורך הגוף.',
    },
    handlingNotes: {
      en: 'Handle with wet hands. Support the belly when lifting larger fish.',
      he: 'אחזו בידיים רטובות. תמכו בבטן בעת הרמת דגים גדולים.',
    },
    consumptionWarning: {
      en: 'Only consume fish you can positively identify and that meet local size limits.',
      he: 'צרכו רק דגים שזיהיתם בוודאות ושעומדים במגבלות הגודל המקומיות.',
    },
  },
  'sp-2': {
    id: 'sp-2',
    description: {
      en: 'One of the most sought-after shore species in Israel. Found around reefs and rocky ground.',
      he: 'אחד ממיני החוף המבוקשים בישראל. נמצא סביב שוניות וקרקע סלעית.',
    },
    habitat: { en: 'Rocky reefs and sandy bottoms', he: 'שוניות סלעיות וקרקעות חוליות' },
    identificationNotes: {
      en: 'Deep body, blue spots on head in adults. Pinkish-silver flanks.',
      he: 'גוף עמוק, כתמים כחולים על הראש בבוגרים. צדדים ורודים-כסופים.',
    },
    handlingNotes: { en: 'Sharp gill covers — handle carefully.', he: 'כיסויי זימים חדים — אחזו בזהירות.' },
    consumptionWarning: {
      en: 'Check minimum size regulations before keeping.',
      he: 'בדקו תקנות גודל מינימלי לפני שמירה.',
    },
  },
  'sp-3': {
    id: 'sp-3',
    description: {
      en: 'Common on sandy Mediterranean beaches. Feeds on worms and small crustaceans in the surf zone.',
      he: 'נפוץ על חופי חול בים התיכון. ניזון מתולעים וסרטנים קטנים באזור הגלים.',
    },
    habitat: { en: 'Sandy bottoms near shore', he: 'קרקעות חוליות סמוך לחוף' },
    identificationNotes: {
      en: 'Elongated silver body with dark spot at pectoral fin base.',
      he: 'גוף כסוף מוארך עם כתם כהה בבסיס סנפיר החזה.',
    },
    handlingNotes: { en: 'Delicate mouth — avoid lip gripping.', he: 'פה עדין — הימנעו מאחיזה בשפתיים.' },
    consumptionWarning: {
      en: 'Excellent table fish when within legal size.',
      he: 'דג אוכל מצוין כשהוא בגודל חוקי.',
    },
  },
  'sp-4': {
    id: 'sp-4',
    description: {
      en: 'Lives around rocky structure. Cautious feeder — patience and fresh bait help.',
      he: 'חי סביב מבנים סלעיים. אוכל זהיר — סבלנות ופיתיון טרי עוזרים.',
    },
    habitat: { en: 'Rocky areas', he: 'אזורים סלעיים' },
    identificationNotes: {
      en: 'Robust body, steep forehead, reddish coloration on larger adults.',
      he: 'גוף חסון, מצח תלול, גוון אדמדם בבוגרים גדולים.',
    },
    handlingNotes: { en: 'Strong jaws — keep fingers clear.', he: 'לסתות חזקות — שמרו על האצבעות.' },
    consumptionWarning: {
      en: 'Verify species and size limits locally.',
      he: 'אמתו את המין ומגבלות הגודל מקומית.',
    },
  },
  'sp-5': {
    id: 'sp-5',
    description: {
      en: 'Aggressive predator that follows baitfish schools. Exciting on lures and live bait.',
      he: 'טורף אגרסיבי שעוקב אחר להקות פיתיון. מרגש על פיתיונות מלאכותיים וחיים.',
    },
    habitat: { en: 'Open coastal waters', he: 'מים חופיים פתוחים' },
    handlingNotes: {
      en: 'Sharp teeth — use pliers to remove hooks.',
      he: 'שיניים חדות — השתמשו בצבת להסרת ווים.',
    },
    identificationNotes: {
      en: 'Blue-green back, powerful forked tail, prominent teeth.',
      he: 'גב כחול-ירוק, זנב מזלג חזק, שיניים בולטות.',
    },
    consumptionWarning: {
      en: 'Bleed and ice quickly for best quality.',
      he: 'נקזו וקפיאו במהירות לאיכות מיטבית.',
    },
  },
  'sp-6': {
    id: 'sp-6',
    description: {
      en: 'Seasonal pelagic species. Often caught from piers when schools pass close to shore.',
      he: 'מין פלגי עונתי. נתפס לעיתים קרובות ממזחות כשלהקות עוברות קרוב לחוף.',
    },
    habitat: { en: 'Pelagic, near surface', he: 'פלגי, קרוב לפני השטח' },
    identificationNotes: {
      en: 'Streamlined body with wavy lateral lines and small scales.',
      he: 'גוף מוארך עם קווים צדדיים גליים וקשקשים קטנים.',
    },
    handlingNotes: { en: 'Oily fish — handle on ice.', he: 'דג שמן — אחזו על קרח.' },
    consumptionWarning: {
      en: 'Popular for grilling when fresh.',
      he: 'פופולרי לצלייה כשהוא טרי.',
    },
  },
  'sp-7': {
    id: 'sp-7',
    description: {
      en: 'Hardy fish found in harbors and estuaries. Good beginner target on float gear.',
      he: 'דג עמיד שנמצא בנמלים ושפכי נהרות. מטרה טובה למתחילים על ציוד מצוף.',
    },
    habitat: { en: 'Estuaries and shallow coastal', he: 'שפכי נהרות ומים חופיים רדודים' },
    identificationNotes: {
      en: 'Blunt head, thick lips, silvery sides with dark stripe.',
      he: 'ראש קהה, שפתיים עבות, צדדים כסופים עם פס כהה.',
    },
    handlingNotes: { en: 'Scales come off easily — wet hands recommended.', he: 'הקשקשים נושרים בקלות — מומלצות ידיים רטובות.' },
    consumptionWarning: {
      en: 'Avoid fish from heavily polluted harbors.',
      he: 'הימנעו מדגים מנמלים מזוהמים מאוד.',
    },
  },
  'sp-8': {
    id: 'sp-8',
    description: {
      en: 'Protected in many areas. Large grouper require heavy tackle and careful release.',
      he: 'מוגן באזורים רבים. לוקוס גדול דורש ציוד כבד ושחרור זהיר.',
    },
    habitat: { en: 'Rocky reefs', he: 'שוניות סלעיות' },
    identificationNotes: {
      en: 'Stocky body, large mouth, mottled brown pattern.',
      he: 'גוף מלא, פה גדול, דוגמת חום מנומרת.',
    },
    handlingNotes: {
      en: 'Protected species — check regulations before keeping.',
      he: 'מין מוגן — בדקו תקנות לפני שמירה.',
    },
    consumptionWarning: {
      en: 'Often protected — release unless regulations allow.',
      he: 'לעיתים קרובות מוגן — שחררו אלא אם התקנות מאפשרות.',
    },
  },
  'sp-9': {
    id: 'sp-9',
    description: {
      en: 'Flatfish of sandy bays. Best targeted at night on calm beaches.',
      he: 'דג שטוח של מפרצי חול. מטרה מיטבית בלילה על חופים שקטים.',
    },
    habitat: { en: 'Sandy and muddy bottoms', he: 'קרקעות חוליות ובוציות' },
    identificationNotes: {
      en: 'Both eyes on right side. Oval flat body.',
      he: 'שתי העיניים בצד ימין. גוף שטוח אליפטי.',
    },
    handlingNotes: { en: 'Fragile — minimize air exposure.', he: 'עדין — מזערו חשיפה לאוויר.' },
    consumptionWarning: {
      en: 'Prized eating fish when legal size.',
      he: 'דג אוכל מוערך בגודל חוקי.',
    },
  },
  'sp-10': {
    id: 'sp-10',
    description: {
      en: 'Powerful offshore predator. Occasionally caught from deep piers and jetties.',
      he: 'טורף חזק בלב ים. נתפס לעיתים ממזחות ושוברי גלים עמוקים.',
    },
    habitat: { en: 'Offshore reefs', he: 'שוניות בלב ים' },
    identificationNotes: {
      en: 'Amber stripe along flank, robust body, dark diagonal eye bar in juveniles.',
      he: 'פס ענבר לאורך הצד, גוף חסון, פס אלכסוני כהה ליד העין בצעירים.',
    },
    handlingNotes: { en: 'Very strong — use heavy leader.', he: 'חזק מאוד — השתמשו במנהיג עבה.' },
    consumptionWarning: {
      en: 'Excellent sashimi quality when fresh.',
      he: 'איכות סשימי מצוינת כשהוא טרי.',
    },
  },
  'sp-11': {
    id: 'sp-11',
    description: {
      en: 'Fast predator with excellent eyesight. Responds to shiny lures and fast retrieves.',
      he: 'טורף מהיר עם ראייה מצוינת. מגיב לפיתיונות מבריקים ומשיכה מהירה.',
    },
    habitat: { en: 'Coastal pelagic', he: 'פלגי חופי' },
    identificationNotes: {
      en: 'Long silver body, prominent jaw, sharp teeth visible.',
      he: 'גוף כסוף ארוך, לסת בולטת, שיניים חדות נראות.',
    },
    handlingNotes: { en: 'Dangerous teeth — never put fingers near mouth.', he: 'שיניים מסוכנות — לעולם אל תכניסו אצבעות לפה.' },
    consumptionWarning: {
      en: 'Bleed immediately after capture.',
      he: 'נקזו מיד לאחר לכידה.',
    },
  },
  'sp-12': {
    id: 'sp-12',
    description: {
      en: 'Small schooling fish. Excellent live bait and fun on light tackle.',
      he: 'דג קטן שחי בלהקות. פיתיון חי מצוין וכיף על ציוד קל.',
    },
    habitat: { en: 'Pelagic schools', he: 'להקות פלגיות' },
    identificationNotes: {
      en: 'Small silvery fish with dark spot behind gill cover.',
      he: 'דג כסוף קטן עם כתם כהה מאחורי כיסוי הזימים.',
    },
    handlingNotes: { en: 'Keep alive in aerated bucket for bait.', he: 'שמרו בחיים בדלי מואוור לפיתיון.' },
    consumptionWarning: {
      en: 'Often used as bait rather than table fish.',
      he: 'משמש לעיתים קרובות כפיתיון ולא כדג אוכל.',
    },
  },
  'sp-13': {
    id: 'sp-13',
    description: {
      en: 'Bottom feeder with distinctive barbels. Common on sandy Mediterranean shores.',
      he: 'אוכל קרקע עם שפם מובחן. נפוץ על חופי חול בים התיכון.',
    },
    habitat: { en: 'Sandy and muddy bottoms', he: 'קרקעות חוליות ובוציות' },
    identificationNotes: {
      en: 'Pink-orange body with yellow stripes, chin barbels.',
      he: 'גוף ורוד-כתום עם פסים צהובים, שפם בסנטר.',
    },
    handlingNotes: { en: 'Delicate scales — wet handling.', he: 'קשקשים עדינים — אחזה רטובה.' },
    consumptionWarning: {
      en: 'Prized in Mediterranean cuisine.',
      he: 'מוערך במטבח הים-תיכוני.',
    },
  },
  'sp-14': {
    id: 'sp-14',
    description: {
      en: 'Common inshore species. Active in shallow rocky areas and surf.',
      he: 'מין חופי נפוץ. פעיל באזורים סלעיים רדודים ובגלים.',
    },
    habitat: { en: 'Rocky and sandy areas', he: 'אזורים סלעיים וחוליים' },
    identificationNotes: {
      en: 'Silver with dark vertical bars, especially in juveniles.',
      he: 'כסוף עם פסים אנכיים כהים, במיוחד בצעירים.',
    },
    handlingNotes: { en: 'Small mouth — use appropriate hook size.', he: 'פה קטן — השתמשו בגודל וו מתאים.' },
    consumptionWarning: {
      en: 'Good eating when above minimum size.',
      he: 'אוכל טוב מעל גודל מינימלי.',
    },
  },
  'sp-15': {
    id: 'sp-15',
    description: {
      en: 'Exciting surf-zone predator. Follows baitfish along sandy beaches in summer. Rare but prized when caught.',
      he: 'טורף מרגש באזור הגלים. עוקב אחר פיתיון לאורך חופי חול בקיץ. נדיר אך מבוקש כשנתפס.',
    },
    habitat: { en: 'Sandy beaches and surf zone', he: 'חופי חול ואזור הגלים' },
    identificationNotes: {
      en: 'Silver torpedo shape, forked tail, no spots on adults. Also known as amit arian.',
      he: 'צורת טורפדו כסופה, זנב מזלג, ללא כתמים בבוגרים. ידוע גם כאמית אריאן.',
    },
    handlingNotes: { en: 'Powerful runs — ensure drag is set.', he: 'בריחות חזקות — ודאו שהבלם מכוון.' },
    consumptionWarning: {
      en: 'Release smaller fish to sustain the population.',
      he: 'שחררו דגים קטנים יותר לשמירה על האוכלוסייה.',
    },
  },
};

export function getSpeciesProfile(id: string): SpeciesProfile | undefined {
  return SPECIES_PROFILES[id];
}

export function getLocalizedSpeciesText(
  id: string,
  field: keyof Omit<SpeciesProfile, 'id'>,
  language: string,
): string | undefined {
  const profile = SPECIES_PROFILES[id];
  if (!profile) return undefined;
  const lang = resolveLang(language);
  return profile[field][lang];
}
