import type { FishVisualProfile } from '@/lib/fishRecognition/types';

/** Species-specific visual identification traits (Mediterranean / Israel). */
export const VISUAL_TRAIT_OVERRIDES: Record<string, Partial<FishVisualProfile>> = {
  'pf-001': {
    bodyShape: 'elongated cylindrical silver body',
    colorPatterns: ['silver', 'dark grey back', 'stripes on scales in adults'],
    finShape: 'forked tail, small pectoral fins',
    tailShape: 'forked',
    mouthShape: 'small subterminal mouth',
    visualFeatures: ['thick lips', 'schooling mullet', 'flat head in large specimens'],
    commonSizeCm: '15–50',
    identifyingSigns: {
      he: 'גוף מוארך וכסוף, ראש שטוח, שחייה בלהקות ליד החוף ושפכי נחלים.',
      en: 'Elongated silver body, flat head, often in schools near shore and river mouths.',
    },
  },
  'pf-024': {
    bodyShape: 'deep oval compressed body',
    colorPatterns: ['silver-grey', 'golden band between eyes on adults'],
    finShape: 'single dorsal fin with spines',
    tailShape: 'forked',
    mouthShape: 'small mouth with thick lips',
    visualFeatures: ['golden forehead stripe', 'deep body', 'gilthead spot between eyes'],
    commonSizeCm: '20–70',
    identifyingSigns: {
      he: 'גוף עמוק וכסוף, פס זהוב בין העיניים, שפתיים עבות.',
      en: 'Deep silver body, golden band between eyes, thick lips.',
    },
  },
  'pf-017': {
    bodyShape: 'elongated torpedo body',
    colorPatterns: ['blue-green back', 'silver sides', 'sharp teeth visible'],
    finShape: 'two dorsal fins, forked tail',
    tailShape: 'forked',
    mouthShape: 'large jaw with visible teeth',
    visualFeatures: ['aggressive predator', 'blue-green coloration', 'sharp teeth'],
    commonSizeCm: '30–80',
    identifyingSigns: {
      he: 'גוף טורפד, גב כחול-ירוק, שיניים בולטות, דג טורף מהיר.',
      en: 'Torpedo body, blue-green back, visible sharp teeth, fast predator.',
    },
  },
  'pf-018': {
    bodyShape: 'long slender body',
    colorPatterns: ['silver with dark vertical bars or spots', 'long snout'],
    finShape: 'small fins, forked tail',
    tailShape: 'forked',
    mouthShape: 'long jaw with fang-like teeth',
    visualFeatures: ['barracuda shape', 'long snout', 'visible teeth'],
    commonSizeCm: '40–120',
    identifyingSigns: {
      he: 'גוף ארוך ודק, לסת ארוכה עם שיניים, פסים או נקודות כהות.',
      en: 'Long slender body, long jaw with teeth, dark bars or spots.',
    },
  },
  'pf-013': {
    bodyShape: 'robust oval body',
    colorPatterns: ['brown-grey with dark spots', 'may show red-brown tones'],
    finShape: 'rounded dorsal and anal fins',
    tailShape: 'rounded',
    mouthShape: 'large mouth',
    visualFeatures: ['grouper shape', 'large spots', 'thick body'],
    commonSizeCm: '15–60',
    identifyingSigns: {
      he: 'גוף עבה ועגול, כתמים כהים, פה גדול — לוקוס/דקר.',
      en: 'Thick oval body, dark spots, large mouth — grouper.',
    },
  },
  'pf-012': {
    bodyShape: 'elongated with beard barbels',
    colorPatterns: ['red-pink with yellow stripes on fins', 'striped patterns'],
    finShape: 'two dorsal fins, chin barbels',
    tailShape: 'forked',
    mouthShape: 'small mouth with chin whiskers',
    visualFeatures: ['red mullet', 'chin barbels', 'yellow fin stripes'],
    commonSizeCm: '10–25',
    identifyingSigns: {
      he: 'זקן על הסנטר, גוף ורוד-אדום, פסים צהובים על הסנפירים.',
      en: 'Chin barbels, pink-red body, yellow stripes on fins.',
    },
  },
  'pf-006': {
    bodyShape: 'elongated powerful body',
    colorPatterns: ['silver with dark stripe along flank', 'yellow tail fin often'],
    finShape: 'small finlets near tail',
    tailShape: 'forked yellowish',
    mouthShape: 'moderate jaw',
    visualFeatures: ['amberjack', 'dark lateral line', 'yellow tail'],
    commonSizeCm: '40–100',
    identifyingSigns: {
      he: 'גוף חזק וארוך, פס כהה לאורך הגוף, זנב צהוב.',
      en: 'Powerful elongated body, dark lateral stripe, yellowish tail.',
    },
  },
  'pf-003': {
    bodyShape: 'torpedo mackerel shape',
    colorPatterns: ['blue-green back', 'silver belly', 'wavy lines on back'],
    finShape: 'small finlets, forked tail',
    tailShape: 'forked',
    mouthShape: 'pointed jaw',
    visualFeatures: ['mackerel', 'finlets', 'fast pelagic fish'],
    commonSizeCm: '25–150',
    identifyingSigns: {
      he: 'צורת פלמידה/סcomber — גב כהה, קווים על הגב, סנפירונים קטנים.',
      en: 'Mackerel shape — dark back, wavy lines, small finlets near tail.',
    },
  },
  'mf-028': {
    bodyShape: 'elongated silver body',
    colorPatterns: ['silver', 'dark grey back'],
    finShape: 'two dorsal fins, forked tail',
    tailShape: 'forked',
    mouthShape: 'moderate terminal mouth',
    visualFeatures: ['sea bass', 'silver flanks', 'no barbels'],
    commonSizeCm: '25–70',
    identifyingSigns: {
      he: 'לברק — גוף כסוף מוארך, שני סנפירי גב, ללא זקן.',
      en: 'Sea bass — elongated silver body, two dorsal fins, no barbels.',
    },
  },
  'mf-004': {
    bodyShape: 'elongated powerful silver body',
    colorPatterns: ['silver', 'dark back', 'no bars on body'],
    finShape: 'forked tail, small finlets',
    tailShape: 'forked',
    mouthShape: 'large jaw',
    visualFeatures: ['leerfish', 'large size', 'surf predator'],
    commonSizeCm: '60–150',
    identifyingSigns: {
      he: 'אריען — גוף כסוף גדול, לסת חזקה, דג גלים גדול.',
      en: 'Leerfish — large silver body, strong jaw, surf predator.',
    },
  },
  'mf-043': {
    bodyShape: 'torpedo shape',
    colorPatterns: ['blue-green back', 'silver sides'],
    finShape: 'finlets, forked tail',
    tailShape: 'forked',
    mouthShape: 'pointed',
    visualFeatures: ['chub mackerel', 'finlets', 'pelagic'],
    commonSizeCm: '20–40',
    identifyingSigns: {
      he: 'פלמידה — גוף טורפד, גב כהה, סנפירונים.',
      en: 'Chub mackerel — torpedo body, dark back, finlets.',
    },
  },
};

