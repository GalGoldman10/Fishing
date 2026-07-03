import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const in24h = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const in1h = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  const { data: trips } = await supabase
    .from('trip_plans')
    .select('*, push_tokens(expo_push_token)')
    .eq('notification_enabled', true)
    .gte('planned_start', new Date().toISOString())
    .lte('planned_start', in24h);

  const notifications: Array<{ token: string; title: string; body: string }> = [];

  for (const trip of trips ?? []) {
    const tokens = (trip.push_tokens as Array<{ expo_push_token: string }>) ?? [];
    for (const t of tokens) {
      notifications.push({
        token: t.expo_push_token,
        title: 'Upcoming Fishing Trip',
        body: `Your trip is coming up. Don't forget your equipment checklist!`,
      });
    }
  }

  if (notifications.length > 0) {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notifications.map((n) => ({
        to: n.token,
        title: n.title,
        body: n.body,
        sound: 'default',
      }))),
    });
  }

  return new Response(JSON.stringify({ sent: notifications.length }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
