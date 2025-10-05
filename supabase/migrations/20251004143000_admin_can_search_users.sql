-- =====================================================
-- MIGRATION: Allow Admins to Search All Users
-- Date: October 4, 2025 14:30
-- Description: Admins need to search/view all users in PaywallManager
--              RLS was blocking SELECT queries with anon key
-- =====================================================

-- Create policy: Admins can SELECT all users
CREATE POLICY "admins_can_select_all_users" ON users
  FOR SELECT
  USING (
    -- Allow if user is admin
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.is_admin = true
    )
    -- Or viewing own record
    OR auth.uid() = id
  );

-- Create policy: Admins can UPDATE other users' tiers/roles
CREATE POLICY "admins_can_update_user_tiers" ON users
  FOR UPDATE
  USING (
    -- Allow if user is admin
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.is_admin = true
    )
  );

COMMENT ON POLICY "admins_can_select_all_users" ON users IS
  'Admins can view all users for management. Regular users can only view themselves.';

COMMENT ON POLICY "admins_can_update_user_tiers" ON users IS
  'Admins can update user tiers and roles in PaywallManager.';
