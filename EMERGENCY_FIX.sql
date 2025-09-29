-- EMERGENCY FIX: Check if towns table is actually a view
-- Run this in Supabase SQL Editor

-- 1. Check if 'towns' is a table or view
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'towns';

-- 2. List ALL columns in the towns table/view
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'towns'
  AND column_name LIKE '%climate%'
ORDER BY ordinal_position;

-- 3. If towns is a VIEW, recreate it with climate columns
-- This might be needed if the view definition is outdated