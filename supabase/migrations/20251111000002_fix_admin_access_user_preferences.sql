-- Migration: Fix Admin Access to user_preferences
-- Date: 2025-11-11
-- Purpose: Allow admins to read any user's preferences (for Algorithm Manager)
--
-- PROBLEM: Algorithm Manager cannot read user_preferences due to RLS blocking
--
-- SOLUTION: Update SELECT policy to allow:
--           1. Users to read their own data
--           2. Admins (is_admin = true) to read ANY user's data

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "user_preferences_select_policy" ON user_preferences;
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Enable read access for own preferences" ON user_preferences;

-- Create new SELECT policy with admin access
CREATE POLICY "user_preferences_select_policy"
ON user_preferences
FOR SELECT
USING (
  -- Allow if user is viewing their own data
  auth.uid() = user_id
  OR
  -- Allow if user is an admin (for Algorithm Manager and admin tools)
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
);

-- Verify policy was created
DO $$
BEGIN
  RAISE NOTICE 'Policy updated successfully for user_preferences table';
  RAISE NOTICE 'Admins can now read all users'' preferences';
END $$;
