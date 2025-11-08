-- Fix town_images trigger issue
-- Error: record "new" has no field "name"
-- This suggests there's a conflicting trigger on the table

-- First, drop ALL triggers on town_images
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    RAISE NOTICE '=== Dropping all triggers on town_images table ===';
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

-- Drop the function
DROP FUNCTION IF EXISTS sync_town_cache_image();

-- Recreate the correct function
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

-- Recreate the trigger
CREATE TRIGGER sync_town_cache_image
AFTER INSERT OR UPDATE OR DELETE ON public.town_images
FOR EACH ROW
EXECUTE FUNCTION sync_town_cache_image();

-- Test the trigger
DO $$
DECLARE
  test_town_id UUID;
  test_image_id UUID;
  test_url TEXT := 'https://trigger-test-' || EXTRACT(EPOCH FROM NOW())::TEXT || '.jpg';
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
    RAISE NOTICE 'No test image found, skipping trigger test';
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
    RAISE NOTICE '✅ Trigger working! Cache updated to: %', cache_url;
  ELSE
    RAISE WARNING '❌ Trigger NOT working! Cache is: %, expected: %', cache_url, test_url;
  END IF;

  -- Restore original
  UPDATE public.town_images
  SET image_url = original_url
  WHERE id = test_image_id;

  RAISE NOTICE '✅ Restored original URL';
END$$;
