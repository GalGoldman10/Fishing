-- FishGuide AI Database Schema
-- Migration 001: Initial schema with PostGIS

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enums via check constraints for portability

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en', 'he')),
  experience_level TEXT NOT NULL DEFAULT 'beginner' CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  default_units TEXT NOT NULL DEFAULT 'metric' CHECK (default_units IN ('metric', 'imperial')),
  country_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE user_roles (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'editor', 'moderator', 'admin')),
  PRIMARY KEY (user_id, role)
);

CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  organization TEXT,
  source_type TEXT NOT NULL DEFAULT 'reference',
  url TEXT,
  published_at TIMESTAMPTZ,
  checked_at TIMESTAMPTZ,
  reliability_level TEXT DEFAULT 'medium',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE fishing_spots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  localized_names JSONB DEFAULT '{}',
  description TEXT,
  country_code TEXT NOT NULL,
  region TEXT,
  municipality TEXT,
  environment_type TEXT NOT NULL,
  shore_type TEXT NOT NULL,
  seabed_type TEXT NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  access_type TEXT,
  parking_information TEXT,
  accessibility_information TEXT,
  difficulty_level TEXT NOT NULL DEFAULT 'moderate',
  suitable_for_children BOOLEAN DEFAULT false,
  night_access BOOLEAN DEFAULT true,
  boat_access BOOLEAN DEFAULT false,
  fishing_methods TEXT[] DEFAULT '{}',
  hazard_level TEXT,
  hazard_notes TEXT,
  verification_status TEXT NOT NULL DEFAULT 'unknown' CHECK (verification_status IN ('verified', 'community', 'estimated', 'demo', 'unknown')),
  confidence_score REAL NOT NULL DEFAULT 0.5,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_fishing_spots_location ON fishing_spots USING GIST (location);
CREATE INDEX idx_fishing_spots_country ON fishing_spots (country_code);
CREATE INDEX idx_fishing_spots_verification ON fishing_spots (verification_status);

