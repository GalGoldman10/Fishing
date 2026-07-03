import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { I18nManager, Platform } from 'react-native';
import en from './locales/en.json';
import he from './locales/he.json';

const deviceLanguage = Localization.getLocales()[0]?.languageCode ?? 'en';
const supportedLanguages = ['en', 'he'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

const initialLanguage = supportedLanguages.includes(deviceLanguage as SupportedLanguage)
  ? (deviceLanguage as SupportedLanguage)
  : 'en';

// RTL for Hebrew from first launch
if (initialLanguage === 'he') {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    he: { translation: he },
  },
  lng: initialLanguage,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v4',
  saveMissing: __DEV__,
  missingKeyHandler: (lngs, _ns, key) => {
    reportMissingTranslation(key, lngs.join(','));
  },
});

export function reportMissingTranslation(key: string, language: string): void {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.warn(`Missing translation: ${language}.${key}`);
  }
}

export function isRTL(language?: string): boolean {
  return (language ?? i18n.language) === 'he';
}

/** Keeps <html lang dir> in sync on web so screen readers and CSS pick up direction. */
export function syncDocumentLanguage(language: string): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  document.documentElement.lang = language;
  document.documentElement.dir = isRTL(language) ? 'rtl' : 'ltr';
  document.title = i18n.t('app.pageTitle');
}

i18n.on('languageChanged', (lng) => {
  syncDocumentLanguage(lng);
});
syncDocumentLanguage(initialLanguage);

export function setLanguage(language: SupportedLanguage): void {
  void i18n.changeLanguage(language);
  const rtl = language === 'he';
  I18nManager.allowRTL(rtl);
  I18nManager.forceRTL(rtl);
}

export { supportedLanguages };
export default i18n;
