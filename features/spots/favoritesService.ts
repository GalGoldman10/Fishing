import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { create } from 'zustand';
import { isSupabaseAuthEnabled } from '@/lib/config/env';
import { supabase } from '@/lib/api/supabase';

const FAVORITES_KEY = 'fishguide_favorites';

interface FavoritesStore {
  favoriteIds: Set<string>;
  toggleFavorite: (spotId: string) => Promise<void>;
  isFavorite: (spotId: string) => boolean;
  loadFavorites: () => Promise<void>;
}

async function readLocalFavorites(): Promise<string[]> {
  try {
    const raw =
      Platform.OS === 'web'
        ? typeof localStorage !== 'undefined'
          ? localStorage.getItem(FAVORITES_KEY)
          : null
        : await SecureStore.getItemAsync(FAVORITES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

async function writeLocalFavorites(ids: string[]): Promise<void> {
  const raw = JSON.stringify(ids);
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') localStorage.setItem(FAVORITES_KEY, raw);
    return;
  }
  await SecureStore.setItemAsync(FAVORITES_KEY, raw);
}

function parseFavoriteSpotIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((id): id is string => typeof id === 'string');
}

export async function mergeLocalFavoritesToCloud(userId: string): Promise<void> {
  const localIds = await readLocalFavorites();
  if (localIds.length === 0) return;

  const { data } = await supabase
    .from('profiles')
    .select('favorite_spot_ids')
    .eq('id', userId)
    .maybeSingle();

  const serverIds = parseFavoriteSpotIds(data?.favorite_spot_ids);
  if (serverIds.length > 0) return;

  await supabase
    .from('profiles')
    .upsert({ id: userId, favorite_spot_ids: localIds }, { onConflict: 'id' });
}

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
  favoriteIds: new Set(),

  isFavorite: (spotId) => get().favoriteIds.has(spotId),

  loadFavorites: async () => {
    const {
      data: { user },
    } = isSupabaseAuthEnabled() ? await supabase.auth.getUser() : { data: { user: null } };

    if (!user) {
      const ids = await readLocalFavorites();
      set({ favoriteIds: new Set(ids) });
      return;
    }

    const { data } = await supabase
      .from('profiles')
      .select('favorite_spot_ids')
      .eq('id', user.id)
      .maybeSingle();

    const ids = parseFavoriteSpotIds(data?.favorite_spot_ids);
    if (ids.length > 0) {
      await writeLocalFavorites(ids);
      set({ favoriteIds: new Set(ids) });
      return;
    }

    const localIds = await readLocalFavorites();
    set({ favoriteIds: new Set(localIds) });
  },

  toggleFavorite: async (spotId) => {
    const current = get().favoriteIds;
    const isFav = current.has(spotId);
    const next = new Set(current);
    if (isFav) next.delete(spotId);
    else next.add(spotId);
    set({ favoriteIds: next });

    const ids = [...next];
    await writeLocalFavorites(ids);

    if (!isSupabaseAuthEnabled()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('profiles')
      .upsert({ id: user.id, favorite_spot_ids: ids }, { onConflict: 'id' });
  },
}));
