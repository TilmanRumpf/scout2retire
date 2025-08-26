-- Drop obsolete nationality column
-- All values are hardcoded to 'usa' or 'pending' and the field is unused
-- Real citizenship data is collected in onboarding

ALTER TABLE users DROP COLUMN IF EXISTS nationality;

-- Verify it's gone
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'nationality';