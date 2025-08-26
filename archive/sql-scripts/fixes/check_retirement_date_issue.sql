-- Check retirement date in onboarding_responses
-- This will help us understand why retirement date shows "Not set"

-- 1. Check if user has onboarding data
SELECT 
    user_id,
    current_status,
    created_at,
    updated_at,
    submitted_at
FROM onboarding_responses
WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email = 'tilman.rumpf@gmail.com'
)
ORDER BY created_at DESC;

-- 2. Check the structure of current_status for this user
SELECT 
    user_id,
    current_status->>'retirement_timeline' as retirement_timeline_raw,
    current_status->'retirement_timeline'->>'status' as retirement_status,
    current_status->'retirement_timeline'->>'target_year' as target_year,
    current_status->'retirement_timeline'->>'target_month' as target_month,
    current_status->'retirement_timeline'->>'target_day' as target_day,
    current_status->'retirement_timeline'->>'year' as year,
    current_status->'retirement_timeline'->>'month' as month,
    current_status->'retirement_timeline'->>'day' as day
FROM onboarding_responses
WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email = 'tilman.rumpf@gmail.com'
);

-- 3. Check the users table to see if retirement_date is stored there
SELECT 
    id,
    email,
    full_name,
    nationality,
    retirement_date,
    retirement_year_estimate,
    created_at,
    updated_at
FROM users
WHERE id IN (
    SELECT id FROM auth.users 
    WHERE email = 'tilman.rumpf@gmail.com'
);

-- 4. Pretty print the current_status JSON for manual inspection
SELECT 
    jsonb_pretty(current_status) as current_status_formatted
FROM onboarding_responses
WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email = 'tilman.rumpf@gmail.com'
);