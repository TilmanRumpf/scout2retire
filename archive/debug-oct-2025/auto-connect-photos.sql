-- Auto-connect photos from town-images bucket to towns table
-- Matches based on filename pattern: CC-CityName.jpg
-- Updates image_url_1, image_url_2, image_url_3 for matched towns

-- Step 1: Create a temporary table with parsed photo data
CREATE TEMP TABLE photo_matches AS
SELECT
  name AS filename,
  -- Extract country code (first 2 chars before hyphen)
  UPPER(SUBSTRING(name FROM '^([A-Z]{2})-')) AS country_code,
  -- Extract city name (between hyphen and file extension)
  REGEXP_REPLACE(
    SUBSTRING(name FROM '^[A-Z]{2}-(.+)\.(jpg|jpeg|png|webp)$'),
    '-', ' ', 'g'
  ) AS city_name,
  -- Build public URL
  'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/' || name AS photo_url,
  -- Row number for each city (to assign to image_url_1, 2, or 3)
  ROW_NUMBER() OVER (
    PARTITION BY
      UPPER(SUBSTRING(name FROM '^([A-Z]{2})-')),
      LOWER(REGEXP_REPLACE(SUBSTRING(name FROM '^[A-Z]{2}-(.+)\.(jpg|jpeg|png|webp)$'), '-', ' ', 'g'))
    ORDER BY name
  ) AS photo_rank
FROM storage.objects
WHERE bucket_id = 'town-images'
  AND name ~ '^[A-Z]{2}-.+\.(jpg|jpeg|png|webp)$'
ORDER BY city_name, photo_rank;

-- Step 2: Map country codes to full country names
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

-- Step 3: Preview matches (optional - comment out if you want to skip preview)
SELECT
  t.id,
  t.name AS town_name,
  t.country,
  p1.filename AS photo_1,
  p2.filename AS photo_2,
  p3.filename AS photo_3
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
WHERE p1.filename IS NOT NULL
ORDER BY t.name;

-- Step 4: Update towns table with matched photos
UPDATE towns t
SET
  image_url_1 = p1.photo_url,
  image_url_2 = p2.photo_url,
  image_url_3 = p3.photo_url
FROM
  photo_matches p1
  LEFT JOIN photo_matches p2 ON
    p2.country_code = p1.country_code
    AND p2.city_name = p1.city_name
    AND p2.photo_rank = 2
  LEFT JOIN photo_matches p3 ON
    p3.country_code = p1.country_code
    AND p3.city_name = p1.city_name
    AND p3.photo_rank = 3
WHERE
  p1.photo_rank = 1
  AND LOWER(t.name) = LOWER(p1.city_name)
  AND t.country = (SELECT country FROM country_code_map WHERE code = p1.country_code)
  AND t.image_url_1 IS NULL; -- Only update if no photo exists

-- Step 5: Show summary of updates
SELECT
  COUNT(*) FILTER (WHERE image_url_1 IS NOT NULL) AS towns_with_photo_1,
  COUNT(*) FILTER (WHERE image_url_2 IS NOT NULL) AS towns_with_photo_2,
  COUNT(*) FILTER (WHERE image_url_3 IS NOT NULL) AS towns_with_photo_3,
  COUNT(*) FILTER (WHERE image_url_1 IS NULL AND image_url_2 IS NULL AND image_url_3 IS NULL) AS towns_without_photos
FROM towns;
