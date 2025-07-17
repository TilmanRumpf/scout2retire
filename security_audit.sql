-- SECURITY AUDIT: Check for users bypassing onboarding
-- DO NOT MODIFY ANY DATA - READ ONLY QUERIES

-- 1. Users with onboarding_completed = false who have activities
SELECT 
    '1. USERS WITH INCOMPLETE ONBOARDING BUT HAVE ACTIVITIES' as check_name,
    u.id,
    u.email,
    u.onboarding_completed,
    u.created_at,
    COUNT(DISTINCT f.id) as favorites_count,
    COUNT(DISTINCT j.id) as journal_count,
    COUNT(DISTINCT v.id) as visits_count,
    COUNT(DISTINCT cm.id) as messages_count
FROM users u
LEFT JOIN favorites f ON u.id = f.user_id
LEFT JOIN journal_entries j ON u.id = j.user_id
LEFT JOIN scheduled_visits v ON u.id = v.user_id
LEFT JOIN chat_messages cm ON u.id = cm.user_id
WHERE u.onboarding_completed = false
GROUP BY u.id, u.email, u.onboarding_completed, u.created_at
HAVING COUNT(DISTINCT f.id) > 0 
    OR COUNT(DISTINCT j.id) > 0 
    OR COUNT(DISTINCT v.id) > 0
    OR COUNT(DISTINCT cm.id) > 0
ORDER BY u.created_at DESC;

-- 2. Users with missing or incomplete profile data
SELECT 
    '2. USERS WITH MISSING PROFILE DATA' as check_name,
    u.id,
    u.email,
    u.onboarding_completed,
    u.full_name IS NULL as missing_name,
    u.nationality IS NULL as missing_nationality,
    u.retirement_year_estimate IS NULL as missing_retirement_year,
    u.hometown IS NULL as missing_hometown,
    o.id IS NULL as missing_onboarding_response
FROM users u
LEFT JOIN onboarding_responses o ON u.id = o.user_id
WHERE u.onboarding_completed = true 
    AND (u.full_name IS NULL 
        OR u.nationality IS NULL 
        OR u.retirement_year_estimate IS NULL
        OR o.id IS NULL);

-- 3. Auth users without corresponding user profiles
SELECT 
    '3. AUTH USERS WITHOUT PROFILES' as check_name,
    a.id as auth_id,
    a.email as auth_email,
    a.created_at as auth_created,
    u.id as user_id
FROM auth.users a
LEFT JOIN public.users u ON a.id = u.id
WHERE u.id IS NULL;

-- 4. Users with onboarding responses but onboarding_completed = false
SELECT 
    '4. USERS WITH RESPONSES BUT INCOMPLETE FLAG' as check_name,
    u.id,
    u.email,
    u.onboarding_completed,
    o.submitted_at,
    o.current_status IS NOT NULL as has_status,
    o.region_preferences IS NOT NULL as has_regions,
    o.climate_preferences IS NOT NULL as has_climate,
    o.culture_preferences IS NOT NULL as has_culture
FROM users u
INNER JOIN onboarding_responses o ON u.id = o.user_id
WHERE u.onboarding_completed = false;

-- 5. Check for orphaned data (activities without valid users)
SELECT 
    '5. ORPHANED FAVORITES' as check_name,
    f.user_id,
    COUNT(*) as count
FROM favorites f
LEFT JOIN users u ON f.user_id = u.id
WHERE u.id IS NULL
GROUP BY f.user_id;

SELECT 
    '5. ORPHANED JOURNAL ENTRIES' as check_name,
    j.user_id,
    COUNT(*) as count
FROM journal_entries j
LEFT JOIN users u ON j.user_id = u.id
WHERE u.id IS NULL
GROUP BY j.user_id;

-- 6. Users who have activities but no onboarding responses
SELECT 
    '6. USERS WITH ACTIVITIES BUT NO ONBOARDING DATA' as check_name,
    u.id,
    u.email,
    u.onboarding_completed,
    COUNT(DISTINCT f.id) as favorites_count,
    COUNT(DISTINCT j.id) as journal_count,
    o.id IS NULL as missing_onboarding_response
FROM users u
LEFT JOIN favorites f ON u.id = f.user_id
LEFT JOIN journal_entries j ON u.id = j.user_id
LEFT JOIN onboarding_responses o ON u.id = o.user_id
WHERE o.id IS NULL
    AND (f.id IS NOT NULL OR j.id IS NOT NULL)
GROUP BY u.id, u.email, u.onboarding_completed, o.id;

-- 7. Check recently created users for suspicious patterns
SELECT 
    '7. RECENT USER ACTIVITY PATTERNS' as check_name,
    u.id,
    u.email,
    u.created_at,
    u.onboarding_completed,
    EXTRACT(EPOCH FROM (COALESCE(f.min_created, NOW()) - u.created_at)) / 60 as minutes_to_first_favorite,
    EXTRACT(EPOCH FROM (COALESCE(j.min_created, NOW()) - u.created_at)) / 60 as minutes_to_first_journal,
    f.count as favorites_count,
    j.count as journal_count
FROM users u
LEFT JOIN (
    SELECT user_id, MIN(created_at) as min_created, COUNT(*) as count
    FROM favorites
    GROUP BY user_id
) f ON u.id = f.user_id
LEFT JOIN (
    SELECT user_id, MIN(created_at) as min_created, COUNT(*) as count
    FROM journal_entries
    GROUP BY user_id
) j ON u.id = j.user_id
WHERE u.created_at > NOW() - INTERVAL '7 days'
    AND (f.count > 0 OR j.count > 0)
ORDER BY u.created_at DESC;

-- 8. Summary statistics
SELECT 
    '8. SUMMARY STATISTICS' as check_name,
    COUNT(*) FILTER (WHERE onboarding_completed = true) as completed_onboarding,
    COUNT(*) FILTER (WHERE onboarding_completed = false) as incomplete_onboarding,
    COUNT(*) FILTER (WHERE onboarding_completed IS NULL) as null_onboarding,
    COUNT(*) as total_users
FROM users;