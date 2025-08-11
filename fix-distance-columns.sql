-- Change distance columns from INTEGER to TEXT to store range values
-- This allows storing values like "< 5 km", "5-10 km", etc.

-- Change distance_to_ocean_km to TEXT
ALTER TABLE towns 
ALTER COLUMN distance_to_ocean_km TYPE TEXT;

-- Also change other distance fields to TEXT for consistency
ALTER TABLE towns 
ALTER COLUMN airport_distance TYPE TEXT;

ALTER TABLE towns 
ALTER COLUMN nearest_major_hospital_km TYPE TEXT;

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'towns' 
AND column_name IN ('distance_to_ocean_km', 'airport_distance', 'nearest_major_hospital_km');