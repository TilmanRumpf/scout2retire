-- =====================================================
-- PHOTO SYSTEM OVERHAUL MIGRATION
-- =====================================================
-- Purpose: Move from 10 scattered image columns in towns table
--          to normalized town_images table with proper relationships
--
-- Current State: 351 towns with image data in these columns:
--   - image_url_1, image_url_2, image_url_3 (actual image URLs)
--   - image_source, image_photographer, image_license (metadata)
--   - image_is_fallback, image_validated_at, image_validation_note (status)
--   - image_urls (array column, unused legacy)
--
-- Target State:
--   - towns.image_url_1 remains as cache/display field (for backward compat)
--   - All image data lives in town_images table
--   - Trigger keeps image_url_1 in sync with display_order=1 image
--
-- Migration Strategy:
--   1. Create town_images table (idempotent)
--   2. Migrate existing image data from towns table
--   3. Create trigger to sync image_url_1 cache field
--   4. Add RLS policies for security
--
-- Rollback: See 20251109000001_rollback_town_images.sql
-- =====================================================

-- =====================================================
-- STEP 1: Create town_images table
-- =====================================================

-- Drop trigger first if exists (idempotent)
DROP TRIGGER IF EXISTS sync_town_cache_image ON public.town_images;
DROP FUNCTION IF EXISTS sync_town_cache_image();

-- Create table (idempotent - will not error if exists)
CREATE TABLE IF NOT EXISTS public.town_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  town_id INTEGER NOT NULL REFERENCES public.towns(id) ON DELETE CASCADE,

  -- Image data
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 1,

  -- Metadata
  source TEXT,
  photographer TEXT,
  license TEXT,

  -- Status/validation
  is_fallback BOOLEAN DEFAULT false,
  validated_at TIMESTAMPTZ,
  validation_note TEXT,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_town_display_order UNIQUE(town_id, display_order),
  CONSTRAINT valid_display_order CHECK (display_order > 0)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_town_images_town_id ON public.town_images(town_id);
CREATE INDEX IF NOT EXISTS idx_town_images_display_order ON public.town_images(town_id, display_order);

-- Add comment
COMMENT ON TABLE public.town_images IS 'Normalized storage for town images. Replaces 10 scattered columns in towns table. Migration created 2025-11-09.';

-- =====================================================
-- STEP 2: Migrate existing image data from towns
-- =====================================================

-- Migrate image_url_1 (display_order = 1)
INSERT INTO public.town_images (
  town_id,
  image_url,
  display_order,
  source,
  photographer,
  license,
  is_fallback,
  validated_at,
  validation_note
)
SELECT
  id,
  image_url_1,
  1,
  image_source,
  image_photographer,
  image_license,
  COALESCE(image_is_fallback, false),
  image_validated_at,
  image_validation_note
FROM public.towns
WHERE image_url_1 IS NOT NULL
ON CONFLICT (town_id, display_order) DO UPDATE
SET
  image_url = EXCLUDED.image_url,
  source = EXCLUDED.source,
  photographer = EXCLUDED.photographer,
  license = EXCLUDED.license,
  is_fallback = EXCLUDED.is_fallback,
  validated_at = EXCLUDED.validated_at,
  validation_note = EXCLUDED.validation_note,
  updated_at = NOW();

-- Migrate image_url_2 (display_order = 2)
INSERT INTO public.town_images (
  town_id,
  image_url,
  display_order
)
SELECT
  id,
  image_url_2,
  2
FROM public.towns
WHERE image_url_2 IS NOT NULL
ON CONFLICT (town_id, display_order) DO UPDATE
SET
  image_url = EXCLUDED.image_url,
  updated_at = NOW();

-- Migrate image_url_3 (display_order = 3)
INSERT INTO public.town_images (
  town_id,
  image_url,
  display_order
)
SELECT
  id,
  image_url_3,
  3
FROM public.towns
WHERE image_url_3 IS NOT NULL
ON CONFLICT (town_id, display_order) DO UPDATE
SET
  image_url = EXCLUDED.image_url,
  updated_at = NOW();

-- =====================================================
-- STEP 3: Create trigger to sync cache field
-- =====================================================

-- Function to keep towns.image_url_1 in sync with display_order=1
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

-- Create trigger
CREATE TRIGGER sync_town_cache_image
AFTER INSERT OR UPDATE OR DELETE ON public.town_images
FOR EACH ROW
EXECUTE FUNCTION sync_town_cache_image();

-- =====================================================
-- STEP 4: Enable RLS and create policies
-- =====================================================

ALTER TABLE public.town_images ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can view images)
CREATE POLICY "Public can view town images"
ON public.town_images
FOR SELECT
TO public
USING (true);

-- Admin write access
CREATE POLICY "Admins can manage town images"
ON public.town_images
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.admin_role IN ('admin', 'super_admin')
  )
);

-- =====================================================
-- VERIFICATION QUERIES (for testing)
-- =====================================================

-- Check migration counts
DO $$
DECLARE
  towns_with_url1 INTEGER;
  towns_with_url2 INTEGER;
  towns_with_url3 INTEGER;
  migrated_order1 INTEGER;
  migrated_order2 INTEGER;
  migrated_order3 INTEGER;
BEGIN
  SELECT COUNT(*) INTO towns_with_url1 FROM public.towns WHERE image_url_1 IS NOT NULL;
  SELECT COUNT(*) INTO towns_with_url2 FROM public.towns WHERE image_url_2 IS NOT NULL;
  SELECT COUNT(*) INTO towns_with_url3 FROM public.towns WHERE image_url_3 IS NOT NULL;

  SELECT COUNT(*) INTO migrated_order1 FROM public.town_images WHERE display_order = 1;
  SELECT COUNT(*) INTO migrated_order2 FROM public.town_images WHERE display_order = 2;
  SELECT COUNT(*) INTO migrated_order3 FROM public.town_images WHERE display_order = 3;

  RAISE NOTICE 'Migration Verification:';
  RAISE NOTICE 'image_url_1: % towns -> % migrated', towns_with_url1, migrated_order1;
  RAISE NOTICE 'image_url_2: % towns -> % migrated', towns_with_url2, migrated_order2;
  RAISE NOTICE 'image_url_3: % towns -> % migrated', towns_with_url3, migrated_order3;

  IF towns_with_url1 = migrated_order1 THEN
    RAISE NOTICE '✅ image_url_1 migration complete';
  ELSE
    RAISE WARNING '❌ image_url_1 count mismatch!';
  END IF;

  IF towns_with_url2 = migrated_order2 THEN
    RAISE NOTICE '✅ image_url_2 migration complete';
  ELSE
    RAISE WARNING '❌ image_url_2 count mismatch!';
  END IF;

  IF towns_with_url3 = migrated_order3 THEN
    RAISE NOTICE '✅ image_url_3 migration complete';
  ELSE
    RAISE WARNING '❌ image_url_3 count mismatch!';
  END IF;
END $$;
