-- Research platform: trusted domains, search cache, knowledge base vectors

CREATE TABLE IF NOT EXISTS trusted_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL UNIQUE,
  source_type TEXT NOT NULL DEFAULT 'other',
  authority_score INTEGER NOT NULL DEFAULT 50 CHECK (authority_score BETWEEN 0 AND 100),
  country_code TEXT,
  is_whitelisted BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blocked_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL UNIQUE,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS research_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_hash TEXT NOT NULL,
  query_text TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  category TEXT,
  results JSONB NOT NULL DEFAULT '[]',
  provider TEXT,
  source_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_research_cache_hash ON research_cache(query_hash);
CREATE INDEX IF NOT EXISTS idx_research_cache_expires ON research_cache(expires_at);

CREATE TABLE IF NOT EXISTS fishing_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  country_code TEXT,
  region TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  spot_id UUID REFERENCES fishing_spots(id) ON DELETE SET NULL,
  species_id UUID REFERENCES species(id) ON DELETE SET NULL,
  source_url TEXT,
  source_type TEXT,
  reliability_score NUMERIC(5,2) DEFAULT 50,
  confidence_score NUMERIC(5,2) DEFAULT 50,
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fishing_knowledge_category ON fishing_knowledge(category);
CREATE INDEX IF NOT EXISTS idx_fishing_knowledge_country ON fishing_knowledge(country_code);
CREATE INDEX IF NOT EXISTS idx_fishing_knowledge_spot ON fishing_knowledge(spot_id);

-- Seed trusted Israeli fishing-related domains
INSERT INTO trusted_domains (domain, source_type, authority_score, country_code) VALUES
  ('gov.il', 'government', 95, 'IL'),
  ('ims.gov.il', 'weather', 95, 'IL'),
  ('he.wikipedia.org', 'scientific', 80, 'IL'),
  ('en.wikipedia.org', 'scientific', 80, NULL),
  ('fishbase.se', 'scientific', 90, NULL)
ON CONFLICT (domain) DO NOTHING;

-- RLS
ALTER TABLE trusted_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE fishing_knowledge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trusted_domains_read" ON trusted_domains FOR SELECT USING (true);
CREATE POLICY "blocked_domains_read" ON blocked_domains FOR SELECT USING (true);
CREATE POLICY "research_cache_read" ON research_cache FOR SELECT USING (true);
CREATE POLICY "fishing_knowledge_read" ON fishing_knowledge FOR SELECT USING (true);

CREATE POLICY "trusted_domains_admin" ON trusted_domains FOR ALL
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'editor')));

CREATE POLICY "blocked_domains_admin" ON blocked_domains FOR ALL
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'editor')));

CREATE POLICY "fishing_knowledge_admin" ON fishing_knowledge FOR ALL
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'editor', 'moderator')));
