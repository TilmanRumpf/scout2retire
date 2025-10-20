-- =====================================================
-- USER ANALYTICS SYSTEM - COMPREHENSIVE TRACKING
-- Created: October 19, 2025
-- Purpose: Track device usage, sessions, behavior, engagement metrics
--          for data-driven product decisions and user insights
-- =====================================================

-- =====================================================
-- TABLE 1: user_device_history (Device Tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_device_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_type TEXT NOT NULL,
  platform TEXT,
  browser TEXT,
  user_agent TEXT,
  screen_resolution TEXT,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_count INTEGER DEFAULT 1,
  total_time_seconds INTEGER DEFAULT 0,
  is_current BOOLEAN DEFAULT true,
  ip_address INET,
  country TEXT,
  city TEXT,
  CONSTRAINT valid_device_type CHECK (device_type IN ('mobile', 'tablet', 'desktop', 'unknown'))
);

CREATE INDEX idx_user_device_history_user ON user_device_history(user_id, last_seen_at DESC);
CREATE INDEX idx_user_device_history_device ON user_device_history(device_type);
CREATE INDEX idx_user_device_history_platform ON user_device_history(platform);

COMMENT ON TABLE user_device_history IS 'Track all devices used by each user over time';

-- =====================================================
-- TABLE 2: user_sessions (Session Tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_history_id UUID REFERENCES user_device_history(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  page_views INTEGER DEFAULT 0,
  actions_count INTEGER DEFAULT 0,
  features_used TEXT[],
  entry_page TEXT,
  exit_page TEXT,
  is_active BOOLEAN DEFAULT true,
  session_quality_score DECIMAL(3,2), -- 0.00 to 1.00
  CONSTRAINT valid_quality_score CHECK (session_quality_score >= 0 AND session_quality_score <= 1)
);

CREATE INDEX idx_user_sessions_user ON user_sessions(user_id, started_at DESC);
CREATE INDEX idx_user_sessions_active ON user_sessions(user_id, is_active);
CREATE INDEX idx_user_sessions_duration ON user_sessions(duration_seconds);
CREATE INDEX idx_user_sessions_started_at ON user_sessions(started_at);

COMMENT ON TABLE user_sessions IS 'Individual user sessions with duration and engagement metrics';

-- =====================================================
-- TABLE 3: user_behavior_events (Event Tracking)
-- =====================================================
-- user_behavior_events table
CREATE TABLE IF NOT EXISTS user_behavior_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES user_sessions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_category TEXT,
  event_name TEXT NOT NULL,
  event_metadata JSONB,
  page_url TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_event_type CHECK (event_type IN ('click', 'view', 'search', 'save', 'share', 'chat', 'preference_change', 'feature_use', 'conversion', 'error'))
);

CREATE INDEX idx_behavior_events_user ON user_behavior_events(user_id, occurred_at DESC);
CREATE INDEX idx_behavior_events_type ON user_behavior_events(event_type, occurred_at DESC);
CREATE INDEX idx_behavior_events_category ON user_behavior_events(event_category, occurred_at DESC);
CREATE INDEX idx_behavior_events_session ON user_behavior_events(session_id);
CREATE INDEX idx_behavior_events_occurred_at ON user_behavior_events(occurred_at);

COMMENT ON TABLE user_behavior_events IS 'Granular tracking of user actions and interactions';

-- =====================================================
-- TABLE 4: user_engagement_metrics (Daily Aggregates)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_engagement_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  sessions_count INTEGER DEFAULT 0,
  total_time_seconds INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  actions_count INTEGER DEFAULT 0,
  features_used TEXT[],
  towns_viewed INTEGER DEFAULT 0,
  searches_performed INTEGER DEFAULT 0,
  chats_sent INTEGER DEFAULT 0,
  avg_session_duration INTEGER,
  engagement_score DECIMAL(3,2), -- 0.00 to 1.00
  is_dau BOOLEAN DEFAULT false, -- Daily Active User
  is_wau BOOLEAN DEFAULT false, -- Weekly Active User (computed)
  is_mau BOOLEAN DEFAULT false, -- Monthly Active User (computed)
  UNIQUE(user_id, metric_date),
  CONSTRAINT valid_engagement_score CHECK (engagement_score >= 0 AND engagement_score <= 1)
);

