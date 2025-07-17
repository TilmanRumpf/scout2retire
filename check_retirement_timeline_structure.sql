-- Check the EXACT structure of retirement_timeline data in onboarding_responses
-- This query will show us what's actually stored in the database

-- First, let's see the raw JSONB data for a few sample records
SELECT 
    id,
    user_id,
    current_status,
    current_status->'retirement_timeline' as retirement_timeline_raw,
    jsonb_pretty(current_status->'retirement_timeline') as retirement_timeline_pretty
FROM onboarding_responses
WHERE current_status->'retirement_timeline' IS NOT NULL
LIMIT 5;

-- Now let's check what keys exist in the retirement_timeline object
SELECT DISTINCT
    jsonb_object_keys(current_status->'retirement_timeline') as timeline_keys
FROM onboarding_responses
WHERE current_status->'retirement_timeline' IS NOT NULL;

-- Check if we have the expected fields (target_year, target_month, target_day)
SELECT 
    COUNT(*) as total_records,
    COUNT(current_status->'retirement_timeline'->'target_year') as has_target_year,
    COUNT(current_status->'retirement_timeline'->'target_month') as has_target_month,
    COUNT(current_status->'retirement_timeline'->'target_day') as has_target_day,
    COUNT(current_status->'retirement_timeline'->'month') as has_month,
    COUNT(current_status->'retirement_timeline'->'year') as has_year
FROM onboarding_responses
WHERE current_status->'retirement_timeline' IS NOT NULL;

-- Show a variety of retirement_timeline structures to see all variations
SELECT DISTINCT ON (jsonb_typeof(current_status->'retirement_timeline'))
    jsonb_typeof(current_status->'retirement_timeline') as data_type,
    current_status->'retirement_timeline' as sample_data,
    jsonb_pretty(current_status->'retirement_timeline') as sample_data_pretty
FROM onboarding_responses
WHERE current_status->'retirement_timeline' IS NOT NULL;

-- Get a comprehensive view of all unique retirement_timeline structures
SELECT 
    current_status->'retirement_timeline' as retirement_timeline,
    COUNT(*) as occurrence_count
FROM onboarding_responses
WHERE current_status->'retirement_timeline' IS NOT NULL
GROUP BY current_status->'retirement_timeline'
ORDER BY occurrence_count DESC
LIMIT 10;