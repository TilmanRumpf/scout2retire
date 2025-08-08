-- Step 1: Drop the existing check constraints
ALTER TABLE towns DROP CONSTRAINT IF EXISTS towns_pace_of_life_check;
ALTER TABLE towns DROP CONSTRAINT IF EXISTS towns_pace_of_life_actual_check;

-- Step 2: Update all "slow" values to "relaxed"
UPDATE towns 
SET pace_of_life = 'relaxed' 
WHERE pace_of_life = 'slow';

UPDATE towns 
SET pace_of_life_actual = 'relaxed' 
WHERE pace_of_life_actual = 'slow';

-- Step 3: Add new check constraints with "relaxed" instead of "slow"
ALTER TABLE towns 
ADD CONSTRAINT towns_pace_of_life_check 
CHECK (pace_of_life IN ('fast', 'moderate', 'relaxed'));

ALTER TABLE towns 
ADD CONSTRAINT towns_pace_of_life_actual_check 
CHECK (pace_of_life_actual IN ('fast', 'moderate', 'relaxed'));

-- Step 4: Verify the changes
SELECT 
  pace_of_life, 
  COUNT(*) as count 
FROM towns 
WHERE pace_of_life IS NOT NULL 
GROUP BY pace_of_life 
ORDER BY count DESC;

SELECT 
  pace_of_life_actual, 
  COUNT(*) as count 
FROM towns 
WHERE pace_of_life_actual IS NOT NULL 
GROUP BY pace_of_life_actual 
ORDER BY count DESC;