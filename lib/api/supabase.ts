import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { env } from '@/lib/config/env';
import type { Database } from '@/types/database';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

let supabaseInstance: SupabaseClient<Database> | null = null;

export function getSupabase(): SupabaseClient<Database> {
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(
      env.supabaseUrl || 'http://localhost:54321',
      env.supabaseAnonKey || 'placeholder-key',
      {
        auth: {
          storage: Platform.OS === 'web' ? undefined : ExpoSecureStoreAdapter,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      },
    );
  }
  return supabaseInstance;
}

export const supabase = getSupabase();
