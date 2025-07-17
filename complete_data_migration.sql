-- Complete the data migration from onboarding_responses to users columns
-- This will populate all the NULL columns with actual user data

-- First, let's check what we're migrating
SELECT 
  u.email,
  u.primary_citizenship,
  o.current_status->>'retirement_status' as json_retirement_status,
  o.current_status->'citizenship'->>'primary_citizenship' as json_citizenship
FROM users u
JOIN onboarding_responses o ON u.id = o.user_id
WHERE u.onboarding_completed = true
LIMIT 5;

-- Run the migration function
SELECT * FROM migrate_onboarding_to_users_columns();

-- Verify migration worked
SELECT 
  email,
  primary_citizenship,
  retirement_status,
  summer_temp_preference,
  total_budget_usd
FROM users 
WHERE onboarding_completed = true
LIMIT 5;