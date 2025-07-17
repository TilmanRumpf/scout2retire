-- 1. Show ALL columns in the towns table with their data types
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'towns'
ORDER BY ordinal_position;

-- 2. Show a complete example of one town with all non-null fields
-- Using Porto as an example since it's likely to have comprehensive data
SELECT * FROM towns 
WHERE name = 'Porto' 
  AND country = 'Portugal'
LIMIT 1;

-- Alternative: Get the town with the most complete data
-- SELECT * FROM towns
-- WHERE cost_index IS NOT NULL
--   AND healthcare_score IS NOT NULL
--   AND safety_score IS NOT NULL
--   AND climate IS NOT NULL
--   AND population IS NOT NULL
--   AND expat_population IS NOT NULL
--   AND description IS NOT NULL
-- ORDER BY 
--   CASE WHEN avg_temp_summer IS NOT NULL THEN 1 ELSE 0 END +
--   CASE WHEN avg_temp_winter IS NOT NULL THEN 1 ELSE 0 END +
--   CASE WHEN rent_1bed IS NOT NULL THEN 1 ELSE 0 END +
--   CASE WHEN hospital_count IS NOT NULL THEN 1 ELSE 0 END +
--   CASE WHEN internet_speed IS NOT NULL THEN 1 ELSE 0 END DESC
-- LIMIT 1;
