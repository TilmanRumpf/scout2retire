-- ========================================================================
-- GEOGRAPHIC DATA STANDARDIZATION MIGRATION
-- Date: 2025-10-28
-- Purpose: Rename 'name' to 'town_name' and add ISO standard codes
--
-- Changes:
--   1. Add town_name column (copy from name)
--   2. Add country_code column (ISO 3166-1 alpha-2)
--   3. Add subdivision_code column (ISO 3166-2)
--   4. Keep 'name' temporarily for backward compatibility
--
-- SAFETY: This migration does NOT drop the old 'name' column
--         Drop manually only after full verification
-- ========================================================================

BEGIN;

-- Step 1: Add new columns
ALTER TABLE towns
ADD COLUMN IF NOT EXISTS town_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS country_code VARCHAR(2),
ADD COLUMN IF NOT EXISTS subdivision_code VARCHAR(10);

-- Step 2: Copy existing data to new column
UPDATE towns SET town_name = name WHERE town_name IS NULL;

-- Step 3: Add comments for documentation
COMMENT ON COLUMN towns.town_name IS 'Name of the town/city (formerly "name")';
COMMENT ON COLUMN towns.country_code IS 'ISO 3166-1 alpha-2 country code (US, AE, CA, etc.)';
COMMENT ON COLUMN towns.subdivision_code IS 'ISO 3166-2 subdivision code (FL, AZ, ON, etc.) - NULL if no standard code exists';
COMMENT ON COLUMN towns.name IS 'DEPRECATED: Use town_name instead. Kept for backward compatibility during migration.';

-- Step 4: Create index on town_name for search performance
CREATE INDEX IF NOT EXISTS idx_towns_town_name ON towns(town_name);
CREATE INDEX IF NOT EXISTS idx_towns_country_code ON towns(country_code);
CREATE INDEX IF NOT EXISTS idx_towns_subdivision_code ON towns(subdivision_code) WHERE subdivision_code IS NOT NULL;

-- Step 5: Verify data was copied correctly
DO $$
DECLARE
  name_count INTEGER;
  town_name_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO name_count FROM towns WHERE name IS NOT NULL;
  SELECT COUNT(*) INTO town_name_count FROM towns WHERE town_name IS NOT NULL;

  IF name_count != town_name_count THEN
    RAISE EXCEPTION 'Data verification failed: name count (%) != town_name count (%)', name_count, town_name_count;
  END IF;

  RAISE NOTICE 'Data verification passed: % records copied successfully', town_name_count;
END $$;

COMMIT;

-- ========================================================================
-- VERIFICATION QUERIES (Run these manually to verify migration)
-- ========================================================================

-- Check that all names were copied
-- SELECT
--   COUNT(*) FILTER (WHERE name IS NOT NULL) as name_count,
--   COUNT(*) FILTER (WHERE town_name IS NOT NULL) as town_name_count,
--   COUNT(*) FILTER (WHERE name != town_name) as mismatch_count
-- FROM towns;

-- View sample data
-- SELECT id, name, town_name, country, country_code, region, subdivision_code
-- FROM towns
-- LIMIT 10;

-- ========================================================================
-- TO DROP OLD COLUMN (Only after full verification and code updates)
-- ========================================================================

-- WARNING: Only run this after:
-- 1. All code has been updated to use town_name
-- 2. All tests pass
-- 3. Production is verified working
--
-- ALTER TABLE towns DROP COLUMN name;
