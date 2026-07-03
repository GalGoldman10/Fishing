import { z } from 'npm:zod@3';

export const fishingAssistantResponseSchema = z.object({
  answer: z.string(),
  location: z.object({
    spotId: z.string().optional(),
    name: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    distanceKm: z.number().optional(),
  }).optional(),
  terrain: z.object({
    shoreType: z.enum(['sandy', 'rocky', 'mixed', 'pier', 'harbor', 'cliff', 'unknown']).optional(),
    seabedType: z.enum(['sand', 'rock', 'reef', 'mud', 'mixed', 'unknown']).optional(),
    confidence: z.enum(['verified', 'high', 'medium', 'low', 'unknown']),
  }).optional(),
  possibleSpecies: z.array(z.object({
    speciesId: z.string().optional(),
    name: z.string(),
    likelihood: z.enum(['high', 'medium', 'low', 'unknown']).optional(),
    seasonNote: z.string().optional(),
    regulationWarning: z.string().optional(),
  })),
  recommendedSetup: z.object({
    method: z.string(),
    rod: z.string(),
    reel: z.string(),
    mainLine: z.string(),
    leader: z.string(),
    hookOrLure: z.string(),
    weight: z.string().optional(),
    bait: z.string().optional(),
    accessories: z.array(z.string()),
  }).optional(),
  conditions: z.object({
    summary: z.string(),
    suitability: z.enum(['good', 'acceptable', 'poor', 'unknown']),
    retrievedAt: z.string().optional(),
  }).optional(),
  hazards: z.array(z.string()),
  regulations: z.array(z.string()),
  followUpQuestions: z.array(z.string()),
  sources: z.array(z.object({
    title: z.string(),
    authority: z.string().optional(),
    url: z.string().optional(),
    checkedAt: z.string().optional(),
  })),
  confidence: z.enum(['verified', 'high', 'medium', 'low']),
  freshnessMessage: z.string().optional(),
});

export const TOOL_DEFINITIONS = [
  {
    type: 'function' as const,
    name: 'search_fishing_spots',
    description: 'Search fishing spots by query, location, radius, and filters',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        latitude: { type: 'number' },
        longitude: { type: 'number' },
        radiusKm: { type: 'number' },
        country: { type: 'string' },
        region: { type: 'string' },
        fishingEnvironment: { type: 'string' },
        terrainType: { type: 'string' },
      },
    },
  },
  {
    type: 'function' as const,
    name: 'get_fishing_spot_details',
    description: 'Get full details for a fishing spot by ID',
    parameters: {
      type: 'object',
      properties: { spotId: { type: 'string' } },
      required: ['spotId'],
    },
  },
  {
    type: 'function' as const,
    name: 'get_nearby_spots',
    description: 'Find nearby fishing spots using PostGIS',
    parameters: {
      type: 'object',
      properties: {
        latitude: { type: 'number' },
        longitude: { type: 'number' },
        radiusKm: { type: 'number' },
      },
      required: ['latitude', 'longitude'],
    },
  },
  {
    type: 'function' as const,
    name: 'search_species',
    description: 'Search fish species by name or region',
    parameters: {
      type: 'object',
      properties: {
        speciesName: { type: 'string' },
        country: { type: 'string' },
        environment: { type: 'string' },
      },
    },
  },
  {
    type: 'function' as const,
    name: 'build_equipment_setup',
    description: 'Build equipment recommendation for spot, species, and conditions',
    parameters: {
      type: 'object',
      properties: {
        spotId: { type: 'string' },
        targetSpecies: { type: 'string' },
        fishingMethod: { type: 'string' },
        experienceLevel: { type: 'string' },
        budget: { type: 'string' },
      },
    },
  },
  {
    type: 'function' as const,
    name: 'get_environmental_conditions',
    description: 'Get current marine/weather conditions for coordinates',
    parameters: {
      type: 'object',
      properties: {
        latitude: { type: 'number' },
        longitude: { type: 'number' },
        dateTime: { type: 'string' },
      },
      required: ['latitude', 'longitude'],
    },
  },
  {
    type: 'function' as const,
    name: 'get_regulations',
    description: 'Get fishing regulations for a location',
    parameters: {
      type: 'object',
      properties: {
        latitude: { type: 'number' },
        longitude: { type: 'number' },
        country: { type: 'string' },
        species: { type: 'string' },
      },
    },
  },
  {
    type: 'function' as const,
    name: 'search_web',
    description:
      'Search the internet ONLY for fishing-related information: locations, species, equipment, regulations, conditions, and angling techniques. Queries are automatically scoped to fishing. Do not use for restaurants, tourism, or non-fishing topics.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'The search query — be specific, include location and topic' },
        language: { type: 'string', enum: ['en', 'he'] },
        locationHint: { type: 'string', description: 'City, beach name, or region to focus the search' },
      },
      required: ['query'],
    },
  },
];
