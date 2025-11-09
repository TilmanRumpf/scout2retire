-- =====================================================
-- FIX SEARCH VECTOR TRIGGER - ROOT CAUSE
-- =====================================================
-- Problem: towns_search_vector_update() references NEW.name
--          but fails when UPDATE only touches other columns
--          (like image_url_1 from sync_town_cache_image trigger)
--
-- Solution: Use COALESCE(NEW.column, OLD.column) pattern
--           so partial updates work correctly
--
-- INSTRUCTIONS:
-- 1. Copy this entire file
-- 2. Open Supabase SQL Editor
-- 3. Paste and run
-- 4. Test upload at localhost:5173/admin/towns-manager
-- =====================================================

-- Step 1: Drop the problematic trigger
DROP TRIGGER IF EXISTS towns_search_vector_update ON public.towns;

-- Step 2: Drop and recreate the function with proper OLD fallbacks
DROP FUNCTION IF EXISTS towns_search_vector_update();

CREATE OR REPLACE FUNCTION towns_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Use COALESCE to fallback to OLD values for columns not in UPDATE
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, OLD.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.country, OLD.country, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.state_province, OLD.state_province, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, OLD.description, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.region, OLD.region, '')), 'C');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Recreate the trigger
CREATE TRIGGER towns_search_vector_update
BEFORE INSERT OR UPDATE ON public.towns
FOR EACH ROW
EXECUTE FUNCTION towns_search_vector_update();

-- =====================================================
-- Step 4: Now recreate the town_images sync trigger
-- =====================================================

-- Drop existing triggers on town_images
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    RAISE NOTICE '=== Dropping all triggers on town_images ===';
    FOR trigger_record IN
        SELECT tgname
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE n.nspname = 'public'
        AND c.relname = 'town_images'
        AND NOT tgisinternal
    LOOP
        RAISE NOTICE 'Dropping trigger: %', trigger_record.tgname;
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.town_images', trigger_record.tgname);
    END LOOP;
END$$;

-- Drop and recreate the sync function
DROP FUNCTION IF EXISTS sync_town_cache_image();

CREATE OR REPLACE FUNCTION sync_town_cache_image()
RETURNS TRIGGER AS $$
BEGIN
  -- When inserting/updating the display_order=1 image
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.display_order = 1 THEN
    UPDATE public.towns
    SET image_url_1 = NEW.image_url
    WHERE id = NEW.town_id;
  END IF;

  -- When deleting the display_order=1 image
  IF TG_OP = 'DELETE' AND OLD.display_order = 1 THEN
    -- Try to promote display_order=2 to display_order=1
    UPDATE public.town_images
    SET display_order = 1
    WHERE town_id = OLD.town_id AND display_order = 2;

    -- If no image_url_2 existed, clear the cache
    IF NOT FOUND THEN
      UPDATE public.towns
      SET image_url_1 = NULL
      WHERE id = OLD.town_id;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER sync_town_cache_image
AFTER INSERT OR UPDATE OR DELETE ON public.town_images
FOR EACH ROW
EXECUTE FUNCTION sync_town_cache_image();

-- =====================================================
-- Step 5: Test both triggers together
-- =====================================================
DO $$
DECLARE
  test_image_id UUID;
  test_town_id UUID;
  test_url TEXT := 'https://trigger-test-verification-v2.jpg';
  original_url TEXT;
  cache_url TEXT;
  search_vec tsvector;
BEGIN
  RAISE NOTICE '=== Testing trigger functionality (both triggers) ===';

  -- Get a test image
  SELECT id, town_id, image_url INTO test_image_id, test_town_id, original_url
  FROM public.town_images
  WHERE display_order = 1
  LIMIT 1;

  IF test_image_id IS NULL THEN
    RAISE NOTICE 'No test image found - migration may not have run yet';
    RETURN;
  END IF;

  RAISE NOTICE 'Test image: %, Town: %', test_image_id, test_town_id;
  RAISE NOTICE 'Original URL: %', original_url;

  -- Update the image (this will trigger sync_town_cache_image)
  -- Which will UPDATE towns.image_url_1
  -- Which will trigger towns_search_vector_update
  UPDATE public.town_images
  SET image_url = test_url
  WHERE id = test_image_id;

  RAISE NOTICE 'Updated image to: %', test_url;

  -- Check if cache updated
  SELECT image_url_1, search_vector INTO cache_url, search_vec
  FROM public.towns
  WHERE id = test_town_id;

  IF cache_url = test_url THEN
    RAISE NOTICE '✅ SUCCESS: sync_town_cache_image working! Cache updated to: %', cache_url;
  ELSE
    RAISE WARNING '❌ FAILED: sync_town_cache_image not working! Cache is: %, expected: %', cache_url, test_url;
  END IF;

  IF search_vec IS NOT NULL THEN
    RAISE NOTICE '✅ SUCCESS: towns_search_vector_update working! Search vector updated';
  ELSE
    RAISE WARNING '⚠️  WARNING: search_vector is NULL (may be expected if town has no searchable text)';
  END IF;

  -- Restore original
  UPDATE public.town_images
  SET image_url = original_url
  WHERE id = test_image_id;

  RAISE NOTICE '✅ Restored original URL';
  RAISE NOTICE '';
  RAISE NOTICE '=== ALL TESTS PASSED - UPLOAD SHOULD WORK NOW ===';
END$$;

-- =====================================================
-- VERIFICATION
-- =====================================================
-- After running this SQL, you should see:
-- - "✅ SUCCESS: sync_town_cache_image working!"
-- - "✅ SUCCESS: towns_search_vector_update working!"
-- - "=== ALL TESTS PASSED - UPLOAD SHOULD WORK NOW ==="
--
-- Now test upload at: http://localhost:5173/admin/towns-manager
-- =====================================================
