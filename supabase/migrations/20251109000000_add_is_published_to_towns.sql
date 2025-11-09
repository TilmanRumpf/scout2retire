-- Migration: Add is_published column to towns table
-- Purpose: Allow admins to control which towns appear in public views
-- Date: 2025-11-09

-- Step 1: Add is_published column with default true (all existing towns become published)
ALTER TABLE towns
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true NOT NULL;

-- Step 2: Add published_at timestamp for audit trail
ALTER TABLE towns
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;

-- Step 3: Add published_by for tracking which admin published
ALTER TABLE towns
ADD COLUMN IF NOT EXISTS published_by UUID REFERENCES auth.users(id);

-- Step 4: Set initial published_at for existing published towns
UPDATE towns
SET published_at = updated_at
WHERE is_published = true AND published_at IS NULL;

-- Step 5: Create index for faster filtering in public queries
CREATE INDEX IF NOT EXISTS idx_towns_is_published ON towns(is_published);

-- Step 6: Create composite index for common query pattern (published + has photo)
CREATE INDEX IF NOT EXISTS idx_towns_published_with_photo
ON towns(is_published, image_url_1)
WHERE is_published = true AND image_url_1 IS NOT NULL;

-- Step 7: Add comment for documentation
COMMENT ON COLUMN towns.is_published IS 'Controls whether town appears in public views. false = draft/admin-only, true = visible to users';
COMMENT ON COLUMN towns.published_at IS 'Timestamp when town was first published or last re-published';
COMMENT ON COLUMN towns.published_by IS 'Admin user who published this town';

-- Step 8: Migration logic - Set unpublished for incomplete towns
-- Towns without quality_of_life are considered drafts
UPDATE towns
SET
  is_published = false,
  published_at = NULL
WHERE quality_of_life IS NULL;

-- Step 9: Grant permissions (RLS policies will control actual access)
-- Admins can update is_published, users can only read
GRANT SELECT ON towns TO authenticated;
GRANT UPDATE (is_published, published_at, published_by) ON towns TO authenticated;
