-- Migration: Usage Tracking Tables for Paywall System
-- Created: October 4, 2025 06:20 AM
-- Purpose: Track monthly Scotty AI chat usage and daily discovery views

-- =====================================================
-- 1. SCOTTY CHAT USAGE TABLE (Monthly Tracking)
-- =====================================================

CREATE TABLE IF NOT EXISTS scotty_chat_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chat_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  month_year TEXT NOT NULL, -- Format: 'YYYY-MM' for easy monthly grouping
  metadata JSONB DEFAULT '{}', -- Store chat details, AI model used, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Index for fast monthly usage lookups
  CONSTRAINT unique_chat_per_timestamp UNIQUE (user_id, chat_started_at)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_scotty_chat_user_month ON scotty_chat_usage(user_id, month_year);
CREATE INDEX IF NOT EXISTS idx_scotty_chat_started_at ON scotty_chat_usage(chat_started_at DESC);

-- RLS Policies
ALTER TABLE scotty_chat_usage ENABLE ROW LEVEL SECURITY;

-- Users can view their own chat history
CREATE POLICY "Users can view own scotty chats"
  ON scotty_chat_usage FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own chat records
CREATE POLICY "Users can create own scotty chats"
  ON scotty_chat_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all chat usage
CREATE POLICY "Admins can view all scotty chats"
  ON scotty_chat_usage FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND admin_role IN ('admin', 'executive_admin', 'auditor')
    )
  );

-- =====================================================
-- 2. DISCOVERY VIEWS TABLE (Daily Tracking)
-- =====================================================

CREATE TABLE IF NOT EXISTS discovery_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  town_id UUID NOT NULL REFERENCES towns(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  view_date DATE NOT NULL DEFAULT CURRENT_DATE, -- For daily grouping
  metadata JSONB DEFAULT '{}', -- Store context (from /today, /discover, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate views of same town on same day
  CONSTRAINT unique_town_view_per_day UNIQUE (user_id, town_id, view_date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_discovery_user_date ON discovery_views(user_id, view_date DESC);
CREATE INDEX IF NOT EXISTS idx_discovery_viewed_at ON discovery_views(viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_discovery_town ON discovery_views(town_id);

-- RLS Policies
ALTER TABLE discovery_views ENABLE ROW LEVEL SECURITY;

-- Users can view their own discovery history
CREATE POLICY "Users can view own discoveries"
  ON discovery_views FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own discovery views
CREATE POLICY "Users can create own discoveries"
  ON discovery_views FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all discovery usage
CREATE POLICY "Admins can view all discoveries"
  ON discovery_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND admin_role IN ('admin', 'executive_admin', 'auditor')
    )
  );

-- =====================================================
-- 3. HELPER FUNCTIONS FOR USAGE TRACKING
-- =====================================================

-- Get monthly Scotty chat count for current user
CREATE OR REPLACE FUNCTION get_scotty_chat_count_current_month()
RETURNS INTEGER AS $$
DECLARE
  v_current_month TEXT;
  v_count INTEGER;
BEGIN
  v_current_month := TO_CHAR(NOW(), 'YYYY-MM');

  SELECT COUNT(*)
  INTO v_count
  FROM scotty_chat_usage
  WHERE user_id = auth.uid()
    AND month_year = v_current_month;

  RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get daily discovery count for current user
CREATE OR REPLACE FUNCTION get_discovery_count_today()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(DISTINCT town_id)
  INTO v_count
  FROM discovery_views
  WHERE user_id = auth.uid()
    AND view_date = CURRENT_DATE;

  RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Record Scotty chat (with automatic month_year calculation)
CREATE OR REPLACE FUNCTION record_scotty_chat(
  p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID AS $$
DECLARE
  v_chat_id UUID;
  v_month_year TEXT;
BEGIN
  v_month_year := TO_CHAR(NOW(), 'YYYY-MM');

  INSERT INTO scotty_chat_usage (user_id, month_year, metadata)
  VALUES (auth.uid(), v_month_year, p_metadata)
  RETURNING id INTO v_chat_id;

  RETURN v_chat_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Record discovery view (with automatic date)
CREATE OR REPLACE FUNCTION record_discovery_view(
  p_town_id UUID,
  p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID AS $$
DECLARE
  v_view_id UUID;
BEGIN
  INSERT INTO discovery_views (user_id, town_id, metadata)
  VALUES (auth.uid(), p_town_id, p_metadata)
  ON CONFLICT (user_id, town_id, view_date) DO NOTHING
  RETURNING id INTO v_view_id;

  RETURN v_view_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. CLEANUP FUNCTIONS (Optional - for maintenance)
-- =====================================================

-- Delete scotty chats older than 12 months (for GDPR compliance)
CREATE OR REPLACE FUNCTION cleanup_old_scotty_chats()
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM scotty_chat_usage
  WHERE chat_started_at < NOW() - INTERVAL '12 months';

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Delete discovery views older than 6 months
CREATE OR REPLACE FUNCTION cleanup_old_discoveries()
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM discovery_views
  WHERE viewed_at < NOW() - INTERVAL '6 months';

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_scotty_chat_count_current_month() TO authenticated;
GRANT EXECUTE ON FUNCTION get_discovery_count_today() TO authenticated;
GRANT EXECUTE ON FUNCTION record_scotty_chat(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION record_discovery_view(UUID, JSONB) TO authenticated;

-- Grant execute on cleanup functions to admins only
GRANT EXECUTE ON FUNCTION cleanup_old_scotty_chats() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_discoveries() TO authenticated;
