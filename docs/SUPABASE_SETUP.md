# Supabase setup (user accounts & profiles)

FishGuide stores signed-in users in **Supabase Auth** and saves profile data (name, avatar, experience, fishing setup, favorite spots, language) in the **`profiles`** table.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a project.
2. In **Project Settings → API**, copy:
   - **Project URL**
   - **anon public** key (publishable)

## 2. Apply database migrations

From the `fishguide-ai` folder:

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

Or run the SQL files under `supabase/migrations/` in the Supabase SQL editor (in order).

This creates `profiles`, RLS policies, and the signup trigger that auto-creates a profile row for each new user.

## 3. Configure the app

Copy `.env.example` to `.env` and set:

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
EXPO_PUBLIC_USE_MOCK_DATA=false
```

Restart Expo after changing `.env`.

When `EXPO_PUBLIC_USE_MOCK_DATA=false` and real Supabase credentials are set, the app:

- Persists login sessions on the device (SecureStore)
- Restores the session on launch
- Loads profile and favorites from Supabase after sign-in
- Saves profile edits and favorite spots to the cloud

## 4. Email confirmation (optional)

In Supabase **Authentication → Providers → Email**:

- **Disable** “Confirm email” for instant sign-in after registration, or
- **Enable** it — users must confirm via email before signing in (the app shows a message after signup).

## 5. What is stored

| Field | Where |
|-------|--------|
| Email / password | Supabase Auth |
| Display name, avatar, experience | `profiles` |
| Fishing rod/reel/line setup | `profiles.fishing_setup` (JSON) |
| Home favorite spot | `profiles.favorite_spot_id` |
| Saved spot list | `profiles.favorite_spot_ids` (JSON array) |
| App language | `profiles.preferred_language` |

## Local development

For a local Supabase stack:

```bash
npx supabase start
```

Use the URL and anon key printed by `supabase start` in `.env`.
