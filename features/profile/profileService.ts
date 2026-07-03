import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { isMockMode } from '@/lib/config/env';
import { supabase } from '@/lib/api/supabase';
import {
  DEFAULT_PROFILE,
  UserProfileData,
  useProfileStore,
} from '@/stores/profileStore';

const PROFILE_STORAGE_KEY = 'fishguide_user_profile';

async function readStoredProfile(): Promise<UserProfileData | null> {
  try {
    const raw =
      Platform.OS === 'web'
        ? typeof localStorage !== 'undefined'
          ? localStorage.getItem(PROFILE_STORAGE_KEY)
          : null
        : await SecureStore.getItemAsync(PROFILE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfileData;
  } catch {
    return null;
  }
}

async function writeStoredProfile(profile: UserProfileData): Promise<void> {
  const raw = JSON.stringify(profile);
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') localStorage.setItem(PROFILE_STORAGE_KEY, raw);
    return;
  }
  await SecureStore.setItemAsync(PROFILE_STORAGE_KEY, raw);
}

function toStoreData(row: {
  display_name?: string | null;
  avatar_url?: string | null;
  experience_level?: string | null;
}): Partial<UserProfileData> {
  return {
    displayName: row.display_name ?? '',
    avatarUri: row.avatar_url ?? null,
    experienceLevel:
      row.experience_level === 'intermediate' || row.experience_level === 'advanced'
        ? row.experience_level
        : 'beginner',
  };
}

export async function hydrateProfile(): Promise<void> {
  const local = await readStoredProfile();
  const base = local ?? DEFAULT_PROFILE;

  if (!isMockMode()) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (data) {
        useProfileStore.getState().hydrate({
          ...base,
          ...toStoreData(data),
        });
        return;
      }
    }
  }

  useProfileStore.getState().hydrate(base);
}

export async function saveProfile(patch: Partial<UserProfileData>): Promise<void> {
  const current = useProfileStore.getState();
  const next: UserProfileData = {
    displayName: patch.displayName ?? current.displayName,
    avatarUri: patch.avatarUri !== undefined ? patch.avatarUri : current.avatarUri,
    experienceLevel: patch.experienceLevel ?? current.experienceLevel,
    favoriteSpotId: patch.favoriteSpotId !== undefined ? patch.favoriteSpotId : current.favoriteSpotId,
    fishingSetup: patch.fishingSetup ?? current.fishingSetup,
  };

  useProfileStore.getState().hydrate(next);
  await writeStoredProfile(next);

  if (isMockMode()) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from('profiles')
    .update({
      display_name: next.displayName || null,
      avatar_url: next.avatarUri,
      experience_level: next.experienceLevel,
    })
    .eq('id', user.id);
}

export async function clearProfile(): Promise<void> {
  useProfileStore.getState().reset();
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(PROFILE_STORAGE_KEY);
  } else {
    await SecureStore.deleteItemAsync(PROFILE_STORAGE_KEY);
  }
}