CREATE INDEX idx_engagement_metrics_user ON user_engagement_metrics(user_id, metric_date DESC);
CREATE INDEX idx_engagement_metrics_date ON user_engagement_metrics(metric_date DESC);
CREATE INDEX idx_engagement_metrics_dau ON user_engagement_metrics(metric_date, is_dau);
CREATE INDEX idx_engagement_metrics_wau ON user_engagement_metrics(metric_date, is_wau);
CREATE INDEX idx_engagement_metrics_mau ON user_engagement_metrics(metric_date, is_mau);

COMMENT ON TABLE user_engagement_metrics IS 'Daily aggregated engagement metrics per user';

-- =====================================================
-- TABLE 5: user_cohorts (Cohort Analysis)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cohort_type TEXT NOT NULL,
  cohort_identifier TEXT NOT NULL,
  joined_cohort_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cohort_metadata JSONB,
  UNIQUE(user_id, cohort_type, cohort_identifier),
  CONSTRAINT valid_cohort_type CHECK (cohort_type IN ('acquisition_week', 'acquisition_month', 'device_type', 'subscription_tier', 'behavior_segment', 'location', 'feature_adopter'))
);

CREATE INDEX idx_user_cohorts_user ON user_cohorts(user_id);
CREATE INDEX idx_user_cohorts_type ON user_cohorts(cohort_type, cohort_identifier);
CREATE INDEX idx_user_cohorts_identifier ON user_cohorts(cohort_identifier);

COMMENT ON TABLE user_cohorts IS 'User segmentation for cohort analysis and retention tracking';

-- =====================================================
-- TABLE 6: retention_metrics (Cohort Retention)
-- =====================================================
CREATE TABLE IF NOT EXISTS retention_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_type TEXT NOT NULL,
  cohort_identifier TEXT NOT NULL,
  cohort_size INTEGER NOT NULL,
  day_number INTEGER NOT NULL, -- Days since cohort creation
  retained_users INTEGER NOT NULL,
  retention_rate DECIMAL(5,2), -- Percentage
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cohort_type, cohort_identifier, day_number),
  CONSTRAINT valid_retention_rate CHECK (retention_rate >= 0 AND retention_rate <= 100)
);

CREATE INDEX idx_retention_metrics_cohort ON retention_metrics(cohort_type, cohort_identifier, day_number);
CREATE INDEX idx_retention_metrics_date ON retention_metrics(calculated_at DESC);

COMMENT ON TABLE retention_metrics IS 'Pre-calculated retention rates for cohort analysis';

-- =====================================================
-- TABLE 7: Alter users table (Add analytics columns)
-- =====================================================
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS last_device_type TEXT,
  ADD COLUMN IF NOT EXISTS last_platform TEXT,
  ADD COLUMN IF NOT EXISTS last_browser TEXT,
  ADD COLUMN IF NOT EXISTS last_user_agent TEXT,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS total_sessions INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_time_seconds INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lifetime_page_views INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lifetime_actions INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS first_session_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS avg_session_duration_seconds INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_7_days_active_days INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_30_days_active_days INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS engagement_tier TEXT DEFAULT 'inactive',
  ADD COLUMN IF NOT EXISTS churn_risk_score DECIMAL(3,2) DEFAULT 0.5;

-- Add constraints
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS valid_engagement_tier,
  ADD CONSTRAINT valid_engagement_tier CHECK (engagement_tier IN ('inactive', 'low', 'medium', 'high', 'power_user'));

ALTER TABLE users
  DROP CONSTRAINT IF EXISTS valid_churn_risk,
  ADD CONSTRAINT valid_churn_risk CHECK (churn_risk_score >= 0 AND churn_risk_score <= 1);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_users_engagement_tier ON users(engagement_tier);
