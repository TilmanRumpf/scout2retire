-- FIX FOR USER_PREFERENCES RLS POLICY
-- Run this in Supabase SQL Editor at:
-- https://supabase.com/dashboard/project/axlruvvsjepsulcbqlho/sql/new

-- STEP 1: Check if RLS is enabled (CRITICAL!)
SELECT
  relname as table_name,
  relrowsecurity as rls_enabled,
  relforcerowsecurity as rls_forced
FROM pg_class
WHERE relname = 'user_preferences';

-- STEP 2: Enable RLS if not already enabled
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- STEP 3: Check existing policies (to know what to drop)
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'user_preferences';

-- STEP 4: Drop ALL existing policies (using generic approach)
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE tablename = 'user_preferences' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON user_preferences', pol.policyname);
  END LOOP;
END $$;

-- STEP 5: Create comprehensive RLS policies
-- Policy for authenticated users to manage their own preferences
CREATE POLICY "Enable access for users based on user_id"
  ON user_preferences
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- STEP 6: Verify the table structure
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'user_preferences'
  AND column_name IN ('user_id', 'id')
ORDER BY ordinal_position;

-- STEP 7: Verify data exists for your user
SELECT
  'Data exists for tilman.rumpf' as check_type,
  COUNT(*) as count_should_be_1,
  CASE
    WHEN COUNT(*) = 0 THEN 'ERROR: No preferences found!'
    WHEN COUNT(*) = 1 THEN 'SUCCESS: Preferences exist'
    ELSE 'WARNING: Multiple preference records'
  END as status
FROM user_preferences
WHERE user_id = '83d285b2-b21b-4d13-a1a1-6d51b6733d52';

-- STEP 8: Final verification
-- Note: This query runs with admin privileges in SQL editor
-- To truly test RLS, you need to test from the app or use VERIFY_RLS_FIX.js
SELECT
  'Final Status Check' as check_type,
  (SELECT COUNT(*) FROM user_preferences WHERE user_id = '83d285b2-b21b-4d13-a1a1-6d51b6733d52') as tilman_records,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'user_preferences') as policy_count,
  (SELECT relrowsecurity FROM pg_class WHERE relname = 'user_preferences') as rls_enabled,
  CASE
    WHEN (SELECT COUNT(*) FROM user_preferences WHERE user_id = '83d285b2-b21b-4d13-a1a1-6d51b6733d52') = 1
      AND (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'user_preferences') > 0
      AND (SELECT relrowsecurity FROM pg_class WHERE relname = 'user_preferences') = true
    THEN '✅ Everything looks correct! Test in the app to confirm.'
    ELSE '❌ Something is wrong - check the individual results above'
  END as status;