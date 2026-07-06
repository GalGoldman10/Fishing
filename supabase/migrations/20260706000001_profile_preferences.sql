-- Profile preferences: fishing setup, favorite spots (app-level IDs), insert fallback

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS favorite_spot_id TEXT,
  ADD COLUMN IF NOT EXISTS favorite_spot_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS fishing_setup JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Allow upsert when the signup trigger did not run (e.g. imported users)
CREATE POLICY "Users insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
