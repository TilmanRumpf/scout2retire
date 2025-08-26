-- Comprehensive analysis of onboarding data save process
-- This query helps understand exactly how data is saved and structured

-- 1. Check table structure
SELECT 
    'Table Structure' as section,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'onboarding_responses'
ORDER BY ordinal_position;

-- 2. Check if there are any rows
SELECT 
    'Row Count' as section,
    COUNT(*) as total_rows
FROM onboarding_responses;

-- 3. Examine the JSONB structure of each onboarding field
SELECT 
    'Sample Data Structure' as section,
    user_id,
    jsonb_pretty(current_status) as current_status_pretty,
    jsonb_pretty(region_preferences) as region_preferences_pretty,
    jsonb_pretty(climate_preferences) as climate_preferences_pretty,
    jsonb_pretty(culture_preferences) as culture_preferences_pretty,
    jsonb_pretty(hobbies) as hobbies_pretty,
    jsonb_pretty(administration) as administration_pretty,
    jsonb_pretty(costs) as costs_pretty
FROM onboarding_responses
LIMIT 1;

-- 4. Check specific transformations that occur during save
-- Current Status transformations
SELECT 
    'Current Status Transformations' as section,
    user_id,
    current_status->'family_situation' as family_situation_saved,
    current_status->'citizenship' as citizenship_saved,
    current_status->'partner_citizenship' as partner_citizenship_saved,
    current_status->'retirement_timeline' as retirement_timeline_saved,
    current_status->'pet_owner' as pet_owner_saved
FROM onboarding_responses
WHERE current_status IS NOT NULL
LIMIT 1;

-- 5. Check Region Preferences structure
SELECT 
    'Region Preferences Structure' as section,
    user_id,
    region_preferences->'regions' as regions_array,
    region_preferences->'countries' as countries_array,
    region_preferences->'provinces' as provinces_array,
    region_preferences->'geographic_features' as features_array,
    region_preferences->'vegetation_types' as vegetation_array
FROM onboarding_responses
WHERE region_preferences IS NOT NULL
LIMIT 1;

-- 6. Check data types within JSONB
SELECT 
    'JSONB Data Types' as section,
    user_id,
    jsonb_typeof(current_status->'family_situation') as family_situation_type,
    jsonb_typeof(current_status->'pet_owner') as pet_owner_type,
    jsonb_typeof(region_preferences->'regions') as regions_type,
    jsonb_typeof(region_preferences->'countries') as countries_type
FROM onboarding_responses
WHERE current_status IS NOT NULL AND region_preferences IS NOT NULL
LIMIT 1;

-- 7. Check for any null vs undefined handling
SELECT 
    'Null/Undefined Handling' as section,
    user_id,
    CASE 
        WHEN current_status ? 'partner_citizenship' THEN 'Key exists'
        ELSE 'Key missing'
    END as partner_citizenship_presence,
    CASE 
        WHEN current_status->'partner_citizenship' = 'null'::jsonb THEN 'Value is null'
        WHEN current_status->'partner_citizenship' IS NULL THEN 'Value is SQL NULL'
        ELSE 'Has value'
    END as partner_citizenship_value
FROM onboarding_responses
WHERE current_status IS NOT NULL
LIMIT 5;