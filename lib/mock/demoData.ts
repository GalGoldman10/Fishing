import { FishingSpotDetails, FishingSpotSummary, SpeciesDetails, SpeciesSummary, MarineConditions } from '@/types/fishing';
import { getBeachProfile } from '@/lib/mock/beachProfiles';
import { getSpeciesProfile } from '@/lib/mock/speciesProfiles';

// Coordinates were audited on 2026-07-03: several pins previously used
// city-center positions instead of the actual shoreline fishing access point.
// Each spot now stores the shoreline pin plus a separate offshore
// marineCoordinates used for marine forecast requests (never an inland point).
const VERIFIED_AT = '2026-07-03T00:00:00Z';

export const DEMO_SPOTS: FishingSpotSummary[] = [
  {
    id: 'demo-1', slug: 'tel-aviv-beach', name: 'Tel Aviv Beach (Gordon)',
    localizedNames: { en: 'Tel Aviv Beach (Gordon)', he: 'חוף תל אביב (גורדון)' },
    countryCode: 'IL', region: 'Tel Aviv', environmentType: 'shore', shoreType: 'sandy',
    seabedType: 'sand', latitude: 32.0849, longitude: 34.7680, difficultyLevel: 'easy',
    marineCoordinates: { latitude: 32.0849, longitude: 34.7550 },
    coordinateSource: 'manual-verification', coordinatesVerifiedAt: VERIFIED_AT,
    verificationStatus: 'demo', confidenceScore: 0.3, distanceKm: 2.1,
  },
  {
    id: 'demo-2', slug: 'herzliya-marina', name: 'Herzliya Marina Pier',
    localizedNames: { en: 'Herzliya Marina Pier', he: 'רציף מרינה הרצליה' },
    countryCode: 'IL', region: 'Herzliya', environmentType: 'pier', shoreType: 'pier',
    seabedType: 'sand', latitude: 32.1622, longitude: 34.7950, difficultyLevel: 'easy',
    marineCoordinates: { latitude: 32.1622, longitude: 34.7820 },
    coordinateSource: 'manual-verification', coordinatesVerifiedAt: VERIFIED_AT,
    verificationStatus: 'demo', confidenceScore: 0.3, distanceKm: 8.5,
  },
  {
    id: 'demo-3', slug: 'jaffa-rocks', name: 'Jaffa Rocky Shore',
    localizedNames: { en: 'Jaffa Rocky Shore', he: 'חוף סלעים יפו' },
    countryCode: 'IL', region: 'Tel Aviv-Jaffa', environmentType: 'rocks', shoreType: 'rocky',
    seabedType: 'rock', latitude: 32.0535, longitude: 34.7498, difficultyLevel: 'moderate',
    marineCoordinates: { latitude: 32.0535, longitude: 34.7380 },
    coordinateSource: 'manual-verification', coordinatesVerifiedAt: VERIFIED_AT,
    verificationStatus: 'demo', confidenceScore: 0.3, distanceKm: 4.2,
  },
  {
    id: 'demo-4', slug: 'ashdod-port', name: 'Ashdod Harbor Area',
    localizedNames: { en: 'Ashdod Harbor Area', he: 'אזור נמל אשדוד' },
    countryCode: 'IL', region: 'Ashdod', environmentType: 'harbor', shoreType: 'harbor',
    seabedType: 'mixed', latitude: 31.7975, longitude: 34.6320, difficultyLevel: 'moderate',
    marineCoordinates: { latitude: 31.7975, longitude: 34.6180 },
    coordinateSource: 'manual-verification', coordinatesVerifiedAt: VERIFIED_AT,
    verificationStatus: 'demo', confidenceScore: 0.3, distanceKm: 45.0,
  },
  {
    id: 'demo-5', slug: 'caesarea-beach', name: 'Caesarea Sandy Beach',
    localizedNames: { en: 'Caesarea Sandy Beach', he: 'חוף חול קיסריה' },
    countryCode: 'IL', region: 'Caesarea', environmentType: 'shore', shoreType: 'sandy',
    seabedType: 'sand', latitude: 32.5010, longitude: 34.8895, difficultyLevel: 'easy',
    marineCoordinates: { latitude: 32.5010, longitude: 34.8760 },
    coordinateSource: 'manual-verification', coordinatesVerifiedAt: VERIFIED_AT,
    verificationStatus: 'demo', confidenceScore: 0.3, distanceKm: 35.0,
  },
  {
    id: 'demo-6', slug: 'netanya-cliffs', name: 'Netanya Cliff Shore',
    localizedNames: { en: 'Netanya Cliff Shore', he: 'חוף צוקים נתניה' },
    countryCode: 'IL', region: 'Netanya', environmentType: 'rocks', shoreType: 'cliff',
    seabedType: 'rock', latitude: 32.3215, longitude: 34.8480, difficultyLevel: 'difficult',
    marineCoordinates: { latitude: 32.3215, longitude: 34.8350 },
    coordinateSource: 'manual-verification', coordinatesVerifiedAt: VERIFIED_AT,
    verificationStatus: 'demo', confidenceScore: 0.3, distanceKm: 28.0,
  },
  {
    id: 'demo-7', slug: 'haifa-breakwater', name: 'Haifa Breakwater (Bat Galim)',
    localizedNames: { en: 'Haifa Breakwater (Bat Galim)', he: 'שובר גלים חיפה (בת גלים)' },
    countryCode: 'IL', region: 'Haifa', environmentType: 'pier', shoreType: 'mixed',
    seabedType: 'rock', latitude: 32.8338, longitude: 34.9812, difficultyLevel: 'moderate',
    marineCoordinates: { latitude: 32.8420, longitude: 34.9750 },
    coordinateSource: 'manual-verification', coordinatesVerifiedAt: VERIFIED_AT,
    verificationStatus: 'demo', confidenceScore: 0.3, distanceKm: 85.0,
  },
  {
    id: 'demo-8', slug: 'ashkelon-south', name: 'Ashkelon South Beach',
    localizedNames: { en: 'Ashkelon South Beach', he: 'חוף דרום אשקלון' },
    countryCode: 'IL', region: 'Ashkelon', environmentType: 'shore', shoreType: 'mixed',
    seabedType: 'mixed', latitude: 31.6560, longitude: 34.5480, difficultyLevel: 'easy',
    marineCoordinates: { latitude: 31.6560, longitude: 34.5350 },
    coordinateSource: 'manual-verification', coordinatesVerifiedAt: VERIFIED_AT,
    verificationStatus: 'demo', confidenceScore: 0.3, distanceKm: 55.0,
  },
  {
    id: 'demo-9', slug: 'palmachim-beach', name: 'Palmachim Beach',
    localizedNames: { en: 'Palmachim Beach', he: 'חוף פלמחים' },
    countryCode: 'IL', region: 'Palmachim', environmentType: 'shore', shoreType: 'sandy',
    seabedType: 'sand', latitude: 31.9290, longitude: 34.7020, difficultyLevel: 'easy',
    marineCoordinates: { latitude: 31.9290, longitude: 34.6890 },
    coordinateSource: 'manual-verification', coordinatesVerifiedAt: VERIFIED_AT,
    verificationStatus: 'demo', confidenceScore: 0.35, distanceKm: 22.0,
  },
  {
    id: 'demo-10', slug: 'bat-yam-beach', name: 'Bat Yam Beach',
    localizedNames: { en: 'Bat Yam Beach', he: 'חוף בת ים' },
    countryCode: 'IL', region: 'Bat Yam', environmentType: 'shore', shoreType: 'sandy',
    seabedType: 'sand', latitude: 32.0236, longitude: 34.7365, difficultyLevel: 'easy',
    marineCoordinates: { latitude: 32.0236, longitude: 34.7230 },
    coordinateSource: 'manual-verification', coordinatesVerifiedAt: VERIFIED_AT,
    verificationStatus: 'demo', confidenceScore: 0.3, distanceKm: 6.0,
  },
  {
    id: 'demo-11', slug: 'rishon-beach', name: 'Rishon LeZion Beach',
    localizedNames: { en: 'Rishon LeZion Beach', he: 'חוף ראשון לציון' },
    countryCode: 'IL', region: 'Rishon LeZion', environmentType: 'shore', shoreType: 'sandy',
    seabedType: 'sand', latitude: 31.9760, longitude: 34.7050, difficultyLevel: 'easy',
    marineCoordinates: { latitude: 31.9760, longitude: 34.6920 },
    coordinateSource: 'manual-verification', coordinatesVerifiedAt: VERIFIED_AT,
    verificationStatus: 'demo', confidenceScore: 0.3, distanceKm: 12.0,
  },
  {
    id: 'demo-12', slug: 'beit-yanai', name: 'Beit Yanai Beach',
    localizedNames: { en: 'Beit Yanai Beach', he: 'חוף בית ינאי' },
    countryCode: 'IL', region: 'Beit Yanai', environmentType: 'shore', shoreType: 'mixed',
    seabedType: 'mixed', latitude: 32.3860, longitude: 34.8615, difficultyLevel: 'easy',
    marineCoordinates: { latitude: 32.3860, longitude: 34.8480 },
    coordinateSource: 'manual-verification', coordinatesVerifiedAt: VERIFIED_AT,
    verificationStatus: 'demo', confidenceScore: 0.35, distanceKm: 32.0,
  },
  {
    id: 'demo-13', slug: 'nahariya-coast', name: 'Nahariya Coast',
    localizedNames: { en: 'Nahariya Coast', he: 'חוף נהריה' },
    countryCode: 'IL', region: 'Nahariya', environmentType: 'rocks', shoreType: 'rocky',
    seabedType: 'rock', latitude: 33.0080, longitude: 35.0895, difficultyLevel: 'moderate',
    marineCoordinates: { latitude: 33.0080, longitude: 35.0760 },
    coordinateSource: 'manual-verification', coordinatesVerifiedAt: VERIFIED_AT,
    verificationStatus: 'demo', confidenceScore: 0.3, distanceKm: 95.0,
  },
  {
    id: 'demo-14', slug: 'nitzanim-beach', name: 'Nitzanim Beach',
    localizedNames: { en: 'Nitzanim Beach', he: 'חוף ניצנים' },
    countryCode: 'IL', region: 'Nitzanim', environmentType: 'shore', shoreType: 'sandy',
    seabedType: 'sand', latitude: 31.7330, longitude: 34.6010, difficultyLevel: 'easy',
    marineCoordinates: { latitude: 31.7330, longitude: 34.5880 },
    coordinateSource: 'manual-verification', coordinatesVerifiedAt: VERIFIED_AT,
    verificationStatus: 'demo', confidenceScore: 0.35, distanceKm: 48.0,
  },
  {
    id: 'demo-15', slug: 'zikim-beach', name: 'Zikim Beach',
    localizedNames: { en: 'Zikim Beach', he: 'חוף זיקים' },
    countryCode: 'IL', region: 'Zikim', environmentType: 'shore', shoreType: 'sandy',
    seabedType: 'sand', latitude: 31.6080, longitude: 34.5205, difficultyLevel: 'easy',
    marineCoordinates: { latitude: 31.6080, longitude: 34.5070 },
    coordinateSource: 'manual-verification', coordinatesVerifiedAt: VERIFIED_AT,
    verificationStatus: 'demo', confidenceScore: 0.3, distanceKm: 62.0,
  },
  {
    id: 'demo-16', slug: 'dor-beach', name: 'Dor Beach',
    localizedNames: { en: 'Dor Beach', he: 'חוף דור' },
    countryCode: 'IL', region: 'Dor', environmentType: 'shore', shoreType: 'mixed',
    seabedType: 'mixed', latitude: 32.6090, longitude: 34.9155, difficultyLevel: 'easy',
    marineCoordinates: { latitude: 32.6090, longitude: 34.9020 },
    coordinateSource: 'manual-verification', coordinatesVerifiedAt: VERIFIED_AT,
    verificationStatus: 'demo', confidenceScore: 0.35, distanceKm: 42.0,
  },
  {
    id: 'demo-17', slug: 'eilat-beach', name: 'Eilat North Beach',
    localizedNames: { en: 'Eilat North Beach', he: 'חוף צפון אילת' },
    countryCode: 'IL', region: 'Eilat', environmentType: 'shore', shoreType: 'sandy',
    seabedType: 'sand', latitude: 29.5502, longitude: 34.9580, difficultyLevel: 'easy',
    marineCoordinates: { latitude: 29.5400, longitude: 34.9580 },
    coordinateSource: 'manual-verification', coordinatesVerifiedAt: VERIFIED_AT,
    verificationStatus: 'demo', confidenceScore: 0.3, distanceKm: 300.0,
  },
  {
    id: 'demo-18', slug: 'sea-of-galilee', name: 'Sea of Galilee (Tiberias)',
    localizedNames: { en: 'Sea of Galilee (Tiberias)', he: 'ים כנרת (טבריה)' },
    countryCode: 'IL', region: 'Tiberias', environmentType: 'shore', shoreType: 'sandy',
    seabedType: 'mud', latitude: 32.7905, longitude: 35.5430, difficultyLevel: 'easy',
    marineCoordinates: { latitude: 32.7905, longitude: 35.5560 },
    coordinateSource: 'manual-verification', coordinatesVerifiedAt: VERIFIED_AT,
    verificationStatus: 'demo', confidenceScore: 0.3, distanceKm: 120.0,
  },
];

