/**
 * Synthesize a structured fishing answer from scored sources.
 */

import type {
  FishingAnswer,
  FishingSource,
  ResearchConfidence,
  SourceConflict,
} from '@/types/research';
import type { QueryUnderstanding } from '@/lib/research/queryUnderstanding';

interface SynthesisInput {
  question: string;
  language: 'en' | 'he';
  understanding: QueryUnderstanding;
  sources: FishingSource[];
  searchQueriesUsed: string[];
  providersUsed: string[];
  generatedAt: string;
}

function determineConfidence(sources: FishingSource[]): { level: ResearchConfidence; reason: string } {
  if (sources.length === 0) {
    return {
      level: 'limited',
      reason: 'No reliable fishing sources were found for this question.',
    };
  }

  const official = sources.filter((s) =>
    ['government', 'regulation', 'weather', 'marine', 'scientific'].includes(s.sourceType),
  );
  const avgReliability = sources.reduce((sum, s) => sum + s.reliabilityScore, 0) / sources.length;

  if (official.length >= 2 && sources.length >= 4 && avgReliability >= 70) {
    return {
      level: 'high',
      reason: `Based on ${sources.length} independent sources including ${official.length} official or scientific sources.`,
    };
  }

  if (sources.length >= 3 && avgReliability >= 55) {
    return {
      level: 'medium',
      reason: `Based on ${sources.length} sources. Some information may rely on community or local reports.`,
    };
  }

  return {
    level: 'limited',
    reason: `Only ${sources.length} source(s) found. Verify details on site before fishing.`,
  };
}

function buildQuickAnswer(
  question: string,
  sources: FishingSource[],
  understanding: QueryUnderstanding,
  language: 'en' | 'he',
): string {
  const isHe = language === 'he';
  const loc = understanding.locationName ?? understanding.city;

  if (sources.length === 0) {
    return isHe
      ? 'לא מצאתי מספיק מקורות אמינים לענות על השאלה. נסה לציין שם חוף, עיר או מיקום מדויק יותר.'
      : 'I could not find enough reliable sources to answer confidently. Try specifying a beach name, city, or more precise location.';
  }

  const topSnippets = sources
    .slice(0, 3)
    .map((s) => s.snippet)
    .filter((s) => s.length > 30)
    .join(' ');

  const intro = isHe
    ? loc
      ? `לפי ${sources.length} מקורות עצמאיים על ${loc}:\n\n`
      : `לפי ${sources.length} מקורות עצמאיים:\n\n`
    : loc
      ? `Based on ${sources.length} independent sources about ${loc}:\n\n`
      : `Based on ${sources.length} independent sources:\n\n`;

  const synthesized = topSnippets.slice(0, 800) || sources[0].snippet;

  const disclaimer = isHe
    ? '\n\n⚠️ מידע מהאינטרנט — לא מאומת. אשר תקנות ותנאים במקום לפני דיג.'
    : '\n\n⚠️ Information from web sources — not verified. Confirm regulations and conditions on site before fishing.';

  return `${intro}${synthesized}${disclaimer}`;
}

/**
 * Detect disagreeing numeric claims about the same measurable topic
 * (e.g. minimum size, wave height, depth) across different sources.
 */
