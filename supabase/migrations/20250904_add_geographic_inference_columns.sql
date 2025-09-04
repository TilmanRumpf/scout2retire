-- ============================================
-- Geographic Inference System Enhancement
-- ============================================
-- Date: 2025-09-04
-- Purpose: Add columns needed for the Geographic Inference hobby matching system
-- Author: Claude + Tilman
--
-- This migration adds two critical columns for the revolutionary hobby inference system
-- that reduces 865,000 hobby-town relationships to just 7-10 data points per town.
-- ============================================

-- 1. Add distance to nearest urban center for spillover effect calculations
-- Urban spillover rule: Towns within 40km of cities >50k population get 80% of urban amenities
ALTER TABLE towns 
ADD COLUMN IF NOT EXISTS distance_to_urban_center NUMERIC DEFAULT NULL;

-- 2. Add top hobbies array for validation layer
-- Stores the 10 most mentioned hobbies from real-world sources (expat forums, Google Places, etc.)
-- Used to validate and adjust inference confidence scores
ALTER TABLE towns 
ADD COLUMN IF NOT EXISTS top_hobbies TEXT[] DEFAULT NULL;

-- 3. Add performance index for distance queries
CREATE INDEX IF NOT EXISTS idx_towns_distance_urban 
ON towns(distance_to_urban_center)
WHERE distance_to_urban_center IS NOT NULL;

-- 4. Add GIN index for array searches on top_hobbies
CREATE INDEX IF NOT EXISTS idx_towns_top_hobbies
ON towns USING GIN(top_hobbies)
WHERE top_hobbies IS NOT NULL;

-- 5. Add documentation comments
COMMENT ON COLUMN towns.distance_to_urban_center IS 
'Distance in km to nearest city with population > 50,000. Used for urban spillover effect in Geographic Inference system. Towns within 40km get 80% of urban amenity scores.';

COMMENT ON COLUMN towns.top_hobbies IS 
'Top 10 most mentioned hobbies/activities for this town from real-world sources (expat forums, Google Places, TripAdvisor). Used as validation layer for Geographic Inference. NULL means no data collected yet.';

-- ============================================
-- USAGE EXAMPLES
-- ============================================
-- Example 1: Find towns with golf in top hobbies
-- SELECT name, country FROM towns WHERE 'golf' = ANY(top_hobbies);

-- Example 2: Find towns near urban centers
-- SELECT name, distance_to_urban_center 
-- FROM towns 
-- WHERE distance_to_urban_center < 40
-- ORDER BY distance_to_urban_center;

-- Example 3: Urban spillover calculation
-- SELECT 
--   name,
--   CASE 
--     WHEN population > 50000 THEN 1.0  -- Is urban center
--     WHEN distance_to_urban_center < 40 THEN 0.8  -- Urban spillover
--     ELSE 0.2  -- Rural
--   END as urban_amenity_score
-- FROM towns;

-- ============================================
-- ROLLBACK SCRIPT (if needed)
-- ============================================
-- ALTER TABLE towns DROP COLUMN IF EXISTS distance_to_urban_center;
-- ALTER TABLE towns DROP COLUMN IF EXISTS top_hobbies;
-- DROP INDEX IF EXISTS idx_towns_distance_urban;
-- DROP INDEX IF EXISTS idx_towns_top_hobbies;