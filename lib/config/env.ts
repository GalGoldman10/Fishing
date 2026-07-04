import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

export const env = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? (extra.supabaseUrl as string) ?? '',
  supabaseAnonKey:
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? (extra.supabaseAnonKey as string) ?? '',
  mapProvider: process.env.EXPO_PUBLIC_MAP_PROVIDER ?? 'react-native-maps',
  mapToken: process.env.EXPO_PUBLIC_MAP_TOKEN ?? '',
  useMockData: process.env.EXPO_PUBLIC_USE_MOCK_DATA === 'true',
  appEnv: process.env.EXPO_PUBLIC_APP_ENV ?? 'development',
} as const;

/** Supabase project URL + anon key are set (not placeholders). */
export function hasSupabaseBackend(): boolean {
  return Boolean(
    env.supabaseUrl &&
      env.supabaseAnonKey &&
      !env.supabaseUrl.includes('placeholder') &&
      !env.supabaseAnonKey.includes('placeholder'),
  );
}

/** Chat can call the fishing-assistant edge function (OpenAI runs server-side). */
export function isAiChatAvailable(): boolean {
  return hasSupabaseBackend();
}

export const isMockMode = () => env.useMockData || !hasSupabaseBackend();
