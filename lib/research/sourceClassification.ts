/**
 * Classify source type and authority by domain patterns.
 */

import type { FishingSourceType } from '@/types/research';

interface DomainRule {
  pattern: RegExp;
  sourceType: FishingSourceType;
  authorityScore: number;
  country?: string;
}

const DOMAIN_RULES: DomainRule[] = [
  { pattern: /parks\.org\.il/i, sourceType: 'government', authorityScore: 95, country: 'IL' },
  { pattern: /shvilist\.com/i, sourceType: 'local-report', authorityScore: 72, country: 'IL' },
  { pattern: /tiulim\.net/i, sourceType: 'local-report', authorityScore: 68, country: 'IL' },
  { pattern: /israelfishing\.co\.il/i, sourceType: 'fishing-organization', authorityScore: 75, country: 'IL' },
  { pattern: /tahvivim\.com/i, sourceType: 'fishing-organization', authorityScore: 68, country: 'IL' },
  { pattern: /\.gov\.il$|gov\.il/i, sourceType: 'government', authorityScore: 95, country: 'IL' },
  { pattern: /\.gov$|\.gov\./i, sourceType: 'government', authorityScore: 95 },
  { pattern: /fisheries|fishery|ministry.*fish/i, sourceType: 'regulation', authorityScore: 100 },
  { pattern: /noaa\.gov|meteo|weather\.gov|ims\.gov/i, sourceType: 'weather', authorityScore: 95 },
  { pattern: /tide|oceanographic|marine\.gov/i, sourceType: 'marine', authorityScore: 90 },
  { pattern: /wikipedia\.org|fishbase|marinespecies/i, sourceType: 'scientific', authorityScore: 85 },
  { pattern: /reddit\.com\/r\/fishing|fishforum|angling/i, sourceType: 'forum', authorityScore: 50 },
  { pattern: /facebook\.com|instagram\.com|twitter\.com|x\.com/i, sourceType: 'social', authorityScore: 25 },
  { pattern: /youtube\.com/i, sourceType: 'social', authorityScore: 35 },
  { pattern: /tackle|bait.*shop|angling.*store/i, sourceType: 'tackle-shop', authorityScore: 65 },
  { pattern: /charter|fishing.*trip/i, sourceType: 'charter', authorityScore: 65 },
  { pattern: /openstreetmap|nominatim/i, sourceType: 'map', authorityScore: 75 },
  { pattern: /fishing.*org|angling.*association/i, sourceType: 'fishing-organization', authorityScore: 80 },
];

export function extractDomain(url: string): string {
  try {
    const host = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
    return host.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function classifySource(
  url: string,
  title: string,
  snippet: string,
): { sourceType: FishingSourceType; authorityScore: number; country?: string } {
  const combined = `${url} ${title} ${snippet}`.toLowerCase();
  const domain = extractDomain(url);

  for (const rule of DOMAIN_RULES) {
    if (rule.pattern.test(domain) || rule.pattern.test(combined)) {
      return { sourceType: rule.sourceType, authorityScore: rule.authorityScore, country: rule.country };
    }
  }

  if (/regulat|license|law|statute|תקנ/i.test(combined)) {
    return { sourceType: 'regulation', authorityScore: 70 };
  }
  if (/report|forum|community|דיווח/i.test(combined)) {
    return { sourceType: 'local-report', authorityScore: 55 };
  }
  if (/fishing|angling|דיג/i.test(combined)) {
    return { sourceType: 'fishing-organization', authorityScore: 70 };
  }

  return { sourceType: 'other', authorityScore: 40 };
}
