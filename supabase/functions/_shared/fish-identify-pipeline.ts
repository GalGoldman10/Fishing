/**
 * Server-side constrained fish identification pipeline (Deno / Supabase Edge).
 * Uses only species from fish-id-catalog.json — never free-form guessing.
 */
import { getModel } from './system-prompt.ts';
import catalogData from './fish-id-catalog.json' with { type: 'json' };

type Lang = 'en' | 'he';
type Region = 'mediterranean_israel' | 'mediterranean' | 'global';

interface CatalogEntry {
  speciesId: string;
  commonNameEn: string;
  commonNameHe: string;
  scientificName: string;
  familyHe?: string;
  familyLatin?: string;
  habitat: string;
  commonInIsrael: boolean;
  confusedWithSpeciesIds: string[];
  visual: {
    bodyShape: string;
    colorPatterns: string[];
    finShape: string;
    tailShape: string;
    mouthShape: string;
    visualFeatures: string[];
    identifyingSigns: { en: string; he: string };
  };
}

const CATALOG = catalogData as CatalogEntry[];
const ALLOWED_IDS = new Set(CATALOG.map((e) => e.speciesId));

export interface FishIdentifyRequest {
  imageBase64: string;
  mimeType: string;
  language: Lang;
  region?: Region;
  debug?: boolean;
}

export interface FishMatchResult {
  speciesId: string;
  name: string;
  nameHe: string;
  nameEn: string;
  scientificName: string;
  familyHe?: string;
  familyLatin?: string;
  confidence: number;
  description: string;
  identificationNotes: string;
  matchReason: string;
  keyIdentifyingSigns: string[];
  confusedWith: { speciesId: string; name: string }[];
  commonInIsrael: boolean;
  habitat: string;
  bestBait: string;
  techniques: string;
  safetyWarning?: string;
}

export interface FishIdentifyResult {
  status: 'success' | 'uncertain' | 'no_fish' | 'blurry' | 'error';
  region: Region;
  primaryMatch?: FishMatchResult;
  alternativeMatches?: FishMatchResult[];
  uncertainMessage?: string;
  errorMessage?: string;
  imageQuality?: { score: number; issues: string[]; recommendation?: string };
  detectedFeatures?: Record<string, unknown>;
  debug?: Record<string, unknown>;
}

const FEATURE_PROMPT = `You are a fish identification assistant. Do NOT name any fish species.
Analyze image quality and visible features only. Return ONLY JSON:
{"imageQuality":{"score":0-100,"issues":[],"recommendation":""},"features":{"fishDetected":true,"bodyShape":"","primaryColors":[],"patterns":[],"tailShape":"","dorsalFin":"","mouthShape":"","eyePosition":"","estimatedLengthCm":"","environment":"","viewAngle":""}}`;

function buildRankPrompt(lang: Lang, region: Region, features: unknown, quality: unknown, candidates: unknown[]): string {
  return `You are a fish identification assistant. Identify ONLY from the candidate list and image. Never invent species.
Region: ${region}. Language for text fields: ${lang === 'he' ? 'Hebrew' : 'English'}.
Features: ${JSON.stringify(features)}
Quality: ${JSON.stringify(quality)}
Candidates: ${JSON.stringify(candidates)}
Return ONLY JSON: {"matches":[{"speciesId":"","confidence":0-100,"matchReason":"","keyIdentifyingSigns":[]}]} — max 4 matches, speciesId must be from candidates. If unsure, use low confidence.`;
}

function normalize(v: string | undefined): string {
  return (v ?? '').toLowerCase().trim();
}

function tokenOverlap(a: string, b: string): number {
  const ta = new Set(normalize(a).split(/[\s,/\-]+/).filter((t) => t.length > 2));
  const tb = new Set(normalize(b).split(/[\s,/\-]+/).filter((t) => t.length > 2));
  if (!ta.size || !tb.size) return 0;
  let o = 0;
  for (const t of ta) if ([...tb].some((x) => x === t || x.includes(t) || t.includes(x))) o += 1;
  return o / Math.max(ta.size, tb.size);
}

