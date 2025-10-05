-- =====================================================
-- FIX: Infinite Recursion in users RLS Policy
-- Date: October 4, 2025 20:00
-- Issue: Login was failing with "infinite recursion detected in policy for relation users"
-- Root Cause: admins_can_select_all_users policy queries users table to check is_admin
--             This creates infinite loop: users->check admin->query users->check admin->...
-- Solution: Use security definer function to bypass RLS when checking admin status
-- =====================================================

-- Drop the problematic policies first
DROP POLICY IF EXISTS "admins_can_select_all_users" ON users;
DROP POLICY IF EXISTS "admins_can_update_user_tiers" ON users;

-- Create a security definer function that bypasses RLS to check admin status
CREATE OR REPLACE FUNCTION is_user_admin(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  admin_status BOOLEAN;
BEGIN
  -- This function runs with SECURITY DEFINER, bypassing RLS
  SELECT is_admin INTO admin_status
  FROM users
  WHERE id = user_id;

  RETURN COALESCE(admin_status, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION is_user_admin IS 'Check if user is admin - runs with SECURITY DEFINER to avoid RLS recursion';

-- Recreate policy using the security definer function (no recursion!)
CREATE POLICY "admins_can_select_all_users" ON users
  FOR SELECT
  USING (
    -- Allow if user is admin (uses security definer function - no recursion)
    is_user_admin(auth.uid())
    -- Or viewing own record
    OR auth.uid() = id
  );

-- Recreate update policy
CREATE POLICY "admins_can_update_user_tiers" ON users
  FOR UPDATE
  USING (
    -- Allow if user is admin (uses security definer function - no recursion)
    is_user_admin(auth.uid())
  );

-- Add comments
COMMENT ON POLICY "admins_can_select_all_users" ON users IS
  'Admins can view all users for management. Regular users can only view themselves. Uses security definer function to avoid recursion.';

COMMENT ON POLICY "admins_can_update_user_tiers" ON users IS
  'Admins can update user tiers and roles in PaywallManager. Uses security definer function to avoid recursion.';

-- Add INSERT and DELETE policies for completeness
CREATE POLICY "users_can_insert_own" ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "admins_can_delete_users" ON users
  FOR DELETE
  USING (is_user_admin(auth.uid()));

COMMENT ON POLICY "users_can_insert_own" ON users IS
  'Users can only create their own profile record';

COMMENT ON POLICY "admins_can_delete_users" ON users IS
  'Only admins can delete user accounts';
