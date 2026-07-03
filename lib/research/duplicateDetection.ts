/**
 * Detect and group duplicate search results.
 */

import type { RawSearchResult } from '@/types/research';
import { extractDomain } from '@/lib/research/sourceClassification';

export interface DuplicateGroup {
  familyId: string;
  canonicalUrl: string;
  members: RawSearchResult[];
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\u0590-\u05FF\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
}

function titleSimilarity(a: string, b: string): number {
  const na = normalizeTitle(a);
  const nb = normalizeTitle(b);
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.85;
  const wordsA = new Set(na.split(' '));
  const wordsB = new Set(nb.split(' '));
  const intersection = [...wordsA].filter((w) => wordsB.has(w) && w.length > 3);
  const union = new Set([...wordsA, ...wordsB]);
  return intersection.length / union.size;
}

function snippetSimilarity(a: string, b: string): number {
  const sa = a.toLowerCase().slice(0, 200);
  const sb = b.toLowerCase().slice(0, 200);
  if (sa === sb) return 1;
  const minLen = Math.min(sa.length, sb.length);
  if (minLen < 40) return 0;
  let matches = 0;
  for (let i = 0; i < minLen - 20; i += 10) {
    if (sb.includes(sa.slice(i, i + 20))) matches++;
  }
  return matches / Math.ceil(minLen / 10);
}

export function groupDuplicates(results: RawSearchResult[]): {
  unique: RawSearchResult[];
  groups: DuplicateGroup[];
  filteredCount: number;
} {
  const families: DuplicateGroup[] = [];
  const assigned = new Set<number>();

  for (let i = 0; i < results.length; i++) {
    if (assigned.has(i)) continue;
    const family: RawSearchResult[] = [results[i]];
    assigned.add(i);

    for (let j = i + 1; j < results.length; j++) {
      if (assigned.has(j)) continue;
      const a = results[i];
      const b = results[j];

      const sameUrl = a.url && b.url && a.url === b.url;
      const sameDomain = extractDomain(a.url) === extractDomain(b.url);
      const titleSim = titleSimilarity(a.title, b.title);
      const snippetSim = snippetSimilarity(a.snippet, b.snippet);

      const isDuplicate =
        sameUrl ||
        (titleSim > 0.8 && snippetSim > 0.6) ||
        (sameDomain && titleSim > 0.7 && snippetSim > 0.5);

      if (isDuplicate) {
        family.push(b);
        assigned.add(j);
      }
    }

    if (family.length > 1) {
      families.push({
        familyId: `fam-${i}`,
        canonicalUrl: family[0].url,
        members: family,
      });
    }
  }

  // Keep best result per family (longest snippet)
  const unique: RawSearchResult[] = [];
  const familyIndices = new Set(families.flatMap((f) => f.members.map((m) => results.indexOf(m))));

  for (let i = 0; i < results.length; i++) {
    if (!familyIndices.has(i)) {
      unique.push(results[i]);
      continue;
    }
    const family = families.find((f) => f.members.includes(results[i]));
    if (family && family.members[0] === results[i]) {
      unique.push(results[i]);
    }
  }

  return {
    unique,
    groups: families,
    filteredCount: results.length - unique.length,
  };
}
