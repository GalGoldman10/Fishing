import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform, I18nManager } from 'react-native';
import i18n, { SupportedLanguage, supportedLanguages, syncDocumentLanguage } from '@/lib/localization/i18n';
import { isSupabaseAuthEnabled } from '@/lib/config/env';
import { supabase } from '@/lib/api/supabase';

const STORAGE_KEY = 'fishguide_language';

interface LanguageState {
  language: SupportedLanguage;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setLanguage: (language: SupportedLanguage) => Promise<void>;
}

function isSupported(value: string | null | undefined): value is SupportedLanguage {
  return !!value && supportedLanguages.includes(value as SupportedLanguage);
}

async function readStoredLanguage(): Promise<SupportedLanguage | null> {
  try {
    const stored = await SecureStore.getItemAsync(STORAGE_KEY);
    if (isSupported(stored)) return stored;
  } catch {
    // SecureStore unavailable (web) — fall through
  }
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isSupported(stored)) return stored;
  }
  return null;
}

async function readProfileLanguage(): Promise<SupportedLanguage | null> {
  if (!isSupabaseAuthEnabled()) return null;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase
      .from('profiles')
      .select('preferred_language')
      .eq('id', user.id)
      .maybeSingle();
    const preferred = data?.preferred_language;
    return isSupported(preferred) ? preferred : null;
  } catch {
    return null;
  }
}

async function persistLanguage(language: SupportedLanguage): Promise<void> {
  try {
    await SecureStore.setItemAsync(STORAGE_KEY, language);
  } catch {
    // SecureStore unavailable — web fallback below
  }
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, language);
  }

  // Also store on the signed-in user's profile so the choice follows them across devices.
  if (isSupabaseAuthEnabled()) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({ preferred_language: language }).eq('id', user.id);
      }
    } catch {
      // profile sync is best-effort
    }
  }
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: (i18n.language as SupportedLanguage) || 'en',
  hydrated: false,

  // Priority: signed-in profile > saved device preference > browser/device language > English.
  hydrate: async () => {
    const profileLanguage = await readProfileLanguage();
    const storedLanguage = profileLanguage ?? (await readStoredLanguage());
    if (storedLanguage) {
      await applyLanguage(storedLanguage, false);
      set({ language: storedLanguage, hydrated: true });
      return;
    }
    // No explicit preference — keep the device/browser-detected language from i18n init.
    set({ language: i18n.language as SupportedLanguage, hydrated: true });
  },

  setLanguage: async (language) => {
    await applyLanguage(language, true);
    set({ language });
  },
}));

export async function applyLanguage(language: SupportedLanguage, persist: boolean): Promise<void> {
  await i18n.changeLanguage(language);
  syncDocumentLanguage(language);

  if (persist) {
    await persistLanguage(language);
  }

  const rtl = language === 'he';
  if (I18nManager.isRTL !== rtl) {
    I18nManager.allowRTL(rtl);
    I18nManager.forceRTL(rtl);
  }
}

export function getCurrentLanguage(): SupportedLanguage {
  return (i18n.language as SupportedLanguage) || 'en';
}