export const DEMO_SPECIES: SpeciesSummary[] = [
  { id: 'sp-1', commonName: 'Sea Bass', scientificName: 'Dicentrarchus labrax', localizedNames: { en: 'Sea Bass', he: 'לברק' }, habitat: 'Coastal waters, rocky and sandy areas', environmentTypes: ['shore', 'pier'], conservationStatus: 'least_concern' },
  { id: 'sp-2', commonName: 'Gilthead Bream', scientificName: 'Sparus aurata', localizedNames: { en: 'Gilthead Bream', he: 'דניס' }, habitat: 'Rocky reefs and sandy bottoms', environmentTypes: ['shore', 'rocks'], conservationStatus: 'least_concern' },
  { id: 'sp-3', commonName: 'Sand Steenbras', scientificName: 'Lithognathus mormyrus', localizedNames: { en: 'Sand Steenbras', he: 'מרמור' }, habitat: 'Sandy bottoms near shore', environmentTypes: ['shore'], conservationStatus: 'least_concern' },
  { id: 'sp-4', commonName: 'Red Porgy', scientificName: 'Pagrus pagrus', localizedNames: { en: 'Red Porgy', he: 'פארידה' }, habitat: 'Rocky areas', environmentTypes: ['rocks', 'pier'], conservationStatus: 'least_concern' },
  { id: 'sp-5', commonName: 'Bluefish', scientificName: 'Pomatomus saltatrix', localizedNames: { en: 'Bluefish', he: 'גומבר' }, habitat: 'Open coastal waters', environmentTypes: ['shore', 'pier', 'boat'], conservationStatus: 'least_concern' },
  { id: 'sp-6', commonName: 'Atlantic Mackerel', scientificName: 'Scomber scombrus', localizedNames: { en: 'Atlantic Mackerel', he: 'מקרל' }, habitat: 'Pelagic, near surface', environmentTypes: ['pier', 'boat'], conservationStatus: 'least_concern' },
  { id: 'sp-7', commonName: 'Grey Mullet', scientificName: 'Mugil cephalus', localizedNames: { en: 'Grey Mullet', he: 'בורי' }, habitat: 'Estuaries and shallow coastal', environmentTypes: ['shore', 'harbor'], conservationStatus: 'least_concern' },
  { id: 'sp-8', commonName: 'Dusky Grouper', scientificName: 'Epinephelus marginatus', localizedNames: { en: 'Dusky Grouper', he: 'לוקוס' }, habitat: 'Rocky reefs', environmentTypes: ['rocks'], conservationStatus: 'vulnerable' },
  { id: 'sp-9', commonName: 'Common Sole', scientificName: 'Solea solea', localizedNames: { en: 'Common Sole', he: 'דג לשון' }, habitat: 'Sandy and muddy bottoms', environmentTypes: ['shore'], conservationStatus: 'least_concern' },
  { id: 'sp-10', commonName: 'Greater Amberjack', scientificName: 'Seriola dumerili', localizedNames: { en: 'Greater Amberjack', he: 'אינטיאס' }, habitat: 'Offshore reefs', environmentTypes: ['boat', 'pier'], conservationStatus: 'least_concern' },
  { id: 'sp-11', commonName: 'European Barracuda', scientificName: 'Sphyraena sphyraena', localizedNames: { en: 'European Barracuda', he: 'ברקודה' }, habitat: 'Coastal pelagic', environmentTypes: ['pier', 'boat'], conservationStatus: 'least_concern' },
  { id: 'sp-12', commonName: 'European Pilchard', scientificName: 'Sardina pilchardus', localizedNames: { en: 'European Pilchard', he: 'סרדין' }, habitat: 'Pelagic schools', environmentTypes: ['pier', 'boat'], conservationStatus: 'least_concern' },
  { id: 'sp-13', commonName: 'Red Mullet', scientificName: 'Mullus surmuletus', localizedNames: { en: 'Red Mullet', he: 'ברבוניה' }, habitat: 'Sandy and muddy bottoms', environmentTypes: ['shore'], conservationStatus: 'least_concern' },
  { id: 'sp-14', commonName: 'White Seabream', scientificName: 'Diplodus sargus', localizedNames: { en: 'White Seabream', he: 'סרגוס' }, habitat: 'Rocky and sandy areas', environmentTypes: ['shore', 'rocks'], conservationStatus: 'least_concern' },
  { id: 'sp-15', commonName: 'Leerfish', scientificName: 'Lichia amia', localizedNames: { en: 'Leerfish (Arian)', he: 'אריאן' }, habitat: 'Sandy beaches and surf zone', environmentTypes: ['shore'], conservationStatus: 'least_concern' },
];

