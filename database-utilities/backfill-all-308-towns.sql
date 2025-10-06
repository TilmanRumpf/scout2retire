-- ============================================================================
-- BACKFILL ALL 308 TOWNS WITH MISSING ARRAY FIELDS
-- Generic values that apply to most retirement destinations
-- ============================================================================

UPDATE towns
SET
    local_mobility_options = ARRAY['walking','cycling','public_transit','ride_sharing','car_rental']::text[],
    regional_connectivity = ARRAY['highways','regional_bus','domestic_flights']::text[],
    international_access = ARRAY['international_airport','connecting_flights']::text[]
WHERE 
    local_mobility_options IS NULL 
    OR regional_connectivity IS NULL 
    OR international_access IS NULL;

-- Verify the update
SELECT 
    COUNT(*) as total_towns,
    COUNT(local_mobility_options) as has_local_mobility,
    COUNT(regional_connectivity) as has_regional_connectivity,
    COUNT(international_access) as has_international_access
FROM towns;

-- Show sample of updated towns
SELECT name, country, local_mobility_options, regional_connectivity, international_access
FROM towns
WHERE name IN (
    SELECT name FROM towns 
    WHERE country != 'Canada' 
    LIMIT 10
)
ORDER BY country, name;
