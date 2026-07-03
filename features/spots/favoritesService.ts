import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { create } from 'zustand';
import { isMockMode } from '@/lib/config/env';
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

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
  favoriteIds: new Set(),

  isFavorite: (spotId) => get().favoriteIds.has(spotId),

  loadFavorites: async () => {
    if (isMockMode()) {
      const ids = await readLocalFavorites();
      set({ favoriteIds: new Set(ids) });
      return;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      const ids = await readLocalFavorites();
      set({ favoriteIds: new Set(ids) });
      return;
    }
    const { data } = await supabase.from('favorites').select('spot_id').eq('user_id', user.id);
    set({ favoriteIds: new Set((data ?? []).map((f) => f.spot_id)) });
  },

  toggleFavorite: async (spotId) => {
    const current = get().favoriteIds;
    const isFav = current.has(spotId);
    const next = new Set(current);
    if (isFav) next.delete(spotId);
    else next.add(spotId);
    set({ favoriteIds: next });

    await writeLocalFavorites([...next]);

    if (isMockMode()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (isFav) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('spot_id', spotId);
    } else {
      await supabase.from('favorites').insert([{ user_id: user.id, spot_id: spotId }]);
    }
  },
}));