CREATE TABLE fishing_spot_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  spot_id UUID NOT NULL REFERENCES fishing_spots(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  caption TEXT,
  photographer TEXT,
  source_id UUID REFERENCES sources(id),
  moderation_status TEXT NOT NULL DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE species (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  common_name TEXT NOT NULL,
  scientific_name TEXT,
  localized_names JSONB DEFAULT '{}',
  aliases TEXT[] DEFAULT '{}',
  description TEXT,
  identification_notes TEXT,
  habitat TEXT,
  environment_types TEXT[] DEFAULT '{}',
  preferred_depth_min REAL,
  preferred_depth_max REAL,
  active_times TEXT[] DEFAULT '{}',
  conservation_status TEXT,
  handling_notes TEXT,
  consumption_warning TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_species_common_name ON species (common_name);
CREATE INDEX idx_species_aliases ON species USING GIN (aliases);

CREATE TABLE spot_species (
  spot_id UUID NOT NULL REFERENCES fishing_spots(id) ON DELETE CASCADE,
  species_id UUID NOT NULL REFERENCES species(id) ON DELETE CASCADE,
  likelihood TEXT NOT NULL DEFAULT 'medium',
  seasonal_months INT[] DEFAULT '{}',
  preferred_methods TEXT[] DEFAULT '{}',
  preferred_baits TEXT[] DEFAULT '{}',
  preferred_lures TEXT[] DEFAULT '{}',
  depth_notes TEXT,
  confidence_score REAL DEFAULT 0.5,
  source_id UUID REFERENCES sources(id),
  last_verified_at TIMESTAMPTZ,
  PRIMARY KEY (spot_id, species_id)
);

CREATE TABLE equipment_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  specifications JSONB DEFAULT '{}',
  skill_level TEXT,
  environment_types TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE equipment_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  spot_id UUID REFERENCES fishing_spots(id) ON DELETE SET NULL,
  species_id UUID REFERENCES species(id) ON DELETE SET NULL,
  shore_type TEXT,
  seabed_type TEXT,
  fishing_method TEXT NOT NULL,
  experience_level TEXT NOT NULL DEFAULT 'beginner',
  rod_specification JSONB DEFAULT '{}',
  reel_specification JSONB DEFAULT '{}',
  line_specification JSONB DEFAULT '{}',
  leader_specification JSONB DEFAULT '{}',
  terminal_tackle JSONB DEFAULT '{}',
  bait_and_lures JSONB DEFAULT '{}',
  accessories JSONB DEFAULT '{}',
  reasoning TEXT,
  confidence_score REAL DEFAULT 0.5,
  source_id UUID REFERENCES sources(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE regulations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  country_code TEXT NOT NULL,
  region TEXT,
  species_id UUID REFERENCES species(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  license_required BOOLEAN DEFAULT false,
  minimum_size TEXT,
  bag_limit TEXT,
  closed_season TEXT,
  prohibited_methods TEXT[] DEFAULT '{}',
  protected_status BOOLEAN DEFAULT false,
  effective_from DATE,
  effective_until DATE,
  source_id UUID REFERENCES sources(id),
  last_checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE hazards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  spot_id UUID NOT NULL REFERENCES fishing_spots(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  title TEXT NOT NULL,
  description TEXT,
  seasonal_months INT[] DEFAULT '{}',
  source_id UUID REFERENCES sources(id),
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE environmental_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  spot_id UUID REFERENCES fishing_spots(id) ON DELETE SET NULL,
  location GEOGRAPHY(POINT, 4326),
  provider TEXT NOT NULL,
  observed_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  wind_speed REAL,
  wind_direction TEXT,
  wave_height REAL,
  wave_period REAL,
  water_temperature REAL,
  air_temperature REAL,
  tide_height REAL,
  raw_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_env_snapshots_location ON environmental_snapshots USING GIST (location);
CREATE INDEX idx_env_snapshots_expires ON environmental_snapshots (expires_at);

CREATE TABLE favorites (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  spot_id UUID NOT NULL REFERENCES fishing_spots(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, spot_id)
);

CREATE TABLE trip_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  spot_id UUID NOT NULL REFERENCES fishing_spots(id) ON DELETE CASCADE,
  planned_start TIMESTAMPTZ NOT NULL,
  planned_end TIMESTAMPTZ,
  target_species_ids UUID[] DEFAULT '{}',
  selected_method TEXT,
  equipment_checklist JSONB DEFAULT '{}',
  notes TEXT,
  notification_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE catch_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  spot_id UUID REFERENCES fishing_spots(id) ON DELETE SET NULL,
  species_id UUID REFERENCES species(id) ON DELETE SET NULL,
  caught_at TIMESTAMPTZ NOT NULL,
  location GEOGRAPHY(POINT, 4326),
  estimated_length REAL,
  estimated_weight REAL,
  bait_or_lure TEXT,
  fishing_method TEXT,
  released BOOLEAN DEFAULT true,
  notes TEXT,
  image_path TEXT,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'friends', 'public')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE spot_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  spot_id UUID NOT NULL REFERENCES fishing_spots(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,
  proposed_data JSONB DEFAULT '{}',
  description TEXT,
  evidence_image_paths TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  moderator_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  anonymous_session_id TEXT,
  title TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
  text TEXT,
  structured_content JSONB,
  tool_calls JSONB,
  token_usage JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_messages_session ON chat_messages (session_id, created_at);

CREATE TABLE push_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expo_push_token TEXT NOT NULL,
  platform TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, expo_push_token)
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  identifier TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INT NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (identifier, endpoint)
);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER fishing_spots_updated_at BEFORE UPDATE ON fishing_spots FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER species_updated_at BEFORE UPDATE ON species FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trip_plans_updated_at BEFORE UPDATE ON trip_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER catch_logs_updated_at BEFORE UPDATE ON catch_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER chat_sessions_updated_at BEFORE UPDATE ON chat_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  INSERT INTO user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Helper: check user role
CREATE OR REPLACE FUNCTION has_role(check_role TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = check_role
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_admin_or_editor()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'editor', 'moderator')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;
