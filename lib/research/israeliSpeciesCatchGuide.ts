/**
 * Israeli Mediterranean species catch ethics guide.
 *
 * Size recommendations and per-session limits sourced from the Fishing Addicts
 * recreational ethics infographic (community guide). Official legal minimums
 * and protected species status cross-referenced with parks.org.il (INPA):
 *   - parks.org.il/category/sea/fish/ (species profiles)
 *   - parks.org.il/article/fish-length/ (minimum sizes)
 *
 * General species descriptions also reference tahvivim.com hobby fishing content.
 */

import type { Lang } from '@/lib/research/fishingKnowledge';
import {
  buildMediterraneanFishCatalogOverview,
  buildMediterraneanFishDetailAnswer,
  matchMediterraneanFish,
  tryBuildMediterraneanFishAnswer,
  PARKS_MEDITERRANEAN_FISH_URL,
} from '@/lib/research/mediterraneanFishCatalog';

export interface SpeciesCatchProfile {
  id: string;
  patterns: RegExp[];
  name: { en: string; he: string };
  role: { en: string; he: string };
  /** True when the species is flagged with extinction concern in the ethics guide. */
  extinctionConcern: boolean;
  /** Legal minimum length in cm when specified in the guide; null = not listed. */
  legalMinimumCm: number | null;
  recommendedMinimumCm: number;
  maxPerSession: number;
  /** Overrides when Israeli law differs from the community ethics card (e.g. protected grouper). */
  protectedNote?: { en: string; he: string };
}

