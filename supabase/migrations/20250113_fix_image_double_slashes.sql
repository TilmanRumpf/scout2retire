-- Fix image URLs with double slashes
-- This fixes St Tropez, Medellin, and 4 other towns

UPDATE towns 
SET 
  image_url_1 = REPLACE(image_url_1, 'town-images//', 'town-images/'),
  image_url_2 = REPLACE(image_url_2, 'town-images//', 'town-images/'),
  image_url_3 = REPLACE(image_url_3, 'town-images//', 'town-images/')
WHERE 
  image_url_1 LIKE '%town-images//%' OR
  image_url_2 LIKE '%town-images//%' OR
  image_url_3 LIKE '%town-images//%';

-- Verify the fix
SELECT name, country, image_url_1 
FROM towns 
WHERE name IN ('Saint-Tropez', 'Medellin', 'Paris', 'Porto', 'Valencia', 'Merida')
ORDER BY name;