export function detectNumericConflicts(
  sources: FishingSource[],
  language: 'en' | 'he',
): SourceConflict[] {
  const topics: Array<{ topic: { en: string; he: string }; pattern: RegExp }> = [
    { topic: { en: 'Minimum size', he: 'אורך מינימום' }, pattern: /(minimum|מינימום|אורך מינימלי)[^.]{0,60}?(\d+(?:\.\d+)?)\s*(cm|ס"מ|סנטימטר)/i },
    { topic: { en: 'Wave height', he: 'גובה גלים' }, pattern: /(wave|גל(?:ים)?)[^.]{0,40}?(\d+(?:\.\d+)?)\s*(m\b|meter|מטר|מ')/i },
    { topic: { en: 'Depth', he: 'עומק' }, pattern: /(depth|עומק)[^.]{0,40}?(\d+(?:\.\d+)?)\s*(m\b|meter|מטר|מ')/i },
  ];

  const conflicts: SourceConflict[] = [];
  for (const { topic, pattern } of topics) {
    const claims: Array<{ value: number; source: FishingSource }> = [];
    for (const source of sources) {
      const match = pattern.exec(`${source.title} ${source.snippet}`);
      if (match) claims.push({ value: parseFloat(match[2]), source });
    }
    const values = [...new Set(claims.map((c) => c.value))];
    if (values.length > 1) {
      conflicts.push({
        topic: language === 'he' ? topic.he : topic.en,
        claims: claims.map((c) => ({
          claim: `${c.value}`,
          sourceIds: [c.source.id],
          reliability: c.source.isPrimarySource ? 'high' : 'medium',
        })),
        resolution:
          language === 'he'
            ? 'המקורות מציינים ערכים שונים — המידע אינו ודאי. העדף את המקור הרשמי או העדכני ביותר ואמת במקום.'
            : 'Sources report different values — this information is uncertain. Prefer the official or most recent source and verify on site.',
      });
    }
  }
  return conflicts;
}

function detectConflicts(sources: FishingSource[], language: 'en' | 'he'): SourceConflict[] {
  const conflicts: SourceConflict[] = [...detectNumericConflicts(sources, language)];

  const official = sources.filter((s) => s.isPrimarySource);
  const community = sources.filter((s) => ['forum', 'social', 'local-report'].includes(s.sourceType));

  if (official.length > 0 && community.length > 0) {
    const officialClaims = official.map((s) => s.snippet.slice(0, 100)).join('; ');
    const communityClaims = community.map((s) => s.snippet.slice(0, 100)).join('; ');

    if (officialClaims !== communityClaims) {
      conflicts.push({
        topic: language === 'he' ? 'דיווחי קהילה מול מקורות רשמיים' : 'Community reports vs official sources',
        claims: [
          {
            claim: language === 'he' ? 'מקורות רשמיים/מדעיים' : 'Official/scientific sources',
            sourceIds: official.map((s) => s.id),
            reliability: 'high',
          },
          {
            claim: language === 'he' ? 'דיווחי קהילה מקומית' : 'Local community reports',
            sourceIds: community.map((s) => s.id),
            reliability: 'medium',
          },
        ],
        resolution:
          language === 'he'
            ? 'עדיף להסתמך על מקורות רשמיים לתקנות ובטיחות. דיווחי קהילה יכולים לרמוז על פעילות אחרונה אך אינם מובטחים.'
            : 'Prefer official sources for regulations and safety. Community reports may indicate recent activity but are not guaranteed.',
      });
    }
  }

  return conflicts;
}

export function synthesizeAnswer(input: SynthesisInput): FishingAnswer {
  const { sources, understanding, language, question, generatedAt } = input;
  let { level, reason } = determineConfidence(sources);
  let quickAnswer = buildQuickAnswer(question, sources, understanding, language);
  const conflicts = detectConflicts(sources, language);

  // Numeric conflicts make the information uncertain — never hide that.
  const numericConflicts = conflicts.filter((c) => c.claims.every((cl) => /^\d/.test(cl.claim)));
  if (numericConflicts.length > 0) {
    if (level === 'high') {
      level = 'medium';
      reason = `${reason} Sources disagree on: ${numericConflicts.map((c) => c.topic).join(', ')}.`;
    }
    const note =
      language === 'he'
        ? `\n\n⚠️ המקורות אינם מסכימים לגבי: ${numericConflicts.map((c) => c.topic).join(', ')}. העדף מקור רשמי ועדכני.`
        : `\n\n⚠️ Sources disagree about: ${numericConflicts.map((c) => c.topic).join(', ')}. Prefer the official, most recent source.`;
    quickAnswer = `${quickAnswer}${note}`;
  }

  const safetyWarnings: string[] = [];
  if (understanding.needsWeather || understanding.category === 'safety') {
    safetyWarnings.push(
      language === 'he'
        ? 'תנאי ים ורוח משתנים — בדוק תחזית עדכנית לפני יציאה לדיג.'
        : 'Sea and wind conditions change — check current forecast before fishing.',
    );
  }
  if (understanding.category === 'location' || /rock|סלע/i.test(question)) {
    safetyWarnings.push(
      language === 'he'
        ? 'דיג מסלעים מסוכן בגלים גבוהים — היזהר מהחלקה.'
        : 'Rock fishing is dangerous in high waves — beware of slippery surfaces.',
    );
  }

  const regulations = understanding.needsRegulations
    ? [
        {
          title: language === 'he' ? 'תקנות דיג' : 'Fishing regulations',
          summary:
            language === 'he'
              ? 'תקנות דיג עשויות להשתנות. אשר עם הרשות המוסמכת לפני דיג.'
              : 'Fishing regulations can change. Confirm the latest rules with the relevant fisheries authority before fishing.',
          isOfficial: sources.some((s) => ['government', 'regulation'].includes(s.sourceType)),
        },
      ]
    : [];

  return {
    question,
    language,
    directAnswer: quickAnswer,
    summary: quickAnswer,
    quickAnswer,
    location: understanding.locationName
      ? {
          name: understanding.locationName,
          country: understanding.country,
          region: understanding.region,
          city: understanding.city,
          waterType: understanding.isIsraeliLocation ? 'saltwater' : 'unknown',
        }
      : undefined,
    conditions: understanding.needsWeather
      ? {
          summary:
            language === 'he'
              ? 'נתוני מזג אוויר וים דורשים מקור רשמי עדכני — ראה מקורות למטה.'
              : 'Weather and marine data require current official sources — see sources below.',
          isLive: true,
          retrievedAt: generatedAt,
          suitability: 'unknown',
        }
      : undefined,
    regulations,
    safetyWarnings,
    confidence: level,
    confidenceReason: reason,
    sources,
    conflicts: conflicts.length > 0 ? conflicts : undefined,
    searchQueriesUsed: input.searchQueriesUsed,
    providersUsed: input.providersUsed,
    generatedAt,
    lastVerifiedAt: generatedAt,
  };
}
