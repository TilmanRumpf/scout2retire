-- Clean up unused legacy tables

-- Drop the empty town_summary table
DROP TABLE IF EXISTS town_summary;

-- Verify the cleanup
SELECT 
  schemaname, 
  tablename, 
  tableowner 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename LIKE '%town%'
ORDER BY tablename;