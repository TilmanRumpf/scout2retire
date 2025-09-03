-- Add display_name column to hobbies table
-- This column will store user-friendly display names for hobbies

ALTER TABLE hobbies ADD COLUMN display_name TEXT;

-- Add comment to document the purpose of this column
COMMENT ON COLUMN hobbies.display_name IS 'User-friendly display name for the hobby, can be different from the internal name';