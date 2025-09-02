-- Update Basketball
UPDATE hobbies
SET 
  category = 'activity',
  verification_method = 'database_infrastructure',
  verification_query = 'basketball_courts_count > 0 OR sports_facilities_count > 0',
  verification_notes = 'Requires basketball courts - available in most towns via parks, schools, rec centers'
WHERE id = 'f093e571-8e24-4b51-8f52-72bc07af3e3a';

-- Get next unprocessed hobby
SELECT 
  id,
  name,
  category,
  group_name,
  is_universal,
  description
FROM hobbies
WHERE verification_method IS NULL
ORDER BY name
LIMIT 1;