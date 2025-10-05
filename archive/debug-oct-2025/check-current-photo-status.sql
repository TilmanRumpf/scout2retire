-- Check actual current photo status
SELECT
  COUNT(*) FILTER (WHERE image_url_1 IS NOT NULL) AS has_photo_1,
  COUNT(*) FILTER (WHERE image_url_2 IS NOT NULL) AS has_photo_2,
  COUNT(*) FILTER (WHERE image_url_3 IS NOT NULL) AS has_photo_3,
  COUNT(*) FILTER (WHERE image_url_1 IS NULL AND image_url_2 IS NULL AND image_url_3 IS NULL) AS no_photos,
  COUNT(*) AS total
FROM towns;

-- Show some examples of towns WITH photos
SELECT name, country, image_url_1
FROM towns
WHERE image_url_1 IS NOT NULL
LIMIT 5;

-- Show some examples of towns WITHOUT photos
SELECT name, country
FROM towns
WHERE image_url_1 IS NULL
LIMIT 10;
