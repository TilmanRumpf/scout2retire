-- STEP 1: Fix towns search (public data, no consent needed)
DROP POLICY IF EXISTS "towns_unified_select" ON towns;
DROP POLICY IF EXISTS "towns_public_read" ON towns;

CREATE POLICY "towns_public_read"
ON towns FOR SELECT
TO anon, authenticated
USING (true);

-- STEP 2: Add admin_access_consent column to user_preferences
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS admin_access_consent BOOLEAN DEFAULT true;

-- Set existing users to true (grandfather them in)
UPDATE user_preferences SET admin_access_consent = true WHERE admin_access_consent IS NULL;

-- STEP 3: Add admin_access_consent column to onboarding_responses
ALTER TABLE onboarding_responses 
ADD COLUMN IF NOT EXISTS admin_access_consent BOOLEAN DEFAULT true;

-- Set existing users to true (grandfather them in)
UPDATE onboarding_responses SET admin_access_consent = true WHERE admin_access_consent IS NULL;

-- STEP 4: Update user_preferences RLS policy (now column exists)
DROP POLICY IF EXISTS "user_preferences_select_policy" ON user_preferences;

CREATE POLICY "user_preferences_select_policy"
ON user_preferences FOR SELECT
USING (
  -- Users can view their own data
  auth.uid() = user_id
  OR
  -- Admins can view data ONLY if user consented
  (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
    AND admin_access_consent = true
  )
);

-- STEP 5: Update onboarding_responses RLS policy
DROP POLICY IF EXISTS "onboarding_responses_select_policy" ON onboarding_responses;

CREATE POLICY "onboarding_responses_select_policy"
ON onboarding_responses FOR SELECT
USING (
  -- Users can view their own data
  auth.uid() = user_id
  OR
  -- Admins can view data ONLY if user consented
  (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
    AND admin_access_consent = true
  )
);

-- STEP 6: Verification
DO $$
BEGIN
  RAISE NOTICE '✅ Towns table: Now allows anon + authenticated read access';
  RAISE NOTICE '✅ user_preferences: Added admin_access_consent column';
  RAISE NOTICE '✅ onboarding_responses: Added admin_access_consent column';
  RAISE NOTICE '✅ RLS policies: Updated to check consent';
  RAISE NOTICE '📋 Existing users: Grandfathered in with consent=true';
  RAISE NOTICE '📋 New users: Will need to consent during onboarding';
END $$;
