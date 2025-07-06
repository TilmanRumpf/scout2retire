-- Add town_country column to favorites table if it doesn't exist
ALTER TABLE favorites 
ADD COLUMN IF NOT EXISTS town_country TEXT;

-- Update existing rows to have town_country from towns table
UPDATE favorites f
SET town_country = t.country
FROM towns t
WHERE f.town_id = t.id
AND f.town_country IS NULL;