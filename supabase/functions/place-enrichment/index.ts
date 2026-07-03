import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const USER_AGENT = 'FishGuideAI/1.0';

interface NominatimResult {
  display_name?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    country?: string;
  };
}

async function nominatimReverse(lat: number, lng: number): Promise<NominatimResult | null> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=14&addressdetails=1`,
    { headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' } },
  );
  if (!res.ok) return null;
  return res.json();
}

async function overpassNearby(lat: number, lng: number) {
  const query = `
    [out:json][timeout:15];
    (
      node["natural"="beach"](around:2000,${lat},${lng});
      way["natural"="beach"](around:2000,${lat},${lng});
      node["man_made"="pier"](around:2000,${lat},${lng});
      way["man_made"="pier"](around:2000,${lat},${lng});
      node["leisure"="marina"](around:2000,${lat},${lng});
      node["harbour"](around:2000,${lat},${lng});
      node["natural"="coastline"](around:1500,${lat},${lng});
    );
    out center 12;
  `;

  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.elements ?? []).map((el: Record<string, unknown>) => ({
    name: (el.tags as Record<string, string>)?.name ?? 'Unnamed feature',
    type:
      (el.tags as Record<string, string>)?.natural ??
      (el.tags as Record<string, string>)?.man_made ??
      (el.tags as Record<string, string>)?.leisure ??
      'coastal',
  }));
}

async function wikipediaSummary(lat: number, lng: number, spotName: string, lang: string) {
  const wikiLang = lang === 'he' ? 'he' : 'en';
  const geoRes = await fetch(
    `https://${wikiLang}.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat}|${lng}&gsradius=3000&gslimit=1&format=json`,
  );
  const geo = await geoRes.json();
  const title = geo?.query?.geosearch?.[0]?.title ?? spotName;

  const sumRes = await fetch(
    `https://${wikiLang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
    { headers: { Accept: 'application/json' } },
  );
  if (!sumRes.ok) return null;
  return sumRes.json();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { latitude, longitude, spotName, language = 'en' } = await req.json();

    const [nominatim, features, wiki] = await Promise.all([
      nominatimReverse(latitude, longitude),
      overpassNearby(latitude, longitude),
      wikipediaSummary(latitude, longitude, spotName, language),
    ]);

    const terrainHints: string[] = [];
    for (const f of features) {
      const t = String(f.type).toLowerCase();
      if (t.includes('beach')) terrainHints.push('Beach area on OpenStreetMap');
      if (t.includes('pier')) terrainHints.push('Pier structure on OpenStreetMap');
      if (t.includes('marina') || t.includes('harbour')) terrainHints.push('Marina/harbour on OpenStreetMap');
    }

    const sources = [
      { provider: 'nominatim', title: 'OpenStreetMap Nominatim', url: 'https://www.openstreetmap.org', fetchedAt: new Date().toISOString() },
      { provider: 'openstreetmap', title: 'OpenStreetMap Overpass', url: 'https://www.openstreetmap.org', fetchedAt: new Date().toISOString() },
    ];

    if (wiki?.extract) {
      sources.push({
        provider: 'wikipedia',
        title: `Wikipedia`,
        url: wiki?.content_urls?.desktop?.page,
        fetchedAt: new Date().toISOString(),
      });
    }

    return new Response(
      JSON.stringify({
        placeName: wiki?.title ?? spotName,
        summary: wiki?.extract ?? `Location near ${nominatim?.display_name ?? spotName}. Data from OpenStreetMap.`,
        description: wiki?.description,
        wikipediaUrl: wiki?.content_urls?.desktop?.page,
        address: nominatim?.display_name,
        municipality: nominatim?.address?.municipality ?? nominatim?.address?.city ?? nominatim?.address?.town,
        region: nominatim?.address?.state,
        country: nominatim?.address?.country,
        nearbyFeatures: features.slice(0, 8),
        terrainHints: [...new Set(terrainHints)],
        sources,
        fetchedAt: new Date().toISOString(),
        confidence: wiki?.extract ? 'medium' : 'low',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Enrichment failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
