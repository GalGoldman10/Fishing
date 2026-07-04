import { createClient } from 'npm:@supabase/supabase-js@2';

export function getServiceClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
}

export async function checkRateLimit(identifier: string, endpoint: string, maxRequests = 20): Promise<boolean> {
  try {
    const supabase = getServiceClient();
    const windowStart = new Date();
    windowStart.setMinutes(windowStart.getMinutes() - 60);

    const { data, error } = await supabase
      .from('rate_limits')
      .select('request_count')
      .eq('identifier', identifier)
      .eq('endpoint', endpoint)
      .gte('window_start', windowStart.toISOString())
      .maybeSingle();

    if (error) {
      console.warn('rate_limits query failed, allowing request:', error.message);
      return true;
    }

    if (data && data.request_count >= maxRequests) return false;

    const { error: upsertError } = await supabase.from('rate_limits').upsert({
      identifier,
      endpoint,
      request_count: (data?.request_count ?? 0) + 1,
      window_start: new Date().toISOString(),
    }, { onConflict: 'identifier,endpoint' });

    if (upsertError) {
      console.warn('rate_limits upsert failed, allowing request:', upsertError.message);
    }

    return true;
  } catch (err) {
    console.warn('checkRateLimit failed, allowing request:', err);
    return true;
  }
}

export async function executeTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const supabase = getServiceClient();

  switch (name) {
    case 'search_fishing_spots':
      return supabase.rpc('search_fishing_spots', {
        p_query: args.query ?? null,
        p_lat: args.latitude ?? null,
        p_lng: args.longitude ?? null,
        p_radius_km: args.radiusKm ?? 25,
      }).then((r) => r.data);

    case 'get_fishing_spot_details':
      return supabase.rpc('get_fishing_spot_details', {
        p_spot_id: args.spotId,
      }).then((r) => r.data);

    case 'get_nearby_spots':
      return supabase.rpc('get_nearby_spots', {
        p_lat: args.latitude,
        p_lng: args.longitude,
        p_radius_km: args.radiusKm ?? 25,
      }).then((r) => r.data);

    case 'search_species': {
      const q = args.speciesName as string;
      return supabase.from('species')
        .select('*')
        .or(`common_name.ilike.%${q}%,scientific_name.ilike.%${q}%`)
        .limit(20)
        .then((r) => r.data);
    }

    case 'get_regulations':
      return supabase.from('regulations')
        .select('*, sources(*)')
        .eq('country_code', args.country ?? 'IL')
        .limit(20)
        .then((r) => r.data);

    case 'get_environmental_conditions':
      return {
        provider: 'mock',
        summary: 'Conditions retrieved from cache or mock provider',
        suitability: 'unknown',
        retrievedAt: new Date().toISOString(),
      };

    case 'build_equipment_setup':
      return supabase.from('equipment_recommendations')
        .select('*')
        .eq('spot_id', args.spotId ?? '')
        .limit(5)
        .then((r) => r.data);

    default:
      return { error: `Unknown tool: ${name}` };
  }
}
