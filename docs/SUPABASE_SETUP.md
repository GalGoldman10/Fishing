# Supabase setup (user accounts & profiles)

FishGuide stores signed-in users in **Supabase Auth** and saves profile data (name, avatar, experience, fishing setup, favorite spots, language, catch log) in your Supabase project.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a project.
2. In **Project Settings → API**, copy:
   - **Project URL**
   - **anon public** key (publishable)

## 2. Apply database migrations

From the `fishguide-ai` folder:

```bash
npm run db:link -- --project-ref YOUR_PROJECT_REF
npm run db:push
```

Or run every file in `supabase/migrations/` in order in the Supabase **SQL editor**.

Migrations create:

- `profiles` (auto-created on signup) with fishing setup and favorite spots
- Row-level security so users only read/write their own data
- `avatars` storage bucket for profile photos
- `catch_logs` with free-text species names

## 3. Configure the app

Copy `.env.example` to `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
EXPO_PUBLIC_USE_MOCK_DATA=true
```

**Important:** You can keep `EXPO_PUBLIC_USE_MOCK_DATA=true` for demo fishing spots while still using real sign-in — auth works whenever Supabase URL and key are set.

Set `EXPO_PUBLIC_USE_MOCK_DATA=false` only when your Supabase database is seeded with real fishing spots.

Restart Expo after changing `.env`.

## 4. Deploy edge functions (optional)

For AI chat and account deletion:

```bash
npx supabase functions deploy fishing-assistant
npx supabase functions deploy account-delete
```

Set `OPENAI_API_KEY` as a Supabase secret for chat (see `docs/CHATGPT_SETUP.md`).

## 5. Email confirmation (optional)

In Supabase **Authentication → Providers → Email**:

- **Disable** “Confirm email” for instant sign-in after registration, or
- **Enable** it — users must confirm via email before signing in (the app shows a message after signup).

## 6. What is stored

| Field | Where |
|-------|--------|
| Email / password | Supabase Auth |
| Display name, avatar, experience | `profiles` |
| Fishing rod/reel/line setup | `profiles.fishing_setup` (JSON) |
| Home favorite spot | `profiles.favorite_spot_id` |
| Saved spot list | `profiles.favorite_spot_ids` (JSON array) |
| App language | `profiles.preferred_language` |
| Profile photo file | Supabase Storage `avatars` bucket |
| Catch log entries | `catch_logs` (species name, size, notes) |

## 7. Guest → account merge

If someone uses the app as a guest and later signs up or signs in, local profile, favorites, and catches are uploaded when their cloud profile is still empty.

## Local development

```bash
npm run db:start
```

Use the URL and anon key printed by `supabase start` in `.env`, then:

```bash
npm run db:reset
```
