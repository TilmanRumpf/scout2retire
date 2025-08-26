-- Check the structure of onboarding_responses table
-- This query shows all columns, their data types, and constraints

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'onboarding_responses'
ORDER BY ordinal_position;

-- Sample a row to see the actual data structure
SELECT 
    user_id,
    current_status,
    region_preferences,
    submitted_at
FROM onboarding_responses 
LIMIT 1;

-- Check specifically the current_status field structure
SELECT 
    user_id,
    current_status->'citizenship' as citizenship_data,
    current_status->'retirement_timeline' as retirement_data,
    current_status->'family_situation' as family_status,
    current_status->'pet_owner' as pet_data
FROM onboarding_responses 
WHERE current_status IS NOT NULL
LIMIT 1;