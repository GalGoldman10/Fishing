import { create } from 'zustand';
import { isSupabaseAuthEnabled, usesDemoData } from '@/lib/config/env';
import { supabase } from '@/lib/api/supabase';
import type { Json } from '@/types/database';

interface TripStore {
  mockTrips: Array<{
    id: string;
    spotId: string;
    plannedStart: string;
    notificationEnabled: boolean;
  }>;
  addMockTrip: (trip: TripStore['mockTrips'][0]) => void;
}

export const useTripStore = create<TripStore>((set) => ({
  mockTrips: [],
  addMockTrip: (trip) => set((s) => ({ mockTrips: [...s.mockTrips, trip] })),
}));

export async function saveTripPlan(input: {
  spotId: string;
  plannedStart: string;
  plannedEnd?: string;
  targetSpeciesIds?: string[];
  selectedMethod?: string;
  equipmentChecklist?: Record<string, unknown>;
  notes?: string;
  notificationEnabled: boolean;
}): Promise<void> {
  if (!isSupabaseAuthEnabled() || usesDemoData()) {
    useTripStore.getState().addMockTrip({
      id: `trip-${Date.now()}`,
      spotId: input.spotId,
      plannedStart: input.plannedStart,
      notificationEnabled: input.notificationEnabled,
    });
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication required');

  const { error } = await supabase
    .from('trip_plans')
    .insert([{
      user_id: user.id,
      spot_id: input.spotId,
      planned_start: input.plannedStart,
      planned_end: input.plannedEnd ?? null,
      target_species_ids: input.targetSpeciesIds ?? [],
      selected_method: input.selectedMethod ?? null,
      equipment_checklist: (input.equipmentChecklist ?? {}) as Json,
      notes: input.notes ?? null,
      notification_enabled: input.notificationEnabled,
    }]);

  if (error) throw error;
}
