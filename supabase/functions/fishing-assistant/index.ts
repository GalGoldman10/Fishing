import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { SYSTEM_PROMPT, getModel } from '../_shared/system-prompt.ts';
import { checkRateLimit, getServiceClient } from '../_shared/tools.ts';
import { runFishingAssistant } from '../_shared/assistant-runner.ts';

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
    const { message, sessionId, language = 'en', location, spotId, locationHint } = body;

    if (!message || message.length > 4000) {
      return new Response(JSON.stringify({ error: 'Invalid message' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authHeader = req.headers.get('Authorization');
    const supabase = getServiceClient();
    let userId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id ?? null;
    }

    const rateLimitId = userId ?? req.headers.get('x-forwarded-for') ?? 'anonymous';
    const allowed = await checkRateLimit(rateLimitId, 'fishing-assistant', userId ? 50 : 10);
    if (!allowed) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const { data: session } = await supabase.from('chat_sessions').insert({
        user_id: userId,
        language,
        title: message.slice(0, 50),
      }).select('id').single();
      currentSessionId = session?.id;
    }

    await supabase.from('chat_messages').insert({
      session_id: currentSessionId,
      role: 'user',
      text: message,
    });

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      return new Response(JSON.stringify({
        answer: 'AI assistant is not configured. Please set OPENAI_API_KEY and WEB_SEARCH_PROVIDER on the server.',
        sessionId: currentSessionId,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const result = await runFishingAssistant({
      message,
      language,
      location,
      spotId,
      locationHint,
    });

    await supabase.from('chat_messages').insert({
      session_id: currentSessionId,
      role: 'assistant',
      text: result.answer,
      structured_content: result.structured ?? null,
    });

    return new Response(
      JSON.stringify({
        answer: result.answer,
        sessionId: currentSessionId,
        structured: result.structured,
        webSearchUsed: result.webSearchUsed,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('fishing-assistant error:', err);
    return new Response(
      JSON.stringify({ answer: 'Something went wrong while searching. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
