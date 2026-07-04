import { asksSpotSiteData, tryAnswerSpotSiteQuestion } from '@/lib/research/spotSiteAnswer';
import { getMarineForecast } from '@/features/marine/marineService';
import type { MarineForecast } from '@/types/marine';

jest.mock('@/features/marine/marineService', () => ({
  getMarineForecast: jest.fn(),
}));

const mockForecast: MarineForecast = {
  current: {
    latitude: 32.0849,
    longitude: 34.755,
    waveHeightMeters: 0.8,
    wavePeriodSeconds: 6,
    windSpeedKph: 14,
    windDirectionDegrees: 270,
    seaTemperatureCelsius: 22,
    seaLevel: 'low',
    fishingSuitabilityScore: 72,
    suitabilityLabel: 'good',
    safetyWarnings: [],
    source: 'open-meteo',
    forecastTime: new Date().toISOString(),
    fetchedAt: new Date().toISOString(),
  },
  hourly: [],
};

describe('spotSiteAnswer', () => {
  beforeEach(() => {
    jest.mocked(getMarineForecast).mockResolvedValue(mockForecast);
  });

  it('detects wave and conditions questions', () => {
    expect(asksSpotSiteData('What are the waves at Gordon beach today?')).toBe(true);
    expect(asksSpotSiteData('מה גובה הגלים בחוף גורדון?')).toBe(true);
    expect(asksSpotSiteData('What equipment for Herzliya?')).toBe(false);
  });

  it('returns live marine data for a named beach', async () => {
    const result = await tryAnswerSpotSiteQuestion({
      question: 'What are the waves at Gordon beach right now?',
      language: 'en',
    });

    expect(result).not.toBeNull();
    expect(result!.fromSiteData).toBe(true);
    expect(result!.answer).toMatch(/0\.8 m/i);
    expect(result!.answer.toLowerCase()).toMatch(/gordon|tel aviv/);
    expect(result!.structured.location?.spotId).toBe('demo-1');
    expect(result!.research.conditions?.isLive).toBe(true);
  });

  it('returns Hebrew answer for Herzliya waves', async () => {
    const result = await tryAnswerSpotSiteQuestion({
      question: 'מה גובה הגלים במרינה הרצליה עכשיו?',
      language: 'he',
    });

    expect(result).not.toBeNull();
    expect(result!.answer).toContain('גלים');
    expect(result!.structured.location?.spotId).toBe('demo-2');
  });

  it('returns null when no spot is mentioned', async () => {
    const result = await tryAnswerSpotSiteQuestion({
      question: 'What are the waves today?',
      language: 'en',
    });
    expect(result).toBeNull();
  });

  it('returns null when question is not about site data', async () => {
    const result = await tryAnswerSpotSiteQuestion({
      question: 'What fish can I catch at Palmachim?',
      language: 'en',
    });
    expect(result).toBeNull();
  });
});
