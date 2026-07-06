import type {
  DetectedVisualFeatures,
  FishIdentificationCatalogEntry,
  IdentificationRegion,
  ImageQualityAssessment,
} from '@/lib/fishRecognition/types';

function normalize(value: string | undefined): string {
  return (value ?? '').toLowerCase().trim();
}

function tokenOverlap(a: string, b: string): number {
  const tokensA = new Set(normalize(a).split(/[\s,/\-]+/).filter((t) => t.length > 2));
  const tokensB = new Set(normalize(b).split(/[\s,/\-]+/).filter((t) => t.length > 2));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;
  let overlap = 0;
  for (const t of tokensA) {
    if (tokensB.has(t)) overlap += 1;
    else if ([...tokensB].some((b) => b.includes(t) || t.includes(b))) overlap += 0.5;
  }
  return overlap / Math.max(tokensA.size, tokensB.size);
}

function listOverlap(listA: string[] | undefined, listB: string[]): number {
  if (!listA?.length) return 0;
  let score = 0;
  for (const item of listA) {
    for (const target of listB) {
      score = Math.max(score, tokenOverlap(item, target));
    }
  }
  return score;
}

function regionMultiplier(entry: FishIdentificationCatalogEntry, region: IdentificationRegion): number {
  if (region === 'global') return 1;
  if (entry.region.includes(region)) return 1;
  if (region === 'mediterranean_israel' && entry.region.includes('mediterranean')) return 0.85;
  return 0.55;
}

export interface CandidateScore {
  speciesId: string;
  nameHe: string;
  score: number;
  reasons: string[];
}

export function scoreCatalogCandidates(
  features: DetectedVisualFeatures,
  catalog: FishIdentificationCatalogEntry[],
  region: IdentificationRegion,
): CandidateScore[] {
  if (!features.fishDetected) return [];

  const featureBlob = [
    features.bodyShape,
    features.tailShape,
    features.dorsalFin,
    features.mouthShape,
    features.eyePosition,
    features.environment,
    ...(features.primaryColors ?? []),
    ...(features.patterns ?? []),
  ]
    .filter(Boolean)
    .join(' ');

  const scored: CandidateScore[] = catalog.map((entry) => {
    const reasons: string[] = [];
    let score = 0;

    const visualBlob = [
      entry.visual.bodyShape,
      entry.visual.tailShape,
      entry.visual.finShape,
      entry.visual.mouthShape,
      ...entry.visual.colorPatterns,
      ...entry.visual.visualFeatures,
    ].join(' ');

    const shapeScore = tokenOverlap(features.bodyShape ?? '', entry.visual.bodyShape);
    if (shapeScore > 0.3) {
      score += shapeScore * 25;
      reasons.push(`body shape: ${entry.visual.bodyShape}`);
    }

    const colorScore = listOverlap(features.primaryColors, entry.visual.colorPatterns);
    if (colorScore > 0.2) {
      score += colorScore * 20;
      reasons.push(`color pattern overlap`);
    }

    const patternScore = listOverlap(features.patterns, entry.visual.colorPatterns);
    if (patternScore > 0.2) {
      score += patternScore * 15;
      reasons.push(`markings/patterns overlap`);
    }

    const tailScore = tokenOverlap(features.tailShape ?? '', entry.visual.tailShape);
    if (tailScore > 0.3) {
      score += tailScore * 10;
      reasons.push(`tail: ${entry.visual.tailShape}`);
    }

    const mouthScore = tokenOverlap(features.mouthShape ?? '', entry.visual.mouthShape);
    if (mouthScore > 0.3) {
      score += mouthScore * 8;
      reasons.push(`mouth shape overlap`);
    }

    const generalScore = tokenOverlap(featureBlob, visualBlob);
    score += generalScore * 12;

    score *= regionMultiplier(entry, region);
    if (entry.commonInIsrael && region === 'mediterranean_israel') {
      score += 3;
      reasons.push('common in Israel/Mediterranean');
    }

    return {
      speciesId: entry.speciesId,
      nameHe: entry.commonNameHe,
      score: Math.min(100, Math.round(score)),
      reasons,
    };
  });

  return scored.sort((a, b) => b.score - a.score);
}

export function assessImageQualityFromFeatures(
  quality: ImageQualityAssessment | undefined,
  features: DetectedVisualFeatures,
): ImageQualityAssessment {
  if (quality) return quality;

  const issues: string[] = [];
  let score = 70;

  if (!features.fishDetected) {
    issues.push('no fish detected');
    score = 10;
  }
  if (!features.bodyShape) {
    issues.push('body shape not visible');
    score -= 15;
  }
  if (!features.primaryColors?.length) {
    issues.push('color not clear');
    score -= 10;
  }
  if (features.viewAngle && /top|bottom|hidden|partial/i.test(features.viewAngle)) {
    issues.push('side view recommended');
    score -= 15;
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    issues,
    recommendation:
      issues.length > 0
        ? 'Upload a clear side-view photo of the full fish in good lighting.'
        : undefined,
  };
}
