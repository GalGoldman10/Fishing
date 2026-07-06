import { supabase } from '@/lib/api/supabase';
import { isSupabaseAuthEnabled } from '@/lib/config/env';
import { mergeLocalProfileToCloud, readLocalProfileSnapshot } from '@/features/profile/profileService';
import { mergeLocalFavoritesToCloud } from '@/features/spots/favoritesService';

/** Push device-local profile and favorites to Supabase when the cloud row is still empty. */
export async function mergeGuestDataToCloud(): Promise<void> {
  if (!isSupabaseAuthEnabled()) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await mergeLocalProfileToCloud(user.id);
  await mergeLocalFavoritesToCloud(user.id);
}

export async function hasPendingGuestProfileData(): Promise<boolean> {
  const local = await readLocalProfileSnapshot();
  if (!local) return false;
  return Boolean(
    local.displayName.trim() ||
      local.avatarUri ||
      local.favoriteSpotId ||
      Object.values(local.fishingSetup).some((v) => v.trim().length > 0),
  );
}
