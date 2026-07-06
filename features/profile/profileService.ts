import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { isMockMode } from '@/lib/config/env';
import { supabase } from '@/lib/api/supabase';
import {
  DEFAULT_FISHING_SETUP,
  DEFAULT_PROFILE,
  FishingSetup,
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

function parseExperienceLevel(value: string | null | undefined): UserProfileData['experienceLevel'] {
  if (value === 'intermediate' || value === 'advanced') return value;
  return 'beginner';
}

function parseFishingSetup(raw: unknown): FishingSetup {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_FISHING_SETUP };
  const row = raw as Record<string, unknown>;
  return {
    rod: typeof row.rod === 'string' ? row.rod : '',
    reel: typeof row.reel === 'string' ? row.reel : '',
    mainLine: typeof row.mainLine === 'string' ? row.mainLine : '',
    leader: typeof row.leader === 'string' ? row.leader : '',
    hooks: typeof row.hooks === 'string' ? row.hooks : '',
    bait: typeof row.bait === 'string' ? row.bait : '',
    notes: typeof row.notes === 'string' ? row.notes : '',
  };
}

function toStoreData(row: {
  display_name?: string | null;
  avatar_url?: string | null;
  experience_level?: string | null;
  favorite_spot_id?: string | null;
  fishing_setup?: unknown;
}): Partial<UserProfileData> {
  return {
    displayName: row.display_name ?? '',
    avatarUri: row.avatar_url ?? null,
    experienceLevel: parseExperienceLevel(row.experience_level),
    favoriteSpotId: row.favorite_spot_id ?? null,
    fishingSetup: parseFishingSetup(row.fishing_setup),
  };
}

function toProfileRow(profile: UserProfileData, userId: string) {
  return {
    id: userId,
    display_name: profile.displayName || null,
    avatar_url: profile.avatarUri,
    experience_level: profile.experienceLevel,
    favorite_spot_id: profile.favoriteSpotId,
    fishing_setup: profile.fishingSetup,
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
        const merged: UserProfileData = {
          ...base,
          ...toStoreData(data),
        };
        useProfileStore.getState().hydrate(merged);
        await writeStoredProfile(merged);
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

  await supabase.from('profiles').upsert(toProfileRow(next, user.id), { onConflict: 'id' });
}

export async function clearProfile(): Promise<void> {
  useProfileStore.getState().reset();
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(PROFILE_STORAGE_KEY);
  } else {
    await SecureStore.deleteItemAsync(PROFILE_STORAGE_KEY);
  }
}
