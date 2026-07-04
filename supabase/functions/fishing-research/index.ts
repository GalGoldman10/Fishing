import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { runServerResearch } from '../_shared/research/orchestrator.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { question, language = 'en', locationHint, location, spotId, recentMessages } = body;

    if (!question || typeof question !== 'string') {
      return new Response(JSON.stringify({ error: 'question is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const hint = locationHint ?? (location ? 'Israel Mediterranean coast' : undefined);
    const context = Array.isArray(recentMessages)
      ? recentMessages.filter((item: unknown): item is string => typeof item === 'string').slice(-8)
      : [];
    const research = await runServerResearch(question, language, hint, context);

    return new Response(JSON.stringify({
      ...research,
      location,
      spotId,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
