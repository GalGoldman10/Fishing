import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { checkRateLimit, getServiceClient } from '../_shared/tools.ts';
import { runFishIdentify } from '../_shared/fish-identify-runner.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let language: 'en' | 'he' = 'en';

  try {
    const body = await req.json();
    const { imageBase64, mimeType = 'image/jpeg' } = body;
    language = body.language === 'he' ? 'he' : 'en';

    if (!imageBase64 || typeof imageBase64 !== 'string' || imageBase64.length < 100) {
      return new Response(JSON.stringify({ status: 'error', errorMessage: 'Invalid image' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (imageBase64.length > 6_000_000) {
      return new Response(JSON.stringify({ status: 'error', errorMessage: 'Image too large' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      return new Response(
        JSON.stringify({
          status: 'error',
          errorMessage:
            language === 'he'
              ? 'זיהוי דגים לא מוגדר בשרת.'
              : 'Fish identification is not configured on the server.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    let userId: string | null = null;
    try {
      const supabase = getServiceClient();
      const authHeader = req.headers.get('Authorization');
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        userId = user?.id ?? null;
      }

      const rateLimitId = userId ?? req.headers.get('x-forwarded-for') ?? 'anonymous';
      const allowed = await checkRateLimit(rateLimitId, 'fish-identify', userId ? 30 : 8);
      if (!allowed) {
        return new Response(JSON.stringify({ status: 'error', errorMessage: 'Rate limit exceeded' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } catch (err) {
      console.warn('Rate limit check failed, continuing:', err);
    }

    const result = await runFishIdentify({
      imageBase64,
      mimeType,
      language,
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('fish-identify error:', err);
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({
        status: 'error',
        errorMessage:
          language === 'he'
            ? `שגיאה בזיהוי: ${msg.slice(0, 200)}`
            : `Identification error: ${msg.slice(0, 200)}`,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
