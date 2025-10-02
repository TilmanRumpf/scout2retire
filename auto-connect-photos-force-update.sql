-- Auto-connect photos - FORCE UPDATE (overwrites existing photos)
-- Matches based on filename pattern: CC-CityName.jpg
-- Updates image_url_1, image_url_2, image_url_3 for ALL matched towns

-- Step 1: Create a temporary table with parsed photo data
CREATE TEMP TABLE photo_matches AS
SELECT
  name AS filename,
  UPPER(SUBSTRING(name FROM '^([A-Z]{2})-')) AS country_code,
  REGEXP_REPLACE(
    SUBSTRING(name FROM '^[A-Z]{2}-(.+)\.(jpg|jpeg|png|webp)$'),
    '-', ' ', 'g'
  ) AS city_name,
  'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/' || name AS photo_url,
  ROW_NUMBER() OVER (
    PARTITION BY
      UPPER(SUBSTRING(name FROM '^([A-Z]{2})-')),
      LOWER(REGEXP_REPLACE(SUBSTRING(name FROM '^[A-Z]{2}-(.+)\.(jpg|jpeg|png|webp)$'), '-', ' ', 'g'))
    ORDER BY name
  ) AS photo_rank
FROM storage.objects
WHERE bucket_id = 'town-images'
  AND name ~ '^[A-Z]{2}-.+\.(jpg|jpeg|png|webp)$';

-- Step 2: Country code mapping
CREATE TEMP TABLE country_code_map (code TEXT, country TEXT);

INSERT INTO country_code_map (code, country) VALUES
  ('US', 'United States'),
  ('CA', 'Canada'),
  ('MX', 'Mexico'),
  ('ES', 'Spain'),
  ('PT', 'Portugal'),
  ('IT', 'Italy'),
  ('FR', 'France'),
  ('GR', 'Greece'),
  ('CR', 'Costa Rica'),
  ('PA', 'Panama'),
  ('EC', 'Ecuador'),
  ('CO', 'Colombia'),
  ('PE', 'Peru'),
  ('AR', 'Argentina'),
  ('UY', 'Uruguay'),
  ('CL', 'Chile'),
  ('BR', 'Brazil'),
  ('TH', 'Thailand'),
  ('VN', 'Vietnam'),
  ('MY', 'Malaysia'),
  ('ID', 'Indonesia'),
  ('PH', 'Philippines'),
  ('AU', 'Australia'),
  ('NZ', 'New Zealand'),
  ('FJ', 'Fiji'),
  ('DE', 'Germany'),
  ('NL', 'Netherlands'),
  ('BE', 'Belgium'),
  ('GB', 'United Kingdom'),
  ('IE', 'Ireland'),
  ('MA', 'Morocco'),
  ('TN', 'Tunisia'),
  ('ZA', 'South Africa'),
  ('DO', 'Dominican Republic'),
  ('IN', 'India'),
  ('TR', 'Turkey'),
  ('HR', 'Croatia'),
  ('MT', 'Malta'),
  ('CY', 'Cyprus');

-- Step 3: Show what WILL be updated
SELECT
  t.id,
  t.name AS town_name,
  t.country,
  t.image_url_1 AS old_photo_1,
  p1.photo_url AS new_photo_1,
  p2.photo_url AS new_photo_2,
  p3.photo_url AS new_photo_3
FROM towns t
LEFT JOIN photo_matches p1 ON
  LOWER(t.name) = LOWER(p1.city_name)
  AND t.country = (SELECT country FROM country_code_map WHERE code = p1.country_code)
  AND p1.photo_rank = 1
LEFT JOIN photo_matches p2 ON
  LOWER(t.name) = LOWER(p2.city_name)
  AND t.country = (SELECT country FROM country_code_map WHERE code = p2.country_code)
  AND p2.photo_rank = 2
LEFT JOIN photo_matches p3 ON
  LOWER(t.name) = LOWER(p3.city_name)
  AND t.country = (SELECT country FROM country_code_map WHERE code = p3.country_code)
  AND p3.photo_rank = 3
WHERE p1.photo_url IS NOT NULL
ORDER BY t.name;

-- Step 4: FORCE UPDATE - removes existing photos and adds new ones
UPDATE towns t
SET
  image_url_1 = p1.photo_url,
  image_url_2 = p2.photo_url,
  image_url_3 = p3.photo_url
FROM
  photo_matches p1
  LEFT JOIN photo_matches p2 ON
    p2.country_code = p1.country_code
    AND LOWER(p2.city_name) = LOWER(p1.city_name)
    AND p2.photo_rank = 2
  LEFT JOIN photo_matches p3 ON
    p3.country_code = p1.country_code
    AND LOWER(p3.city_name) = LOWER(p1.city_name)
    AND p3.photo_rank = 3
WHERE
  p1.photo_rank = 1
  AND LOWER(t.name) = LOWER(p1.city_name)
  AND t.country = (SELECT country FROM country_code_map WHERE code = p1.country_code);
  -- REMOVED: AND t.image_url_1 IS NULL (now updates ALL matched towns)

-- Step 5: Summary
SELECT
  COUNT(*) FILTER (WHERE image_url_1 IS NOT NULL) AS towns_with_photo_1,
  COUNT(*) FILTER (WHERE image_url_2 IS NOT NULL) AS towns_with_photo_2,
  COUNT(*) FILTER (WHERE image_url_3 IS NOT NULL) AS towns_with_photo_3,
  COUNT(*) FILTER (WHERE image_url_1 IS NULL) AS towns_without_photos,
  COUNT(*) AS total_towns
FROM towns;
