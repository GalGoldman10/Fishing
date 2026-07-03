import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Server-side marine data proxy.
// Provider API keys (MARINE_API_KEY / WEATHER_API_KEY / TIDE_API_KEY) stay on
// the server and are never exposed to the frontend. The default provider is
// Open-Meteo, which requires no key; a premium provider can be plugged in by
// setting MARINE_CONDITIONS_PROVIDER and the relevant key.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MARINE_HOURLY = [
  'wave_height',
  'wave_period',
  'wave_direction',
  'swell_wave_height',
  'swell_wave_period',
  'swell_wave_direction',
  'sea_surface_temperature',
  'ocean_current_velocity',
  'ocean_current_direction',
  'sea_level_height_msl',
].join(',');

const WEATHER_HOURLY = [
  'temperature_2m',
  'wind_speed_10m',
  'wind_gusts_10m',
  'wind_direction_10m',
  'precipitation_probability',
  'surface_pressure',
  'visibility',
].join(',');

async function fetchJson(url: string, timeoutMs = 8000): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`upstream status ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

function isValidCoordinates(latitude: unknown, longitude: unknown): boolean {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let body: { latitude?: unknown; longitude?: unknown };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid-request' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { latitude, longitude } = body;
  if (!isValidCoordinates(latitude, longitude)) {
    return new Response(JSON.stringify({ error: 'invalid-coordinates' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const marineUrl =
      `https://marine-api.open-meteo.com/v1/marine?latitude=${latitude}&longitude=${longitude}` +
      `&hourly=${MARINE_HOURLY}&timezone=auto&forecast_days=3`;
    const weatherUrl =
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
      `&hourly=${WEATHER_HOURLY}&daily=sunrise,sunset&wind_speed_unit=kmh&timezone=auto&forecast_days=3`;

    // The marine endpoint may have no data for inland water; weather is required.
    const [marine, weather] = await Promise.all([
      fetchJson(marineUrl).catch(() => null),
      fetchJson(weatherUrl),
    ]);

    return new Response(
      JSON.stringify({
        provider: 'open-meteo',
        retrievedAt: new Date().toISOString(),
        marine,
        weather,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch {
    // Never leak upstream errors or stack traces to clients.
    return new Response(JSON.stringify({ error: 'marine-data-unavailable' }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