function scoreCandidates(features: Record<string, unknown>, region: Region) {
  if (!features.fishDetected) return [];
  const blob = [
    features.bodyShape,
    features.tailShape,
    features.dorsalFin,
    features.mouthShape,
    ...(Array.isArray(features.primaryColors) ? features.primaryColors : []),
    ...(Array.isArray(features.patterns) ? features.patterns : []),
  ].join(' ');

  return CATALOG.map((entry) => {
    const visualBlob = [
      entry.visual.bodyShape,
      entry.visual.tailShape,
      entry.visual.finShape,
      entry.visual.mouthShape,
      ...entry.visual.colorPatterns,
      ...entry.visual.visualFeatures,
    ].join(' ');
    let score = tokenOverlap(String(features.bodyShape ?? ''), entry.visual.bodyShape) * 25;
    score += tokenOverlap(blob, visualBlob) * 20;
    if (entry.commonInIsrael && region === 'mediterranean_israel') score += 5;
    if (!entry.commonInIsrael && region === 'mediterranean_israel') score *= 0.85;
    return { speciesId: entry.speciesId, nameHe: entry.commonNameHe, score: Math.min(100, Math.round(score)), reasons: [] as string[] };
  }).sort((a, b) => b.score - a.score);
}

function present(
  speciesId: string,
  confidence: number,
  matchReason: string,
  signs: string[],
  lang: Lang,
): FishMatchResult | null {
  const entry = CATALOG.find((e) => e.speciesId === speciesId);
  if (!entry) return null;
  const confusedWith = entry.confusedWithSpeciesIds
    .map((id) => CATALOG.find((e) => e.speciesId === id))
    .filter(Boolean)
    .map((e) => ({ speciesId: e!.speciesId, name: lang === 'he' ? e!.commonNameHe : e!.commonNameEn }));

  return {
    speciesId,
    name: lang === 'he' ? entry.commonNameHe : entry.commonNameEn,
    nameHe: entry.commonNameHe,
    nameEn: entry.commonNameEn,
    scientificName: entry.scientificName,
    familyHe: entry.familyHe,
    familyLatin: entry.familyLatin,
    confidence: Math.round(confidence),
    description: lang === 'he' ? entry.visual.identifyingSigns.he : entry.visual.identifyingSigns.en,
    identificationNotes: lang === 'he' ? entry.visual.identifyingSigns.he : entry.visual.identifyingSigns.en,
    matchReason,
    keyIdentifyingSigns: signs,
    confusedWith,
    commonInIsrael: entry.commonInIsrael,
    habitat: entry.habitat,
    bestBait: lang === 'he' ? 'שרימפס, דיונון או פיתיון מקומי' : 'Shrimp, squid, or local bait',
    techniques: lang === 'he' ? 'דיג מהחוף' : 'Shore fishing',
    safetyWarning: /לוקוס|דקר|grouper|SERRANIDAE/i.test(`${entry.commonNameHe} ${entry.familyLatin ?? ''}`)
      ? lang === 'he'
        ? 'ייתכן שמדובר בדקר/לוקוס — בדקו תקנות שמירה.'
        : 'May be grouper — check protection rules.'
      : undefined,
  };
}

async function callVision(
  apiKey: string,
  system: string,
  userText: string,
  imageDataUrl: string,
): Promise<Record<string, unknown>> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: getModel(),
      temperature: 0.1,
      max_tokens: 1400,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        {
          role: 'user',
          content: [
            { type: 'text', text: userText },
            { type: 'image_url', image_url: { url: imageDataUrl, detail: 'high' } },
          ],
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const json = await res.json();
  const content = json.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('Empty vision response');
  return JSON.parse(content);
}

