/**
 * Location resolver — maps free-text place mentions (Hebrew, English,
 * transliterations, misspellings) to a canonical fishing location with
 * verified coordinates. Map pins and marine lookups must use these
 * coordinates, never text matching alone.
 */

import { isValidCoordinates } from '@/lib/utils/coordinates';

export interface ResolvedLocation {
  id: string;
  nameEn: string;
  nameHe: string;
  city?: string;
  region: 'mediterranean' | 'red-sea' | 'sea-of-galilee' | 'inland';
  waterType: 'saltwater' | 'freshwater';
  latitude: number;
  longitude: number;
  /** How the match was made — exact alias or fuzzy (misspelling-tolerant). */
  matchType: 'exact' | 'fuzzy';
}

interface GazetteerEntry {
  id: string;
  nameEn: string;
  nameHe: string;
  city?: string;
  region: ResolvedLocation['region'];
  waterType: ResolvedLocation['waterType'];
  latitude: number;
  longitude: number;
  /** Lowercase aliases: English spellings, Hebrew forms, transliterations. */
  aliases: string[];
}

const GAZETTEER: GazetteerEntry[] = [
  { id: 'zikim', nameEn: 'Zikim Beach', nameHe: 'חוף זיקים', city: 'Zikim', region: 'mediterranean', waterType: 'saltwater', latitude: 31.6072, longitude: 34.5089, aliases: ['zikim', 'זיקים'] },
  { id: 'ashkelon', nameEn: 'Ashkelon coast', nameHe: 'חוף אשקלון', city: 'Ashkelon', region: 'mediterranean', waterType: 'saltwater', latitude: 31.6844, longitude: 34.5511, aliases: ['ashkelon', 'ashqelon', 'askelon', 'אשקלון'] },
  { id: 'nitzanim', nameEn: 'Nitzanim Beach', nameHe: 'חוף ניצנים', city: 'Nitzanim', region: 'mediterranean', waterType: 'saltwater', latitude: 31.7423, longitude: 34.6019, aliases: ['nitzanim', 'nizanim', 'ניצנים'] },
  { id: 'ashdod', nameEn: 'Ashdod coast', nameHe: 'חוף אשדוד', city: 'Ashdod', region: 'mediterranean', waterType: 'saltwater', latitude: 31.7920, longitude: 34.6280, aliases: ['ashdod', 'אשדוד'] },
  { id: 'palmachim', nameEn: 'Palmachim Beach', nameHe: 'חוף פלמחים', city: 'Palmachim', region: 'mediterranean', waterType: 'saltwater', latitude: 31.9297, longitude: 34.7031, aliases: ['palmachim', 'palmahim', 'פלמחים'] },
  { id: 'bat-yam', nameEn: 'Bat Yam Beach', nameHe: 'חוף בת ים', city: 'Bat Yam', region: 'mediterranean', waterType: 'saltwater', latitude: 32.0171, longitude: 34.7368, aliases: ['bat yam', 'בת ים'] },
  { id: 'jaffa', nameEn: 'Jaffa Rocky Shore', nameHe: 'חוף יפו', city: 'Jaffa', region: 'mediterranean', waterType: 'saltwater', latitude: 32.0504, longitude: 34.7502, aliases: ['jaffa', 'yafo', 'יפו'] },
  { id: 'tel-aviv', nameEn: 'Tel Aviv coast', nameHe: 'חוף תל אביב', city: 'Tel Aviv', region: 'mediterranean', waterType: 'saltwater', latitude: 32.0809, longitude: 34.7647, aliases: ['tel aviv', 'telaviv', 'תל אביב', 'gordon', 'גורדון', 'frishman', 'פרישמן', 'hilton', 'הילטון', 'reading', 'רידינג'] },
  { id: 'herzliya', nameEn: 'Herzliya coast', nameHe: 'חוף הרצליה', city: 'Herzliya', region: 'mediterranean', waterType: 'saltwater', latitude: 32.1723, longitude: 34.7987, aliases: ['herzliya', 'herzlia', 'הרצליה', 'sidna ali', 'סידנא עלי'] },
  { id: 'netanya', nameEn: 'Netanya coast', nameHe: 'חוף נתניה', city: 'Netanya', region: 'mediterranean', waterType: 'saltwater', latitude: 32.3286, longitude: 34.8497, aliases: ['netanya', 'natanya', 'נתניה', 'argaman', 'ארגמן'] },
  { id: 'beit-yanai', nameEn: 'Beit Yanai Beach', nameHe: 'חוף בית ינאי', city: 'Beit Yanai', region: 'mediterranean', waterType: 'saltwater', latitude: 32.3846, longitude: 34.8635, aliases: ['beit yanai', 'bet yanai', 'בית ינאי', 'michmoret', 'מיכמורת'] },
  { id: 'caesarea', nameEn: 'Caesarea coast', nameHe: 'חוף קיסריה', city: 'Caesarea', region: 'mediterranean', waterType: 'saltwater', latitude: 32.5006, longitude: 34.8896, aliases: ['caesarea', 'cesarea', 'קיסריה', 'sdot yam', 'שדות ים'] },
  { id: 'dor', nameEn: 'Dor HaBonim Beach', nameHe: 'חוף דור הבונים', city: 'Dor', region: 'mediterranean', waterType: 'saltwater', latitude: 32.6403, longitude: 34.9199, aliases: ['dor', 'habonim', 'dor habonim', 'דור', 'הבונים', 'tantura', 'טנטורה'] },
  { id: 'atlit', nameEn: 'Atlit Beach', nameHe: 'חוף עתלית', city: 'Atlit', region: 'mediterranean', waterType: 'saltwater', latitude: 32.6980, longitude: 34.9296, aliases: ['atlit', 'עתלית'] },
  { id: 'haifa', nameEn: 'Haifa coast', nameHe: 'חוף חיפה', city: 'Haifa', region: 'mediterranean', waterType: 'saltwater', latitude: 32.8323, longitude: 34.9706, aliases: ['haifa', 'hifa', 'חיפה', 'bat galim', 'בת גלים', 'dado', 'דדו'] },
  { id: 'akko', nameEn: 'Akko coast', nameHe: 'חוף עכו', city: 'Akko', region: 'mediterranean', waterType: 'saltwater', latitude: 32.9204, longitude: 35.0691, aliases: ['akko', 'acre', 'acco', 'עכו'] },
  { id: 'nahariya', nameEn: 'Nahariya coast', nameHe: 'חוף נהריה', city: 'Nahariya', region: 'mediterranean', waterType: 'saltwater', latitude: 33.0110, longitude: 35.0899, aliases: ['nahariya', 'nahariyya', 'נהריה'] },
  { id: 'achziv', nameEn: 'Achziv Beach', nameHe: 'חוף אכזיב', city: 'Achziv', region: 'mediterranean', waterType: 'saltwater', latitude: 33.0480, longitude: 35.1022, aliases: ['achziv', 'akhziv', 'אכזיב'] },
  { id: 'rosh-hanikra', nameEn: 'Rosh HaNikra', nameHe: 'ראש הנקרה', region: 'mediterranean', waterType: 'saltwater', latitude: 33.0870, longitude: 35.1080, aliases: ['rosh hanikra', 'ראש הנקרה'] },
  { id: 'eilat', nameEn: 'Eilat', nameHe: 'אילת', city: 'Eilat', region: 'red-sea', waterType: 'saltwater', latitude: 29.5479, longitude: 34.9520, aliases: ['eilat', 'elat', 'אילת'] },
  { id: 'kinneret', nameEn: 'Sea of Galilee', nameHe: 'הכנרת', city: 'Tiberias', region: 'sea-of-galilee', waterType: 'freshwater', latitude: 32.8331, longitude: 35.5453, aliases: ['kinneret', 'kineret', 'sea of galilee', 'galilee', 'tiberias', 'כנרת', 'הכנרת', 'טבריה', 'ginosar', 'גינוסר'] },
  { id: 'yeruham', nameEn: 'Yeruham Lake', nameHe: 'אגם ירוחם', city: 'Yeruham', region: 'inland', waterType: 'freshwater', latitude: 30.9903, longitude: 34.8977, aliases: ['yeruham', 'yerucham', 'ירוחם'] },
];