export const ISRAELI_SPECIES_CATCH_GUIDE: SpeciesCatchProfile[] = [
  {
    id: 'grouper-lokus',
    patterns: [/לוקוס|grouper|dusky grouper|דקר/i],
    name: { en: 'Grouper (lokus)', he: 'לוקוס' },
    role: { en: 'Predatory fish — extinction concern in the ethics guide', he: 'דג טורף — חשש להכחדה במדריך האתיקה' },
    extinctionConcern: true,
    legalMinimumCm: 40,
    recommendedMinimumCm: 50,
    maxPerSession: 3,
    protectedNote: {
      en: 'IMPORTANT: Dusky grouper (lokus) is PROTECTED under Israeli law — if you hook one you must release it immediately. Verify current rules at parks.org.il before keeping any grouper species.',
      he: 'חשוב: לוקוס (דקר הסלעים) מוגן בחוק בישראל — אם נתפס יש לשחרר מיד. בדקו את הכללים העדכניים ב-parks.org.il לפני שמחליטים להשאיר דקר.',
    },
  },
  {
    id: 'amberjack',
    patterns: [/אינטיאס|amberjack|intias/i],
    name: { en: 'Amberjack (intias)', he: 'אינטיאס' },
    role: { en: 'Important predatory fish — no extinction concern listed', he: 'דג טורף חשוב — ללא חשש להכחדה' },
    extinctionConcern: false,
    legalMinimumCm: null,
    recommendedMinimumCm: 60,
    maxPerSession: 3,
  },
  {
    id: 'dorado',
    patterns: [/דוראדו|dorado|mahi.?mahi|דג הדור/i],
    name: { en: 'Dorado (mahi-mahi)', he: 'דוראדו' },
    role: { en: 'Predator and prey — no extinction concern listed', he: 'טורף ונטרף — ללא חשש להכחדה' },
    extinctionConcern: false,
    legalMinimumCm: null,
    recommendedMinimumCm: 50,
    maxPerSession: 4,
  },
  {
    id: 'bonito',
    patterns: [/פלמידה|bonito|palamida|טונה שחורה/i],
    name: { en: 'Bonito (palamida)', he: 'פלמידה' },
    role: { en: 'Predator and prey — no extinction concern listed', he: 'טורף ונטרף — ללא חשש להכחדה' },
    extinctionConcern: false,
    legalMinimumCm: 30,
    recommendedMinimumCm: 50,
    maxPerSession: 4,
  },
  {
    id: 'little-tunny',
    patterns: [/טונית|little tunny|tuna\b|טונה(?! ש)/i],
    name: { en: 'Little tunny', he: 'טונית' },
    role: { en: 'Predator and prey — no extinction concern listed', he: 'טורף ונטרף — ללא חשש להכחדה' },
    extinctionConcern: false,
    legalMinimumCm: null,
    recommendedMinimumCm: 50,
    maxPerSession: 4,
  },
  {
    id: 'barracuda',
    patterns: [/ברקודה|barracuda/i],
    name: { en: 'Barracuda', he: 'ברקודה' },
    role: { en: 'Predator and prey — no extinction concern listed', he: 'טורף ונטרף — ללא חשש להכחדה' },
    extinctionConcern: false,
    legalMinimumCm: 20, // INPA parks.org.il/article/fish-length/
    recommendedMinimumCm: 50,
    maxPerSession: 4,
  },
  {
    id: 'bluefish',
    patterns: [/גומבר|bluefish/i],
    name: { en: 'Bluefish (gombar)', he: 'גומבר' },
    role: { en: 'Predator and prey — no extinction concern listed', he: 'טורף ונטרף — ללא חשש להכחדה' },
    extinctionConcern: false,
    legalMinimumCm: null,
    recommendedMinimumCm: 45,
    maxPerSession: 3,
  },
  {
    id: 'sea-bass',
    patterns: [/לברק\b|sea bass|seabass/i],
    name: { en: 'Sea bass (levrek)', he: 'לברק' },
    role: { en: 'Predator and prey — no extinction concern listed', he: 'טורף ונטרף — ללא חשש להכחדה' },
    extinctionConcern: false,
    legalMinimumCm: null,
    recommendedMinimumCm: 35,
    maxPerSession: 3,
  },
  {
    id: 'needlefish',
    patterns: [/חניתנ|חלילנ|needlefish|cornetfish/i],
    name: { en: 'Needlefish & cornetfish', he: 'חניתנים וחלילנים' },
    role: { en: 'Predator and prey — no extinction concern listed', he: 'טורף ונטרף — ללא חשש להכחדה' },
    extinctionConcern: false,
    legalMinimumCm: null,
    recommendedMinimumCm: 60,
    maxPerSession: 4,
  },
  {
    id: 'blue-runner',
    patterns: [/טרכון|blue runner|jack\b|טרחון|צנינית/i],
    name: { en: 'Blue runner (jack)', he: 'טרכון' },
    role: { en: 'Predator and prey — no extinction concern listed', he: 'טורף ונטרף — ללא חשש להכחדה' },
    extinctionConcern: false,
    legalMinimumCm: 11,
    recommendedMinimumCm: 15,
    maxPerSession: 12,
  },
  {
    id: 'white-seabream',
    patterns: [/סרגוס|white seabream|sargos|sargo\b/i],
    name: { en: 'White seabream (sargos)', he: 'סרגוס' },
    role: { en: 'Predator and prey — no extinction concern listed', he: 'טורף ונטרף — ללא חשש להכחדה' },
    extinctionConcern: false,
    legalMinimumCm: 11,
    recommendedMinimumCm: 12,
    maxPerSession: 12,
  },
  {
    id: 'sillago',
    patterns: [/טלוויזיה|sillago|smelt.?whiting|באטיס|דג חול/i],
    name: { en: 'Sillago (telvizia / battis)', he: 'טלוויזיה (באטיס)' },
    role: { en: 'Predator and prey — no extinction concern listed', he: 'טורף ונטרף — ללא חשש להכחדה' },
    extinctionConcern: false,
    legalMinimumCm: null,
    recommendedMinimumCm: 12,
    maxPerSession: 20,
  },
];

const TAHVIVIM_SPECIES_URL =
  'https://tahvivim.com/%d7%a1%d7%95%d7%92%d7%99-%d7%93%d7%92%d7%99%d7%9d/';

const ASKS_CATCH_LIMITS =
  /מינימום|minimum|גודל|size limit|כמה.*(מותר|לקחת|פריט)|quota|מכסה|בסשן|per session|recommended.*(size|keep)|legal.*(size|minimum)|מה (ה)?גודל|אורך/i;

const ASKS_SPECIES_LIST =
  /סוגי דגים|סוגי הדגים|common fish|fish types|fish species in israel|אילו דגים|רשימת דגים|list.*fish/i;

export function matchSpeciesCatchProfile(text: string): SpeciesCatchProfile | undefined {
  return ISRAELI_SPECIES_CATCH_GUIDE.find((p) => p.patterns.some((re) => re.test(text)));
}

function formatLegalMin(profile: SpeciesCatchProfile, lang: Lang): string {
  if (profile.legalMinimumCm == null) {
    return lang === 'he' ? 'אין מינימום בחוק (לפי המדריך)' : 'No legal minimum listed in the guide';
  }
  return lang === 'he'
    ? `מינימום בחוק: ${profile.legalMinimumCm} ס"מ`
    : `Legal minimum: ${profile.legalMinimumCm} cm`;
}

