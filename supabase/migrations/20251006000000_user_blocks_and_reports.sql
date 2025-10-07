-- User Blocks and Reports System
-- Created: 2025-10-06
-- Purpose: Allow users to block other users and report inappropriate behavior

-- =====================================================
-- USER BLOCKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_blocks (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate blocks
  UNIQUE(user_id, blocked_user_id),

  -- Prevent self-blocking
  CONSTRAINT no_self_block CHECK (user_id != blocked_user_id)
);

-- Indexes for performance
CREATE INDEX idx_user_blocks_user_id ON user_blocks(user_id);
CREATE INDEX idx_user_blocks_blocked_user_id ON user_blocks(blocked_user_id);

-- RLS Policies
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;

-- Users can view their own blocks
CREATE POLICY "Users can view their own blocks"
  ON user_blocks FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own blocks
CREATE POLICY "Users can create their own blocks"
  ON user_blocks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own blocks (unblock)
CREATE POLICY "Users can delete their own blocks"
  ON user_blocks FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- USER REPORTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_reports (
  id BIGSERIAL PRIMARY KEY,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN (
    'harassment',
    'spam',
    'inappropriate_content',
    'impersonation',
    'privacy_violation',
    'other'
  )),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'under_review',
    'resolved',
    'dismissed'
  )),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  admin_notes TEXT,

  -- Prevent self-reporting
  CONSTRAINT no_self_report CHECK (reporter_id != reported_user_id)
);

-- Indexes for performance
CREATE INDEX idx_user_reports_reporter_id ON user_reports(reporter_id);
CREATE INDEX idx_user_reports_reported_user_id ON user_reports(reported_user_id);
CREATE INDEX idx_user_reports_status ON user_reports(status);

-- RLS Policies
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;

-- Users can view their own reports
CREATE POLICY "Users can view their own reports"
  ON user_reports FOR SELECT
  USING (auth.uid() = reporter_id);

-- Users can create reports
CREATE POLICY "Users can create reports"
  ON user_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Admins can view all reports
CREATE POLICY "Admins can view all reports"
  ON user_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.admin_role IN ('admin', 'executive_admin')
    )
  );

-- Admins can update reports
CREATE POLICY "Admins can update reports"
  ON user_reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.admin_role IN ('admin', 'executive_admin')
    )
  );

-- =====================================================
-- RPC FUNCTIONS
-- =====================================================

-- Block a user
CREATE OR REPLACE FUNCTION block_user(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert block record (ON CONFLICT DO NOTHING handles duplicates)
  INSERT INTO user_blocks (user_id, blocked_user_id)
  VALUES (auth.uid(), p_user_id)
  ON CONFLICT (user_id, blocked_user_id) DO NOTHING;
END;
$$;

-- Unblock a user
CREATE OR REPLACE FUNCTION unblock_user(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM user_blocks
  WHERE user_id = auth.uid()
  AND blocked_user_id = p_user_id;
END;
$$;

-- Get list of blocked users
CREATE OR REPLACE FUNCTION get_blocked_users()
RETURNS TABLE (
  blocked_user_id UUID,
  blocked_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT ub.blocked_user_id, ub.created_at
  FROM user_blocks ub
  WHERE ub.user_id = auth.uid()
  ORDER BY ub.created_at DESC;
END;
$$;

-- Report a user
CREATE OR REPLACE FUNCTION report_user(
  p_reported_user_id UUID,
  p_reason TEXT,
  p_description TEXT DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_report_id BIGINT;
BEGIN
  -- Insert report
  INSERT INTO user_reports (
    reporter_id,
    reported_user_id,
    reason,
    description
  ) VALUES (
    auth.uid(),
    p_reported_user_id,
    p_reason,
    p_description
  )
  RETURNING id INTO v_report_id;

  RETURN v_report_id;
END;
$$;

-- Check if user is blocked
CREATE OR REPLACE FUNCTION is_user_blocked(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_blocks
    WHERE user_id = auth.uid()
    AND blocked_user_id = p_user_id
  );
END;
$$;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update updated_at on user_reports
CREATE OR REPLACE FUNCTION update_user_reports_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_user_reports_updated_at
BEFORE UPDATE ON user_reports
FOR EACH ROW
EXECUTE FUNCTION update_user_reports_updated_at();

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE user_blocks IS 'Stores user block relationships - prevents blocked users from interacting';
COMMENT ON TABLE user_reports IS 'Stores user reports for moderation';
COMMENT ON FUNCTION block_user IS 'Block another user from interacting with you';
COMMENT ON FUNCTION unblock_user IS 'Remove a user block';
COMMENT ON FUNCTION get_blocked_users IS 'Get list of users you have blocked';
COMMENT ON FUNCTION report_user IS 'Report a user for inappropriate behavior';
COMMENT ON FUNCTION is_user_blocked IS 'Check if you have blocked a specific user';
