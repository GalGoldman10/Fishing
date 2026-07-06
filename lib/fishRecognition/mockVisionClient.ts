import { FISH_IDENTIFICATION_CATALOG } from '@/lib/fishRecognition/identificationCatalog';
import type {
  DetectedVisualFeatures,
  FeatureExtractionResponse,
  RankedSpeciesMatch,
  VisionClient,
} from '@/lib/fishRecognition/types';
import {
  assessImageQualityFromFeatures,
  scoreCatalogCandidates,
} from '@/lib/fishRecognition/candidateScoring';

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/** Deterministic mock features derived from image URI — never random species names. */
export function mockExtractFeatures(imageUri: string): FeatureExtractionResponse {
  const lower = imageUri.toLowerCase();
  if (lower.includes('nofish') || lower.includes('no-fish')) {
    return {
      imageQuality: { score: 20, issues: ['no fish detected'] },
      features: { fishDetected: false },
    };
  }
  if (lower.includes('blur') || lower.includes('blurry')) {
    return {
      imageQuality: {
        score: 35,
        issues: ['blurry', 'bad lighting'],
        recommendation: 'Upload a sharper side-view photo.',
      },
      features: { fishDetected: true, bodyShape: 'unclear', primaryColors: ['unknown'] },
    };
  }

  const seed = hashString(imageUri);
  const catalogIndex = seed % FISH_IDENTIFICATION_CATALOG.length;
  const target = FISH_IDENTIFICATION_CATALOG[catalogIndex];

  const features: DetectedVisualFeatures = {
    fishDetected: true,
    bodyShape: target.visual.bodyShape,
    primaryColors: target.visual.colorPatterns.slice(0, 2),
    patterns: target.visual.colorPatterns,
    tailShape: target.visual.tailShape,
    dorsalFin: target.visual.finShape,
    mouthShape: target.visual.mouthShape,
    viewAngle: 'side',
    environment: 'shore',
  };

  return {
    imageQuality: { score: 78 + (seed % 15), issues: [] },
    features,
  };
}

export function createMockVisionClient(imageUri: string): VisionClient {
  const extracted = mockExtractFeatures(imageUri);

  return {
    async extractFeatures() {
      await new Promise((r) => setTimeout(r, 900));
      return extracted;
    },
    async rankCandidates(_url, _lang, region, features, _quality, candidatePayload) {
      await new Promise((r) => setTimeout(r, 700));
      const scores = scoreCatalogCandidates(features, FISH_IDENTIFICATION_CATALOG, region);
      const allowed = new Set(
        (candidatePayload as { speciesId: string }[]).map((c) => c.speciesId),
      );

      return scores
        .filter((s) => allowed.has(s.speciesId))
        .slice(0, 4)
        .map((s, index) => ({
          speciesId: s.speciesId,
          confidence: Math.max(25, s.score - index * 12),
          matchReason: s.reasons.join('; ') || 'Closest visual match in guide database',
          keyIdentifyingSigns:
            FISH_IDENTIFICATION_CATALOG.find((e) => e.speciesId === s.speciesId)?.visual
              .visualFeatures ?? [],
        })) as RankedSpeciesMatch[];
    },
  };
}
