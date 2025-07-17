-- Drop unused retirement_status column
-- Data is stored in onboarding_responses JSON instead

ALTER TABLE users DROP COLUMN IF EXISTS retirement_status;

-- Verify it's gone
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'retirement_status';