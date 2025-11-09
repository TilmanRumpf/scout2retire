-- Add updated_by column to towns table for tracking last modifier
-- This allows admins to see who last modified each town record

-- Add column if it doesn't exist
ALTER TABLE towns
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_towns_updated_by ON towns(updated_by);

-- Add comment
COMMENT ON COLUMN towns.updated_by IS 'User ID of person who last modified this town record';
