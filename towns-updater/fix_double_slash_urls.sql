-- Fix image URLs with double slashes
-- This will correct URLs like /town-images//filename.jpg to /town-images/filename.jpg

-- First, let's see which towns have this issue
SELECT name, country, image_url_1 
FROM towns 
WHERE image_url_1 LIKE '%town-images//%'
ORDER BY name;

-- Update all image URLs to remove double slashes
UPDATE towns 
SET 
  image_url_1 = REPLACE(image_url_1, 'town-images//', 'town-images/'),
  image_url_2 = REPLACE(image_url_2, 'town-images//', 'town-images/'),
  image_url_3 = REPLACE(image_url_3, 'town-images//', 'town-images/')
WHERE 
  image_url_1 LIKE '%town-images//%' OR
  image_url_2 LIKE '%town-images//%' OR
  image_url_3 LIKE '%town-images//%';

-- Verify the fix worked for St Tropez and Medellin specifically
SELECT name, country, image_url_1 
FROM towns 
WHERE name IN ('Saint-Tropez', 'Medellin', 'St Tropez')
ORDER BY name;

-- Show all fixed towns
SELECT name, country, image_url_1 
FROM towns 
WHERE image_url_1 IS NOT NULL
AND (name LIKE '%Tropez%' OR name = 'Medellin' OR image_url_1 LIKE '%town-images/%')
ORDER BY name;