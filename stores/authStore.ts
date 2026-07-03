import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: User | null;
  isGuest: boolean;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  setGuest: (isGuest: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isGuest: false,
  isLoading: true,
  setSession: (session) =>
    set({ session, user: session?.user ?? null, isGuest: false, isLoading: false }),
  setGuest: (isGuest) => set({ isGuest, session: null, user: null, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  signOut: () => set({ session: null, user: null, isGuest: false }),
}));
