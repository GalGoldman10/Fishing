import { create } from 'zustand';
import { ExperienceLevel } from '@/types/fishing';

export interface FishingSetup {
  rod: string;
  reel: string;
  mainLine: string;
  leader: string;
  hooks: string;
  bait: string;
  notes: string;
}

export interface UserProfileData {
  displayName: string;
  avatarUri: string | null;
  experienceLevel: ExperienceLevel;
  favoriteSpotId: string | null;
  fishingSetup: FishingSetup;
}

export const DEFAULT_FISHING_SETUP: FishingSetup = {
  rod: '',
  reel: '',
  mainLine: '',
  leader: '',
  hooks: '',
  bait: '',
  notes: '',
};

export const DEFAULT_PROFILE: UserProfileData = {
  displayName: '',
  avatarUri: null,
  experienceLevel: 'beginner',
  favoriteSpotId: null,
  fishingSetup: { ...DEFAULT_FISHING_SETUP },
};

interface ProfileStore extends UserProfileData {
  hydrated: boolean;
  setProfile: (patch: Partial<UserProfileData>) => void;
  setFishingSetup: (patch: Partial<FishingSetup>) => void;
  hydrate: (data: UserProfileData) => void;
  reset: () => void;
}

export const useProfileStore = create<ProfileStore>((set) => ({
  ...DEFAULT_PROFILE,
  hydrated: false,

  setProfile: (patch) => set((state) => ({ ...state, ...patch })),

  setFishingSetup: (patch) =>
    set((state) => ({
      fishingSetup: { ...state.fishingSetup, ...patch },
    })),

  hydrate: (data) => set({ ...data, hydrated: true }),

  reset: () => set({ ...DEFAULT_PROFILE, fishingSetup: { ...DEFAULT_FISHING_SETUP }, hydrated: true }),
}));
