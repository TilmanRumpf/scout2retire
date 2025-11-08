-- CREATE USER_TOWN_ACCESS TABLE
-- Town-level access control for Scouts, Town Managers, and Enterprise users
-- Created: 2025-10-18

-- Use gen_random_uuid() which is built into Postgres
CREATE TABLE IF NOT EXISTS user_town_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  town_id UUID NOT NULL REFERENCES towns(id) ON DELETE CASCADE,
  access_level TEXT NOT NULL CHECK (access_level IN ('view', 'edit', 'full')),
  granted_by UUID REFERENCES users(id),
  granted_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  notes TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, town_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_town_access_user ON user_town_access(user_id) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_user_town_access_town ON user_town_access(town_id) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_user_town_access_active ON user_town_access(active);

-- Comments
COMMENT ON TABLE user_town_access IS 'Town-level access control - allows specific users to edit specific towns';
COMMENT ON COLUMN user_town_access.access_level IS 'view=read-only, edit=can modify fields, full=edit+manage hobbies/exclusions';
COMMENT ON COLUMN user_town_access.expires_at IS 'Optional expiration date for temporary access';
COMMENT ON COLUMN user_town_access.notes IS 'Why access was granted, context for admins';

-- RLS Policies
ALTER TABLE user_town_access ENABLE ROW LEVEL SECURITY;

-- Executive/Assistant Admins can see and manage all access records
CREATE POLICY "admins_manage_town_access"
ON user_town_access
AS PERMISSIVE
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND (
      users.admin_role IN ('executive_admin', 'assistant_admin')
      OR users.is_admin = true
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND (
      users.admin_role IN ('executive_admin', 'assistant_admin')
      OR users.is_admin = true
    )
  )
);

-- Users can see their own town access records
CREATE POLICY "users_view_own_town_access"
ON user_town_access
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (user_id = auth.uid() AND active = true);

-- Function to check if user has access to a town
CREATE OR REPLACE FUNCTION has_town_access(
  p_user_id UUID,
  p_town_id UUID,
  p_min_access_level TEXT DEFAULT 'view'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_tier TEXT;
  v_access_level TEXT;
  v_is_admin BOOLEAN;
BEGIN
  -- Check if user is admin (bypass access control)
  SELECT is_admin, admin_role INTO v_is_admin, v_user_tier
  FROM users
  WHERE id = p_user_id;

  IF v_is_admin OR v_user_tier IN ('executive_admin', 'assistant_admin') THEN
    RETURN TRUE;
  END IF;

  -- Check specific town access
  SELECT access_level INTO v_access_level
  FROM user_town_access
  WHERE user_id = p_user_id
    AND town_id = p_town_id
    AND active = true
    AND (expires_at IS NULL OR expires_at > NOW());

  IF v_access_level IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check access level meets minimum requirement
  CASE p_min_access_level
    WHEN 'view' THEN
      RETURN v_access_level IN ('view', 'edit', 'full');
    WHEN 'edit' THEN
      RETURN v_access_level IN ('edit', 'full');
    WHEN 'full' THEN
      RETURN v_access_level = 'full';
    ELSE
      RETURN FALSE;
  END CASE;
END;
$$;

COMMENT ON FUNCTION has_town_access IS 'Check if user has minimum required access level to a specific town';

-- Function to get user's accessible towns
CREATE OR REPLACE FUNCTION get_user_accessible_towns(p_user_id UUID)
RETURNS TABLE (
  town_id UUID,
  town_name TEXT,
  country TEXT,
  access_level TEXT,
  granted_at TIMESTAMP,
  expires_at TIMESTAMP
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_admin_role TEXT;
BEGIN
  -- Check if user is admin
  SELECT is_admin, admin_role INTO v_is_admin, v_admin_role
  FROM users
  WHERE id = p_user_id;

  -- Admins get all towns
  IF v_is_admin OR v_admin_role IN ('executive_admin', 'assistant_admin') THEN
    RETURN QUERY
    SELECT
      t.id,
      t.town_name,
      t.country,
      'full'::TEXT,
      NOW(),
      NULL::TIMESTAMP
    FROM towns t
    ORDER BY t.town_name;
  ELSE
    -- Non-admins get only their accessible towns
    RETURN QUERY
    SELECT
      uta.town_id,
      t.town_name,
      t.country,
      uta.access_level,
      uta.granted_at,
      uta.expires_at
    FROM user_town_access uta
    JOIN towns t ON t.id = uta.town_id
    WHERE uta.user_id = p_user_id
      AND uta.active = true
      AND (uta.expires_at IS NULL OR uta.expires_at > NOW())
    ORDER BY t.town_name;
  END IF;
END;
$$;

COMMENT ON FUNCTION get_user_accessible_towns IS 'Get all towns a user has access to (admins get all towns)';