export const DEMO_CONDITIONS: MarineConditions = {
  weather: 'Partly cloudy',
  windSpeed: 12,
  windDirection: 'NW',
  waveHeight: 0.6,
  wavePeriod: 5,
  airTemperature: 24,
  waterTemperature: 22,
  sunrise: '05:42',
  sunset: '19:28',
  provider: 'mock',
  retrievedAt: new Date().toISOString(),
  suitability: 'good',
  summary: 'Moderate northwest wind with small waves. Suitable for shore casting.',
  localizedSummary: {
    en: 'Moderate northwest wind with small waves. Suitable for shore casting.',
    he: 'רוח צפון-מערבית מתונה עם גלים קטנים. מתאים להטלה מהחוף.',
  },
};

export function getDemoSpotDetails(id: string): FishingSpotDetails | null {
  const spot = DEMO_SPOTS.find((s) => s.id === id);
  if (!spot) return null;

  const profile = getBeachProfile(id);
  const speciesEntries = profile
    ? profile.speciesIds.map((entry) => {
        const s = DEMO_SPECIES.find((sp) => sp.id === entry.id);
        if (!s) return null;
        return {
          speciesId: s.id,
          commonName: s.commonName,
          scientificName: s.scientificName,
          localizedNames: s.localizedNames,
          likelihood: entry.likelihood,
          seasonalMonths: [3, 4, 5, 6, 7, 8, 9, 10],
          preferredMethods: profile.fishingMethods as ('surf_casting' | 'bottom_fishing' | 'float_fishing')[],
          preferredBaits: profile.equipmentOverride?.baits ?? ['sardine', 'squid'],
          confidenceScore: 0.35,
        };
      }).filter(Boolean)
    : DEMO_SPECIES.slice(0, 4).map((s, i) => ({
        speciesId: s.id,
        commonName: s.commonName,
        scientificName: s.scientificName,
        localizedNames: s.localizedNames,
        likelihood: (['high', 'medium', 'low'] as const)[i % 3],
        seasonalMonths: [3, 4, 5, 6, 7, 8, 9, 10],
        preferredMethods: ['surf_casting', 'bottom_fishing'] as const,
        preferredBaits: ['sardine', 'squid'],
        confidenceScore: 0.3,
      }));

  const eqOverride = profile?.equipmentOverride;
  const defaultEq = {
    id: 'eq-1', fishingMethod: 'surf_casting', experienceLevel: 'beginner' as const,
    rodSpecification: { type: 'surf rod', length: '3.6-4.2m', castingWeight: '80-150g' },
    reelSpecification: { type: 'spinning', size: '5000-6000' },
    lineSpecification: { main: '0.30-0.35mm mono or PE 1.5-2' },
    leaderSpecification: { material: 'fluorocarbon', strength: '0.40-0.50mm' },
    terminalTackle: { hooks: '#2/0 - 4/0', weights: '120-200g pyramid sinkers' },
    baitAndLures: { baits: ['sardine', 'squid', 'local shrimp'] },
    reasoning: profile?.localTips.en ?? 'Standard Mediterranean shore casting setup for demo purposes.',
    confidenceScore: 0.4,
  };

  if (eqOverride) {
    if (eqOverride.rod) defaultEq.rodSpecification = { type: eqOverride.rod.split(',')[0], length: eqOverride.rod, castingWeight: '' };
    if (eqOverride.reel) defaultEq.reelSpecification = { type: 'spinning', size: eqOverride.reel };
    if (eqOverride.mainLine) defaultEq.lineSpecification = { main: eqOverride.mainLine };
    if (eqOverride.leader) defaultEq.leaderSpecification = { material: 'fluorocarbon', strength: eqOverride.leader };
    if (eqOverride.hooks) defaultEq.terminalTackle = { ...defaultEq.terminalTackle, hooks: eqOverride.hooks };
    if (eqOverride.weights) defaultEq.terminalTackle = { ...defaultEq.terminalTackle, weights: eqOverride.weights };
    if (eqOverride.baits) defaultEq.baitAndLures = { baits: eqOverride.baits };
  }

  return {
    ...spot,
    description: profile?.description.en ?? 'Demonstration fishing spot. NOT verified — confirm on site.',
    municipality: spot.region,
    accessType: 'public',
    parkingInformation: profile?.parkingInformation.en ?? 'Public parking nearby (demo data)',
    accessibilityInformation: spot.difficultyLevel === 'easy' ? 'Generally accessible' : 'Uneven terrain',
    suitableForChildren: spot.difficultyLevel === 'easy',
    nightAccess: spot.shoreType !== 'cliff',
    boatAccess: spot.region === 'Eilat',
    fishingMethods: (profile?.fishingMethods ?? ['surf_casting', 'bottom_fishing', 'float_fishing']) as ('surf_casting' | 'bottom_fishing' | 'float_fishing')[],
    hazardLevel: spot.shoreType === 'cliff' ? 'high' : profile?.hazardNotes ? 'medium' : 'low',
    hazardNotes: profile?.hazardNotes?.en ?? (spot.shoreType === 'rocky' ? 'Slippery rocks when wet' : undefined),
    species: speciesEntries as FishingSpotDetails['species'],
    equipment: [defaultEq],
    hazards: profile?.hazardNotes
      ? [{
          id: 'h-1',
          type: 'general',
          severity: 'medium' as const,
          title: 'Safety note',
          description: profile.hazardNotes.en,
          localizedTitle: { en: 'Safety note', he: 'הערת בטיחות' },
          localizedDescription: profile.hazardNotes,
        }]
      : spot.shoreType === 'rocky' || spot.shoreType === 'cliff'
        ? [{
            id: 'h-1',
            type: 'slippery_rocks',
            severity: 'medium' as const,
            title: 'Slippery rocks',
            description: 'Rocks can be very slippery when wet.',
            localizedTitle: { en: 'Slippery rocks', he: 'סלעים חלקים' },
            localizedDescription: {
              en: 'Rocks can be very slippery when wet.',
              he: 'הסלעים עלולים להיות חלקים מאוד כשהם רטובים.',
            },
          }]
        : [],
    regulations: [
      {
        id: 'reg-1',
        title: 'Demonstration Regulation',
        summary: 'DEMO ONLY: Always verify with the Israel Nature and Parks Authority before fishing. License required.',
        localizedSummary: {
          en: 'DEMO ONLY: Always verify with the Israel Nature and Parks Authority before fishing. License required.',
          he: 'הדגמה בלבד: אמתו תמיד עם רשות הטבע והגנים לפני דיג. נדרש רישיון דיג.',
        },
        licenseRequired: true,
        minimumSize: 'Varies by species',
        lastCheckedAt: '2024-01-01',
      },
    ],
    sources: [
      { id: 'src-1', title: 'FishGuide Beach Database', organization: 'FishGuide AI', reliabilityLevel: 'demo' },
    ],
  };
}

export function getDemoSpeciesDetails(id: string): SpeciesDetails | null {
  const species = DEMO_SPECIES.find((s) => s.id === id);
  if (!species) return null;
  const profile = getSpeciesProfile(id);
  return {
    ...species,
    habitat: profile?.habitat.en ?? species.habitat,
    aliases: [species.commonName],
    description: profile?.description.en ?? `Demonstration species entry for ${species.commonName}.`,
    identificationNotes: profile?.identificationNotes.en ?? 'Consult a field guide for positive identification.',
    preferredDepthMin: 1,
    preferredDepthMax: 30,
    activeTimes: ['dawn', 'dusk', 'night'],
    handlingNotes: profile?.handlingNotes.en ?? 'Handle with wet hands. Watch for spines.',
    consumptionWarning: profile?.consumptionWarning.en ?? 'Only consume fish you can positively identify.',
    localizedContent: profile
      ? {
          description: profile.description,
          habitat: profile.habitat,
          identificationNotes: profile.identificationNotes,
          handlingNotes: profile.handlingNotes,
          consumptionWarning: profile.consumptionWarning,
        }
      : undefined,
  };
}
