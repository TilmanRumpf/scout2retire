-- =====================================================
-- ROLLBACK: Photo System Overhaul
-- =====================================================
-- Purpose: Cleanly reverse the town_images migration if needed
--
-- WARNING: This will NOT delete data from towns table columns.
--          The original image_url_1/2/3 columns remain intact.
--          This only removes the new town_images table and trigger.
--
-- Use Case: If migration causes issues and you need to revert
--
-- To rollback: Run this file
-- To re-migrate: Run 20251109000000_create_town_images_table.sql again
-- =====================================================

-- =====================================================
-- STEP 1: Drop trigger and function
-- =====================================================

DROP TRIGGER IF EXISTS sync_town_cache_image ON public.town_images;
DROP FUNCTION IF EXISTS sync_town_cache_image();

-- =====================================================
-- STEP 2: Drop policies (before dropping table)
-- =====================================================

DROP POLICY IF EXISTS "Public can view town images" ON public.town_images;
DROP POLICY IF EXISTS "Admins can manage town images" ON public.town_images;

-- =====================================================
-- STEP 3: Drop table
-- =====================================================

-- Note: This does NOT affect towns.image_url_1/2/3 columns
-- Those remain intact with all original data
DROP TABLE IF EXISTS public.town_images CASCADE;

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Rollback complete';
  RAISE NOTICE 'town_images table dropped';
  RAISE NOTICE 'Original towns.image_url_1/2/3 columns remain intact';
  RAISE NOTICE '';
  RAISE NOTICE 'To re-migrate, run: 20251109000000_create_town_images_table.sql';
END $$;
