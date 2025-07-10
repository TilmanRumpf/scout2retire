-- Fix broken Google Maps goo.gl links by replacing with standard Google Maps search URLs
-- This uses the town name and country to create a search query

-- Update all google_maps_link entries to use the new format
UPDATE towns
SET google_maps_link = 
    'https://www.google.com/maps/search/' || 
    REPLACE(REPLACE(REPLACE(name || '+' || country, ' ', '+'), ',', ''), '''', '')
WHERE google_maps_link LIKE '%goo.gl%' 
   OR google_maps_link LIKE '%maps.app.goo.gl%'
   OR google_maps_link IS NULL
   OR google_maps_link = '';

-- Add a comment to track when this migration was run
COMMENT ON COLUMN towns.google_maps_link IS 'Google Maps search URL for the town. Updated from legacy goo.gl links on 2025-01-10';