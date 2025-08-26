-- Fix missing target_month in retirement_timeline
-- Some users have target_year and target_day but missing target_month

-- First, let's check how many records have this issue
SELECT 
    user_id,
    current_status->'retirement_timeline' as retirement_timeline,
    current_status->'retirement_timeline'->>'target_year' as target_year,
    current_status->'retirement_timeline'->>'target_month' as target_month,
    current_status->'retirement_timeline'->>'target_day' as target_day
FROM onboarding_responses
WHERE current_status->'retirement_timeline' IS NOT NULL
    AND current_status->'retirement_timeline'->>'target_year' IS NOT NULL
    AND current_status->'retirement_timeline'->>'target_month' IS NULL;

-- Update records with missing target_month to January (1)
UPDATE onboarding_responses
SET current_status = jsonb_set(
    current_status,
    '{retirement_timeline,target_month}',
    '1'::jsonb
)
WHERE current_status->'retirement_timeline' IS NOT NULL
    AND current_status->'retirement_timeline'->>'target_year' IS NOT NULL
    AND current_status->'retirement_timeline'->>'target_month' IS NULL;

-- Verify the fix
SELECT 
    user_id,
    current_status->'retirement_timeline' as retirement_timeline_after_fix
FROM onboarding_responses
WHERE user_id = '83d285b2-b21b-4d13-a1a1-6d51b6733d52';