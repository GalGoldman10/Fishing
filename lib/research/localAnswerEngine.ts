/**
 * Build direct, practical fishing answers from local database + filtered web snippets.
 * Fixes the problem of dumping irrelevant Wikipedia text.
 */

import { getDemoSpotDetails, DEMO_SPECIES, DEMO_CONDITIONS } from '@/lib/mock/demoData';
import { findSpotFromQuestion, shoreTypeLabel, listKnownBeaches } from '@/lib/research/spotMatcher';
import { getBeachProfile } from '@/lib/mock/beachProfiles';
import type { QueryUnderstanding } from '@/lib/research/queryUnderstanding';
import type {
  EquipmentRecommendation,
  FishRecommendation,
  FishingAnswer,
  FishingSource,
} from '@/types/research';

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

export interface LocalAnswerResult {
  directAnswer: string;
  species?: FishRecommendation[];
  equipment?: EquipmentRecommendation[];
  safetyWarnings?: string[];
  usedLocalDb: boolean;
}

export function buildLocalAnswer(
  question: string,
  language: 'en' | 'he',
  understanding: QueryUnderstanding,
  sources: FishingSource[],
  locationHint?: string,
): LocalAnswerResult {
  const isHe = language === 'he';
  const spot = findSpotFromQuestion(question, locationHint ?? understanding.locationName);
  const profile = spot ? getBeachProfile(spot.id) : undefined;
  const spotName = spot
    ? (spot.localizedNames?.[language] ?? spot.name)
    : (understanding.locationName ?? understanding.city);

  const q = question.toLowerCase();
  const sections: string[] = [];
  let species: FishRecommendation[] | undefined;
  let equipment: EquipmentRecommendation[] | undefined;
  const safetyWarnings: string[] = [];
  let usedLocalDb = false;

  // Intent detection — each question type produces a different answer.
  const asksTerrain = /rocky|sandy|sand|rock|terrain|bottom|seabed|חולי|סלע|קרקעית|שטח/i.test(question);
  const asksSpecies = /catch|species|fish can|target|what.*bite|לכוד|מינים|מה אפשר|איזה דג|מה כדאי לדוג|מה נתפס/i.test(question);
  const asksEquipment = /equipment|rod|reel|line|hook|sinker|bait|setup|gear|bring|take|pack|what do i need|ציוד|חכה|סליל|פיתיון|סטאפ|להביא|לקחת|מה צריך|איזה ציוד/i.test(question);
  const asksRegulations = /regulat|license|licence|legal|תקנ|רישיון|חוק/i.test(question);
  const asksConditions = /weather|wind|wave|good for fishing|worth (going|fishing)|right now|today|tonight|tomorrow|מזג|רוח|גל|מחר|היום|הלילה|הערב|עכשיו|כדאי (לצאת|לדוג)|טוב לדיג|מה דעתך|מה אתה חושב|what do you think|is it good/i.test(question);

  // --- TERRAIN / SHORE TYPE ---
  if (asksTerrain) {
    if (spot) {
      usedLocalDb = true;
      const shore = shoreTypeLabel(spot.shoreType, language);
      const seabed = shoreTypeLabel(spot.seabedType === 'sand' ? 'sandy' : spot.seabedType, language);
      sections.push(
        isHe
          ? `תשובה ישירה: ${spotName} הוא חוף ${shore} עם קרקעית ${seabed}. רמת קושי: ${spot.difficultyLevel === 'easy' ? 'קלה (מתאים למתחילים)' : spot.difficultyLevel}.`
          : `Quick answer: ${spotName} is a ${shore} shore with a ${seabed} seabed. Difficulty: ${spot.difficultyLevel}${spot.difficultyLevel === 'easy' ? ' (beginner-friendly)' : ''}.`,
      );
      if (spot.shoreType === 'rocky' || spot.shoreType === 'cliff') {
        safetyWarnings.push(
          isHe ? 'סלעים חלקים כשהם רטובים — נעליים מונעות החלקה חובה.' : 'Rocks are slippery when wet — non-slip shoes essential.',
        );
      }
    } else if (!spotName) {
      const beaches = listKnownBeaches(language).slice(0, 8).join(language === 'he' ? ', ' : ', ');
      sections.push(
        isHe
          ? `תשובה: ציין שם חוף או עיר. חופים במערכת: ${beaches} ועוד.`
          : `Quick answer: Please name a specific beach. Beaches in our database include: ${beaches}, and more.`,
      );
    }
  }

  // Beach overview only for questions with no other detected intent
  const hasSpecificIntent = asksSpecies || asksEquipment || asksRegulations || asksConditions;
  if (spot && profile && sections.length === 0 && !hasSpecificIntent) {
    usedLocalDb = true;
    const desc = profile.description[language];
    const tip = profile.localTips[language];
    const shore = shoreTypeLabel(spot.shoreType, language);
    sections.push(
      isHe
        ? `${spotName} — חוף ${shore}.\n\n${desc}\n\nטיפ מקומי: ${tip}`
        : `${spotName} — ${shore} shore.\n\n${desc}\n\nLocal tip: ${tip}`,
    );
  }

  // --- SPECIES / WHAT TO CATCH ---
  if (asksSpecies) {
    if (spot) {
      usedLocalDb = true;
      const details = getDemoSpotDetails(spot.id);
      if (details) {
        species = details.species.map((s) => ({
          commonName: s.localizedNames?.[language] ?? s.commonName,
          localName: s.localizedNames?.he,
          scientificName: s.scientificName,
          likelihood: s.likelihood,
          season: isHe ? 'מרץ–אוקטובר (עונה חמה)' : 'March–October (warm season)',
          preferredArea: spot.shoreType === 'rocky' ? (isHe ? 'ליד סלעים' : 'Near rocks') : (isHe ? 'אזור חולי רדוד' : 'Shallow sandy zone'),
          technique: 'surf casting / bottom fishing',
          baitOrLure: isHe ? 'סרדין, דיונון' : 'sardine, squid',
        }));

        const list = species
          .map((s) => `• ${s.commonName} (${s.likelihood}) — ${s.baitOrLure}`)
          .join('\n');

        sections.push(
          isHe
            ? `מה אפשר ללכוד ב${spotName}:\n${list}\n\nטיפ: ${profile?.localTips.he ?? ''}`
            : `Fish you may catch at ${spotName}:\n${list}\n\nTip: ${profile?.localTips.en ?? ''}`,
        );
      }
    } else {
      const defaultSpecies = DEMO_SPECIES.slice(0, 4);
      species = defaultSpecies.map((s) => ({
        commonName: s.localizedNames?.[language] ?? s.commonName,
        scientificName: s.scientificName,
        likelihood: 'medium' as const,
        season: isHe ? 'אביב–סתיו' : 'Spring–Autumn',
        baitOrLure: isHe ? 'סרדין, דיונון, שרימפס' : 'sardine, squid, shrimp',
      }));
      sections.push(
        isHe
          ? `מינים נפוצים בים התיכון (ישראל):\n${species.map((s) => `• ${s.commonName}`).join('\n')}\n\nציין שם חוף לקבלת מידע מדויק יותר.`
          : `Common Mediterranean species (Israel):\n${species.map((s) => `• ${s.commonName}`).join('\n')}\n\nName a specific beach for location-targeted info.`,
      );
      usedLocalDb = true;
    }
  }

  // --- EQUIPMENT ---
  if (asksEquipment) {
    if (spot) {
      usedLocalDb = true;
      const details = getDemoSpotDetails(spot.id);
      const eq = details?.equipment[0];
      if (eq?.rodSpecification && eq.reelSpecification) {
        const rod = eq.rodSpecification;
        const reel = eq.reelSpecification;
        const line = eq.lineSpecification;
        const leader = eq.leaderSpecification;
        const tackle = eq.terminalTackle;
        const baits = eq.baitAndLures?.baits as string[] | undefined;

        const eqRec: EquipmentRecommendation = {
          rod: `${rod.type} ${rod.length}, casting ${rod.castingWeight}`,
          reel: `${reel.type} size ${reel.size}`,
          mainLine: String(line?.main ?? ''),
          leader: leader ? `${leader.material} ${leader.strength}` : undefined,
          hookOrLure: tackle?.hooks ? String(tackle.hooks) : undefined,
          sinker: tackle?.weights ? String(tackle.weights) : undefined,
          bait: baits?.join(', '),
          castingMethod: spot.shoreType === 'sandy' ? 'long cast beyond breakers' : 'short cast near structure',
        };
        equipment = [eqRec];

        sections.push(
          isHe
            ? `ציוד מומלץ ל${spotName}:\n• חכה: ${eqRec.rod}\n• סליל: ${eqRec.reel}\n• חוט: ${eqRec.mainLine}\n• מנהיג: ${eqRec.leader}\n• קרסים: ${eqRec.hookOrLure}\n• משקולות: ${eqRec.sinker}\n• פיתיון: ${eqRec.bait}${profile?.equipmentOverride?.castingTip ? `\n• הטלה: ${profile.equipmentOverride.castingTip.he}` : ''}`
            : `Recommended setup for ${spotName}:\n• Rod: ${eqRec.rod}\n• Reel: ${eqRec.reel}\n• Main line: ${eqRec.mainLine}\n• Leader: ${eqRec.leader}\n• Hooks: ${eqRec.hookOrLure}\n• Sinkers: ${eqRec.sinker}\n• Bait: ${eqRec.bait}${profile?.equipmentOverride?.castingTip ? `\n• Casting: ${profile.equipmentOverride.castingTip.en}` : ''}`,
        );
      }
    } else {
      sections.push(
        isHe
          ? 'ציוד לדיג חוף בינוני (ים תיכון):\n• חכת סרף 3.6–4.2 מ\'\n• סליל ספינינג 5000–6000\n• חוט 0.30–0.35 מ"מ\n• משקולות 120–200 גרם\n• פיתיון: סרדין או דיונון'
          : 'General Mediterranean shore setup:\n• Surf rod 3.6–4.2m\n• Spinning reel 5000–6000\n• Line 0.30–0.35mm\n• Sinkers 120–200g\n• Bait: sardine or squid',
      );
      usedLocalDb = true;
    }
  }

  // --- REGULATIONS ---
  if (asksRegulations) {
    sections.push(
      isHe
        ? 'תקנות דיג בישראל: נדרש רישיון דיג תקף. יש מגבלות גודל ומכסה לפי מין. מינים מוגנים אסורים ללכידה. אשר תמיד עם רשות הטבע והגנים לפני דיג.'
        : 'Israel fishing regulations: A valid fishing license is required. Size limits and catch quotas apply per species. Protected species must not be kept. Always confirm with the Israel Nature and Parks Authority before fishing.',
    );
    usedLocalDb = true;
  }

  // --- WEATHER / CONDITIONS / "IS IT WORTH GOING NOW" ---
  if (asksConditions) {
    const c = DEMO_CONDITIONS;
    const conditionsSummary = c.localizedSummary?.[language] ?? c.summary;
    const spotIntro = spot
      ? isHe
        ? `לגבי דיג ב${spotName} עכשיו: `
        : `About fishing at ${spotName} right now: `
      : '';
    sections.push(
      isHe
        ? `${spotIntro}תנאים נוכחיים (הדגמה): ${conditionsSummary} רוח ${c.windSpeed} קמ"ש מ${c.windDirection}, גלים ~${c.waveHeight}מ'. התאמה: ${c.suitability === 'good' ? 'טובה' : 'בינונית'}. בדוק תחזית עדכנית לפני יציאה.`
        : `${spotIntro}Current conditions (demo): ${conditionsSummary} Wind ${c.windSpeed} km/h ${c.windDirection}, waves ~${c.waveHeight}m. Suitability: ${c.suitability}. Check live forecast before going.`,
    );
    if (spot && profile) {
      const tip = profile.localTips[language];
      sections.push(isHe ? `טיפ מקומי ל${spotName}: ${tip}` : `Local tip for ${spotName}: ${tip}`);
    }
    usedLocalDb = true;
  }

  // --- BEGINNER / GENERAL LOCATION ---
  if (sections.length === 0 && spot && profile) {
    usedLocalDb = true;
    const details = getDemoSpotDetails(spot.id);
    const shore = shoreTypeLabel(spot.shoreType, language);
    const speciesList = details?.species
      .slice(0, 3)
      .map((s) => s.localizedNames?.[language] ?? s.commonName)
      .join(', ');

    sections.push(
      isHe
        ? `${spotName} — חוף ${shore}, קרקעית ${spot.seabedType}.\n${profile.description.he}\nמינים עיקריים: ${speciesList}.\n${profile.localTips.he}`
        : `${spotName} — ${shore} shore, ${spot.seabedType} seabed.\n${profile.description.en}\nMain species: ${speciesList}.\n${profile.localTips.en}`,
    );
  } else if (sections.length === 0 && spot) {
    usedLocalDb = true;
    const details = getDemoSpotDetails(spot.id);
    const shore = shoreTypeLabel(spot.shoreType, language);
    const speciesList = details?.species
      .slice(0, 3)
      .map((s) => s.localizedNames?.[language] ?? s.commonName)
      .join(', ');

    sections.push(
      isHe
        ? `${spotName} — חוף ${shore}, קרקעית ${spot.seabedType}. מינים עיקריים: ${speciesList}. שיטות: הטלה מהחוף, דיג תחתית. ${spot.difficultyLevel === 'easy' ? 'מתאים למתחילים.' : 'דורש ניסיון.'}`
        : `${spotName} — ${shore} shore, ${spot.seabedType} seabed. Main species: ${speciesList}. Methods: surf casting, bottom fishing. ${spot.difficultyLevel === 'easy' ? 'Beginner-friendly.' : 'Requires experience.'}`,
    );
  }

  // Add filtered web supplement (only relevant sentences)
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
      isHe
        ? `ממקורות נוספים:\n${webExtra.join('\n')}`
        : `From additional sources:\n${webExtra.join('\n')}`,
    );
  }

  if (sections.length === 0) {
    const sample = listKnownBeaches(language).slice(0, 6).join(', ');
    return {
      directAnswer: isHe
        ? `לא זיהיתי את החוף בשאלה. נסה לציין שם מדויק, למשל:\n• חוף פלמחים — מה אפשר ללכוד?\n• האם חוף גורדון חולי?\n• איזה ציוד לדיג בחיפה?\n\nחופים במערכת: ${sample} ועוד.`
        : `I could not identify the beach in your question. Try a specific name, for example:\n• What can I catch at Palmachim beach?\n• Is Gordon beach sandy or rocky?\n• What equipment for fishing in Haifa?\n\nBeaches in our database: ${sample}, and more.`,
      usedLocalDb: false,
    };
  }

  const disclaimer = isHe
    ? '\n\n⚠️ נתוני הדגמה + מקורות רשת — אשר במקום לפני דיג.'
    : '\n\n⚠️ Demo data + web sources — verify on site before fishing.';

  return {
    directAnswer: sections.join('\n\n') + disclaimer,
    species,
    equipment,
    safetyWarnings,
    usedLocalDb,
  };
}

export function enrichAnswerWithLocalKnowledge(
  answer: FishingAnswer,
  question: string,
  understanding: QueryUnderstanding,
  locationHint?: string,
): FishingAnswer {
  const local = buildLocalAnswer(question, answer.language, understanding, answer.sources, locationHint);

  if (local.directAnswer && (local.usedLocalDb || answer.sources.length === 0)) {
    return {
      ...answer,
      directAnswer: local.directAnswer,
      summary: local.directAnswer,
      quickAnswer: local.directAnswer,
      species: local.species ?? answer.species,
      equipment: local.equipment ?? answer.equipment,
      safetyWarnings: [...(local.safetyWarnings ?? []), ...(answer.safetyWarnings ?? [])],
      confidence: local.usedLocalDb ? (answer.sources.length >= 2 ? 'medium' : 'medium') : answer.confidence,
      confidenceReason: local.usedLocalDb
        ? answer.language === 'he'
          ? 'תשובה מבוססת מסד נתוני דיג + מקורות רשת.'
          : 'Answer based on fishing database + web sources.'
        : answer.confidenceReason,
    };
  }

  return answer;
}
