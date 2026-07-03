export type {
  DetectedTermMatch,
  FishingTermAliasEntry,
  NormalizedFishingQuery,
  TermConfidenceLevel,
} from './types';
export { FISHING_TERM_ALIASES } from './fishingTermAliases';
export {
  normalizeFishingQuery,
  normalizeFishingQueryText,
  detectCanonicalFishingTerm,
  expandSearchTerms,
  buildTermAssumptionPrefix,
  buildTermClarificationQuestion,
} from './normalizeFishingQuery';
export { cleanFishingQueryText, normalizeForMatching } from './textUtils';
export { levenshteinDistance, fuzzyMatchScore } from './levenshtein';