CREATE INDEX IF NOT EXISTS idx_users_churn_risk ON users(churn_risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_users_device_type ON users(last_device_type);
CREATE INDEX IF NOT EXISTS idx_users_platform ON users(last_platform);

COMMENT ON COLUMN users.last_device_type IS 'Most recent device: mobile, tablet, desktop, unknown';
COMMENT ON COLUMN users.last_platform IS 'Most recent OS: iOS, Android, Windows, macOS, Linux';
COMMENT ON COLUMN users.engagement_tier IS 'User engagement level: inactive, low, medium, high, power_user';
COMMENT ON COLUMN users.churn_risk_score IS 'Predicted churn probability: 0.0 (low risk) to 1.0 (high risk)';

-- =====================================================
-- FUNCTION 1: update_user_device (Track Device Usage)
-- =====================================================
CREATE OR REPLACE FUNCTION update_user_device(
  p_user_id UUID,
  p_device_type TEXT,
  p_platform TEXT DEFAULT NULL,
  p_browser TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_screen_resolution TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_device_id UUID;
BEGIN
  -- Find or create device history entry
  SELECT id INTO v_device_id
  FROM user_device_history
  WHERE user_id = p_user_id
    AND device_type = p_device_type
    AND platform = p_platform
    AND browser = p_browser
  LIMIT 1;

  IF v_device_id IS NULL THEN
    -- New device, create entry
    INSERT INTO user_device_history (
      user_id,
      device_type,
      platform,
      browser,
      user_agent,
      screen_resolution,
      is_current
    ) VALUES (
      p_user_id,
      p_device_type,
      p_platform,
      p_browser,
      p_user_agent,
      p_screen_resolution,
      true
    ) RETURNING id INTO v_device_id;
  ELSE
    -- Update existing device
    UPDATE user_device_history
    SET
      last_seen_at = NOW(),
      session_count = session_count + 1,
      user_agent = COALESCE(p_user_agent, user_agent),
      screen_resolution = COALESCE(p_screen_resolution, screen_resolution),
      is_current = true
    WHERE id = v_device_id;
  END IF;

  -- Mark other devices as not current
  UPDATE user_device_history
  SET is_current = false
  WHERE user_id = p_user_id AND id != v_device_id;

  -- Update users table
  UPDATE users
  SET
    last_device_type = p_device_type,
    last_platform = p_platform,
    last_browser = p_browser,
    last_user_agent = p_user_agent,
    last_login_at = NOW(),
    last_active_at = NOW()
  WHERE id = p_user_id;

  RETURN v_device_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_user_device IS 'Update or create device history entry for user';

-- =====================================================
-- FUNCTION 2: start_user_session (Begin Session)
-- =====================================================
CREATE OR REPLACE FUNCTION start_user_session(
  p_user_id UUID,
  p_device_history_id UUID DEFAULT NULL,
  p_entry_page TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_session_id UUID;
BEGIN
  -- Create new session
  INSERT INTO user_sessions (
    user_id,
    device_history_id,
    entry_page,
    is_active
  ) VALUES (
    p_user_id,
    p_device_history_id,
    p_entry_page,
    true
  ) RETURNING id INTO v_session_id;

  -- Update user's first session timestamp if null
  UPDATE users
  SET first_session_at = COALESCE(first_session_at, NOW())
  WHERE id = p_user_id;

  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION start_user_session IS 'Start a new user session';

-- =====================================================
-- FUNCTION 3: end_user_session (End Session)
-- =====================================================
CREATE OR REPLACE FUNCTION end_user_session(
  p_session_id UUID,
  p_exit_page TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
  v_started_at TIMESTAMPTZ;
  v_duration INTEGER;
  v_page_views INTEGER;
  v_actions INTEGER;
BEGIN
  -- Get session details
  SELECT user_id, started_at, page_views, actions_count
  INTO v_user_id, v_started_at, v_page_views, v_actions
  FROM user_sessions
  WHERE id = p_session_id;

  IF v_user_id IS NULL THEN
    RETURN; -- Session not found
  END IF;

  -- Calculate duration in seconds
  v_duration := EXTRACT(EPOCH FROM (NOW() - v_started_at))::INTEGER;

  -- Calculate session quality score (0.0 to 1.0)
  -- Based on: duration (40%), page_views (30%), actions (30%)
  DECLARE
    v_quality_score DECIMAL(3,2);
    v_duration_score DECIMAL(3,2);
    v_pageview_score DECIMAL(3,2);
    v_action_score DECIMAL(3,2);
  BEGIN
    -- Duration score: 0-300 seconds = 0.0 to 1.0
    v_duration_score := LEAST(v_duration / 300.0, 1.0);

    -- Page view score: 0-10 pages = 0.0 to 1.0
    v_pageview_score := LEAST(v_page_views / 10.0, 1.0);

    -- Action score: 0-5 actions = 0.0 to 1.0
    v_action_score := LEAST(v_actions / 5.0, 1.0);

    v_quality_score := (v_duration_score * 0.4) + (v_pageview_score * 0.3) + (v_action_score * 0.3);

    -- Update session
    UPDATE user_sessions
    SET
      ended_at = NOW(),
      duration_seconds = v_duration,
      exit_page = p_exit_page,
      is_active = false,
      session_quality_score = v_quality_score
    WHERE id = p_session_id;
  END;

  -- Update user totals
  UPDATE users
  SET
    total_sessions = total_sessions + 1,
    total_time_seconds = total_time_seconds + v_duration,
    lifetime_page_views = lifetime_page_views + v_page_views,
    lifetime_actions = lifetime_actions + v_actions,
    avg_session_duration_seconds = (total_time_seconds + v_duration) / (total_sessions + 1)
  WHERE id = v_user_id;

  -- Update device history
  UPDATE user_device_history
  SET total_time_seconds = total_time_seconds + v_duration
  WHERE id = (SELECT device_history_id FROM user_sessions WHERE id = p_session_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION end_user_session IS 'End user session and calculate metrics';

-- =====================================================
-- FUNCTION 4: track_behavior_event (Log User Action)
-- =====================================================
CREATE OR REPLACE FUNCTION track_behavior_event(
  p_user_id UUID,
  p_session_id UUID,
  p_event_type TEXT,
  p_event_name TEXT,
  p_event_category TEXT DEFAULT NULL,
  p_event_metadata JSONB DEFAULT NULL,
  p_page_url TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
BEGIN
  -- Insert event
  INSERT INTO user_behavior_events (
    user_id,
    session_id,
    event_type,
    event_name,
    event_category,
    event_metadata,
    page_url
  ) VALUES (
    p_user_id,
    p_session_id,
    p_event_type,
    p_event_name,
    p_event_category,
    p_event_metadata,
    p_page_url
  ) RETURNING id INTO v_event_id;

  -- Increment session counters
  IF p_event_type = 'view' THEN
    UPDATE user_sessions
    SET page_views = page_views + 1
    WHERE id = p_session_id;
  ELSE
    UPDATE user_sessions
    SET actions_count = actions_count + 1
    WHERE id = p_session_id;
  END IF;

  -- Update user's last active time
  UPDATE users
  SET last_active_at = NOW()
  WHERE id = p_user_id;

  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION track_behavior_event IS 'Log a user behavior event';

-- =====================================================
-- FUNCTION 5: calculate_daily_engagement (Aggregate Metrics)
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_daily_engagement(p_date DATE DEFAULT CURRENT_DATE)
RETURNS INTEGER AS $$
DECLARE
  v_processed_users INTEGER := 0;
  v_user_record RECORD;
BEGIN
  -- Process each user who was active on this date
  FOR v_user_record IN
    SELECT DISTINCT user_id
    FROM user_sessions
    WHERE DATE(started_at) = p_date
  LOOP
    -- Calculate and insert/update metrics
    INSERT INTO user_engagement_metrics (
      user_id,
      metric_date,
      sessions_count,
      total_time_seconds,
      page_views,
      actions_count,
      features_used,
      avg_session_duration,
      is_dau
    )
    SELECT
      user_id,
      p_date,
      COUNT(*),
      SUM(duration_seconds),
      SUM(page_views),
      SUM(actions_count),
      ARRAY_AGG(DISTINCT feature ORDER BY feature) FILTER (WHERE feature IS NOT NULL),
      AVG(duration_seconds)::INTEGER,
      true
    FROM user_sessions
    CROSS JOIN LATERAL unnest(features_used) AS feature
    WHERE user_id = v_user_record.user_id
      AND DATE(started_at) = p_date
    GROUP BY user_id
    ON CONFLICT (user_id, metric_date)
    DO UPDATE SET
      sessions_count = EXCLUDED.sessions_count,
      total_time_seconds = EXCLUDED.total_time_seconds,
      page_views = EXCLUDED.page_views,
      actions_count = EXCLUDED.actions_count,
      features_used = EXCLUDED.features_used,
      avg_session_duration = EXCLUDED.avg_session_duration,
      is_dau = true;

    v_processed_users := v_processed_users + 1;
  END LOOP;

  -- Mark WAU (active in last 7 days)
  UPDATE user_engagement_metrics
  SET is_wau = true
  WHERE metric_date = p_date
    AND user_id IN (
      SELECT DISTINCT user_id
      FROM user_engagement_metrics
      WHERE metric_date BETWEEN p_date - INTERVAL '6 days' AND p_date
        AND is_dau = true
    );

  -- Mark MAU (active in last 30 days)
  UPDATE user_engagement_metrics
  SET is_mau = true
  WHERE metric_date = p_date
    AND user_id IN (
      SELECT DISTINCT user_id
      FROM user_engagement_metrics
      WHERE metric_date BETWEEN p_date - INTERVAL '29 days' AND p_date
        AND is_dau = true
    );

  RETURN v_processed_users;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION calculate_daily_engagement IS 'Calculate daily engagement metrics for all active users';

-- =====================================================
-- FUNCTION 6: assign_user_cohort (Cohort Assignment)
-- =====================================================
CREATE OR REPLACE FUNCTION assign_user_cohort(
  p_user_id UUID,
  p_cohort_type TEXT,
  p_cohort_identifier TEXT,
  p_cohort_metadata JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_cohort_id UUID;
BEGIN
  INSERT INTO user_cohorts (
    user_id,
    cohort_type,
    cohort_identifier,
    cohort_metadata
  ) VALUES (
    p_user_id,
    p_cohort_type,
    p_cohort_identifier,
    p_cohort_metadata
  )
  ON CONFLICT (user_id, cohort_type, cohort_identifier)
  DO UPDATE SET cohort_metadata = EXCLUDED.cohort_metadata
  RETURNING id INTO v_cohort_id;

  RETURN v_cohort_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION assign_user_cohort IS 'Assign user to a cohort for analysis';

-- =====================================================
-- FUNCTION 7: update_engagement_tier (Classify Users)
-- =====================================================
CREATE OR REPLACE FUNCTION update_engagement_tier(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_days_active_30 INTEGER;
  v_avg_session_duration INTEGER;
  v_total_actions INTEGER;
  v_tier TEXT;
BEGIN
  -- Get user's 30-day activity metrics
  SELECT
    COUNT(DISTINCT metric_date),
    AVG(avg_session_duration)::INTEGER,
    SUM(actions_count)
  INTO v_days_active_30, v_avg_session_duration, v_total_actions
  FROM user_engagement_metrics
  WHERE user_id = p_user_id
    AND metric_date >= CURRENT_DATE - INTERVAL '30 days';

  -- Classify user
  IF v_days_active_30 = 0 THEN
    v_tier := 'inactive';
  ELSIF v_days_active_30 >= 20 AND v_total_actions > 100 THEN
    v_tier := 'power_user';
  ELSIF v_days_active_30 >= 10 OR v_total_actions > 50 THEN
    v_tier := 'high';
  ELSIF v_days_active_30 >= 5 OR v_total_actions > 20 THEN
    v_tier := 'medium';
  ELSE
    v_tier := 'low';
  END IF;

  -- Update user
  UPDATE users
  SET
    engagement_tier = v_tier,
    last_30_days_active_days = v_days_active_30
  WHERE id = p_user_id;

  RETURN v_tier;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_engagement_tier IS 'Classify user engagement level based on 30-day activity';

-- =====================================================
-- POPULATE: Initial Cohorts for Existing Users
-- =====================================================
DO $$
DECLARE
  v_user_record RECORD;
  v_week_identifier TEXT;
  v_month_identifier TEXT;
BEGIN
  FOR v_user_record IN
    SELECT id, created_at
    FROM users
  LOOP
    -- Assign acquisition week cohort
    v_week_identifier := TO_CHAR(v_user_record.created_at, 'YYYY-"W"IW');
    PERFORM assign_user_cohort(
      v_user_record.id,
      'acquisition_week',
      v_week_identifier,
      jsonb_build_object('created_at', v_user_record.created_at)
    );

    -- Assign acquisition month cohort
    v_month_identifier := TO_CHAR(v_user_record.created_at, 'YYYY-MM');
    PERFORM assign_user_cohort(
      v_user_record.id,
      'acquisition_month',
      v_month_identifier,
      jsonb_build_object('created_at', v_user_record.created_at)
    );
  END LOOP;
END $$;

-- =====================================================
-- TRIGGER: Auto-assign cohorts on new user
-- =====================================================
CREATE OR REPLACE FUNCTION auto_assign_user_cohorts()
RETURNS TRIGGER AS $$
DECLARE
  v_week_identifier TEXT;
  v_month_identifier TEXT;
BEGIN
  -- Acquisition week
  v_week_identifier := TO_CHAR(NEW.created_at, 'YYYY-"W"IW');
  PERFORM assign_user_cohort(
    NEW.id,
    'acquisition_week',
    v_week_identifier,
    jsonb_build_object('created_at', NEW.created_at)
  );

  -- Acquisition month
  v_month_identifier := TO_CHAR(NEW.created_at, 'YYYY-MM');
  PERFORM assign_user_cohort(
    NEW.id,
    'acquisition_month',
    v_month_identifier,
    jsonb_build_object('created_at', NEW.created_at)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_auto_assign_user_cohorts ON users;
CREATE TRIGGER trigger_auto_assign_user_cohorts
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_user_cohorts();

-- =====================================================
-- RLS POLICIES: Row Level Security
-- =====================================================

-- user_device_history: Users see own devices, admins see all
ALTER TABLE user_device_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_device_history_select_own" ON user_device_history
  FOR SELECT USING (user_id = auth.uid() OR check_admin_access('moderator'));

CREATE POLICY "user_device_history_insert_own" ON user_device_history
  FOR INSERT WITH CHECK (user_id = auth.uid() OR check_admin_access('moderator'));

-- user_sessions: Users see own sessions, admins see all
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_sessions_select_own" ON user_sessions
  FOR SELECT USING (user_id = auth.uid() OR check_admin_access('moderator'));

CREATE POLICY "user_sessions_insert_own" ON user_sessions
  FOR INSERT WITH CHECK (user_id = auth.uid() OR check_admin_access('moderator'));

-- user_behavior_events: Users see own events, admins see all
ALTER TABLE user_behavior_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_behavior_events_select_own" ON user_behavior_events
  FOR SELECT USING (user_id = auth.uid() OR check_admin_access('moderator'));

CREATE POLICY "user_behavior_events_insert_own" ON user_behavior_events
  FOR INSERT WITH CHECK (user_id = auth.uid() OR check_admin_access('moderator'));

-- user_engagement_metrics: Users see own metrics, admins see all
ALTER TABLE user_engagement_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_engagement_metrics_select_own" ON user_engagement_metrics
  FOR SELECT USING (user_id = auth.uid() OR check_admin_access('moderator'));

-- user_cohorts: Users see own cohorts, admins see all
ALTER TABLE user_cohorts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_cohorts_select_own" ON user_cohorts
  FOR SELECT USING (user_id = auth.uid() OR check_admin_access('moderator'));

-- retention_metrics: Admins only
ALTER TABLE retention_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "retention_metrics_select_admins" ON retention_metrics
  FOR SELECT USING (check_admin_access('moderator'));

-- =====================================================
-- VERIFICATION QUERIES (for testing)
-- =====================================================
COMMENT ON SCHEMA public IS 'User Analytics System installed - October 19, 2025';

-- Test queries (comment out before production):
-- SELECT * FROM user_device_history LIMIT 10;
-- SELECT * FROM user_sessions LIMIT 10;
-- SELECT * FROM user_behavior_events LIMIT 10;
-- SELECT * FROM user_engagement_metrics LIMIT 10;
-- SELECT * FROM user_cohorts LIMIT 10;
