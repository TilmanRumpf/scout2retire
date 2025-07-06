-- Fix favorites table to match what the application expects
-- Add missing columns if they don't exist

ALTER TABLE favorites 
ADD COLUMN IF NOT EXISTS town_name TEXT;

ALTER TABLE favorites 
ADD COLUMN IF NOT EXISTS town_country TEXT;

-- Update existing rows to have town_name and town_country from towns table
UPDATE favorites f
SET 
  town_name = t.name,
  town_country = t.country
FROM towns t
WHERE f.town_id = t.id
AND (f.town_name IS NULL OR f.town_country IS NULL);

-- Add comments for documentation
COMMENT ON COLUMN favorites.town_name IS 'Denormalized town name for performance';
COMMENT ON COLUMN favorites.town_country IS 'Denormalized country name for performance';

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'favorites' 
ORDER BY ordinal_position;
EOF < /dev/null