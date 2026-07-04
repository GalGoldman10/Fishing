/**
 * Expert answer engine — composes structured, specific fishing answers.
 *
 * Every answer follows the expert format: Direct answer → Best setup →
 * Best technique → Best time and conditions → Fish you can catch →
 * Extra tips → Sources checked. Content is drawn from the fishing knowledge
 * base (habitat tactics, bait profiles, species tactics, seasonal behavior),
 * the verified spot database, and filtered web sources — never generic filler.
 *
 * When key information is missing (no location, habitat, bait, or target
 * fish), the answer asks 1–3 short follow-up questions instead of guessing.
 */

import { getDemoSpotDetails, DEMO_CONDITIONS } from '@/lib/mock/demoData';
import { findSpotFromQuestion, shoreTypeLabel, listKnownBeaches } from '@/lib/research/spotMatcher';
import { getBeachProfile } from '@/lib/mock/beachProfiles';
import type { QueryUnderstanding } from '@/lib/research/queryUnderstanding';
import {
  HABITAT_TACTICS,
  SPECIES_TACTICS,
  SPECIES_ID_TO_TACTICS,
  detectHabitat,
  detectBait,
  detectTargetSpecies,
  isGenericBeachMention,
  mentionsForeignLocation,
  getSeasonalNotes,
  shoreTypeToHabitat,
  type HabitatTactics,
  type Lang,
  type SpeciesTactics,
} from '@/lib/research/fishingKnowledge';
import { tryBuildTechniqueAnswer } from '@/lib/research/fishingTechniques';
import { tryBuildSpeciesCatchAnswer } from '@/lib/research/israeliSpeciesCatchGuide';
import { buildTermClarificationQuestion } from '@/lib/research/fishingTermNormalization';
import type {
  EquipmentRecommendation,
  FishRecommendation,
  FishingAnswer,
  FishingSource,
} from '@/types/research';

// ---------------------------------------------------------------------------
// Section headers (the required answer structure)
// ---------------------------------------------------------------------------

const H = {
  setup: { en: 'Best setup:', he: 'הציוד המומלץ:' },
  technique: { en: 'Best technique:', he: 'הטכניקה:' },
  time: { en: 'Best time and conditions:', he: 'זמן ותנאים מומלצים:' },
  fish: { en: 'Fish you can catch:', he: 'דגים שאפשר לתפוס:' },
  tips: { en: 'Extra tips:', he: 'טיפים נוספים:' },
  sources: { en: 'Sources checked:', he: 'מקורות שנבדקו:' },
  followUp: { en: 'To tailor this exactly, tell me:', he: 'כדי לדייק את התשובה, ספרו לי:' },
};

const LIKELIHOOD_LABEL: Record<string, { en: string; he: string }> = {
  high: { en: 'high chance', he: 'סיכוי גבוה' },
  medium: { en: 'medium chance', he: 'סיכוי בינוני' },
  low: { en: 'low chance', he: 'סיכוי נמוך' },
};

