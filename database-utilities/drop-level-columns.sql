-- SQL to drop redundant _level columns from towns table
-- Execute this in Supabase SQL Editor

-- First verify the data has been migrated (should return 341 for each)
SELECT 
  COUNT(*) FILTER (WHERE museums_rating IS NOT NULL) as museums_rating_count,
  COUNT(*) FILTER (WHERE cultural_events_rating IS NOT NULL) as cultural_events_rating_count,
  COUNT(*) FILTER (WHERE restaurants_rating IS NOT NULL) as restaurants_rating_count,
  COUNT(*) FILTER (WHERE nightlife_rating IS NOT NULL) as nightlife_rating_count
FROM towns;

-- If all counts are 341, proceed with dropping the columns:
ALTER TABLE towns 
  DROP COLUMN IF EXISTS museums_level,
  DROP COLUMN IF EXISTS cultural_events_level,
  DROP COLUMN IF EXISTS dining_nightlife_level;

-- Verify the columns have been dropped
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'towns' 
  AND column_name LIKE '%_level'
ORDER BY column_name;