-- Fix double slashes in image URLs
-- This is why St Tropez and Medellin don't show images

UPDATE towns 
SET 
  image_url_1 = REPLACE(image_url_1, 'town-images//', 'town-images/')
WHERE 
  image_url_1 LIKE '%town-images//%';

-- Show what was fixed
SELECT name, country, image_url_1 
FROM towns 
WHERE name IN ('Saint-Tropez', 'Medellin', 'Paris', 'Porto', 'Valencia', 'Merida')
ORDER BY name;