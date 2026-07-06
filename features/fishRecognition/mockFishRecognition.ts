import { DEMO_SPECIES } from '@/lib/mock/demoData';
import { getSpeciesProfile } from '@/lib/mock/speciesProfiles';
import {
  SPECIES_ID_TO_TACTICS,
  SPECIES_TACTICS,
  type Lang,
} from '@/lib/research/fishingKnowledge';
import { matchSpeciesCatchProfile } from '@/lib/research/israeliSpeciesCatchGuide';
import type { FishMatch, FishRecognitionResponse } from '@/lib/validation/schemas';

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function buildMatch(speciesId: string, confidence: number, language: Lang): FishMatch {
  const species = DEMO_SPECIES.find((s) => s.id === speciesId)!;
  const profile = getSpeciesProfile(speciesId);
  const tacticsKey = SPECIES_ID_TO_TACTICS[speciesId];
  const tactics = tacticsKey ? SPECIES_TACTICS[tacticsKey] : undefined;
  const catchProfile = matchSpeciesCatchProfile(species.commonName);

  const name = species.localizedNames?.[language] ?? species.commonName;
  const description = profile
    ? (language === 'he' ? profile.description.he : profile.description.en)
    : (species.habitat ?? '');

  const habitat = tactics
    ? (language === 'he' ? tactics.where.he : tactics.where.en)
    : profile
      ? (language === 'he' ? profile.habitat.he : profile.habitat.en)
      : (species.habitat ?? '');

  const bestBait = tactics
    ? (language === 'he' ? tactics.bites.he : tactics.bites.en)
    : language === 'he'
      ? 'שרימפס, דיונון או סרדין'
      : 'Shrimp, squid, or sardine';

  const when = tactics
    ? (language === 'he' ? tactics.when.he : tactics.when.en)
    : '';
  const techniqueBase =
    language === 'he'
      ? 'דיג מהחוף עם ציוד קל עד בינוני'
      : 'Shore fishing with light to medium tackle';
  const techniques = when ? `${techniqueBase}. ${when}` : techniqueBase;

  let safetyWarning: string | undefined;
  if (species.conservationStatus === 'vulnerable') {
    safetyWarning =
      language === 'he'
        ? 'מין מוגן או בסיכון — בדקו תקנות שמירה לפני שמירה. שחררו אם אינכם בטוחים.'
        : 'Protected or vulnerable species — check conservation rules before keeping. Release if unsure.';
  }
  if (catchProfile?.protectedNote) {
    safetyWarning = language === 'he' ? catchProfile.protectedNote.he : catchProfile.protectedNote.en;
  }
  if (tactics?.note) {
    safetyWarning = language === 'he' ? tactics.note.he : tactics.note.en;
  }
  if (profile?.consumptionWarning) {
    const consumption =
      language === 'he' ? profile.consumptionWarning.he : profile.consumptionWarning.en;
    safetyWarning = safetyWarning ? `${safetyWarning} ${consumption}` : consumption;
  }

  return {
    speciesId,
    name,
    scientificName: species.scientificName,
    confidence,
    description,
    commonInIsrael: true,
    habitat,
    bestBait,
    techniques,
    safetyWarning,
  };
}

function pickSpeciesIds(seed: number, count: number): string[] {
  const ids = DEMO_SPECIES.map((s) => s.id);
  const picked: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const idx = (seed + i * 7) % ids.length;
    const id = ids[idx];
    if (!picked.includes(id)) picked.push(id);
  }
  return picked;
}

/** Demo / offline fish recognition using local species knowledge. */
export async function mockIdentifyFish(
  imageUri: string,
  language: Lang,
): Promise<FishRecognitionResponse> {
  await new Promise((r) => setTimeout(r, 1800 + (hashString(imageUri) % 1200)));

  const lower = imageUri.toLowerCase();
  if (lower.includes('nofish') || lower.includes('no-fish')) {
    return { status: 'no_fish' };
  }
  if (lower.includes('blur') || lower.includes('blurry')) {
    return { status: 'blurry' };
  }

  const seed = hashString(imageUri);
  const mode = seed % 10;

  if (mode === 0) {
    return { status: 'no_fish' };
  }
  if (mode === 1) {
    return { status: 'blurry' };
  }

  const primaryId = DEMO_SPECIES[seed % DEMO_SPECIES.length].id;

  if (mode === 2 || mode === 3) {
    const altIds = pickSpeciesIds(seed, 3).filter((id) => id !== primaryId);
    const primaryConfidence = 42 + (seed % 18);
    const alternatives = altIds.slice(0, 2).map((id, i) =>
      buildMatch(id, 28 - i * 8 + (seed % 5), language),
    );

    return {
      status: 'uncertain',
      uncertainMessage:
        language === 'he'
          ? 'אני לא בטוח ב-100%. ייתכן שזה אחד מהדגים הבאים…'
          : "I'm not 100% sure. This may be one of these fish…",
      primaryMatch: buildMatch(primaryId, primaryConfidence, language),
      alternativeMatches: alternatives,
    };
  }

  const confidence = 72 + (seed % 23);
  return {
    status: 'success',
    primaryMatch: buildMatch(primaryId, confidence, language),
  };
}
