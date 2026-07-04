import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { checkRateLimit, getServiceClient } from '../_shared/tools.ts';
import { runFishingAssistant } from '../_shared/assistant-runner.ts';
import { runSimpleOpenAIChat } from '../_shared/simple-openai.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function tryCreateSession(
  supabase: ReturnType<typeof getServiceClient>,
  userId: string | null,
  language: string,
  message: string,
  sessionId?: string,
): Promise<string | undefined> {
  if (sessionId) return sessionId;
  try {
    const { data: session } = await supabase.from('chat_sessions').insert({
      user_id: userId,
      language,
      title: message.slice(0, 50),
    }).select('id').single();
    return session?.id;
  } catch (err) {
    console.warn('chat_sessions unavailable, continuing without persistence:', err);
    return undefined;
  }
}

async function trySaveMessage(
  supabase: ReturnType<typeof getServiceClient>,
  sessionId: string | undefined,
  role: 'user' | 'assistant',
  text: string,
  structured?: unknown,
): Promise<void> {
  if (!sessionId) return;
  try {
    await supabase.from('chat_messages').insert({
      session_id: sessionId,
      role,
      text,
      structured_content: structured ?? null,
    });
  } catch (err) {
    console.warn('chat_messages unavailable:', err);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let language = 'en';
  try {
    const body = await req.json();
    const { message, sessionId, location, spotId, locationHint, recentMessages } = body;
    language = body.language ?? 'en';

    if (!message || message.length > 4000) {
      return new Response(JSON.stringify({ error: 'Invalid message' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      return new Response(JSON.stringify({
        answer: language === 'he'
          ? 'ChatGPT לא מוגדר בשרת. הגדר OPENAI_API_KEY ב-Supabase secrets.'
          : 'AI assistant is not configured. Set OPENAI_API_KEY in Supabase secrets.',
        aiPowered: false,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let userId: string | null = null;
    let currentSessionId = sessionId as string | undefined;
    let supabase: ReturnType<typeof getServiceClient> | null = null;

    try {
      supabase = getServiceClient();
      const authHeader = req.headers.get('Authorization');
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

      currentSessionId = await tryCreateSession(supabase, userId, language, message, currentSessionId);
      await trySaveMessage(supabase, currentSessionId, 'user', message);
    } catch (err) {
      console.warn('Supabase DB unavailable, running ChatGPT without persistence:', err);
    }

    let result;
    try {
      result = await runFishingAssistant({
        message,
        language,
        location,
        spotId,
        locationHint,
        recentMessages: Array.isArray(recentMessages)
          ? recentMessages.filter((item: unknown): item is string => typeof item === 'string').slice(-8)
          : undefined,
      });
    } catch (assistantErr) {
      console.warn('Full assistant failed, trying simple ChatGPT:', assistantErr);
      const simple = await runSimpleOpenAIChat(message, language);
      result = { answer: simple.answer, webSearchUsed: false, structured: undefined };
    }

    if (supabase) {
      await trySaveMessage(supabase, currentSessionId, 'assistant', result.answer, result.structured);
    }

    return new Response(
      JSON.stringify({
        answer: result.answer,
        sessionId: currentSessionId,
        structured: result.structured,
        webSearchUsed: result.webSearchUsed,
        aiPowered: true,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('fishing-assistant error:', err);
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({
        answer: language === 'he'
          ? `שגיאה ב-ChatGPT: ${msg.slice(0, 200)}`
          : `ChatGPT error: ${msg.slice(0, 200)}`,
        aiPowered: false,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
