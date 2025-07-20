-- Migration SQL for consolidating onboarding data
-- Run this in Supabase Dashboard SQL Editor

-- Step 1: Add partner citizenship columns to user_preferences table
ALTER TABLE user_preferences 
  ADD COLUMN IF NOT EXISTS partner_primary_citizenship TEXT,
  ADD COLUMN IF NOT EXISTS partner_secondary_citizenship TEXT;

-- Step 2: Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_preferences' 
AND column_name LIKE 'partner_%'
ORDER BY column_name;

-- Step 3: Check migration status
SELECT 
  (SELECT COUNT(*) FROM onboarding_responses) as total_onboarding_records,
  (SELECT COUNT(*) FROM user_preferences WHERE onboarding_completed = true) as already_migrated,
  (SELECT COUNT(DISTINCT o.user_id) 
   FROM onboarding_responses o
   LEFT JOIN user_preferences p ON o.user_id = p.user_id
   WHERE p.user_id IS NULL OR p.onboarding_completed = false) as needs_migration;

-- Step 4: After running the migration script, verify partner data
SELECT 
  user_id,
  family_status,
  partner_primary_citizenship,
  partner_secondary_citizenship
FROM user_preferences
WHERE family_status IN ('couple', 'family')
AND partner_primary_citizenship IS NOT NULL;