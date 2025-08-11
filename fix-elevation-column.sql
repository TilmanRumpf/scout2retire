-- Change elevation_meters column from INTEGER to TEXT to store range values
-- This allows storing values like "0-50m", "0-300m", "200-600m", etc.

-- Change elevation_meters to TEXT
ALTER TABLE towns 
ALTER COLUMN elevation_meters TYPE TEXT;

-- Verify the change
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'towns' 
AND column_name = 'elevation_meters';