-- Update pace_of_life values from "slow" to "relaxed"
-- This script needs to be executed manually in Supabase SQL Editor

-- Step 1: Drop the existing check constraints (if they exist)
-- Note: This will temporarily remove validation on these columns
ALTER TABLE towns DROP CONSTRAINT IF EXISTS towns_pace_of_life_check;
ALTER TABLE towns DROP CONSTRAINT IF EXISTS towns_pace_of_life_actual_check;

-- Step 2: Update the pace_of_life column values
UPDATE towns SET pace_of_life = 'relaxed' WHERE pace_of_life = 'slow';

-- Step 3: Update the pace_of_life_actual column values  
UPDATE towns SET pace_of_life_actual = 'relaxed' WHERE pace_of_life_actual = 'slow';

-- Step 4: Add new check constraints with the updated allowed values
-- Replace 'slow' with 'relaxed' in the allowed values
ALTER TABLE towns ADD CONSTRAINT towns_pace_of_life_check 
CHECK (pace_of_life IN ('fast', 'moderate', 'relaxed'));

ALTER TABLE towns ADD CONSTRAINT towns_pace_of_life_actual_check 
CHECK (pace_of_life_actual IN ('fast', 'moderate', 'relaxed'));

-- Step 5: Verify the changes
SELECT 
  pace_of_life,
  COUNT(*) as count
FROM towns 
WHERE pace_of_life IS NOT NULL
GROUP BY pace_of_life
ORDER BY pace_of_life;

SELECT 
  pace_of_life_actual,
  COUNT(*) as count  
FROM towns
WHERE pace_of_life_actual IS NOT NULL
GROUP BY pace_of_life_actual
ORDER BY pace_of_life_actual;

-- Expected results after update:
-- pace_of_life should show: fast, moderate, relaxed (no 'slow')
-- pace_of_life_actual should show: fast, moderate, relaxed (no 'slow')