function extractRelevantSentences(text: string, question: string, max = 2): string[] {
  const keywords = question
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3 && !['what', 'where', 'when', 'which', 'about', 'should', 'can'].includes(w));

  const sentences = text.split(/[.!?]\s+/).filter((s) => s.trim().length > 25);

  const scored = sentences.map((s) => {
    const lower = s.toLowerCase();
    const hits = keywords.filter((k) => lower.includes(k)).length;
    const fishingBonus = /fish|fishing|דיג|דג|bait|lure|shore|beach|חוף|rod|חכה/i.test(s) ? 2 : 0;
    return { sentence: s.trim(), score: hits + fishingBonus };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map((s) => s.sentence);
}

// ---------------------------------------------------------------------------
// Section builders
// ---------------------------------------------------------------------------

interface SpotContext {
  spot: ReturnType<typeof findSpotFromQuestion>;
  profile: ReturnType<typeof getBeachProfile>;
  spotName?: string;
}

function buildSetupSection(
  habitat: HabitatTactics,
  lang: Lang,
  override?: { rod?: string; reel?: string; mainLine?: string; leader?: string; hooks?: string; weights?: string; baits?: string[]; castingTip?: { en: string; he: string } },
): { text: string; equipment: EquipmentRecommendation } {
  const isHe = lang === 'he';
  const s = habitat.setup;
  const rod = override?.rod ?? s.rod[lang];
  const reel = override?.reel ?? s.reel[lang];
  const line = override?.mainLine ?? s.line[lang];
  const leader = override?.leader ?? s.leader[lang];
  const hook = override?.hooks ?? s.hook[lang];
  const bait = override?.baits?.join(', ') ?? s.bait[lang];
  const sinker = override?.weights;

  const lines = isHe
    ? [
        `• חכה: ${rod}`,
        `• סליל: ${reel}`,
        `• חוט: ${line}`,
        `• מוביל: ${leader}`,
        `• קרס/חסקה: ${hook}`,
        ...(sinker ? [`• משקולות: ${sinker}`] : []),
        `• פיתיון: ${bait}`,
      ]
    : [
        `• Rod: ${rod}`,
        `• Reel: ${reel}`,
        `• Line: ${line}`,
        `• Leader: ${leader}`,
        `• Hook/rig: ${hook}`,
        ...(sinker ? [`• Sinkers: ${sinker}`] : []),
        `• Bait: ${bait}`,
      ];

  return {
    text: `${H.setup[lang]}\n${lines.join('\n')}`,
    equipment: {
      rod,
      reel,
      mainLine: line,
      leader,
      hookOrLure: hook,
      sinker,
      bait,
      castingMethod: override?.castingTip?.[lang],
    },
  };
}

function buildTechniqueSection(habitat: HabitatTactics, lang: Lang, castingTip?: string): string {
  const steps = habitat.techniqueSteps.map((step, i) => `${i + 1}. ${step[lang]}`);
  if (castingTip) steps.push(`${steps.length + 1}. ${castingTip}`);
  return `${H.technique[lang]}\n${steps.join('\n')}`;
}

function buildTimeSection(habitat: HabitatTactics, lang: Lang): string {
  const seasonal = getSeasonalNotes(new Date(), lang);
  return `${H.time[lang]}\n${habitat.bestTime[lang]}\n${seasonal}`;
}

function speciesLine(tactics: SpeciesTactics, lang: Lang, likelihood?: string): string {
  const isHe = lang === 'he';
  const chance = likelihood ? ` (${LIKELIHOOD_LABEL[likelihood]?.[lang] ?? likelihood})` : '';
  const bitesLabel = isHe ? 'ניגש ל' : 'bites';
  const note = tactics.note ? ` ${tactics.note[lang]}` : '';
  return `• ${tactics.name[lang]}${chance} — ${bitesLabel}: ${tactics.bites[lang]}. ${tactics.where[lang]}.${note}`;
}

function buildFishSection(
  speciesKeys: Array<{ key: string; likelihood?: string }>,
  lang: Lang,
): { text: string; recommendations: FishRecommendation[] } {
  const lines: string[] = [];
  const recommendations: FishRecommendation[] = [];
  const seen = new Set<string>();

  for (const { key, likelihood } of speciesKeys) {
    const tactics = SPECIES_TACTICS[key];
    if (!tactics || seen.has(key)) continue;
    seen.add(key);
    lines.push(speciesLine(tactics, lang, likelihood));
    recommendations.push({
      commonName: tactics.name[lang],
      likelihood: (likelihood as FishRecommendation['likelihood']) ?? 'medium',
      preferredArea: tactics.where[lang],
      technique: tactics.when[lang],
      baitOrLure: tactics.bites[lang],
    });
  }

  return { text: `${H.fish[lang]}\n${lines.join('\n')}`, recommendations };
}

function buildTipsSection(habitat: HabitatTactics | undefined, lang: Lang, extra: string[] = []): string | undefined {
  const tips = [...(habitat?.extraTips.map((t) => t[lang]) ?? []), ...extra].filter(Boolean);
  if (tips.length === 0) return undefined;
  return `${H.tips[lang]}\n${tips.map((t) => `• ${t}`).join('\n')}`;
}

function buildSourcesSection(
  lang: Lang,
  sources: FishingSource[],
  options: { usedSpotDb: boolean; usedConditions: boolean },
): string {
  const isHe = lang === 'he';
  const items: string[] = [];
  if (options.usedSpotDb) {
    items.push(isHe ? '• מסד נתוני חופי הדיג של האפליקציה (מיקומים מאומתים)' : '• App fishing-spot database (verified locations)');
  }
  items.push(isHe ? '• ידע עונתי והתנהגות דגים בים התיכון הישראלי' : '• Seasonal fish-behavior knowledge for the Israeli Mediterranean');
  if (options.usedConditions) {
    items.push(isHe ? '• נתוני ים ומזג אוויר חיים (Open-Meteo)' : '• Live sea and weather data (Open-Meteo)');
  }
  const domains = [...new Set(sources.map((s) => s.domain))].slice(0, 4);
  for (const domain of domains) {
    items.push(`• ${domain}`);
  }
  return `${H.sources[lang]}\n${items.join('\n')}`;
}

function buildFollowUpQuestions(
  lang: Lang,
  missing: { location: boolean; method: boolean; target: boolean },
): string[] {
  const isHe = lang === 'he';
  const questions: string[] = [];
  if (missing.method) {
    questions.push(isHe ? 'אתם דגים מהחוף, מסלעים, ממזח או מסירה?' : 'Are you fishing from shore, rocks, a pier, or a boat?');
  }
  if (missing.location) {
    questions.push(isHe ? 'באיזה חוף או עיר אתם דגים?' : 'Which beach or city are you fishing at?');
  }
  if (missing.target) {
    questions.push(isHe ? 'יש דג מסוים שאתם מכוונים אליו?' : 'Are you targeting a specific fish?');
  }
  return questions.slice(0, 3);
}

// ---------------------------------------------------------------------------
// Main answer builder
// ---------------------------------------------------------------------------

export interface LocalAnswerResult {
  directAnswer: string;
  species?: FishRecommendation[];
  equipment?: EquipmentRecommendation[];
  safetyWarnings?: string[];
  followUpQuestions?: string[];
  usedLocalDb: boolean;
  /** True when the answer is grounded in the knowledge base or verified spot data
   *  (as opposed to the generic fallback that only asks follow-up questions). */
  grounded: boolean;
}

export function buildLocalAnswer(
  question: string,
  language: Lang,
  understanding: QueryUnderstanding,
  sources: FishingSource[],
  locationHint?: string,
): LocalAnswerResult {
  const isHe = language === 'he';
  const spot = findSpotFromQuestion(question, locationHint ?? understanding.locationName);
  const profile = spot ? getBeachProfile(spot.id) : undefined;
  const spotName = spot
    ? ((isHe ? spot.localizedNames?.he : undefined) ?? understanding.locationName ?? spot.localizedNames?.[language] ?? spot.name)
    : (understanding.locationName ?? understanding.city);

  const fullText = `${question} ${locationHint ?? ''}`;

  // The knowledge base covers the Israeli coast. For foreign locations, be
  // honest instead of applying local expertise where it does not belong —
  // web sources (when available) drive those answers.
  if (!spot && mentionsForeignLocation(fullText)) {
    const honest = isHe
      ? 'תשובה כנה: מסד הידע המקומי שלי מכסה את חופי ישראל, ואין לי מידע מאומת ממקור ראשון על האזור ששאלתם עליו. עקרונות שעובדים כמעט בכל מקום: דוגו סביב זריחה ושקיעה, שאלו בחנות דיג מקומית איזה פיתיון עובד עכשיו, והתאימו את הציוד לסוג החוף (חכת סרף ארוכה לחוף פתוח, חכה קצרה וקשיחה ליד סלעים). בדקו את תקנות הדיג המקומיות לפני שיוצאים.'
      : 'Honest answer: my verified local database covers the Israeli coast, so I do not have first-hand knowledge of that area. Principles that travel well: fish around sunrise and sunset, ask a local tackle shop what bait is working now, and match the gear to the terrain (long surf rod for open beaches, shorter stiff rod near rocks). Check the local fishing regulations before you go.';

    const foreignSections = [honest];
    for (const src of sources.slice(0, 3)) {
      const relevant = extractRelevantSentences(src.snippet, question, 1);
      if (relevant.length > 0) {
        foreignSections.push(
          isHe ? `ממקורות רשת:\n${relevant.join('\n')}` : `From web sources:\n${relevant.join('\n')}`,
        );
      }
    }
    foreignSections.push(buildSourcesSection(language, sources, { usedSpotDb: false, usedConditions: false }));

    return {
      directAnswer: foreignSections.join('\n\n'),
      usedLocalDb: false,
      grounded: false,
    };
  }

  const habitatKey = spot ? shoreTypeToHabitat(spot.shoreType) : detectHabitat(fullText);
  const habitat = habitatKey ? HABITAT_TACTICS[habitatKey] : undefined;

  // Technique knowledge base — answers rig/knot/skill/lure/bait/location questions
  // with step-by-step expert content (before generic habitat fallback).
  const asksConditionsEarly =
    /weather|wind|wave|good for fishing|can i fish|worth (going|fishing)|right now|today|tonight|tomorrow|מזג|רוח|גל|מחר|היום|הלילה|עכשיו|כדאי (לצאת|לדוג)|אפשר לדוג|טוב לדיג/i.test(question);
  const isEducationalConditionsQuestion = /how do|how does|why do|what.*affect|איך|למה|משפיע/i.test(question);
  const isLiveConditionsQuestion =
    asksConditionsEarly &&
    !isEducationalConditionsQuestion &&
    (/today|tonight|now|היום|עכשיו|הלילה|right now/i.test(question) || understanding.needsWeather);

  const asksFishWithBaitList = /what fish.*(with|using)|which fish.*(with|using)|catch.*with|אילו דגים.*(עם|ב)|מה אפשר.*(עם|ב)/i.test(question);

  if (!isLiveConditionsQuestion && !asksFishWithBaitList) {
    const techniqueResult = tryBuildTechniqueAnswer(question, language, habitatKey, sources);
    if (techniqueResult) {
      const extraSafety = habitat?.safety.map((s) => s[language]) ?? [];
      return {
        directAnswer: techniqueResult.directAnswer,
        safetyWarnings: [...(techniqueResult.safetyWarnings ?? []), ...extraSafety],
        usedLocalDb: true,
        grounded: true,
      };
    }

    const speciesCatchResult = tryBuildSpeciesCatchAnswer(question, language);
    if (speciesCatchResult) {
      return {
        directAnswer: speciesCatchResult.directAnswer,
        usedLocalDb: true,
        grounded: true,
      };
    }
  }

  const bait = detectBait(fullText);
  const target = detectTargetSpecies(fullText);

  // Intent detection — each question type produces a different answer.
  const asksTerrain = /rocky or sandy|sandy or rocky|terrain|bottom type|seabed|is .*(rocky|sandy)|חולי או סלעי|סלעי או חולי|קרקעית|האם .*(חולי|סלעי)/i.test(question);
  const asksSpecies = /catch|species|fish can|target|what.*bite|לתפוס|ללכוד|מינים|מה אפשר|איזה דג|מה כדאי לדוג|מה נתפס/i.test(question);
  const asksEquipment = /equipment|rod|reel|line|hook|sinker|setup|gear|bring|take|pack|what do i need|ציוד|חכה|סליל|סטאפ|להביא|לקחת|מה צריך|איזה ציוד/i.test(question);
  const asksBait = /bait|lure|פיתיון|דמוי/i.test(question) || !!bait;
  const asksRegulations = /regulat|license|licence|legal|תקנ|רישיון|חוק/i.test(question);
  const asksConditions = /weather|wind|wave|good for fishing|can i fish|worth (going|fishing)|right now|today|tonight|tomorrow|מזג|רוח|גל|מחר|היום|הלילה|הערב|עכשיו|כדאי (לצאת|לדוג)|אפשר לדוג|טוב לדיג|מה דעתך|מה אתה חושב|what do you think|is it good/i.test(question);

  const sections: string[] = [];
  let species: FishRecommendation[] | undefined;
  let equipment: EquipmentRecommendation[] | undefined;
  const safetyWarnings: string[] = [];
  let followUpQuestions: string[] | undefined;
  let usedLocalDb = false;
  let usedSpotDb = false;

  // Species keys available for the "Fish you can catch" section.
  const spotSpeciesKeys: Array<{ key: string; likelihood?: string }> =
    profile?.speciesIds
      .map((s) => ({ key: SPECIES_ID_TO_TACTICS[s.id], likelihood: s.likelihood as string }))
      .filter((s) => !!s.key) ?? [];
  const habitatSpeciesKeys: Array<{ key: string; likelihood?: string }> =
    habitat?.typicalFish.map((key) => ({ key })) ?? [];

  // ---------------------------------------------------------------------
  // 1. Direct answer — tailored to the exact question type.
  // ---------------------------------------------------------------------

  if (asksTerrain && spot) {
    usedLocalDb = true;
    usedSpotDb = true;
    const shore = shoreTypeLabel(spot.shoreType, language);
    const seabed = shoreTypeLabel(spot.seabedType === 'sand' ? 'sandy' : spot.seabedType, language);
    const structure = habitat ? ` ${habitat.structure[language]}` : '';
    sections.push(
      isHe
        ? `תשובה ישירה: ${spotName} הוא חוף ${shore} עם קרקעית ${seabed}.${structure}`
        : `Direct answer: ${spotName} is a ${shore} shore with a ${seabed} seabed.${structure}`,
    );
  } else if (bait && (asksSpecies || asksBait) && !asksEquipment) {
    // Bait-centric question: "What fish can I catch with squid?"
    usedLocalDb = true;
    const catchNames = bait.catches
      .map((c) => SPECIES_TACTICS[c.speciesKey]?.name[language])
      .filter(Boolean)
      .join(', ');
    sections.push(
      isHe
        ? `תשובה ישירה: עם ${bait.name.he} אפשר לכוון באופן ריאלי ל: ${catchNames}. ${bait.whenBest.he}`
        : `Direct answer: With ${bait.name.en.toLowerCase()} you can realistically target: ${catchNames}. ${bait.whenBest.en}`,
    );
    sections.push(
      isHe
        ? `איך לעגן את הפיתיון:\n${bait.howToHook.he}\n\nהחסקה המומלצת:\n${bait.bestRig.he}`
        : `How to hook it:\n${bait.howToHook.en}\n\nBest rig:\n${bait.bestRig.en}`,
    );
    const baitFish = bait.catches.map((c) => {
      const t = SPECIES_TACTICS[c.speciesKey];
      return t ? `• ${t.name[language]} — ${c.note[language]}` : '';
    }).filter(Boolean);
    sections.push(`${H.fish[language]}\n${baitFish.join('\n')}`);
    species = bait.catches.reduce<FishRecommendation[]>((acc, c) => {
      const t = SPECIES_TACTICS[c.speciesKey];
      if (t) {
        acc.push({
          commonName: t.name[language],
          likelihood: 'medium',
          preferredArea: t.where[language],
          baitOrLure: c.note[language],
        });
      }
      return acc;
    }, []);
    const baitTips = buildTipsSection(habitat, language, bait.tips.map((t) => t[language]));
    if (baitTips) sections.push(baitTips);
  } else if (asksConditions) {
    usedLocalDb = true;
    usedSpotDb = !!spot;
    if (spot && isLiveConditionsQuestion) {
      sections.push(
        isHe
          ? `תשובה ישירה: תנאים חיים ל${spotName} — גלים, רוח והתאמה לדיג (Open-Meteo).`
          : `Direct answer: Live conditions for ${spotName} — waves, wind, and fishing suitability (Open-Meteo).`,
      );
      if (habitat) sections.push(buildTimeSection(habitat, language));
    } else {
      const c = DEMO_CONDITIONS;
      const conditionsSummary = c.localizedSummary?.[language] ?? c.summary;
      const spotIntro = spot
        ? isHe
          ? `לגבי דיג ב${spotName} עכשיו: `
          : `About fishing at ${spotName} right now: `
        : '';
      sections.push(
        isHe
          ? `${spotIntro}תנאים נוכחיים (הדגמה): ${conditionsSummary} רוח ${c.windSpeed} קמ"ש מ${c.windDirection}, גלים ~${c.waveHeight}מ'. בדקו את כרטיס תנאי הים באפליקציה לנתונים חיים.`
          : `${spotIntro}Current conditions (demo): ${conditionsSummary} Wind ${c.windSpeed} km/h ${c.windDirection}, waves ~${c.waveHeight}m. Check the live sea-conditions card in the app for real-time data.`,
      );
      if (habitat) sections.push(buildTimeSection(habitat, language));
    }
  } else if (target && (asksSpecies || /how to|how do i|איך/i.test(question))) {
    // Species-target question: "How do I catch bream?"
    usedLocalDb = true;
    sections.push(
      isHe
        ? `תשובה ישירה: ${target.name.he} — ${target.bites.he}. איפה: ${target.where.he}. מתי: ${target.when.he}.${target.note ? ` ${target.note.he}` : ''}`
        : `Direct answer: ${target.name.en} — best baits: ${target.bites.en}. Where: ${target.where.en}. When: ${target.when.en}.${target.note ? ` ${target.note.en}` : ''}`,
    );
  } else if (asksEquipment && habitat) {
    usedLocalDb = true;
    usedSpotDb = !!spot;
    const where = spotName ?? (isHe ? `חוף ${shoreTypeLabel(habitatKey!, 'he')}` : `a ${shoreTypeLabel(habitatKey!, 'en')} beach`);
    const assumedTerrain = !spot && isGenericBeachMention(fullText);
    const assumptionNote = assumedTerrain
      ? isHe
        ? ' רוב חופי ישראל חוליים, אז ההמלצה מותאמת לחוף חולי — אם אתם דגים מסלעים או ממזח, ספרו לי ואתאים.'
        : ' Most Israeli beaches are sandy, so this is tuned for sandy shores — if you fish from rocks or a pier, tell me and I will adjust.'
      : '';
    sections.push(
      isHe
        ? `תשובה ישירה: הנה הסטאפ המדויק ל${where}, כולל למה כל פריט — הפירוט למטה.${assumptionNote}`
        : `Direct answer: Here is the exact setup for ${where}, and why each piece matters — details below.${assumptionNote}`,
    );
  } else if (asksSpecies && (spot || habitat)) {
    usedLocalDb = true;
    usedSpotDb = !!spot;
    const keys = spotSpeciesKeys.length > 0 ? spotSpeciesKeys : habitatSpeciesKeys;
    const names = keys.map((k) => SPECIES_TACTICS[k.key]?.name[language]).filter(Boolean).slice(0, 4).join(', ');
    sections.push(
      isHe
        ? `תשובה ישירה: ב${spotName ?? 'סוג החוף הזה'} הדגים הריאליים הם ${names}. לכל אחד פיתיון וטכניקה משלו — הפירוט למטה.`
        : `Direct answer: At ${spotName ?? 'this type of shore'}, the realistic targets are ${names}. Each has its own bait and technique — details below.`,
    );
  } else if (spot && profile) {
    // Full spot overview: "Tell me about X beach fishing"
    usedLocalDb = true;
    usedSpotDb = true;
    const shore = shoreTypeLabel(spot.shoreType, language);
    sections.push(
      isHe
        ? `תשובה ישירה: ${spotName} — חוף ${shore}. ${profile.description.he}${habitat ? ` ${habitat.structure.he}` : ''}`
        : `Direct answer: ${spotName} — ${shore} shore. ${profile.description.en}${habitat ? ` ${habitat.structure.en}` : ''}`,
    );
  } else if (habitat) {
    // Habitat-only question: "What bait should I use from a rocky beach?"
    usedLocalDb = true;
    sections.push(
      isHe
        ? `תשובה ישירה: ${habitat.structure.he}`
        : `Direct answer: ${habitat.structure.en}`,
    );
  }

  // ---------------------------------------------------------------------
  // 2. Standard expert sections (setup / technique / time / fish / tips).
  //    Added whenever we have a habitat context and the question benefits.
  // ---------------------------------------------------------------------

  const isBaitCentric = !!(bait && (asksSpecies || asksBait) && !asksEquipment);
  if (habitat && !isBaitCentric && sections.length > 0) {
    const setup = buildSetupSection(habitat, language, profile?.equipmentOverride);
    sections.push(setup.text);
    equipment = [setup.equipment];

    sections.push(buildTechniqueSection(habitat, language, profile?.equipmentOverride?.castingTip?.[language]));

    if (!asksConditions) {
      sections.push(buildTimeSection(habitat, language));
    }

    const keys = spotSpeciesKeys.length > 0 ? spotSpeciesKeys : habitatSpeciesKeys;
    if (keys.length > 0) {
      const fish = buildFishSection(keys, language);
      sections.push(fish.text);
      species = fish.recommendations;
    }

    const tips = buildTipsSection(habitat, language, profile ? [profile.localTips[language]] : []);
    if (tips) sections.push(tips);

    for (const warning of habitat.safety) {
      safetyWarnings.push(warning[language]);
    }
    if (profile?.hazardNotes) {
      safetyWarnings.push(profile.hazardNotes[language]);
    }
  }

  // ---------------------------------------------------------------------
  // 3. Regulations — always point to the official source.
  // ---------------------------------------------------------------------

  if (asksRegulations) {
    usedLocalDb = true;
    sections.push(
      isHe
        ? 'תקנות דיג בישראל: נדרש רישיון דיג תקף. קיימות מגבלות אורך מינימום ומכסה לפי מין, ומינים מוגנים (כמו לוקוס/דקר) אסורים ללכידה. המקור הרשמי והמעודכן: רשות הטבע והגנים — parks.org.il.'
        : 'Israel fishing regulations: a valid fishing license is required. Minimum-size limits and quotas apply per species, and protected species (like dusky grouper) must be released. The official, current source: Israel Nature and Parks Authority — parks.org.il.',
    );
  }

  // ---------------------------------------------------------------------
  // 4. Follow-up questions when we could not tailor the answer.
  // ---------------------------------------------------------------------

  const grounded = sections.length > 0;

  if (sections.length === 0) {
    usedLocalDb = true;
    followUpQuestions = buildFollowUpQuestions(language, {
      location: !spot && !understanding.locationName,
      method: !habitat,
      target: !target && !bait,
    });

    const universal = asksEquipment
      ? isHe
        ? 'בינתיים, הבחירה הבטוחה ביותר לרוב הדיג בישראל: חכת סרף ורסטילית 3.6–4.2 מ\' (משקל הטלה 80–150 גרם) עם סליל ספינינג 5000–6000 — מתאימה לחוף חולי, מעורב ואפילו מזח.'
        : 'Meanwhile, the safest all-round choice for most fishing in Israel: a versatile 3.6–4.2m surf rod (80–150g casting weight) with a 5000–6000 spinning reel — it covers sandy beaches, mixed shores and even piers.'
      : isHe
        ? 'בינתיים, עצה שעובדת כמעט תמיד בים התיכון: שרימפס טרי על חסקת ריצה קלה תופס כמעט כל דג, והשעות החזקות הן סביב הזריחה והשקיעה.'
        : 'Meanwhile, advice that almost always works on the Mediterranean: fresh shrimp on a light running rig catches nearly everything, and the strongest hours are around sunrise and sunset.';
    const seasonal = getSeasonalNotes(new Date(), language);
    const beaches = listKnownBeaches(language).slice(0, 6).join(', ');

    sections.push(
      isHe
        ? `${universal}\n\n${seasonal}\n\n${H.followUp.he}\n${followUpQuestions.map((q) => `• ${q}`).join('\n')}\n\nחופים שאני מכיר לעומק: ${beaches} ועוד.`
        : `${universal}\n\n${seasonal}\n\n${H.followUp.en}\n${followUpQuestions.map((q) => `• ${q}`).join('\n')}\n\nBeaches I know in depth: ${beaches}, and more.`,
    );
  } else if (!spot && !understanding.locationName && (asksEquipment || asksSpecies || asksBait) && !isBaitCentric) {
    // We answered from habitat knowledge, but a location would sharpen it.
    followUpQuestions = buildFollowUpQuestions(language, { location: true, method: false, target: false });
    sections.push(
      isHe
        ? `${H.followUp.he}\n${followUpQuestions.map((q) => `• ${q}`).join('\n')}`
        : `${H.followUp.en}\n${followUpQuestions.map((q) => `• ${q}`).join('\n')}`,
    );
  }

  // ---------------------------------------------------------------------
  // 5. Web supplement + sources checked.
  // ---------------------------------------------------------------------

  const webExtra: string[] = [];
  for (const src of sources.slice(0, 3)) {
    const relevant = extractRelevantSentences(src.snippet, question, 1);
    for (const sent of relevant) {
      if (!sections.some((s) => s.includes(sent.slice(0, 40)))) {
        webExtra.push(sent);
      }
    }
  }
  if (webExtra.length > 0) {
    sections.push(
      isHe ? `ממקורות נוספים:\n${webExtra.join('\n')}` : `From additional sources:\n${webExtra.join('\n')}`,
    );
  }

  sections.push(buildSourcesSection(language, sources, { usedSpotDb, usedConditions: asksConditions }));

  return {
    directAnswer: sections.join('\n\n'),
    species,
    equipment,
    safetyWarnings,
    followUpQuestions,
    usedLocalDb,
    grounded,
  };
}

// ---------------------------------------------------------------------------
// Enrichment entry point used by the orchestrator
// ---------------------------------------------------------------------------

export function enrichAnswerWithLocalKnowledge(
  answer: FishingAnswer,
  question: string,
  understanding: QueryUnderstanding,
  locationHint?: string,
): FishingAnswer {
  const norm = understanding.termNormalization;
  const normalizedQuestion = norm?.normalizedQuestion ?? question;

  if (norm?.shouldClarify) {
    const guess = norm.matches[0]?.canonical;
    const clarification = buildTermClarificationQuestion(answer.language, guess);
    return {
      ...answer,
      directAnswer: clarification,
      summary: clarification,
      quickAnswer: clarification,
      confidence: 'limited',
      confidenceReason:
        answer.language === 'he'
          ? 'מונח לא ברור — נדרשת הבהרה קצרה.'
          : 'Unclear fishing term — short clarification needed.',
    };
  }

  const local = buildLocalAnswer(normalizedQuestion, answer.language, understanding, answer.sources, locationHint);

  if (local.directAnswer && (local.usedLocalDb || answer.sources.length === 0)) {
    let directAnswer = local.directAnswer;
    const assumptionPrefix = norm?.assumptionPrefix?.[answer.language === 'he' ? 'he' : 'en'];
    if (assumptionPrefix && !directAnswer.startsWith(assumptionPrefix.trim())) {
      directAnswer = `${assumptionPrefix}${directAnswer}`;
    }

    return {
      ...answer,
      directAnswer,
      summary: directAnswer,
      quickAnswer: directAnswer,
      species: local.species ?? answer.species,
      equipment: local.equipment ?? answer.equipment,
      safetyWarnings: [...(local.safetyWarnings ?? []), ...(answer.safetyWarnings ?? [])],
      confidence: local.grounded || answer.sources.length > 0 ? 'medium' : 'limited',
      confidenceReason: local.grounded
        ? answer.language === 'he'
          ? 'תשובה מבוססת ידע דיג מקצועי + מסד נתונים מקומי + מקורות רשת.'
          : 'Answer based on expert fishing knowledge + local database + web sources.'
        : answer.language === 'he'
          ? 'חסר מידע מדויק לשאלה הזו — נדרשים פרטים נוספים או מקורות חיים.'
          : 'Precise information for this question is missing — more details or live sources are needed.',
    };
  }

  return answer;
}
