-- ================================================
-- SIMPLE DIAGNOSTIC - NO COMPLEX STRING OPERATIONS
-- ================================================

-- 1. Show first 10 files in storage
SELECT 
  name as filename
FROM storage.objects
WHERE bucket_id = 'town-images'
  AND name LIKE '%.jpg'
ORDER BY name
LIMIT 10;

-- 2. Show first 10 towns
SELECT 
  id,
  country,
  name,
  image_url_1
FROM towns
ORDER BY country, name
LIMIT 10;

-- 3. Try the simplest possible update - exact filename match
-- Let's manually update Porto if we have pt-porto-[anything].jpg
UPDATE towns
SET image_url_1 = 'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/pt-porto-lkdjfk.jpg'
WHERE country = 'Portugal' 
  AND name = 'Porto'
  AND EXISTS (
    SELECT 1 
    FROM storage.objects 
    WHERE bucket_id = 'town-images' 
      AND name = 'pt-porto-lkdjfk.jpg'
  );

-- 4. Check if Porto was updated
SELECT country, name, image_url_1 
FROM towns 
WHERE country = 'Portugal' AND name = 'Porto';

-- 5. Let's try a LIKE pattern match
UPDATE towns
SET image_url_1 = (
  SELECT 'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/' || name
  FROM storage.objects
  WHERE bucket_id = 'town-images'
    AND name LIKE 'fr-bordeaux-%'
  LIMIT 1
)
WHERE country = 'France' 
  AND name = 'Bordeaux';

-- 6. Check if Bordeaux was updated
SELECT country, name, image_url_1 
FROM towns 
WHERE country = 'France' AND name = 'Bordeaux';

-- 7. Show all pt- files (Portugal)
SELECT name 
FROM storage.objects
WHERE bucket_id = 'town-images'
  AND name LIKE 'pt-%'
ORDER BY name;

-- 8. Show all Portugal towns
SELECT name 
FROM towns
WHERE country = 'Portugal'
ORDER BY name;

-- 9. Test a US city pattern
SELECT name 
FROM storage.objects
WHERE bucket_id = 'town-images'
  AND name LIKE 'us-fl-%'
ORDER BY name;

-- 10. Show US cities in Florida
SELECT name 
FROM towns
WHERE country = 'United States'
  AND name LIKE '%, FL'
ORDER BY name;