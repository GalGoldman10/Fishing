import { supabase } from '@/lib/api/supabase';
import { useAuthStore } from '@/stores/authStore';
import { isSupabaseAuthEnabled } from '@/lib/config/env';
import { hydrateProfile, clearProfile } from '@/features/profile/profileService';
import { useFavoritesStore } from '@/features/spots/favoritesService';
import { useLanguageStore } from '@/stores/languageStore';
import { mergeGuestDataToCloud } from '@/features/auth/userDataSync';
import { loadCatches } from '@/features/catches/catchService';

export interface SignUpResult {
  needsEmailConfirmation: boolean;
}

export async function syncUserDataAfterAuth(): Promise<void> {
  await mergeGuestDataToCloud();
  await hydrateProfile();
  await useFavoritesStore.getState().loadFavorites();
  await useLanguageStore.getState().hydrate();
  await loadCatches();
}

export function setupAuthStateListener(): () => void {
  if (!isSupabaseAuthEnabled()) return () => {};

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (event, session) => {
    useAuthStore.getState().setSession(session);

    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      await syncUserDataAfterAuth();
    }

    if (event === 'SIGNED_OUT') {
      await clearProfile();
      await useFavoritesStore.getState().loadFavorites();
    }
  });

  return () => subscription.unsubscribe();
}

export async function restoreSession(): Promise<void> {
  const { setSession, setLoading } = useAuthStore.getState();
  setLoading(true);

  if (!isSupabaseAuthEnabled()) {
    setLoading(false);
    return;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  setSession(session);
}

export async function signIn(email: string, password: string): Promise<void> {
  if (!isSupabaseAuthEnabled()) {
    useAuthStore.getState().setGuest(true);
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  useAuthStore.getState().setSession(data.session);
  await syncUserDataAfterAuth();
}

export async function signUp(
  email: string,
  password: string,
  displayName: string,
): Promise<SignUpResult> {
  if (!isSupabaseAuthEnabled()) {
    useAuthStore.getState().setGuest(true);
    return { needsEmailConfirmation: false };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  });
  if (error) throw error;

  if (data.session) {
    useAuthStore.getState().setSession(data.session);
    await syncUserDataAfterAuth();
    return { needsEmailConfirmation: false };
  }

  useAuthStore.getState().setLoading(false);
  return { needsEmailConfirmation: true };
}

export async function signOut(): Promise<void> {
  if (isSupabaseAuthEnabled()) {
    await supabase.auth.signOut();
  }
  useAuthStore.getState().signOut();
  await clearProfile();
  await useFavoritesStore.getState().loadFavorites();
}

export async function deleteAccount(): Promise<void> {
  if (!isSupabaseAuthEnabled()) {
    useAuthStore.getState().signOut();
    return;
  }

  const { error } = await supabase.functions.invoke('account-delete');
  if (error) throw error;
  useAuthStore.getState().signOut();
  await clearProfile();
}
