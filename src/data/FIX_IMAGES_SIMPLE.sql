-- SIMPLE FIX: Replace bad images using only existing columns

-- First, see how many bad images we have
SELECT COUNT(*) as total_bad_images
FROM towns 
WHERE image_url_1 IS NULL 
   OR image_url_1 = ''
   OR image_url_1 LIKE '%rabbit%'
   OR image_url_1 LIKE '%bunny%'
   OR image_url_1 LIKE '%animal%'
   OR image_url_1 LIKE '%placeholder%'
   OR image_url_1 LIKE '%404%';

-- Fix all bad images with country-specific fallbacks
UPDATE towns
SET image_url_1 = CASE
  -- Portugal
  WHEN country = 'Portugal' THEN 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800&q=80'
  
  -- Spain
  WHEN country = 'Spain' THEN 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800&q=80'
  
  -- France
  WHEN country = 'France' THEN 'https://images.unsplash.com/photo-1584266766915-53036a2c4e3b?w=800&q=80'
  
  -- Italy
  WHEN country = 'Italy' THEN 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80'
  
  -- Greece
  WHEN country = 'Greece' THEN 'https://images.unsplash.com/photo-1598037001124-55ddd0f00baf?w=800&q=80'
  
  -- Turkey
  WHEN country = 'Turkey' THEN 'https://images.unsplash.com/photo-1593238739364-18cfde30e522?w=800&q=80'
  
  -- Mexico
  WHEN country = 'Mexico' THEN 'https://images.unsplash.com/photo-1568402102990-bc541580b59f?w=800&q=80'
  
  -- Costa Rica
  WHEN country = 'Costa Rica' THEN 'https://images.unsplash.com/photo-1605723517503-3cadb5818a0c?w=800&q=80'
  
  -- Panama - NO MORE RABBITS!
  WHEN country = 'Panama' THEN 'https://images.unsplash.com/photo-1580257521667-116f90abca01?w=800&q=80'
  
  -- Ecuador
  WHEN country = 'Ecuador' THEN 'https://images.unsplash.com/photo-1533600298287-9a3629a89789?w=800&q=80'
  
  -- Colombia
  WHEN country = 'Colombia' THEN 'https://images.unsplash.com/photo-1597531013114-d5e317a08c17?w=800&q=80'
  
  -- Thailand
  WHEN country = 'Thailand' THEN 'https://images.unsplash.com/photo-1598981457915-aea220950616?w=800&q=80'
  
  -- Malaysia
  WHEN country = 'Malaysia' THEN 'https://images.unsplash.com/photo-1581622558663-b2e33377dfb2?w=800&q=80'
  
  -- Vietnam
  WHEN country = 'Vietnam' THEN 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&q=80'
  
  -- Netherlands
  WHEN country = 'Netherlands' THEN 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&q=80'
  
  -- Latvia
  WHEN country = 'Latvia' THEN 'https://images.unsplash.com/photo-1599057463911-0649c7711f85?w=800&q=80'
  
  -- Slovenia
  WHEN country = 'Slovenia' THEN 'https://images.unsplash.com/photo-1558271736-cd043ef2e855?w=800&q=80'
  
  -- Croatia
  WHEN country = 'Croatia' THEN 'https://images.unsplash.com/photo-1555990538-1e6e5b3d0b3b?w=800&q=80'
  
  -- Malta - NO MORE EIFFEL TOWERS!
  WHEN country = 'Malta' THEN 'https://images.unsplash.com/photo-1565071559227-20ab25b7685e?w=800&q=80'
  
  -- Cyprus
  WHEN country = 'Cyprus' THEN 'https://images.unsplash.com/photo-1598037001432-79de69e0fa57?w=800&q=80'
  
  -- Default fallback
  ELSE 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80'
END
WHERE image_url_1 IS NULL 
   OR image_url_1 = ''
   OR image_url_1 LIKE '%rabbit%'
   OR image_url_1 LIKE '%bunny%'
   OR image_url_1 LIKE '%animal%'
   OR image_url_1 LIKE '%placeholder%'
   OR image_url_1 LIKE '%404%'
   OR image_url_1 LIKE '%eiffel%' AND country = 'Malta';

-- Check what we fixed
SELECT country, COUNT(*) as towns_fixed
FROM towns
WHERE image_url_1 IN (
  'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800&q=80',
  'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800&q=80',
  'https://images.unsplash.com/photo-1584266766915-53036a2c4e3b?w=800&q=80',
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
  'https://images.unsplash.com/photo-1598037001124-55ddd0f00baf?w=800&q=80',
  'https://images.unsplash.com/photo-1593238739364-18cfde30e522?w=800&q=80',
  'https://images.unsplash.com/photo-1568402102990-bc541580b59f?w=800&q=80',
  'https://images.unsplash.com/photo-1605723517503-3cadb5818a0c?w=800&q=80',
  'https://images.unsplash.com/photo-1580257521667-116f90abca01?w=800&q=80',
  'https://images.unsplash.com/photo-1533600298287-9a3629a89789?w=800&q=80',
  'https://images.unsplash.com/photo-1597531013114-d5e317a08c17?w=800&q=80',
  'https://images.unsplash.com/photo-1598981457915-aea220950616?w=800&q=80',
  'https://images.unsplash.com/photo-1581622558663-b2e33377dfb2?w=800&q=80',
  'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&q=80',
  'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&q=80',
  'https://images.unsplash.com/photo-1599057463911-0649c7711f85?w=800&q=80',
  'https://images.unsplash.com/photo-1558271736-cd043ef2e855?w=800&q=80',
  'https://images.unsplash.com/photo-1555990538-1e6e5b3d0b3b?w=800&q=80',
  'https://images.unsplash.com/photo-1565071559227-20ab25b7685e?w=800&q=80',
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80'
)
GROUP BY country
ORDER BY country;

-- Show some examples
SELECT name, country, image_url_1
FROM towns
WHERE country IN ('Panama', 'Malta', 'Netherlands')
LIMIT 10;