/**
 * Refuses non-fishing questions with a polite localized message.
 */

import { normalizeFishingQuery } from '@/lib/research/fishingTermNormalization';
import { normalizeHebrewFinalLetters } from '@/lib/research/fishingTermNormalization/textUtils';
import { detectTargetSpecies } from '@/lib/research/fishingKnowledge';

function containsHebrew(text: string): boolean {
  return /[\u0590-\u05FF]/.test(text);
}

function normalizeHebrewForScope(text: string): string {
  return normalizeHebrewFinalLetters(text);
}

const FISHING_KEYWORDS_EN = [
  'fish', 'fishing', 'angler', 'angling', 'bait', 'lure', 'rod', 'reel', 'tackle',
  'shore', 'surf', 'pier', 'marina', 'harbor', 'harbour', 'catch', 'species',
  'tide', 'wave', 'kayak', 'boat', 'freshwater', 'saltwater', 'hook', 'sinker',
  'float', 'jig', 'rig', 'knot', 'seabass', 'bream', 'trout', 'bass', 'regulation',
  'license', 'licence', 'spearfishing', 'fly fishing', 'cast', 'trolling',
  'spinning', 'jarjour', 'zirzur',
];

const FISHING_KEYWORDS_HE = [
  'דיג', 'דיוג', 'לדיוג', 'לדוג', 'דייג', 'דג', 'דגים', 'חכה', 'פיתיון', 'פתיון', 'דמוי', 'דימוי',
  'חוף', 'חופים', 'מזח', 'נמל', 'לוכד', 'ציוד', 'גל', 'גאות', 'שפל', 'סירה', 'קיאק', 'קרס',
  'משקולת', 'פלואט', 'רישיון', 'תקנה', 'לוקוס', 'דניס', 'מושט', 'רוח', 'ים', 'אגם', 'נהר',
  'זירזור', 'זרזור', 'גרגור', 'גירגור', 'גיג', 'ג\'יג', 'ריג', 'סיליקון',
  'בורי', 'ברבוניה', 'סרגוס', 'גומבר', 'ברקודה', 'מרמור', 'ליציה', 'אמנון',
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
  /טוב לדיוג/,
  /מחר לדיג/,
  /רוח.*(חוף|חופ|דיג|דיוג|סלע)/,
  /גלים.*(דיג|דיוג)/,
  /לדוג/,
  /לדיוג/,
  /(ב|ל)?זיר?זור/,
  /(ב|ל)?גר?גור/,
];

const FISHING_INTENT_PATTERNS_HE = [
  /איפה.*(ל)?תפוס/,
  /איפה.*(ל)?לכוד/,
  /מה אפשר (ל)?תפוס/,
  /איזה (חוף|חופים|מקום|מקומות|מזח).*?(דג|דיג|דיוג)/,
  /(ל)?תפוס.*(ב|של)/,
  /איזה חופים/,
  /חופים.*(מומלץ|מומלצים|טוב|טובים)/,
  /(מומלץ|מומלצים).*(ל)?(דיג|דיוג)/,
  /(ל)?(לכת|ללכת).*(דיג|דיוג)/,
  /פארק.*דיוג/,
  /איזור.*(דיג|דיוג)/,
  /אזור.*(דיג|דיוג)/,
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
  const normalizedQuestion = language === 'he' ? normalizeHebrewForScope(question) : text;

  return keywords.some((kw) => {
    if (language === 'he') {
      return normalizedQuestion.includes(normalizeHebrewForScope(kw));
    }
    return text.includes(kw.toLowerCase());
  });
}

const FOLLOWUP_PATTERNS_HE = [
  /^עוד\b/,
  /^ומה\b/,
  /^מה עם\b/,
  /^גם\b/,
  /^יש עוד\b/,
  /^איפה עוד\b/,
  /^באופן כללי\b/,
  /^ספר לי עוד\b/,
  /^תן לי עוד\b/,
  /^אפשר\b/,
];

const FOLLOWUP_PATTERNS_EN = [
  /^what about\b/i,
  /^and what about\b/i,
  /^any other\b/i,
  /^more options\b/i,
  /^also\b/i,
  /^tell me more\b/i,
  /^can you\b/i,
];

function isFollowUpContinuation(question: string, language: 'en' | 'he'): boolean {
  const patterns = language === 'he' ? FOLLOWUP_PATTERNS_HE : FOLLOWUP_PATTERNS_EN;
  if (patterns.some((p) => p.test(question.trim()))) return true;

  const locationPatterns = [
    /beach|חוף|marina|נמל|pier|מזח|lake|אגם|river|נהר|harbor/i,
    /palmachim|tel aviv|haifa|חיפה|אילת|herzliya|ashdod|ashkelon|מרכז|צפון|דרום/i,
  ];
  return question.trim().length <= 120 && locationPatterns.some((p) => p.test(question));
}

function hasFishingConversationContext(messages: string[], language: 'en' | 'he'): boolean {
  return messages.some((message) => isFishingQuestion(message, language));
}

export function isFishingQuestion(question: string, language: 'en' | 'he'): boolean {
  if (isFishingQuestionForLanguage(question, language)) return true;
  if (language !== 'he' && containsHebrew(question)) {
    return isFishingQuestionForLanguage(question, 'he');
  }
  return false;
}

function isFishingQuestionForLanguage(question: string, language: 'en' | 'he'): boolean {
  const text = question.toLowerCase();
  if (text.includes('phishing')) return false;

  if (textMatchesFishingKeywords(question, language)) return true;

  if (detectTargetSpecies(question)) return true;

  const intentPatterns = language === 'he' ? FISHING_INTENT_PATTERNS_HE : FISHING_INTENT_PATTERNS_EN;
  if (intentPatterns.some((p) => p.test(question))) return true;

  const weatherPatterns = language === 'he' ? FISHING_WEATHER_PATTERNS_HE : FISHING_WEATHER_PATTERNS_EN;
  if (weatherPatterns.some((p) => p.test(question))) return true;

  const norm = normalizeFishingQuery(question, language);
  if (norm.matches.some((m) => m.confidence !== 'low' && m.score >= 0.72)) return true;

  if (textMatchesFishingKeywords(norm.normalizedQuestion, language)) return true;

  const locationPatterns = [
    /beach|beaches|חוף|חופ/i,
    /marina|נמל|pier|מזח|lake|אגם|river|נהר|harbor/i,
    /palmachim|tel aviv|haifa|חיפה|אילת|herzliya|ashdod|ashkelon|מרכז|צפון|דרום/i,
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

export interface FishingScopeOptions {
  /** Recent chat turns (user + assistant) to allow short fishing follow-ups. */
  conversationContext?: string[];
}

export function validateFishingScope(
  question: string,
  language: 'en' | 'he',
  options: FishingScopeOptions = {},
): { allowed: boolean; reason?: string } {
  if (isBlockedTopic(question)) {
    return { allowed: false, reason: getRefusalMessage(language) };
  }
  if (isFishingQuestion(question, language)) {
    return { allowed: true };
  }

  const context = options.conversationContext ?? [];
  if (
    context.length > 0 &&
    hasFishingConversationContext(context, language) &&
    isFollowUpContinuation(question, language)
  ) {
    return { allowed: true };
  }

  return { allowed: false, reason: getRefusalMessage(language) };
}