/** Levenshtein distance for misspelling tolerance. */
function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[] = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[n];
}

function toResolved(entry: GazetteerEntry, matchType: ResolvedLocation['matchType']): ResolvedLocation {
  return {
    id: entry.id,
    nameEn: entry.nameEn,
    nameHe: entry.nameHe,
    city: entry.city,
    region: entry.region,
    waterType: entry.waterType,
    latitude: entry.latitude,
    longitude: entry.longitude,
    matchType,
  };
}

/**
 * Resolve a location mentioned anywhere inside the question (or hint).
 * Pass 1: exact alias substring match. Pass 2: fuzzy word match
 * (edit distance ≤ 2 for words of 5+ chars, ≤ 1 for 4-char words).
 */
export function resolveLocation(text: string, hint?: string): ResolvedLocation | null {
  const haystack = `${text} ${hint ?? ''}`.toLowerCase();

  for (const entry of GAZETTEER) {
    if (entry.aliases.some((alias) => haystack.includes(alias))) {
      return toResolved(entry, 'exact');
    }
  }

  // Fuzzy pass over individual words (Latin and Hebrew).
  const words = haystack.split(/[^a-zא-ת]+/).filter((w) => w.length >= 4);
  let best: { entry: GazetteerEntry; distance: number } | null = null;
  for (const word of words) {
    for (const entry of GAZETTEER) {
      for (const alias of entry.aliases) {
        // Only compare single-word aliases of similar length.
        if (alias.includes(' ') || Math.abs(alias.length - word.length) > 2) continue;
        const maxDistance = word.length >= 5 ? 2 : 1;
        const distance = editDistance(word, alias);
        if (distance > 0 && distance <= maxDistance && (!best || distance < best.distance)) {
          best = { entry, distance };
        }
      }
    }
  }
  return best ? toResolved(best.entry, 'fuzzy') : null;
}

/** All gazetteer coordinates are validated at module load (defensive check). */
export function validateGazetteer(): boolean {
  return GAZETTEER.every((e) => isValidCoordinates(e.latitude, e.longitude));
}
