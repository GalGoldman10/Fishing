import { supabase } from '@/lib/api/supabase';
import { useAuthStore } from '@/stores/authStore';
import { isMockMode } from '@/lib/config/env';

export async function restoreSession(): Promise<void> {
  const { setSession, setLoading } = useAuthStore.getState();
  setLoading(true);

  if (isMockMode()) {
    setLoading(false);
    return;
  }

  const { data: { session } } = await supabase.auth.getSession();
  setSession(session);
}

export async function signIn(email: string, password: string): Promise<void> {
  if (isMockMode()) {
    useAuthStore.getState().setGuest(true);
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  useAuthStore.getState().setSession(data.session);
}

export async function signUp(email: string, password: string, displayName: string): Promise<void> {
  if (isMockMode()) {
    useAuthStore.getState().setGuest(true);
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  });
  if (error) throw error;
  useAuthStore.getState().setSession(data.session);
}

export async function signOut(): Promise<void> {
  if (!isMockMode()) {
    await supabase.auth.signOut();
  }
  useAuthStore.getState().signOut();
}

export async function deleteAccount(): Promise<void> {
  if (isMockMode()) {
    useAuthStore.getState().signOut();
    return;
  }

  const { error } = await supabase.functions.invoke('account-delete');
  if (error) throw error;
  useAuthStore.getState().signOut();
}
