-- Add is_excluded column to towns_hobbies table
-- This allows excluding universal hobbies from specific towns (e.g., Home Brewing in Abu Dhabi)

ALTER TABLE towns_hobbies
ADD COLUMN IF NOT EXISTS is_excluded BOOLEAN DEFAULT FALSE;

-- Add index for faster queries on excluded hobbies
CREATE INDEX IF NOT EXISTS idx_towns_hobbies_excluded
ON towns_hobbies(town_id, is_excluded)
WHERE is_excluded = true;

-- Add comment
COMMENT ON COLUMN towns_hobbies.is_excluded IS 'Set to true to exclude a universal hobby from this specific town';
