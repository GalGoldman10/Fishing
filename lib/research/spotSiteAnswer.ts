/**
 * Answers questions about data that already exists on the site — live marine
 * conditions and spot profiles — without calling ChatGPT or inventing numbers.
 */

import { getLiveConditionsAdvice } from '@/lib/research/conditionsAdvisor';
import { DEMO_SPOTS } from '@/lib/mock/demoData';
import { getBeachProfile } from '@/lib/mock/beachProfiles';
import { degreesToCompassEn } from '@/lib/research/compassText';
import { findSpotFromQuestion, shoreTypeLabel } from '@/lib/research/spotMatcher';
import { formatDateTime, formatTime } from '@/lib/localization/format';
import type { FishingSpotSummary } from '@/types/fishing';
import type { LiveMarineConditions } from '@/types/marine';
import type { FishingAnswer } from '@/types/research';
import type { FishingAssistantResponse } from '@/lib/validation/schemas';

export interface SpotSiteAnswerInput {
  question: string;
  language: 'en' | 'he';
  spotId?: string;
  locationHint?: string;
}

export interface SpotSiteAnswerResult {
  answer: string;
  structured: FishingAssistantResponse;
  research: FishingAnswer;
  fromSiteData: true;
}

const SITE_DATA_PATTERN =
  /wave|גל|גלים|רוח|wind|conditions|תנא|מצב הים|sea state|tide|גאות|שפל|temperature|טמפ|rough|calm|סוער|שקט|suitable|התאם|good for fishing|כדאי.*(לדוג|לצאת)|אפשר לדוג|worth fishing|how high|גובה|period|מחזור|forecast|תחזית|מחר|היום|עכשיו|today|tonight|now|right now/i;

export function asksSpotSiteData(question: string): boolean {
  return SITE_DATA_PATTERN.test(question);
}

function resolveSpot(input: SpotSiteAnswerInput): FishingSpotSummary | null {
  if (input.spotId) {
    return DEMO_SPOTS.find((s) => s.id === input.spotId) ?? null;
  }
  return findSpotFromQuestion(input.question, input.locationHint);
}

function spotDisplayName(spot: FishingSpotSummary, language: 'en' | 'he'): string {
  return spot.localizedNames?.[language] ?? spot.name;
}

function marineCoords(spot: FishingSpotSummary): { latitude: number; longitude: number } {
  return spot.marineCoordinates ?? { latitude: spot.latitude, longitude: spot.longitude };
}

function formatMetricsBlock(current: LiveMarineConditions, language: 'en' | 'he'): string {
  const lines: string[] = [];
  const isHe = language === 'he';

  if (current.waveHeightMeters !== undefined) {
    const period =
      current.wavePeriodSeconds !== undefined
        ? isHe
          ? `, מחזור ${current.wavePeriodSeconds.toFixed(0)} ש'`
          : `, ${current.wavePeriodSeconds.toFixed(0)}s period`
        : '';
    lines.push(
      isHe
        ? `• גלים: ${current.waveHeightMeters.toFixed(1)} מ'${period}`
        : `• Waves: ${current.waveHeightMeters.toFixed(1)} m${period}`,
    );
  }

  if (current.windSpeedKph !== undefined) {
    const dir =
      current.windDirectionDegrees !== undefined
        ? isHe
          ? ` (${Math.round(current.windSpeedKph)} קמ"ש)`
          : ` from the ${degreesToCompassEn(current.windDirectionDegrees)} (${Math.round(current.windSpeedKph)} km/h)`
        : isHe
          ? ` (${Math.round(current.windSpeedKph)} קמ"ש)`
          : ` (${Math.round(current.windSpeedKph)} km/h)`;
    lines.push(isHe ? `• רוח${dir}` : `• Wind${dir}`);
  }

  if (current.seaTemperatureCelsius !== undefined) {
    lines.push(
      isHe
        ? `• טמפרטורת מים: ${Math.round(current.seaTemperatureCelsius)}°C`
        : `• Water temperature: ${Math.round(current.seaTemperatureCelsius)}°C`,
    );
  }

  if (current.visibilityKm !== undefined) {
    lines.push(
      isHe ? `• ראות: ${current.visibilityKm.toFixed(0)} ק"מ` : `• Visibility: ${current.visibilityKm.toFixed(0)} km`,
    );
  }

  if (current.nextHighTide || current.nextLowTide) {
    const tideParts: string[] = [];
    if (current.nextHighTide) {
      tideParts.push(
        isHe ? `גאות ${formatTime(current.nextHighTide, language)}` : `high ${formatTime(current.nextHighTide, language)}`,
      );
    }
    if (current.nextLowTide) {
      tideParts.push(
        isHe ? `שפל ${formatTime(current.nextLowTide, language)}` : `low ${formatTime(current.nextLowTide, language)}`,
      );
    }
    lines.push(isHe ? `• גאות/שפל: ${tideParts.join(', ')}` : `• Tides: ${tideParts.join(', ')}`);
  }

  return lines.join('\n');
}