export async function runFishIdentify(request: FishIdentifyRequest): Promise<FishIdentifyResult> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  const lang = request.language;
  const region = request.region ?? 'mediterranean_israel';
  const dataUrl = `data:${request.mimeType};base64,${request.imageBase64}`;

  const extracted = await callVision(
    apiKey,
    `${FEATURE_PROMPT}\nRespond in ${lang === 'he' ? 'Hebrew' : 'English'} for recommendation text.`,
    'Analyze this fish photo. Do not name the species.',
    dataUrl,
  );

  const imageQuality = (extracted.imageQuality ?? { score: 50, issues: [] }) as {
    score: number;
    issues: string[];
    recommendation?: string;
  };
  const features = (extracted.features ?? { fishDetected: false }) as Record<string, unknown>;

  if (!features.fishDetected) {
    return {
      status: 'no_fish',
      region,
      errorMessage:
        lang === 'he' ? 'לא זוהה דג בתמונה.' : 'No fish detected in the image.',
      imageQuality,
      detectedFeatures: features,
    };
  }

  if (imageQuality.score < 55) {
    return {
      status: 'blurry',
      region,
      uncertainMessage:
        lang === 'he'
          ? 'התמונה לא ברורה מספיק לזיהוי מדויק. העלו תמונה חדה יותר של הדג מהצד.'
          : 'The image is not clear enough for accurate identification. Upload a sharper side-view photo.',
      imageQuality,
      detectedFeatures: features,
    };
  }

  const candidateScores = scoreCandidates(features, region);
  const topIds = candidateScores.slice(0, 8).map((c) => c.speciesId);
  const candidatePayload = topIds
    .map((id) => CATALOG.find((e) => e.speciesId === id))
    .filter(Boolean)
    .map((e) => ({
      speciesId: e!.speciesId,
      commonNameHe: e!.commonNameHe,
      commonNameEn: e!.commonNameEn,
      scientificName: e!.scientificName,
      visual: e!.visual,
      commonInIsrael: e!.commonInIsrael,
    }));

  let ranked: { speciesId: string; confidence: number; matchReason: string; keyIdentifyingSigns: string[] }[] = [];

  if (candidatePayload.length > 0) {
    const ranking = await callVision(
      apiKey,
      buildRankPrompt(lang, region, features, imageQuality, candidatePayload),
      'Rank candidates from the list only. Never invent species.',
      dataUrl,
    );
    const matches = Array.isArray(ranking.matches) ? ranking.matches : [];
    ranked = matches
      .filter((m: { speciesId?: string }) => m.speciesId && ALLOWED_IDS.has(m.speciesId))
      .map((m: { speciesId: string; confidence?: number; matchReason?: string; keyIdentifyingSigns?: string[] }) => {
        const cap = candidateScores.find((c) => c.speciesId === m.speciesId)?.score ?? 0;
        return {
          speciesId: m.speciesId,
          confidence: Math.min(Math.round(m.confidence ?? 0), cap + 12),
          matchReason: m.matchReason ?? 'Visual similarity',
          keyIdentifyingSigns: m.keyIdentifyingSigns ?? [],
        };
      })
      .sort((a, b) => b.confidence - a.confidence);
  }

  if (!ranked.length) {
    ranked = candidateScores.slice(0, 4).map((c, i) => ({
      speciesId: c.speciesId,
      confidence: Math.max(20, c.score - i * 10),
      matchReason: 'Closest match in guide database',
      keyIdentifyingSigns: CATALOG.find((e) => e.speciesId === c.speciesId)?.visual.visualFeatures ?? [],
    }));
  }

  const top = ranked[0];
  const debug = request.debug
    ? { candidateScores: candidateScores.slice(0, 10), ranked, features, imageQuality }
    : undefined;

  if (!top || top.confidence < 50) {
    const alts = ranked.slice(0, 3);
    return {
      status: 'uncertain',
      region,
      uncertainMessage:
        lang === 'he'
          ? 'התמונה לא ברורה מספיק לזיהוי מדויק. אלה ההתאמות הקרובות מהמדריך:'
          : 'The image is not clear enough for accurate ID. Closest guide matches:',
      primaryMatch: alts[0] ? present(alts[0].speciesId, alts[0].confidence, alts[0].matchReason, alts[0].keyIdentifyingSigns, lang) ?? undefined : undefined,
      alternativeMatches: alts.slice(1).map((m) => present(m.speciesId, m.confidence, m.matchReason, m.keyIdentifyingSigns, lang)).filter(Boolean) as FishMatchResult[],
      imageQuality,
      detectedFeatures: features,
      debug,
    };
  }

  const status = top.confidence >= 85 ? 'success' : 'uncertain';
  const uncertainMessage =
    status === 'uncertain'
      ? lang === 'he'
        ? top.confidence < 70
          ? 'אני לא בטוח לגמרי. אלה ההתאמות הקרובות ביותר:'
          : 'ההתאמה הטובה ביותר עם חלופות אפשריות:'
        : top.confidence < 70
          ? "I'm not fully sure. These are the closest matches:"
          : 'Best match with possible alternatives:'
      : undefined;

  return {
    status,
    region,
    uncertainMessage,
    primaryMatch: present(top.speciesId, top.confidence, top.matchReason, top.keyIdentifyingSigns, lang) ?? undefined,
    alternativeMatches: ranked
      .slice(1, 4)
      .map((m) => present(m.speciesId, m.confidence, m.matchReason, m.keyIdentifyingSigns, lang))
      .filter(Boolean) as FishMatchResult[],
    imageQuality,
    detectedFeatures: features,
    debug,
  };
}
