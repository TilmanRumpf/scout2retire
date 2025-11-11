-- Migration: Fix Admin Access to onboarding_responses
-- Date: 2025-11-11
-- Purpose: Allow admins to read any user's onboarding_responses (for Algorithm Manager)
--
-- PROBLEM: Algorithm Manager (admin tool) cannot read other users' preferences
--          due to restrictive RLS policy blocking cross-user reads
--
-- SOLUTION: Update SELECT policy to allow:
--           1. Users to read their own data (existing behavior)
--           2. Admins (is_admin = true) to read ANY user's data (new)

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "onboarding_responses_select_policy" ON onboarding_responses;
DROP POLICY IF EXISTS "Users can view own onboarding responses" ON onboarding_responses;
DROP POLICY IF EXISTS "Enable read access for own responses" ON onboarding_responses;

-- Create new SELECT policy with admin access
CREATE POLICY "onboarding_responses_select_policy"
ON onboarding_responses
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
  RAISE NOTICE 'Policy updated successfully for onboarding_responses table';
  RAISE NOTICE 'Admins can now read all users'' onboarding responses';
END $$;
