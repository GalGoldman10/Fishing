import { scoreCatalogCandidates } from '@/lib/fishRecognition/candidateScoring';
import {
  buildIdentificationResult,
  CONFIDENCE_MIN,
  validateRankedMatches,
} from '@/lib/fishRecognition/confidenceRules';
import {
  FISH_IDENTIFICATION_CATALOG,
  getAllowedSpeciesIds,
} from '@/lib/fishRecognition/identificationCatalog';
import { mockExtractFeatures } from '@/lib/fishRecognition/mockVisionClient';

describe('fish identification catalog', () => {
  it('only contains species from the app guide database', () => {
    expect(FISH_IDENTIFICATION_CATALOG.length).toBeGreaterThan(25);
    for (const entry of FISH_IDENTIFICATION_CATALOG) {
      expect(entry.speciesId).toMatch(/^(pf|mf)-/);
      expect(entry.scientificName.length).toBeGreaterThan(3);
      expect(entry.visual.bodyShape.length).toBeGreaterThan(3);
    }
  });
});

describe('constrained fish identification', () => {
  it('scores sea bass features highest for levrak-like mock image', () => {
    const extracted = mockExtractFeatures('file:///test-levrak-side.jpg');
    const scores = scoreCatalogCandidates(
      extracted.features,
      FISH_IDENTIFICATION_CATALOG,
      'mediterranean_israel',
    );
    const top = scores[0];
    expect(top.score).toBeGreaterThan(20);
    expect(getAllowedSpeciesIds()).toContain(top.speciesId);
  });

  it('rejects vision matches outside the allowlist', () => {
    const allowed = new Set(getAllowedSpeciesIds());
    const filtered = validateRankedMatches(
      [
        { speciesId: 'pf-024', confidence: 90, matchReason: 'ok', keyIdentifyingSigns: [] },
        { speciesId: 'fake-fish', confidence: 99, matchReason: 'hallucinated', keyIdentifyingSigns: [] },
      ],
      allowed,
    );
    expect(filtered).toHaveLength(1);
    expect(filtered[0].speciesId).toBe('pf-024');
  });

  it('returns uncertain status when confidence is below minimum', () => {
    const result = buildIdentificationResult({
      language: 'he',
      region: 'mediterranean_israel',
      imageQuality: { score: 80, issues: [] },
      features: {
        fishDetected: true,
        bodyShape: 'unknown shape',
        primaryColors: ['purple'],
      },
      candidateScores: [
        { speciesId: 'pf-001', nameHe: 'בורי', score: 30, reasons: [] },
        { speciesId: 'pf-024', nameHe: 'דניס', score: 28, reasons: [] },
      ],
      visionRanking: [
        { speciesId: 'pf-001', confidence: 40, matchReason: 'weak', keyIdentifyingSigns: [] },
        { speciesId: 'pf-024', confidence: 38, matchReason: 'weak', keyIdentifyingSigns: [] },
      ],
    });
    expect(result.status).toBe('uncertain');
    expect(result.primaryMatch?.confidence).toBeLessThan(CONFIDENCE_MIN);
    expect(result.alternativeMatches?.length).toBeGreaterThan(0);
  });

  it('never returns success with a single match when confidence is below very high threshold', () => {
    const result = buildIdentificationResult({
      language: 'en',
      region: 'mediterranean_israel',
      imageQuality: { score: 85, issues: [] },
      features: {
        fishDetected: true,
        bodyShape: FISH_IDENTIFICATION_CATALOG[0].visual.bodyShape,
        primaryColors: FISH_IDENTIFICATION_CATALOG[0].visual.colorPatterns,
        tailShape: FISH_IDENTIFICATION_CATALOG[0].visual.tailShape,
      },
      candidateScores: [
        { speciesId: FISH_IDENTIFICATION_CATALOG[0].speciesId, nameHe: 'x', score: 75, reasons: ['shape'] },
        { speciesId: FISH_IDENTIFICATION_CATALOG[1].speciesId, nameHe: 'y', score: 70, reasons: ['shape'] },
      ],
      visionRanking: [
        {
          speciesId: FISH_IDENTIFICATION_CATALOG[0].speciesId,
          confidence: 78,
          matchReason: 'similar',
          keyIdentifyingSigns: ['test'],
        },
        {
          speciesId: FISH_IDENTIFICATION_CATALOG[1].speciesId,
          confidence: 72,
          matchReason: 'alt',
          keyIdentifyingSigns: ['test2'],
        },
      ],
    });
    expect(result.status).toBe('uncertain');
    expect(result.alternativeMatches?.length).toBeGreaterThan(0);
  });
});
