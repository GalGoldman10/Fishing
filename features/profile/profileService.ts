import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { isSupabaseAuthEnabled } from '@/lib/config/env';
import { supabase } from '@/lib/api/supabase';
import { uploadProfileAvatar } from '@/features/profile/avatarStorage';
import {
  DEFAULT_FISHING_SETUP,
  DEFAULT_PROFILE,
  FishingSetup,
  UserProfileData,
  useProfileStore,
} from '@/stores/profileStore';
import type { Json } from '@/types/database';

const PROFILE_STORAGE_KEY = 'fishguide_user_profile';

export async function readLocalProfileSnapshot(): Promise<UserProfileData | null> {
  return readStoredProfile();
}

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

function isEmptyFishingSetup(setup: FishingSetup): boolean {
  return !Object.values(setup).some((value) => value.trim().length > 0);
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
    fishing_setup: { ...profile.fishingSetup } as Json,
  };
}

function isDefaultServerProfile(row: {
  display_name?: string | null;
  avatar_url?: string | null;
  favorite_spot_id?: string | null;
  fishing_setup?: unknown;
  experience_level?: string | null;
}): boolean {
  const setup = parseFishingSetup(row.fishing_setup);
  return (
    !row.display_name &&
    !row.avatar_url &&
    !row.favorite_spot_id &&
    isEmptyFishingSetup(setup) &&
    (row.experience_level ?? 'beginner') === 'beginner'
  );
}

function hasMeaningfulLocalProfile(local: UserProfileData): boolean {
  return Boolean(
    local.displayName.trim() ||
      local.avatarUri ||
      local.favoriteSpotId ||
      local.experienceLevel !== 'beginner' ||
      !isEmptyFishingSetup(local.fishingSetup),
  );
}

export async function mergeLocalProfileToCloud(userId: string): Promise<void> {
  const local = await readStoredProfile();
  if (!local || !hasMeaningfulLocalProfile(local)) return;

  const { data: row } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (row && !isDefaultServerProfile(row)) return;

  let avatarUri = local.avatarUri;
  if (avatarUri && !avatarUri.startsWith('http')) {
    try {
      avatarUri = await uploadProfileAvatar(userId, avatarUri);
    } catch {
      avatarUri = null;
    }
  }

  await supabase
    .from('profiles')
    .upsert(toProfileRow({ ...local, avatarUri }, userId), { onConflict: 'id' });
}

export async function hydrateProfile(): Promise<void> {
  const local = await readStoredProfile();
  const base = local ?? DEFAULT_PROFILE;

  if (isSupabaseAuthEnabled()) {
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

  if (!isSupabaseAuthEnabled()) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  let avatarUri = next.avatarUri;
  if (avatarUri && !avatarUri.startsWith('http')) {
    avatarUri = await uploadProfileAvatar(user.id, avatarUri);
  }

  await supabase
    .from('profiles')
    .upsert(toProfileRow({ ...next, avatarUri }, user.id), { onConflict: 'id' });

  if (avatarUri !== next.avatarUri) {
    const saved = { ...next, avatarUri };
    useProfileStore.getState().hydrate(saved);
    await writeStoredProfile(saved);
  }
}

export async function clearProfile(): Promise<void> {
  useProfileStore.getState().reset();
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(PROFILE_STORAGE_KEY);
  } else {
    await SecureStore.deleteItemAsync(PROFILE_STORAGE_KEY);
  }
}
