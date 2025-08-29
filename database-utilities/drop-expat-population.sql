-- DROP expat_population COLUMN
-- This column is redundant - we only use expat_community_size

ALTER TABLE towns 
DROP COLUMN IF EXISTS expat_population;

-- Verify only expat_community_size remains
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'towns' 
AND column_name LIKE 'expat%';