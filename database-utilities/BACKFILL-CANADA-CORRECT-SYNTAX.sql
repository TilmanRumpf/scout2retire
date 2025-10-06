-- ============================================================================
-- CANADA BACKFILL - CORRECT POSTGRESQL SYNTAX
-- Fixed: Proper array syntax for text[] columns
-- ============================================================================

-- Annapolis Royal
UPDATE towns
SET activity_infrastructure = ARRAY['parks','trails','beaches','cultural_sites','shopping','dining']::text[],
    travel_connectivity_rating = 6,
    social_atmosphere = 'moderate',
    traditional_progressive_lean = 'balanced',
    cost_index = 80,
    climate = 'Maritime temperate',
    population = 500
WHERE name = 'Annapolis Royal';

-- Test it worked
SELECT name, activity_infrastructure, cost_index, climate FROM towns WHERE name = 'Annapolis Royal';
