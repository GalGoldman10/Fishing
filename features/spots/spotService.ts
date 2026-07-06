import { isMockMode } from '@/lib/config/env';
import { DEMO_SPOTS, DEMO_SPECIES, DEMO_CONDITIONS, getDemoSpotDetails, getDemoSpeciesDetails } from '@/lib/mock/demoData';
import { getSpeciesProfile } from '@/lib/mock/speciesProfiles';
import { resolveSpeciesGuideId } from '@/lib/mock/mediterraneanFishGuide';
import { supabase } from '@/lib/api/supabase';
import {
  FishingSpotSummary,
  FishingSpotDetails,
  SpeciesSummary,
  SpeciesDetails,
  MarineConditions,
  SpotFilters,
} from '@/types/fishing';

import { haversineKm, formatDistance } from '@/lib/utils/distance';
import { applyOverrides, loadOverrides } from '@/features/spots/spotOverridesService';

export { formatDistance };

export async function searchSpots(params: {
  query?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  filters?: SpotFilters;
}): Promise<FishingSpotSummary[]> {
  if (isMockMode()) {
    // Admin coordinate corrections apply on top of the demo records.
    const overrides = await loadOverrides();
    let results = applyOverrides([...DEMO_SPOTS], overrides);
    if (params.query) {
      const q = params.query.toLowerCase();
      results = results.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.region?.toLowerCase().includes(q) ||
          s.localizedNames?.he?.includes(params.query!),
      );
    }
    if (params.latitude && params.longitude) {
      results = results
        .map((s) => ({
          ...s,
          distanceKm: haversineKm(params.latitude!, params.longitude!, s.latitude, s.longitude),
        }))
        .filter((s) => !params.radiusKm || (s.distanceKm ?? 0) <= params.radiusKm)
        .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
    }
    if (params.filters?.shoreTypes?.length) {
      results = results.filter((s) => params.filters!.shoreTypes!.includes(s.shoreType));
    }
    if (params.filters?.verifiedOnly) {
      results = results.filter((s) => s.verificationStatus === 'verified');
    }
    if (params.filters?.beginnerFriendly) {
      results = results.filter((s) => s.difficultyLevel === 'easy');
    }
    return results;
  }

  const { data, error } = await supabase.rpc('search_fishing_spots', {
    p_query: params.query ?? null,
    p_lat: params.latitude ?? null,
    p_lng: params.longitude ?? null,
    p_radius_km: params.radiusKm ?? 25,
  } as never);

  if (error) throw error;
  return (data ?? []) as unknown as FishingSpotSummary[];
}

export async function getSpotById(id: string): Promise<FishingSpotDetails | null> {
  if (isMockMode()) {
    const details = getDemoSpotDetails(id);
    if (!details) return null;
    const overrides = await loadOverrides();
    return applyOverrides([details], overrides)[0];
  }

  const { data, error } = await supabase.rpc('get_fishing_spot_details', { p_spot_id: id } as never);
  if (error) throw error;
  return data as FishingSpotDetails | null;
}

export async function getNearbySpots(
  latitude: number,
  longitude: number,
  radiusKm = 25,
  filters?: SpotFilters,
): Promise<FishingSpotSummary[]> {
  return searchSpots({ latitude, longitude, radiusKm, filters });
}

export async function searchSpecies(query?: string): Promise<SpeciesSummary[]> {
  if (isMockMode()) {
    if (!query) return DEMO_SPECIES;
    const q = query.toLowerCase().trim();
    return DEMO_SPECIES.filter((s) => {
      const profile = getSpeciesProfile(s.id);
      return (
        s.commonName.toLowerCase().includes(q) ||
        s.scientificName?.toLowerCase().includes(q) ||
        s.localizedNames?.he?.includes(query.trim()) ||
        s.localizedNames?.en?.toLowerCase().includes(q) ||
        profile?.aliases.some((alias) => alias.toLowerCase().includes(q) || alias.includes(query.trim()))
      );
    });
  }

  const { data, error } = await supabase
    .from('species')
    .select('id, common_name, scientific_name, localized_names, habitat, environment_types, conservation_status')
    .or(`common_name.ilike.%${query}%,scientific_name.ilike.%${query}%`)
    .limit(50);

  if (error) throw error;
  return (data ?? []).map(mapSpeciesRow);
}

export async function getSpeciesById(id: string): Promise<SpeciesDetails | null> {
  if (isMockMode()) return getDemoSpeciesDetails(id) ?? getDemoSpeciesDetails(resolveSpeciesGuideId(id));

  const { data, error } = await supabase.from('species').select('*').eq('id', id).single();
  if (error) return null;
  return mapSpeciesDetailsRow(data);
}

export async function getConditions(
  latitude: number,
  longitude: number,
): Promise<MarineConditions> {
  if (isMockMode()) return { ...DEMO_CONDITIONS, retrievedAt: new Date().toISOString() };

  const { data, error } = await supabase.functions.invoke('marine-conditions', {
    body: { latitude, longitude, dateTime: new Date().toISOString() },
  });

  if (error) throw error;
  return data as MarineConditions;
}

function mapSpeciesRow(row: Record<string, unknown>): SpeciesSummary {
  return {
    id: row.id as string,
    commonName: row.common_name as string,
    scientificName: row.scientific_name as string | undefined,
    localizedNames: row.localized_names as SpeciesSummary['localizedNames'],
    habitat: row.habitat as string | undefined,
    environmentTypes: (row.environment_types as string[]) ?? [],
    conservationStatus: row.conservation_status as string | undefined,
  };
}

function mapSpeciesDetailsRow(row: Record<string, unknown>): SpeciesDetails {
  return {
    ...mapSpeciesRow(row),
    aliases: row.aliases as string[] | undefined,
    description: row.description as string | undefined,
    identificationNotes: row.identification_notes as string | undefined,
    preferredDepthMin: row.preferred_depth_min as number | undefined,
    preferredDepthMax: row.preferred_depth_max as number | undefined,
    activeTimes: row.active_times as string[] | undefined,
    handlingNotes: row.handling_notes as string | undefined,
    consumptionWarning: row.consumption_warning as string | undefined,
  };
}
