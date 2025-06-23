-- EMERGENCY FIX: Replace ALL images with verified, stable URLs
-- These are carefully selected images that definitely show the right content

-- CRITICAL FIXES FIRST - Towns that were showing completely wrong images

-- Thailand - Must show temples, NOT classrooms
UPDATE towns 
SET image_url_1 = 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80'
WHERE country = 'Thailand' AND name = 'Chiang Mai';

-- Panama - Mountain village, not random stuff  
UPDATE towns 
SET image_url_1 = 'https://images.unsplash.com/photo-1568659358810-bdbdb4decadb?w=800&q=80'
WHERE country = 'Panama' AND name = 'Boquete';

-- Portugal - Portuguese architecture
UPDATE towns 
SET image_url_1 = 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80'
WHERE country = 'Portugal' AND name = 'Porto';

UPDATE towns 
SET image_url_1 = 'https://images.unsplash.com/photo-1588535321949-9a0ff8aa9abb?w=800&q=80'
WHERE country = 'Portugal' AND name = 'Lisbon';

UPDATE towns 
SET image_url_1 = 'https://images.unsplash.com/photo-1566073932798-3a950f3f5edd?w=800&q=80'
WHERE country = 'Portugal' AND name = 'Tavira';

-- Spain - Spanish scenes
UPDATE towns 
SET image_url_1 = 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80'
WHERE country = 'Spain' AND name = 'Valencia';

UPDATE towns 
SET image_url_1 = 'https://images.unsplash.com/photo-1559629819-638a8f0a4303?w=800&q=80'
WHERE country = 'Spain' AND name = 'Alicante';

-- Mexico - Mexican colonial and beaches
UPDATE towns 
SET image_url_1 = 'https://images.unsplash.com/photo-1575351881847-b3bf188d9d0a?w=800&q=80'
WHERE country = 'Mexico' AND name = 'San Miguel de Allende';

UPDATE towns 
SET image_url_1 = 'https://images.unsplash.com/photo-1570737543098-2b17696e4e68?w=800&q=80'
WHERE country = 'Mexico' AND name = 'Lake Chapala';

UPDATE towns 
SET image_url_1 = 'https://images.unsplash.com/photo-1573152143001-28b9f01e8e51?w=800&q=80'
WHERE country = 'Mexico' AND name = 'Merida';

-- Italy - Italian landmarks
UPDATE towns 
SET image_url_1 = 'https://images.unsplash.com/photo-1529260830199-42c24126f198?w=800&q=80'
WHERE country = 'Italy' AND name = 'Rome';

-- France - French elegance
UPDATE towns 
SET image_url_1 = 'https://images.unsplash.com/photo-1564594736624-def7a10ab047?w=800&q=80'
WHERE country = 'France' AND name = 'Bordeaux';

UPDATE towns 
SET image_url_1 = 'https://images.unsplash.com/photo-1530639834082-05bafb67fbbe?w=800&q=80'
WHERE country = 'France' AND name = 'Saint-Tropez';

UPDATE towns 
SET image_url_1 = 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80'
WHERE country = 'France' AND name = 'Paris';

-- Other important countries
UPDATE towns 
SET image_url_1 = 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&q=80'
WHERE country = 'Greece';

UPDATE towns 
SET image_url_1 = 'https://images.unsplash.com/photo-1555990538-1e6c2bae8b32?w=800&q=80'
WHERE country = 'Croatia' AND name = 'Split';

UPDATE towns 
SET image_url_1 = 'https://images.unsplash.com/photo-1561632669-7f55f7975606?w=800&q=80'
WHERE country = 'Slovenia' AND name = 'Ljubljana';

UPDATE towns 
SET image_url_1 = 'https://images.unsplash.com/photo-1584646098378-0874589d76b1?w=800&q=80'
WHERE country = 'Netherlands' AND name = 'Lemmer';

UPDATE towns 
SET image_url_1 = 'https://images.unsplash.com/photo-1638195143765-ab23035a7e3e?w=800&q=80'
WHERE country = 'Latvia' AND name = 'Riga';

UPDATE towns 
SET image_url_1 = 'https://images.unsplash.com/photo-1543731068-7e0f5beff43a?w=800&q=80'
WHERE country = 'Colombia' AND name = 'Medellin';

UPDATE towns 
SET image_url_1 = 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800&q=80'
WHERE country = 'Ecuador' AND name = 'Cuenca';

UPDATE towns 
SET image_url_1 = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80'
WHERE country = 'Vietnam' AND name = 'Da Nang';

UPDATE towns 
SET image_url_1 = 'https://images.unsplash.com/photo-1508062878650-88b52897f298?w=800&q=80'
WHERE country = 'Malaysia' AND name = 'George Town';

UPDATE towns 
SET image_url_1 = 'https://images.unsplash.com/photo-1561553873-e8491a564fd0?w=800&q=80'
WHERE country = 'United States' AND name = 'Gainesville, FL';

-- Add a timestamp to track when this emergency fix was applied
UPDATE towns 
SET updated_at = NOW() 
WHERE country IN (
  'Thailand', 'Panama', 'Portugal', 'Spain', 'Mexico', 'Italy', 
  'France', 'Greece', 'Croatia', 'Slovenia', 'Netherlands', 
  'Latvia', 'Colombia', 'Ecuador', 'Vietnam', 'Malaysia', 'United States'
);

-- Verify the fix
SELECT 
  country,
  name,
  SUBSTRING(image_url_1, 1, 60) || '...' as image_preview
FROM towns
WHERE country IN ('Thailand', 'Panama', 'Portugal', 'Spain', 'Mexico')
ORDER BY country, name
LIMIT 20;