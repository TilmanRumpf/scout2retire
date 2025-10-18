-- =====================================================
-- FIX: Update users RLS to use admin_role instead of is_admin
-- Date: October 18, 2025 04:40
-- Issue: TownAccessManager can't load users because RLS checks old is_admin column
-- Solution: Update is_user_admin function to check admin_role column
-- =====================================================

-- Update the security definer function to check admin_role instead of is_admin
CREATE OR REPLACE FUNCTION is_user_admin(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_admin_role TEXT;
BEGIN
  -- This function runs with SECURITY DEFINER, bypassing RLS
  SELECT admin_role INTO user_admin_role
  FROM users
  WHERE id = user_id;

  -- Check if user has executive_admin or assistant_admin role
  RETURN user_admin_role IN ('executive_admin', 'assistant_admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION is_user_admin IS 'Check if user has admin role (executive_admin or assistant_admin) - runs with SECURITY DEFINER to avoid RLS recursion';
