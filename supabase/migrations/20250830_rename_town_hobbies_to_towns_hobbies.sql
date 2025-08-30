-- Migration: Rename town_hobbies table to towns_hobbies for consistency
-- Date: 2025-08-30
-- Description: Renames the junction table from town_hobbies to towns_hobbies
--              to match the naming convention (towns_ prefix)

-- Step 1: Rename the table
ALTER TABLE IF EXISTS town_hobbies RENAME TO towns_hobbies;

-- Step 2: Rename the indexes if they exist
ALTER INDEX IF EXISTS idx_town_hobbies_town_id RENAME TO idx_towns_hobbies_town_id;
ALTER INDEX IF EXISTS idx_town_hobbies_hobby_id RENAME TO idx_towns_hobbies_hobby_id;

-- Step 3: Verification query (run separately to check results)
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('town_hobbies', 'towns_hobbies');
-- Expected result: Only 'towns_hobbies' should appear