function formatRecommended(profile: SpeciesCatchProfile, lang: Lang): string {
  return lang === 'he'
    ? `מומלץ לקחת מ-${profile.recommendedMinimumCm} ס"מ, עד ${profile.maxPerSession} פריטים בסשן`
    : `Recommended: from ${profile.recommendedMinimumCm} cm, up to ${profile.maxPerSession} fish per session`;
}

export function buildSpeciesCatchAnswer(
  profile: SpeciesCatchProfile,
  lang: Lang,
): string {
  const lines: string[] = [];

  lines.push(
    lang === 'he'
      ? `תשובה ישירה: ${profile.name.he} — ${profile.role.he}.`
      : `Direct answer: ${profile.name.en} — ${profile.role.en}.`,
  );

  if (profile.protectedNote) {
    lines.push(profile.protectedNote[lang]);
  }

  lines.push(`${formatLegalMin(profile, lang)}. ${formatRecommended(profile, lang)}.`);

  if (profile.extinctionConcern) {
    lines.push(
      lang === 'he'
        ? 'מין עם חשש להכחדה — העדיפו דגים גדולים יותר ופחות פריטים, או שחרור.'
        : 'Extinction concern flagged — prefer fewer, larger fish, or release.',
    );
  }

  lines.push(
    lang === 'he'
      ? `מקורות: מדריך אתיקה לדייג (Fishing Addicts) + אימות רשמי ב-parks.org.il. תיאור כללי: tahvivim.com`
      : `Sources: Fishing Addicts recreational ethics guide + verify officially at parks.org.il. General info: tahvivim.com`,
  );

  return lines.join('\n\n');
}

export function buildSpeciesListOverviewAnswer(lang: Lang): string {
  const parksOverview = buildMediterraneanFishCatalogOverview(lang);
  const ethicsHeader =
    lang === 'he'
      ? 'מדריך אתיקה לדייג (Fishing Addicts) — 12 מינים עם גודל מומלץ ומכסה לסשן:'
      : 'Recreational ethics guide (Fishing Addicts) — 12 species with recommended size and per-session limits:';

  const rows = ISRAELI_SPECIES_CATCH_GUIDE.map((p) => {
    const legal =
      p.legalMinimumCm == null
        ? lang === 'he' ? 'ללא מינ. חוק' : 'no legal min'
        : lang === 'he' ? `מינ. ${p.legalMinimumCm} ס"מ` : `legal ${p.legalMinimumCm} cm`;
    const rec =
      lang === 'he'
        ? `מומלץ ≥${p.recommendedMinimumCm} ס"מ, עד ${p.maxPerSession}/סשן`
        : `rec ≥${p.recommendedMinimumCm} cm, max ${p.maxPerSession}/session`;
    const flag = p.extinctionConcern ? (lang === 'he' ? ' ⚠️' : ' ⚠️') : '';
    return lang === 'he'
      ? `• ${p.name.he}${flag}: ${legal}, ${rec}`
      : `• ${p.name.en}${flag}: ${legal}, ${rec}`;
  });

  const footer =
    lang === 'he'
      ? `\nלוקוס ודקר אלכסנדרוני מוגנים בחוק — שחררו אם נתפס. לאימות רשמי: ${PARKS_MEDITERRANEAN_FISH_URL}`
      : `\nGrouper species may be protected — release if required. Official rules: ${PARKS_MEDITERRANEAN_FISH_URL}`;

  return `${parksOverview}\n\n---\n\n${ethicsHeader}\n\n${rows.join('\n')}\n${footer}`;
}

export function tryBuildSpeciesCatchAnswer(
  question: string,
  lang: Lang,
): { directAnswer: string; usedLocalDb: true } | null {
  if (ASKS_SPECIES_LIST.test(question)) {
    return { directAnswer: buildSpeciesListOverviewAnswer(lang), usedLocalDb: true };
  }

  const profile = matchSpeciesCatchProfile(question);
  if (profile && (ASKS_CATCH_LIMITS.test(question) || /מוגן|protected|מותר להשאיר|keep fish|כמה פריטים/i.test(question))) {
    return { directAnswer: buildSpeciesCatchAnswer(profile, lang), usedLocalDb: true };
  }

  const medAnswer = tryBuildMediterraneanFishAnswer(question, lang);
  if (medAnswer) return medAnswer;

  const medEntry = matchMediterraneanFish(question);
  if (medEntry && ASKS_CATCH_LIMITS.test(question)) {
    return { directAnswer: buildMediterraneanFishDetailAnswer(medEntry, lang), usedLocalDb: true };
  }

  return null;
}

export { TAHVIVIM_SPECIES_URL };
