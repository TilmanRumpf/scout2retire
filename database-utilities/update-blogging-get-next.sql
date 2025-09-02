-- Update Blogging hobby
UPDATE hobbies
SET 
  category = 'interest',
  verification_method = 'universal',
  verification_query = NULL,
  verification_notes = '100% digital activity. Internet access only requirement.'
WHERE id = 'da356fd7-86d4-40ed-bdf7-14a392572a2c';

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