-- Update Google Maps links to use the Maps Embed API format with zoom level
-- This format provides more consistent zoom control
-- Zoom level 13 = approximately 5-mile (8km) radius view

UPDATE towns
SET google_maps_link = 
    'https://www.google.com/maps/search/' || 
    REPLACE(REPLACE(REPLACE(
        name || ',+' || country, 
        ' ', '+'), 
        '''', ''), 
        '++', '+') || 
    '?z=13'
WHERE google_maps_link IS NOT NULL;

-- Add a comment to track this update
COMMENT ON COLUMN towns.google_maps_link IS 'Google Maps search URL with zoom level 13 (5-mile view). Updated 2025-01-10';