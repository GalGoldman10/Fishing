import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { create } from 'zustand';
import { CatchLogEntry } from '@/types/fishing';
import { isSupabaseAuthEnabled, usesDemoData } from '@/lib/config/env';
import { supabase } from '@/lib/api/supabase';

const CATCHES_KEY = 'fishguide_catches';

interface CatchStore {
  catches: CatchLogEntry[];
  setCatches: (catches: CatchLogEntry[]) => void;
  addCatch: (entry: CatchLogEntry) => void;
}

export const useCatchStore = create<CatchStore>((set) => ({
  catches: [],
  setCatches: (catches) => set({ catches }),
  addCatch: (entry) => set((s) => ({ catches: [entry, ...s.catches] })),
}));

async function readLocalCatches(): Promise<CatchLogEntry[]> {
  try {
    const raw =
      Platform.OS === 'web'
        ? typeof localStorage !== 'undefined'
          ? localStorage.getItem(CATCHES_KEY)
          : null
        : await SecureStore.getItemAsync(CATCHES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CatchLogEntry[];
  } catch {
    return [];
  }
}

async function writeLocalCatches(catches: CatchLogEntry[]): Promise<void> {
  const raw = JSON.stringify(catches);
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') localStorage.setItem(CATCHES_KEY, raw);
    return;
  }
  await SecureStore.setItemAsync(CATCHES_KEY, raw);
}

function mapRow(row: {
  id: string;
  user_id: string;
  species_id: string | null;
  species_name: string | null;
  spot_id: string | null;
  caught_at: string;
  estimated_length: number | null;
  estimated_weight: number | null;
  bait_or_lure: string | null;
  fishing_method: string | null;
  released: boolean | null;
  notes: string | null;
  visibility: string;
}): CatchLogEntry {
  return {
    id: row.id,
    userId: row.user_id,
    speciesId: row.species_id ?? undefined,
    speciesName: row.species_name ?? undefined,
    spotId: row.spot_id ?? undefined,
    caughtAt: row.caught_at,
    estimatedLength: row.estimated_length ?? undefined,
    estimatedWeight: row.estimated_weight ?? undefined,
    baitOrLure: row.bait_or_lure ?? undefined,
    fishingMethod: row.fishing_method ?? undefined,
    released: row.released ?? true,
    notes: row.notes ?? undefined,
    visibility: row.visibility as CatchLogEntry['visibility'],
  };
}

export async function loadCatches(): Promise<void> {
  if (!isSupabaseAuthEnabled()) {
    useCatchStore.getState().setCatches(await readLocalCatches());
    return;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    useCatchStore.getState().setCatches(await readLocalCatches());
    return;
  }

  const { data, error } = await supabase
    .from('catch_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('caught_at', { ascending: false });

  if (error || !data) {
    useCatchStore.getState().setCatches(await readLocalCatches());
    return;
  }

  useCatchStore.getState().setCatches(data.map(mapRow));
}

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
  const {
    data: { user },
  } = isSupabaseAuthEnabled() ? await supabase.auth.getUser() : { data: { user: null } };

  if (!user) {
    const entry: CatchLogEntry = {
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
    };
    const next = [entry, ...(await readLocalCatches())];
    await writeLocalCatches(next);
    useCatchStore.getState().addCatch(entry);
    return;
  }

  const { data, error } = await supabase
    .from('catch_logs')
    .insert([
      {
        user_id: user.id,
        species_id: input.speciesId ?? null,
        species_name: input.speciesName ?? null,
        spot_id: usesDemoData() ? null : (input.spotId ?? null),
        caught_at: input.caughtAt,
        estimated_length: input.estimatedLength ?? null,
        estimated_weight: input.estimatedWeight ?? null,
        bait_or_lure: input.baitOrLure ?? null,
        fishing_method: input.fishingMethod ?? null,
        released: input.released,
        notes: input.notes ?? null,
        visibility: 'private',
      },
    ])
    .select('*')
    .single();

  if (error) throw error;
  if (data) {
    useCatchStore.getState().addCatch(mapRow(data));
  }
}
