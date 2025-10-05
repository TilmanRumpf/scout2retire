UPDATE hobbies
SET 
  category = 'activity',
  is_universal = false,
  verification_method = 'ai_facilities',
  verification_query = 'Are there dance studios, community centers, or clubs that offer ballroom dancing in {town}?',
  verification_notes = 'Needs basic dance venues - studios, community centers, or social clubs. Not universal but doesn''t require luxury facilities.'
WHERE id = '29d00914-b940-47f7-ad75-37dfd77c6bab';

SELECT 
  id,
  name,
  category,
  hobby_type,
  group_name,
  is_universal,
  description,
  verification_method,
  verification_query,
  verification_notes
FROM hobbies
WHERE verification_method IS NULL
ORDER BY name
LIMIT 1;
