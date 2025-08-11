-- Add column to store search query templates for each field
-- This will help with Google verification and future AI data enrichment

-- Add search_queries column as JSONB
ALTER TABLE towns 
ADD COLUMN IF NOT EXISTS search_queries JSONB DEFAULT '{}';

-- Example structure:
-- {
--   "population": "population of {town_name} {country} 2024",
--   "elevation_meters": "elevation range {town_name} {region} {country} meters",
--   "distance_to_ocean_km": "distance from {town_name} to ocean coast kilometers",
--   "climate": "climate {town_name} {country} weather patterns",
--   "cost_of_living_usd": "cost of living {town_name} {country} USD monthly"
-- }

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'towns' 
AND column_name = 'search_queries';