-- Check which user tables exist and have data
SELECT 'users' as table_name, COUNT(*) FROM users 
UNION ALL 
SELECT 'user_preferences', COUNT(*) FROM user_preferences 
UNION ALL 
SELECT 'onboarding_responses', COUNT(*) FROM onboarding_responses;

-- Check specific user data
SELECT 
    id,
    email,
    primary_citizenship,
    partner_primary_citizenship,
    onboarding_completed
FROM users 
LIMIT 3;

-- Check onboarding responses structure
SELECT 
    user_id,
    current_status->>'family_situation' as family_situation,
    current_status->'citizenship'->>'primary_citizenship' as primary_citizenship,
    current_status->'partner_citizenship'->>'primary_citizenship' as partner_citizenship
FROM onboarding_responses 
LIMIT 3;