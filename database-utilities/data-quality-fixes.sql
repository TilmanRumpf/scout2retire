-- ============================================
-- DATA QUALITY FIXES
-- Generated: October 19, 2025
-- Total fixes: 2 (affecting 40 items)
-- ============================================
-- IMPORTANT:
-- 1. Create database snapshot first: node create-database-snapshot.js
-- 2. Test on development database before production
-- 3. Execute fixes one at a time
-- 4. Verify results after each fix
-- ============================================

-- ============================================
-- Fix 1: Canadian Healthcare Costs
-- Issue: 20 Canadian towns show $0 healthcare cost
-- Impact: 20 towns
-- Risk: Low
-- Estimated time: 5 minutes
-- ============================================

-- Current state (verify before running)
SELECT name, country, healthcare_cost_monthly, healthcare_cost
FROM towns
WHERE country = 'Canada' AND healthcare_cost_monthly = 0
ORDER BY name;

-- Expected: 20 rows returned

-- Execute fix
UPDATE towns
SET healthcare_cost_monthly = 75,
    healthcare_cost = 75
WHERE country = 'Canada'
  AND healthcare_cost_monthly = 0;

-- Verify fix
SELECT name, country, healthcare_cost_monthly, healthcare_cost
FROM towns
WHERE country = 'Canada'
ORDER BY name;

-- Expected: All Canadian towns now show healthcare_cost_monthly = 75

-- ============================================
-- Fix 2: Drop Empty Columns
-- Issue: 20 columns are 100% empty across all towns
-- Impact: Reduces schema from 190 to 170 columns (10.5% reduction)
-- Risk: Low (no data exists)
-- Estimated time: 10 minutes
-- ============================================

-- Current state (verify these columns are truly empty)
SELECT
  COUNT(*) as total_towns,
  COUNT(image_url_3) as image_url_3_filled,
  COUNT(image_urls) as image_urls_filled,
  COUNT(expat_groups) as expat_groups_filled,
  COUNT(international_flights_direct) as intl_flights_filled,
  COUNT(regional_airport_distance) as regional_airport_filled,
  COUNT(international_airport_distance) as intl_airport_filled,
  COUNT(internet_reliability) as internet_rel_filled,
  COUNT(mobile_coverage) as mobile_cov_filled,
  COUNT(bike_infrastructure) as bike_infra_filled,
  COUNT(road_quality) as road_quality_filled,
  COUNT(traffic_congestion) as traffic_filled,
  COUNT(parking_availability) as parking_filled,
  COUNT(banking_infrastructure) as banking_filled,
  COUNT(digital_services_availability) as digital_svcs_filled,
  COUNT(sports_facilities) as sports_filled,
  COUNT(mountain_activities) as mountain_filled,
  COUNT(water_sports_available) as water_sports_filled,
  COUNT(cultural_activities) as cultural_filled,
  COUNT(nearest_major_city) as nearest_city_filled,
  COUNT(timezone) as timezone_filled
FROM towns;

-- Expected: total_towns = 352, all other counts = 0

-- WARNING: This operation cannot be easily reversed
-- Create a database snapshot before running!

-- Execute fix (comment out if not ready)
-- ALTER TABLE towns
--   DROP COLUMN IF EXISTS image_url_3,
--   DROP COLUMN IF EXISTS image_urls,
--   DROP COLUMN IF EXISTS expat_groups,
--   DROP COLUMN IF EXISTS international_flights_direct,
--   DROP COLUMN IF EXISTS regional_airport_distance,
--   DROP COLUMN IF EXISTS international_airport_distance,
--   DROP COLUMN IF EXISTS internet_reliability,
--   DROP COLUMN IF EXISTS mobile_coverage,
--   DROP COLUMN IF EXISTS bike_infrastructure,
--   DROP COLUMN IF EXISTS road_quality,
--   DROP COLUMN IF EXISTS traffic_congestion,
--   DROP COLUMN IF EXISTS parking_availability,
--   DROP COLUMN IF EXISTS banking_infrastructure,
--   DROP COLUMN IF EXISTS digital_services_availability,
--   DROP COLUMN IF EXISTS sports_facilities,
--   DROP COLUMN IF EXISTS mountain_activities,
--   DROP COLUMN IF EXISTS water_sports_available,
--   DROP COLUMN IF EXISTS cultural_activities,
--   DROP COLUMN IF EXISTS nearest_major_city,
--   DROP COLUMN IF EXISTS timezone;

-- Verify fix
-- SELECT COUNT(*) as column_count
-- FROM information_schema.columns
-- WHERE table_name = 'towns';

-- Expected: column_count reduced by 20 (was 190, now 170)

-- ============================================
-- Additional Recommended Reviews (Manual)
-- ============================================

-- Review 1: Duplicate Cost Values
-- Issue: $2,793 appears in 30 US towns (templated value?)
SELECT name, country, cost_of_living_usd, rent_1bed
FROM towns
WHERE cost_of_living_usd = 2793
ORDER BY name;

-- Action: Verify each town's cost is accurate, not copy-pasted

-- Review 2: Duplicate Cost Values
-- Issue: $998 appears in 21 international towns
SELECT name, country, cost_of_living_usd, rent_1bed
FROM towns
WHERE cost_of_living_usd = 998
ORDER BY name;

-- Action: Verify each town's cost is accurate, not copy-pasted

-- Review 3: Quality of Life Score Distribution
SELECT
  quality_of_life,
  COUNT(*) as town_count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM towns), 1) as percentage
FROM towns
WHERE quality_of_life IS NOT NULL
GROUP BY quality_of_life
ORDER BY quality_of_life;

-- Issue: 97% of towns score 8-9 (lack of granularity)
-- Action: Consider implementing decimal scoring (7.5, 8.2, etc.)

-- ============================================
-- Validation Queries
-- ============================================

-- Check for remaining data quality issues
SELECT
  'Zero healthcare costs' as issue,
  COUNT(*) as affected_towns
FROM towns
WHERE healthcare_cost_monthly = 0
  AND country != 'Canada'

UNION ALL

SELECT
  'Very high costs (>$5000)' as issue,
  COUNT(*) as affected_towns
FROM towns
WHERE cost_of_living_usd > 5000

UNION ALL

SELECT
  'Very low healthcare score (<4)' as issue,
  COUNT(*) as affected_towns
FROM towns
WHERE healthcare_score < 4

UNION ALL

SELECT
  'Missing critical data (name/country)' as issue,
  COUNT(*) as affected_towns
FROM towns
WHERE name IS NULL OR country IS NULL;

-- Expected: All counts should be 0 or very low

-- ============================================
-- Summary Statistics After Fixes
-- ============================================

SELECT
  'Total towns' as metric,
  COUNT(*) as value
FROM towns

UNION ALL

SELECT
  'Avg cost of living (USD)',
  ROUND(AVG(cost_of_living_usd), 2)
FROM towns

UNION ALL

SELECT
  'Avg healthcare cost (USD)',
  ROUND(AVG(healthcare_cost_monthly), 2)
FROM towns
WHERE healthcare_cost_monthly IS NOT NULL

UNION ALL

SELECT
  'Avg quality of life',
  ROUND(AVG(quality_of_life), 2)
FROM towns
WHERE quality_of_life IS NOT NULL;

-- ============================================
-- END OF FIX SCRIPT
-- ============================================

-- Next Steps:
-- 1. Review audit report: /docs/database/DATA_QUALITY_AUDIT_2025-10-19.md
-- 2. Schedule quality of life rescoring
-- 3. Implement data quality tracking fields
-- 4. Plan next audit for November 19, 2025
