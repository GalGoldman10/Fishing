/**
 * Understand user fishing intent, location, and category.
 */

import type { FishingSearchCategory } from '@/types/research';
import { classifyFishingQuestion } from '@/lib/research/fishingTechniques';
import { normalizeFishingQuery, type NormalizedFishingQuery } from '@/lib/research/fishingTermNormalization';

export interface QueryUnderstanding {
  intent: string;
  category: FishingSearchCategory;
  /** Multi-label classification for answer routing (requirement §3). */
  questionClasses?: import('@/lib/research/fishingTechniques/types').QuestionClass[];
  /** Spelling/slang normalization applied before search and classification. */
  termNormalization?: NormalizedFishingQuery;
  locationName?: string;
  country?: string;
  region?: string;
  city?: string;
  needsWeather: boolean;
  needsRegulations: boolean;
  needsLocalReports: boolean;
  needsEquipment: boolean;
  needsSpecies: boolean;
  isIsraeliLocation: boolean;
}

const LOCATION_PATTERNS: Array<{ pattern: RegExp; name: string; city?: string }> = [
  { pattern: /palmachim|פלמחים/i, name: 'Palmachim Beach', city: 'Palmachim' },
  { pattern: /gordon|גורדון|frishman|פרישמן|hilton.*tel aviv|חוף הילטון/i, name: 'Gordon Beach', city: 'Tel Aviv' },
  { pattern: /tel baruch|תל ברוך/i, name: 'Tel Baruch Beach', city: 'Tel Aviv' },
  { pattern: /tel aviv|תל אביב/i, name: 'Tel Aviv coast', city: 'Tel Aviv' },
  { pattern: /bat yam|בת ים/i, name: 'Bat Yam Beach', city: 'Bat Yam' },
  { pattern: /rishon|ראשון/i, name: 'Rishon LeZion Beach', city: 'Rishon LeZion' },
  { pattern: /herzliya|הרצליה|sidna ali|סידנא עלי/i, name: 'Herzliya coast', city: 'Herzliya' },
  { pattern: /jaffa|יפו|yafo/i, name: 'Jaffa Rocky Shore', city: 'Jaffa' },
  { pattern: /haifa|חיפה|bat galim|בת גלים|dado/i, name: 'Haifa coast', city: 'Haifa' },
  { pattern: /netanya|נתניה/i, name: 'Netanya coast', city: 'Netanya' },
  { pattern: /caesarea|קיסריה|sdot yam|שדות ים/i, name: 'Caesarea coast', city: 'Caesarea' },
  { pattern: /beit yanai|בית ינאי|michmoret|מיכמור/i, name: 'Beit Yanai Beach', city: 'Beit Yanai' },
  { pattern: /ashdod|אשדוד/i, name: 'Ashdod coast', city: 'Ashdod' },
  { pattern: /ashkelon|אשקלון/i, name: 'Ashkelon coast', city: 'Ashkelon' },
  { pattern: /nitzanim|ניצנים/i, name: 'Nitzanim Beach', city: 'Nitzanim' },
  { pattern: /zikim|זיקים/i, name: 'Zikim Beach', city: 'Zikim' },
  { pattern: /dor|דור|habonim|הבונים/i, name: 'Dor Beach', city: 'Dor' },
  { pattern: /nahariya|נהריה|akko|acre|עכו/i, name: 'Northern coast', city: 'Nahariya' },
  { pattern: /eilat|אילת/i, name: 'Eilat', city: 'Eilat' },
  { pattern: /sea of galilee|כנרת|kinneret|tiberias|טבריה/i, name: 'Sea of Galilee', city: 'Tiberias' },
];

function detectCategory(question: string, language: 'en' | 'he'): FishingSearchCategory {
  const q = question.toLowerCase();

  if (/regulat|license|licence|legal|minimum.*(size|length)|size limit|can i keep|תקנ|רישיון|מינימום|חוקי|מותר להשאיר|protected|מוגן/i.test(question)) return 'regulation';
  if (/equipment|rod|reel|line|hook|sinker|ציוד|חכה|סליל|קרס|משקולת/i.test(question)) return 'equipment';
  if (/species|catch|identify|לכוד|מין|זהה|דג\b|fish\b/i.test(question)) return 'species';
  if (/technique|method|cast|surf|rock|rig|knot|jig|hook set|strike|טכניק|שיטת|הטלה|ריג|קשר|ג'?יג|הכאה/i.test(question)) return 'technique';
  if (/weather|wind|wave|tide|temperature|רוח|גל|גאות|מזג/i.test(question)) return 'conditions';
  if (/safe|danger|hazard|current|slippery|בטיח|סכנ|זרם/i.test(question)) return 'safety';
  if (/report|forecast|activity|דיווח|תחזית/i.test(question)) return 'report';
  if (/beach|spot|location|shore|חוף|מקום|נמל|מזח/i.test(question)) return 'location';

  return 'general';
}

export function understandQuery(
  question: string,
  language: 'en' | 'he',
  locationHint?: string,
): QueryUnderstanding {
  const termNormalization = normalizeFishingQuery(question, language);
  const q = termNormalization.normalizedQuestion;

  const category = detectCategory(q, language);

  let locationName = locationHint;
  let city: string | undefined;
  for (const loc of LOCATION_PATTERNS) {
    if (loc.pattern.test(q) || (locationHint && loc.pattern.test(locationHint))) {
      locationName = loc.name;
      city = loc.city;
      break;
    }
  }

  const isIsraeliLocation =
    /israel|ישראל|mediterranean|ים תיכון/i.test(q + (locationHint ?? '')) ||
    !!city ||
    language === 'he';

  const needsWeather =
    category === 'conditions' ||
    category === 'safety' ||
    /weather|wind|wave|tide|רוח|גל|מזג|sea safe|good to fish|\b(today|tonight|now)\b|היום|הלילה|עכשיו/i.test(q);
  const needsRegulations =
    category === 'regulation' ||
    /regulat|license|legal|minimum.*(size|length)|can i keep|תקנ|רישיון|חוקי|מינימום/i.test(q);
  const needsLocalReports = category === 'report' || category === 'location' || category === 'species';
  const needsEquipment = category === 'equipment' || /equipment|rod|ציוד|חכה/i.test(q);
  const needsSpecies = category === 'species' || /catch|species|לכוד|מין/i.test(q);

  return {
    intent: q.trim(),
    category,
    questionClasses: classifyFishingQuestion(q),
    termNormalization,
    locationName,
    country: isIsraeliLocation ? 'IL' : undefined,
    region: isIsraeliLocation ? 'Mediterranean' : undefined,
    city,
    needsWeather,
    needsRegulations,
    needsLocalReports,
    needsEquipment,
    needsSpecies,
    isIsraeliLocation,
  };
}
