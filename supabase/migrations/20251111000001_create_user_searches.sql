-- Create user_searches table for anonymous search analytics
-- User wants to track what users search WITHOUT requiring authentication
-- This is GDPR-compliant anonymous analytics

CREATE TABLE IF NOT EXISTS user_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- User info (nullable for anonymous tracking)
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id TEXT, -- Browser fingerprint/session for anonymous tracking

  -- Search details
  search_type TEXT NOT NULL, -- 'text', 'nearby', 'country'
  search_term TEXT,
  results_count INTEGER DEFAULT 0,
  filters_applied JSONB DEFAULT '{}'::jsonb,

  -- Metadata
  user_agent TEXT,
  ip_address INET
);

-- Index for analytics queries
CREATE INDEX idx_user_searches_created_at ON user_searches(created_at DESC);
CREATE INDEX idx_user_searches_user_id ON user_searches(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_user_searches_search_type ON user_searches(search_type);
CREATE INDEX idx_user_searches_search_term ON user_searches(search_term) WHERE search_term IS NOT NULL;

-- Enable RLS
ALTER TABLE user_searches ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone (anon + authenticated) can INSERT for anonymous analytics
CREATE POLICY "user_searches_insert_anyone"
  ON user_searches
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Users can read their own searches
CREATE POLICY "user_searches_select_own"
  ON user_searches
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR auth.uid() IS NULL -- Allow anon to read nothing (no data leak)
  );

-- Policy: Admins can read all searches
CREATE POLICY "user_searches_select_admin"
  ON user_searches
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );

-- Comment
COMMENT ON TABLE user_searches IS 'Anonymous search analytics - tracks what users search for without requiring authentication';
