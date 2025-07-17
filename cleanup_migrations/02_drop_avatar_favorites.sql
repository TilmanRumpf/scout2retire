-- Drop obsolete avatar_favorites column
-- Part of the removed icon avatar system
-- All values are empty arrays []

ALTER TABLE users DROP COLUMN IF EXISTS avatar_favorites;

-- Verify it's gone
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'avatar_favorites';