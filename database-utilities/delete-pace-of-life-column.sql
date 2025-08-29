-- Delete duplicate pace_of_life column from towns table
-- pace_of_life has only 36 towns (redundant), pace_of_life_actual has all 341 towns

-- First verify the data situation
SELECT 
  COUNT(*) FILTER (WHERE pace_of_life IS NOT NULL) as pace_of_life_count,
  COUNT(*) FILTER (WHERE pace_of_life_actual IS NOT NULL) as pace_of_life_actual_count,
  COUNT(*) FILTER (WHERE pace_of_life != pace_of_life_actual) as conflicts
FROM towns;

-- If count is 0, proceed with deletion:
ALTER TABLE towns 
DROP COLUMN IF EXISTS pace_of_life;

-- Verify the column has been dropped
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'towns' 
  AND column_name = 'pace_of_life';