function buildStructured(
  spot: FishingSpotSummary,
  research: FishingAnswer,
  language: 'en' | 'he',
): FishingAssistantResponse {
  return {
    answer: research.directAnswer,
    location: {
      spotId: spot.id,
      name: spotDisplayName(spot, language),
      latitude: spot.latitude,
      longitude: spot.longitude,
      distanceKm: spot.distanceKm,
    },
    terrain: {
      shoreType: spot.shoreType,
      seabedType: spot.seabedType,
      confidence: spot.verificationStatus === 'verified' ? 'verified' : 'medium',
    },
    possibleSpecies: [],
    conditions: research.conditions
      ? {
          summary: research.conditions.summary ?? '',
          suitability: research.conditions.suitability ?? 'unknown',
          retrievedAt: research.conditions.retrievedAt,
        }
      : undefined,
    hazards: research.safetyWarnings ?? [],
    regulations: [],
    followUpQuestions: [],
    sources: [
      {
        title: language === 'he' ? 'דף הנקודה ותנאי ים חיים' : 'Spot page & live sea conditions',
        url: `/spot/${spot.id}`,
        authority: 'Open-Meteo',
        checkedAt: research.conditions?.retrievedAt ?? research.generatedAt,
      },
    ],
    confidence: 'high',
    freshnessMessage:
      language === 'he'
        ? `נתונים חיים נשלפו ב-${formatDateTime(research.conditions?.retrievedAt ?? research.generatedAt, language)}`
        : `Live data retrieved at ${formatDateTime(research.conditions?.retrievedAt ?? research.generatedAt, language)}`,
  };
}

/**
 * When the user asks about live site data (waves, wind, etc.) for a known spot,
 * return a grounded answer from Open-Meteo + the spot page link.
 */
export async function tryAnswerSpotSiteQuestion(
  input: SpotSiteAnswerInput,
): Promise<SpotSiteAnswerResult | null> {
  if (!asksSpotSiteData(input.question)) return null;

  const spot = resolveSpot(input);
  if (!spot) return null;

  const isHe = input.language === 'he';
  const spotName = spotDisplayName(spot, input.language);
  const coords = marineCoords(spot);
  const profile = getBeachProfile(spot.id);
  const now = new Date().toISOString();

  try {
    const advice = await getLiveConditionsAdvice(
      {
        id: spot.id,
        nameEn: spot.name,
        nameHe: spot.localizedNames?.he ?? spot.name,
        city: spot.region,
        region: 'mediterranean',
        waterType: 'saltwater',
        latitude: coords.latitude,
        longitude: coords.longitude,
        matchType: 'exact',
      },
      input.language,
    );

    const metrics = formatMetricsBlock(advice.current, input.language);
    const shore = shoreTypeLabel(spot.shoreType, input.language);
    const spotPageHint = isHe
      ? `פתחו את דף הנקודה באפליקציה לגרף שעתי, גאות ושפל ואזהרות בטיחות.`
      : `Open the spot page in the app for the hourly timeline, tides, and safety warnings.`;

    const intro = isHe
      ? `תנאי ים חיים עבור ${spotName} (חוף ${shore}):`
      : `Live sea conditions for ${spotName} (${shore} shore):`;

    const directAnswer = [intro, metrics, advice.explanation, spotPageHint].filter(Boolean).join('\n\n');

    const research: FishingAnswer = {
      question: input.question,
      language: input.language,
      directAnswer,
      summary: directAnswer,
      location: {
        name: spotName,
        latitude: spot.latitude,
        longitude: spot.longitude,
        waterType: 'saltwater',
        terrainType: shore,
      },
      conditions: advice.conditions,
      safetyWarnings:
        advice.current.safetyWarnings.length > 0
          ? [
              isHe
                ? 'יש אזהרות ים פעילות — בדקו את כרטיס תנאי הים בדף הנקודה לפני יציאה.'
                : 'Active marine warnings — check the sea-conditions card on the spot page before heading out.',
            ]
          : profile?.hazardNotes ? [profile.hazardNotes[input.language]] : [],
      confidence: 'high',
      confidenceReason: isHe ? 'נתוני ים חיים מהאתר (Open-Meteo)' : 'Live site marine data (Open-Meteo)',
      sources: [],
      searchQueriesUsed: [],
      providersUsed: ['open-meteo', 'spot-database'],
      generatedAt: now,
      lastVerifiedAt: advice.retrievedAt,
    };

    return {
      answer: directAnswer,
      structured: buildStructured(spot, research, input.language),
      research,
      fromSiteData: true,
    };
  } catch {
    return null;
  }
}
