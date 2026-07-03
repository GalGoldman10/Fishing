-- RLS Policies

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fishing_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE fishing_spot_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE species ENABLE ROW LEVEL SECURITY;
ALTER TABLE spot_species ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE regulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE hazards ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE environmental_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE catch_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE spot_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Public read for approved fishing data
CREATE POLICY "Public read fishing spots" ON fishing_spots FOR SELECT USING (true);
CREATE POLICY "Public read species" ON species FOR SELECT USING (true);
CREATE POLICY "Public read spot_species" ON spot_species FOR SELECT USING (true);
CREATE POLICY "Public read equipment" ON equipment_items FOR SELECT USING (true);
CREATE POLICY "Public read equipment_recs" ON equipment_recommendations FOR SELECT USING (true);
CREATE POLICY "Public read regulations" ON regulations FOR SELECT USING (true);
CREATE POLICY "Public read hazards" ON hazards FOR SELECT USING (true);
CREATE POLICY "Public read sources" ON sources FOR SELECT USING (true);
CREATE POLICY "Public read approved images" ON fishing_spot_images FOR SELECT USING (moderation_status = 'approved');
CREATE POLICY "Public read env snapshots" ON environmental_snapshots FOR SELECT USING (expires_at > now());

-- Profiles
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- User roles - read own only
CREATE POLICY "Users read own roles" ON user_roles FOR SELECT USING (auth.uid() = user_id);

-- Favorites
CREATE POLICY "Users manage own favorites" ON favorites FOR ALL USING (auth.uid() = user_id);

-- Trip plans
CREATE POLICY "Users manage own trips" ON trip_plans FOR ALL USING (auth.uid() = user_id);

-- Catch logs
CREATE POLICY "Users manage own catches" ON catch_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public read public catches" ON catch_logs FOR SELECT USING (visibility = 'public');

-- Spot reports
CREATE POLICY "Users manage own reports" ON spot_reports FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Moderators read all reports" ON spot_reports FOR SELECT USING (is_admin_or_editor());
CREATE POLICY "Moderators update reports" ON spot_reports FOR UPDATE USING (is_admin_or_editor());

-- Chat sessions
CREATE POLICY "Users manage own chat sessions" ON chat_sessions FOR ALL USING (auth.uid() = user_id);

-- Chat messages via session ownership
CREATE POLICY "Users read own chat messages" ON chat_messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM chat_sessions cs WHERE cs.id = session_id AND cs.user_id = auth.uid()));
CREATE POLICY "Users insert own chat messages" ON chat_messages FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM chat_sessions cs WHERE cs.id = session_id AND cs.user_id = auth.uid()));

-- Push tokens
CREATE POLICY "Users manage own push tokens" ON push_tokens FOR ALL USING (auth.uid() = user_id);

-- Admin/editor write policies
CREATE POLICY "Editors insert fishing spots" ON fishing_spots FOR INSERT WITH CHECK (is_admin_or_editor());
CREATE POLICY "Editors update fishing spots" ON fishing_spots FOR UPDATE USING (is_admin_or_editor());
CREATE POLICY "Admins delete fishing spots" ON fishing_spots FOR DELETE USING (has_role('admin'));

CREATE POLICY "Editors manage species" ON species FOR ALL USING (is_admin_or_editor());
CREATE POLICY "Editors manage equipment" ON equipment_items FOR ALL USING (is_admin_or_editor());
CREATE POLICY "Editors manage equipment recs" ON equipment_recommendations FOR ALL USING (is_admin_or_editor());
CREATE POLICY "Editors manage regulations" ON regulations FOR ALL USING (is_admin_or_editor());
CREATE POLICY "Editors manage hazards" ON hazards FOR ALL USING (is_admin_or_editor());
CREATE POLICY "Editors manage sources" ON sources FOR ALL USING (is_admin_or_editor());

-- Audit logs - admin read only
CREATE POLICY "Admins read audit logs" ON audit_logs FOR SELECT USING (has_role('admin'));

-- Rate limits - service role only (no client policies)
