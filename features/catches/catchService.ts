import { create } from 'zustand';
import { CatchLogEntry } from '@/types/fishing';
import { isMockMode } from '@/lib/config/env';
import { supabase } from '@/lib/api/supabase';

interface CatchStore {
  catches: CatchLogEntry[];
  addCatch: (entry: CatchLogEntry) => void;
}

export const useCatchStore = create<CatchStore>((set) => ({
  catches: [],
  addCatch: (entry) => set((s) => ({ catches: [entry, ...s.catches] })),
}));

export async function logCatch(input: {
  caughtAt: string;
  speciesName?: string;
  speciesId?: string;
  spotId?: string;
  estimatedLength?: number;
  estimatedWeight?: number;
  baitOrLure?: string;
  fishingMethod?: string;
  released: boolean;
  notes?: string;
}): Promise<void> {
  if (isMockMode()) {
    useCatchStore.getState().addCatch({
      id: `catch-${Date.now()}`,
      userId: 'guest',
      speciesName: input.speciesName,
      speciesId: input.speciesId,
      spotId: input.spotId,
      caughtAt: input.caughtAt,
      estimatedLength: input.estimatedLength,
      estimatedWeight: input.estimatedWeight,
      baitOrLure: input.baitOrLure,
      fishingMethod: input.fishingMethod,
      released: input.released,
      notes: input.notes,
      visibility: 'private',
    });
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication required');

  const { error } = await supabase
    .from('catch_logs')
    .insert([{
      user_id: user.id,
      species_id: input.speciesId ?? null,
      spot_id: input.spotId ?? null,
      caught_at: input.caughtAt,
      estimated_length: input.estimatedLength ?? null,
      estimated_weight: input.estimatedWeight ?? null,
      bait_or_lure: input.baitOrLure ?? null,
      fishing_method: input.fishingMethod ?? null,
      released: input.released,
      notes: input.notes ?? null,
      visibility: 'private',
    }]);

  if (error) throw error;
}
