import { z } from 'zod';

export const confidenceSchema = z.enum(['verified', 'high', 'medium', 'low', 'unknown']);
export const shoreTypeSchema = z.enum(['sandy', 'rocky', 'mixed', 'pier', 'harbor', 'cliff', 'unknown']);
export const seabedTypeSchema = z.enum(['sand', 'rock', 'reef', 'mud', 'mixed', 'unknown']);
export const suitabilitySchema = z.enum(['good', 'acceptable', 'poor', 'unknown']);
export const likelihoodSchema = z.enum(['high', 'medium', 'low', 'unknown']);

export const fishingAssistantResponseSchema = z.object({
  answer: z.string(),
  location: z
    .object({
      spotId: z.string().optional(),
      name: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      distanceKm: z.number().optional(),
    })
    .optional(),
  terrain: z
    .object({
      shoreType: shoreTypeSchema.optional(),
      seabedType: seabedTypeSchema.optional(),
      confidence: confidenceSchema,
    })
    .optional(),
  possibleSpecies: z.array(
    z.object({
      speciesId: z.string().optional(),
      name: z.string(),
      likelihood: likelihoodSchema.optional(),
      seasonNote: z.string().optional(),
      regulationWarning: z.string().optional(),
    }),
  ),
  recommendedSetup: z
    .object({
      method: z.string(),
      rod: z.string(),
      reel: z.string(),
      mainLine: z.string(),
      leader: z.string(),
      hookOrLure: z.string(),
      weight: z.string().optional(),
      bait: z.string().optional(),
      accessories: z.array(z.string()),
    })
    .optional(),
  conditions: z
    .object({
      summary: z.string(),
      suitability: suitabilitySchema,
      retrievedAt: z.string().optional(),
    })
    .optional(),
  hazards: z.array(z.string()),
  regulations: z.array(z.string()),
  followUpQuestions: z.array(z.string()),
  sources: z.array(
    z.object({
      title: z.string(),
      authority: z.string().optional(),
      url: z.string().optional(),
      checkedAt: z.string().optional(),
    }),
  ),
  confidence: z.enum(['verified', 'high', 'medium', 'low']),
  freshnessMessage: z.string().optional(),
});

export type FishingAssistantResponse = z.infer<typeof fishingAssistantResponseSchema>;

export const searchFishingSpotsInputSchema = z.object({
  query: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  radiusKm: z.number().min(0).max(500).optional(),
  country: z.string().optional(),
  region: z.string().optional(),
  fishingEnvironment: z.string().optional(),
  terrainType: z.string().optional(),
  accessibilityRequirements: z.string().optional(),
});

export const getNearbySpotsInputSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  radiusKm: z.number().min(0).max(500).default(25),
  filters: z
    .object({
      shoreTypes: z.array(shoreTypeSchema).optional(),
      beginnerFriendly: z.boolean().optional(),
      verifiedOnly: z.boolean().optional(),
    })
    .optional(),
});

export const buildEquipmentSetupInputSchema = z.object({
  spotId: z.string().optional(),
  terrain: z.string().optional(),
  targetSpecies: z.string().optional(),
  fishingMethod: z.string().optional(),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  budget: z.enum(['low', 'medium', 'high']).optional(),
  existingEquipment: z.array(z.string()).optional(),
  weatherConditions: z.string().optional(),
});

export const chatMessageInputSchema = z.object({
  sessionId: z.string().uuid().optional(),
  message: z.string().min(1).max(4000),
  language: z.enum(['en', 'he']).default('en'),
  location: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    })
    .optional(),
  spotId: z.string().uuid().optional(),
});

export const tripPlanInputSchema = z.object({
  spotId: z.string().uuid(),
  plannedStart: z.string(),
  plannedEnd: z.string().optional(),
  targetSpeciesIds: z.array(z.string().uuid()).optional(),
  selectedMethod: z.string().optional(),
  equipmentChecklist: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().optional(),
  notificationEnabled: z.boolean().default(false),
});

export const catchLogInputSchema = z.object({
  spotId: z.string().uuid().optional(),
  speciesId: z.string().uuid().optional(),
  caughtAt: z.string(),
  estimatedLength: z.number().positive().optional(),
  estimatedWeight: z.number().positive().optional(),
  baitOrLure: z.string().optional(),
  fishingMethod: z.string().optional(),
  released: z.boolean().default(true),
  notes: z.string().optional(),
  visibility: z.enum(['private', 'friends', 'public']).default('private'),
});

// Messages are i18n keys translated in the UI, never shown raw to users.
export const signInSchema = z.object({
  email: z.string().email('validation.invalidEmail'),
  password: z.string().min(6, 'validation.passwordTooShort'),
});

export const signUpSchema = z.object({
  email: z.string().email('validation.invalidEmail'),
  password: z.string().min(6, 'validation.passwordTooShort'),
  displayName: z
    .string()
    .min(2, 'validation.displayNameTooShort')
    .max(50, 'validation.displayNameTooLong'),
});
