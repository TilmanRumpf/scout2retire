-- =====================================================
-- FIX TOWN_IMAGES TRIGGER ISSUE
-- =====================================================
-- Error: record "new" has no field "name"
-- This SQL drops all conflicting triggers and recreates the correct one
--
-- INSTRUCTIONS:
-- 1. Copy this entire file
-- 2. Open Supabase SQL Editor
-- 3. Paste and run
-- 4. Verify with: node database-utilities/test-trigger-simple.js
-- =====================================================

-- Step 1: Drop ALL triggers on town_images (including conflicting ones)
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

-- Step 2: Drop and recreate the function
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

-- Step 3: Recreate the trigger
CREATE TRIGGER sync_town_cache_image
AFTER INSERT OR UPDATE OR DELETE ON public.town_images
FOR EACH ROW
EXECUTE FUNCTION sync_town_cache_image();

-- Step 4: Test the trigger
DO $$
DECLARE
  test_image_id UUID;
  test_town_id UUID;
  test_url TEXT := 'https://trigger-test-verification.jpg';
  original_url TEXT;
  cache_url TEXT;
BEGIN
  RAISE NOTICE '=== Testing trigger functionality ===';

  -- Get a test image
  SELECT id, town_id, image_url INTO test_image_id, test_town_id, original_url
  FROM public.town_images
  WHERE display_order = 1
  LIMIT 1;

  IF test_image_id IS NULL THEN
    RAISE NOTICE 'No test image found';
    RETURN;
  END IF;

  RAISE NOTICE 'Test image: %, Town: %', test_image_id, test_town_id;
  RAISE NOTICE 'Original URL: %', original_url;

  -- Update the image
  UPDATE public.town_images
  SET image_url = test_url
  WHERE id = test_image_id;

  RAISE NOTICE 'Updated image to: %', test_url;

  -- Check if cache updated
  SELECT image_url_1 INTO cache_url
  FROM public.towns
  WHERE id = test_town_id;

  IF cache_url = test_url THEN
    RAISE NOTICE '✅ SUCCESS: Trigger working! Cache updated to: %', cache_url;
  ELSE
    RAISE WARNING '❌ FAILED: Trigger not working! Cache is: %, expected: %', cache_url, test_url;
  END IF;

  -- Restore original
  UPDATE public.town_images
  SET image_url = original_url
  WHERE id = test_image_id;

  RAISE NOTICE '✅ Restored original URL';
END$$;

-- =====================================================
-- VERIFICATION
-- =====================================================
-- After running this SQL, you should see:
-- - "Dropping trigger:" messages for any conflicting triggers
-- - "✅ SUCCESS: Trigger working!" message
--
-- If you see the success message, the trigger is fixed!
-- =====================================================
