/**
 * Conditions advisor — turns live marine data into a fishing explanation.
 *
 * For "is it good to fish today?"-style questions the bot must use verified
 * live data (Open-Meteo via marineService) for the resolved coordinates and
 * explain HOW the conditions affect fishing, not just print numbers.
 */

import { getMarineForecast } from '@/features/marine/marineService';
import { degreesToCompassEn } from '@/lib/research/compassText';
import type { LiveMarineConditions } from '@/types/marine';
import type { FishingConditions } from '@/types/research';
import type { ResolvedLocation } from '@/lib/research/locationResolver';

export interface LiveConditionsAdvice {
  conditions: FishingConditions;
  current: LiveMarineConditions;
  /** Human explanation of how conditions affect fishing, in the answer language. */
  explanation: string;
  retrievedAt: string;
}

function explainEn(c: LiveMarineConditions): string {
  const parts: string[] = [];

  if (c.windSpeedKph !== undefined) {
    const dir = c.windDirectionDegrees !== undefined ? `${degreesToCompassEn(c.windDirectionDegrees)} ` : '';
    if (c.windSpeedKph >= 30) {
      parts.push(`${dir}winds of ${Math.round(c.windSpeedKph)} km/h will make casting and line control difficult — a heavier sinker and a protected spot may work better.`);
    } else if (c.windSpeedKph >= 18) {
      parts.push(`${dir}winds around ${Math.round(c.windSpeedKph)} km/h are workable but favor heavier lures and shorter casts.`);
    } else {
      parts.push(`Light ${dir}wind (${Math.round(c.windSpeedKph)} km/h) allows comfortable casting, including light lures.`);
    }
  }

  if (c.waveHeightMeters !== undefined) {
    if (c.waveHeightMeters >= 1.5) {
      parts.push(`Waves of ${c.waveHeightMeters.toFixed(1)} m create rough surf — shore fishing is hard and rock platforms are dangerous.`);
    } else if (c.waveHeightMeters >= 0.7) {
      parts.push(`Moderate waves (${c.waveHeightMeters.toFixed(1)} m) stir up food near the surf line, which can actually improve bottom fishing from sandy beaches.`);
    } else {
      parts.push(`A calm sea (${c.waveHeightMeters.toFixed(1)} m waves) suits light tackle and lure fishing; fish may sit further out in clear water.`);
    }
  }

  if (c.seaTemperatureCelsius !== undefined) {
    parts.push(`Water temperature is ${Math.round(c.seaTemperatureCelsius)}°C.`);
  }
  if (c.rainProbability !== undefined && c.rainProbability >= 40) {
    parts.push(`Rain probability is ${Math.round(c.rainProbability)}% — bring protection and watch for runoff near stream mouths.`);
  }
  if (c.sunrise && c.sunset) {
    parts.push('Dawn and dusk remain the most productive windows.');
  }

  return parts.join(' ');
}

function explainHe(c: LiveMarineConditions): string {
  const parts: string[] = [];

  if (c.windSpeedKph !== undefined) {
    if (c.windSpeedKph >= 30) {
      parts.push(`רוח של ${Math.round(c.windSpeedKph)} קמ"ש תקשה על ההטלה ושליטה בחוט — משקולת כבדה יותר ומקום מוגן יעבדו טוב יותר.`);
    } else if (c.windSpeedKph >= 18) {
      parts.push(`רוח של כ-${Math.round(c.windSpeedKph)} קמ"ש אפשרית לדיג, אך עדיפים פתיונות כבדים והטלות קצרות.`);
    } else {
      parts.push(`רוח חלשה (${Math.round(c.windSpeedKph)} קמ"ש) מאפשרת הטלה נוחה, כולל פתיונות קלים.`);
    }
  }

  if (c.waveHeightMeters !== undefined) {
    if (c.waveHeightMeters >= 1.5) {
      parts.push(`גלים בגובה ${c.waveHeightMeters.toFixed(1)} מ' יוצרים ים סוער — דיג חופים קשה ומצוקי סלע מסוכנים.`);
    } else if (c.waveHeightMeters >= 0.7) {
      parts.push(`גלים בינוניים (${c.waveHeightMeters.toFixed(1)} מ') מערבלים מזון בקו הגלים — זה דווקא משפר דיג קרקעית מחופים חוליים.`);
    } else {
      parts.push(`ים רגוע (גלים ${c.waveHeightMeters.toFixed(1)} מ') מתאים לציוד קל ולפתיונות דמה; במים צלולים הדגים עשויים להתרחק מהחוף.`);
    }
  }

  if (c.seaTemperatureCelsius !== undefined) {
    parts.push(`טמפרטורת המים ${Math.round(c.seaTemperatureCelsius)}°C.`);
  }
  if (c.rainProbability !== undefined && c.rainProbability >= 40) {
    parts.push(`הסתברות גשם ${Math.round(c.rainProbability)}% — הצטיידו בהתאם ושימו לב לזרימות בשפכי נחלים.`);
  }
  if (c.sunrise && c.sunset) {
    parts.push('שעות הזריחה והשקיעה נשארות החלונות הפוריים ביותר.');
  }

  return parts.join(' ');
}

function suitabilityBucket(score: number): FishingConditions['suitability'] {
  if (score >= 60) return 'good';
  if (score >= 40) return 'acceptable';
  return 'poor';
}

/**
 * Fetch live conditions for a resolved location. Throws when the provider
 * fails — callers must surface the failure, never invent conditions.
 */
export async function getLiveConditionsAdvice(
  location: ResolvedLocation,
  language: 'en' | 'he',
): Promise<LiveConditionsAdvice> {
  const forecast = await getMarineForecast({
    latitude: location.latitude,
    longitude: location.longitude,
  });

  const current = forecast.current;
  const explanation = language === 'he' ? explainHe(current) : explainEn(current);

  return {
    conditions: {
      summary: explanation,
      wind: current.windSpeedKph !== undefined ? `${Math.round(current.windSpeedKph)} km/h` : undefined,
      waves: current.waveHeightMeters !== undefined ? `${current.waveHeightMeters.toFixed(1)} m` : undefined,
      waterTemperature:
        current.seaTemperatureCelsius !== undefined ? `${Math.round(current.seaTemperatureCelsius)}°C` : undefined,
      suitability: suitabilityBucket(current.fishingSuitabilityScore),
      retrievedAt: current.fetchedAt,
      isLive: true,
    },
    current,
    explanation,
    retrievedAt: current.fetchedAt,
  };
}
