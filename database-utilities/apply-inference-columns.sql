-- Direct SQL to add Geographic Inference columns
-- Run this in Supabase Dashboard SQL Editor

-- 1. Add distance_to_urban_center column
ALTER TABLE towns 
ADD COLUMN IF NOT EXISTS distance_to_urban_center NUMERIC DEFAULT NULL;

-- 2. Add top_hobbies column  
ALTER TABLE towns 
ADD COLUMN IF NOT EXISTS top_hobbies TEXT[] DEFAULT NULL;

-- 3. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_towns_distance_urban 
ON towns(distance_to_urban_center)
WHERE distance_to_urban_center IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_towns_top_hobbies
ON towns USING GIN(top_hobbies)
WHERE top_hobbies IS NOT NULL;

-- 4. Add documentation
COMMENT ON COLUMN towns.distance_to_urban_center IS 
'Distance in km to nearest city with population > 50,000. Used for urban spillover effect.';

COMMENT ON COLUMN towns.top_hobbies IS 
'Top 10 most mentioned hobbies from real-world sources. Validation layer for inference.';

-- 5. Verify columns were added
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'towns' 
  AND column_name IN ('distance_to_urban_center', 'top_hobbies');