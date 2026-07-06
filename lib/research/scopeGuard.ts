/**
 * Refuses non-fishing questions with a polite localized message.
 */

import { normalizeFishingQuery } from '@/lib/research/fishingTermNormalization';
import { detectTargetSpecies } from '@/lib/research/fishingKnowledge';

const FISHING_KEYWORDS_EN = [
  'fish', 'fishing', 'angler', 'angling', 'bait', 'lure', 'rod', 'reel', 'tackle',
  'shore', 'surf', 'pier', 'marina', 'harbor', 'harbour', 'catch', 'species',
  'tide', 'wave', 'kayak', 'boat', 'freshwater', 'saltwater', 'hook', 'sinker',
  'float', 'jig', 'rig', 'knot', 'seabass', 'bream', 'trout', 'bass', 'regulation',
  'license', 'licence', 'spearfishing', 'fly fishing', 'cast', 'trolling',
  'spinning', 'jarjour', 'zirzur',
];

const FISHING_KEYWORDS_HE = [
  'דיג', 'לדוג', 'דייג', 'דג', 'דגים', 'חכה', 'פיתיון', 'פתיון', 'דמוי', 'דימוי',
  'חוף', 'מזח', 'נמל', 'לוכד', 'ציוד', 'גל', 'גאות', 'שפל', 'סירה', 'קיאק', 'קרס',
  'משקולת', 'פלואט', 'רישיון', 'תקנה', 'לוקוס', 'דניס', 'מושט', 'רוח', 'ים', 'אגם', 'נהר',
  'זירזור', 'זרזור', 'גרגור', 'גירגור', 'גיג', 'ג\'יג', 'ריג', 'סיליקון',
  'בורי', 'ברבוניה', 'סרגוס', 'גומבר', 'ברקודה', 'מרמור', 'אריאן', 'אמנון',
  'דוראדו', 'פלמידה', 'טונית', 'טרכון', 'טלוויזיה', 'חנית', 'לברק', 'אינטיאס',
  'סוגי דגים', 'מינימום', 'בסשן',
  'לתפוס', 'ללכוד', 'תפוס',
];

const FISHING_WEATHER_PATTERNS_EN = [
  /good for fishing/i,
  /fishing tomorrow/i,
  /fishing today/i,
  /wind.*(beach|shore|rock|fishing)/i,
  /wave.*(fishing|rock|shore)/i,
  /tide.*fishing/i,
  /fish.*weather/i,
];

const FISHING_WEATHER_PATTERNS_HE = [
  /טוב לדיג/,
  /מחר לדיג/,
  /רוח.*(חוף|דיג|סלע)/,
  /גלים.*דיג/,
  /לדוג/,
  /(ב|ל)?זיר?זור/,
  /(ב|ל)?גר?גור/,
];

const FISHING_INTENT_PATTERNS_HE = [
  /איפה.*(ל)?תפוס/,
  /איפה.*(ל)?לכוד/,
  /מה אפשר (ל)?תפוס/,
  /איזה (חוף|מקום|מזח).*דג/,
  /(ל)?תפוס.*(ב|של)/,
];

const FISHING_INTENT_PATTERNS_EN = [
  /where (can i|to|do i) catch/i,
  /where.*fish for/i,
  /what can i catch/i,
  /best place.*catch/i,
];

const BLOCKED_TOPICS_EN = [
  /politic/i, /election/i, /celebrity/i, /movie/i, /recipe(?!.*bait)/i,
  /cryptocurrency/i, /bitcoin/i, /stock market/i, /gambling/i,
];

function textMatchesFishingKeywords(question: string, language: 'en' | 'he'): boolean {
  const text = question.toLowerCase();
  const keywords = language === 'he' ? FISHING_KEYWORDS_HE : FISHING_KEYWORDS_EN;
  return keywords.some((kw) =>
    language === 'he' ? question.includes(kw) : text.includes(kw.toLowerCase()),
  );
}

export function isFishingQuestion(question: string, language: 'en' | 'he'): boolean {
  const text = question.toLowerCase();
  if (text.includes('phishing')) return false;

  if (textMatchesFishingKeywords(question, language)) return true;

  if (detectTargetSpecies(question)) return true;

  const intentPatterns = language === 'he' ? FISHING_INTENT_PATTERNS_HE : FISHING_INTENT_PATTERNS_EN;
  if (intentPatterns.some((p) => p.test(question))) return true;

  const weatherPatterns = language === 'he' ? FISHING_WEATHER_PATTERNS_HE : FISHING_WEATHER_PATTERNS_EN;
  if (weatherPatterns.some((p) => p.test(question))) return true;

  // Recognize slang/typos via the term normalization layer (ignore weak false positives).
  const norm = normalizeFishingQuery(question, language);
  if (norm.matches.some((m) => m.confidence !== 'low' && m.score >= 0.72)) return true;

  if (textMatchesFishingKeywords(norm.normalizedQuestion, language)) return true;

  // Short location-style questions may omit "fishing" explicitly
  const locationPatterns = [
    /beach|חוף|marina|נמל|pier|מזח|lake|אגם|river|נהר|harbor/i,
    /palmachim|tel aviv|haifa|חיפה|אילת|herzliya|ashdod|ashkelon/i,
  ];
  if (locationPatterns.some((p) => p.test(question)) && question.length < 120) return true;

  return false;
}

export function isBlockedTopic(question: string): boolean {
  return BLOCKED_TOPICS_EN.some((p) => p.test(question));
}

export function getRefusalMessage(language: 'en' | 'he'): string {
  return language === 'he'
    ? 'עוזר זה מתמחה רק בדיג ובמידע הקשור לדיג. שאל אותי על מקום דיג, מין דג, ציוד, טכניקה, תנאים או תקנות.'
    : 'This assistant specializes only in fishing and fishing-related information. Please ask me about a fishing location, fish species, equipment, technique, conditions, or regulations.';
}

export function validateFishingScope(
  question: string,
  language: 'en' | 'he',
): { allowed: boolean; reason?: string } {
  if (isBlockedTopic(question)) {
    return { allowed: false, reason: getRefusalMessage(language) };
  }
  if (!isFishingQuestion(question, language)) {
    return { allowed: false, reason: getRefusalMessage(language) };
  }
  return { allowed: true };
}