export function defaultVisualProfile(hebrewName: string, familyLatin?: string): FishVisualProfile {
  const family = familyLatin?.toUpperCase() ?? '';
  if (family.includes('MUGILIDAE')) {
    return {
      bodyShape: 'elongated silver cylindrical body',
      colorPatterns: ['silver', 'grey back'],
      finShape: 'forked tail',
      tailShape: 'forked',
      mouthShape: 'small subterminal mouth',
      visualFeatures: ['mullet-like', 'schooling fish'],
      commonSizeCm: '15–40',
      identifyingSigns: { he: `דג קיפון/בורי — ${hebrewName}`, en: `Mullet family — ${hebrewName}` },
    };
  }
  if (family.includes('SERRANIDAE')) {
    return {
      bodyShape: 'robust oval grouper body',
      colorPatterns: ['brown', 'spots or mottled pattern'],
      finShape: 'rounded fins',
      tailShape: 'rounded',
      mouthShape: 'large mouth',
      visualFeatures: ['grouper', 'thick body'],
      commonSizeCm: '20–60',
      identifyingSigns: { he: `משפחת דקריים — ${hebrewName}`, en: `Grouper family — ${hebrewName}` },
    };
  }
  if (family.includes('SPARIDAE')) {
    return {
      bodyShape: 'deep oval compressed body',
      colorPatterns: ['silver', 'grey', 'sometimes stripes'],
      finShape: 'single dorsal with spines',
      tailShape: 'forked',
      mouthShape: 'small mouth',
      visualFeatures: ['seabream shape', 'deep body'],
      commonSizeCm: '15–45',
      identifyingSigns: { he: `משפחת ספרוסיים — ${hebrewName}`, en: `Seabream family — ${hebrewName}` },
    };
  }
  return {
    bodyShape: 'typical marine fish',
    colorPatterns: ['silver', 'grey'],
    finShape: 'standard fins',
    tailShape: 'forked',
    mouthShape: 'terminal mouth',
    visualFeatures: ['marine fish'],
    commonSizeCm: '15–50',
    identifyingSigns: { he: hebrewName, en: hebrewName },
  };
}
