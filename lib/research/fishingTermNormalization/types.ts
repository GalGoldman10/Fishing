export type TermConfidenceLevel = 'high' | 'medium' | 'low' | 'none';

export interface FishingTermAliasEntry {
  canonical: string;
  english: string[];
  aliases: string[];
}

export interface DetectedTermMatch {
  matchedText: string;
  matchedAlias: string;
  canonical: string;
  /** 0–1 */
  score: number;
  confidence: TermConfidenceLevel;
  wasFuzzy: boolean;
  entry: FishingTermAliasEntry;
}

export interface NormalizedFishingQuery {
  originalQuestion: string;
  cleanedQuestion: string;
  normalizedQuestion: string;
  matches: DetectedTermMatch[];
  searchTerms: string[];
  /** Highest match score, 0 when none. */
  confidence: number;
  confidenceLevel: TermConfidenceLevel;
  /** True when the best match is low confidence and fishing intent is unclear. */
  shouldClarify: boolean;
  assumptionPrefix?: { en: string; he: string };
}
