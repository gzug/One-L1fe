-- ============================================================================
-- phase0_user_preferences
-- User-configurable panel and wearable source preference storage.
-- ============================================================================

-- user_marker_preferences
CREATE TABLE user_marker_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_install_id uuid NOT NULL,
  marker_key text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_marker_pref UNIQUE (app_install_id, marker_key)
);

ALTER TABLE user_marker_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_only_marker_prefs"
  ON user_marker_preferences
  FOR ALL
  USING (app_install_id = (current_setting('app.install_id', true))::uuid)
  WITH CHECK (app_install_id = (current_setting('app.install_id', true))::uuid);

-- user_wearable_preferences
CREATE TABLE user_wearable_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_install_id uuid NOT NULL,
  hc_record_type text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_wearable_pref UNIQUE (app_install_id, hc_record_type)
);

ALTER TABLE user_wearable_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_only_wearable_prefs"
  ON user_wearable_preferences
  FOR ALL
  USING (app_install_id = (current_setting('app.install_id', true))::uuid)
  WITH CHECK (app_install_id = (current_setting('app.install_id', true))::uuid);

-- down
DROP TABLE IF EXISTS user_wearable_preferences;
DROP TABLE IF EXISTS user_marker_preferences;
