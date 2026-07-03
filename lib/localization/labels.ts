import { TFunction } from 'i18next';

/**
 * Enum-value translators. Each looks up `namespace.value` and falls back to the
 * raw value so unknown enum members never break the UI or show a raw key.
 */
function translateEnum(namespace: string, value: string, t: TFunction): string {
  const key = `${namespace}.${value}`;
  const translated = t(key);
  return translated === key ? value.replace(/_/g, ' ') : translated;
}

export function translateShoreType(shoreType: string, t: TFunction): string {
  return translateEnum('shoreTypes', shoreType, t);
}

export function translateDifficulty(level: string, t: TFunction): string {
  return translateEnum('difficultyLevels', level, t);
}

export function translateLikelihood(likelihood: string, t: TFunction): string {
  return translateEnum('likelihood', likelihood, t);
}

export function translateAccessType(accessType: string, t: TFunction): string {
  return translateEnum('accessTypes', accessType, t);
}

export function translateVerificationStatus(status: string, t: TFunction): string {
  return translateEnum('verificationStatus', status, t);
}

export function translateConfidence(confidence: string, t: TFunction): string {
  return translateEnum('confidenceLevels', confidence, t);
}

export function translateEquipmentOption(option: string, t: TFunction): string {
  return translateEnum('equipmentOptions', option, t);
}

export function translateSuitability(suitability: string, t: TFunction): string {
  return translateEnum('suitabilityLevels', suitability, t);
}

export function translateFeatureType(featureType: string, t: TFunction): string {
  return translateEnum('featureTypes', featureType.toLowerCase(), t);
}
