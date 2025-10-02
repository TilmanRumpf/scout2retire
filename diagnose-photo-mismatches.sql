-- Diagnostic: Show what photos exist vs what towns need photos

-- Part 1: What photos are in the bucket?
SELECT
  name AS filename,
  UPPER(SUBSTRING(name FROM '^([A-Z]{2})-')) AS country_code,
  REGEXP_REPLACE(
    SUBSTRING(name FROM '^[A-Z]{2}-(.+)\.(jpg|jpeg|png|webp)$'),
    '-', ' ', 'g'
  ) AS parsed_city_name
FROM storage.objects
WHERE bucket_id = 'town-images'
  AND name ~ '^[A-Z]{2}-.+\.(jpg|jpeg|png|webp)$'
ORDER BY name
LIMIT 20;

-- Part 2: Sample towns WITHOUT photos (first 20)
SELECT name, country
FROM towns
WHERE image_url_1 IS NULL
ORDER BY name
LIMIT 20;

-- Part 3: Check if ANY filename patterns match towns without photos
WITH photo_list AS (
  SELECT
    name AS filename,
    UPPER(SUBSTRING(name FROM '^([A-Z]{2})-')) AS country_code,
    LOWER(REGEXP_REPLACE(
      SUBSTRING(name FROM '^[A-Z]{2}-(.+)\.(jpg|jpeg|png|webp)$'),
      '-', ' ', 'g'
    )) AS parsed_city_name
  FROM storage.objects
  WHERE bucket_id = 'town-images'
    AND name ~ '^[A-Z]{2}-.+\.(jpg|jpeg|png|webp)$'
),
country_map AS (
  SELECT 'US' AS code, 'United States' AS country
  UNION ALL SELECT 'CA', 'Canada'
  UNION ALL SELECT 'MX', 'Mexico'
  UNION ALL SELECT 'ES', 'Spain'
  UNION ALL SELECT 'PT', 'Portugal'
  UNION ALL SELECT 'FR', 'France'
  UNION ALL SELECT 'IT', 'Italy'
  UNION ALL SELECT 'GR', 'Greece'
  UNION ALL SELECT 'NL', 'Netherlands'
  UNION ALL SELECT 'TH', 'Thailand'
)
SELECT
  t.name AS town_name,
  t.country,
  p.filename,
  p.parsed_city_name
FROM towns t
JOIN photo_list p ON
  LOWER(t.name) = p.parsed_city_name
  AND t.country IN (SELECT country FROM country_map WHERE code = p.country_code)
WHERE t.image_url_1 IS NULL
LIMIT 10;
