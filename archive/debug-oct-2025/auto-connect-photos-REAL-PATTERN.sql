-- Auto-connect photos with ACTUAL filename pattern
-- Pattern: cc-cityname-ANYTHING.jpg (e.g., "ca-lunenburg-waterfront-2000x1500.jpg")
-- ONLY updates towns WITHOUT existing photos

-- Step 1: Parse photos with flexible pattern
CREATE TEMP TABLE photo_matches AS
SELECT
  name AS filename,
  -- Extract country code (first 2 chars)
  UPPER(SUBSTRING(name FROM '^([a-z]{2})-')) AS country_code,
  -- Extract city name (between first hyphen and second hyphen OR file extension)
  LOWER(
    SUBSTRING(
      name FROM '^[a-z]{2}-([^-]+)'
    )
  ) AS city_name,
  'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/' || name AS photo_url,
  ROW_NUMBER() OVER (
    PARTITION BY
      UPPER(SUBSTRING(name FROM '^([a-z]{2})-')),
      LOWER(SUBSTRING(name FROM '^[a-z]{2}-([^-]+)'))
    ORDER BY name
  ) AS photo_rank
FROM storage.objects
WHERE bucket_id = 'town-images'
  AND name ~ '^[a-z]{2}-.+\.(jpg|jpeg|png|webp)$';

-- Step 2: Complete country code mapping
CREATE TEMP TABLE country_code_map (code TEXT, country TEXT);

INSERT INTO country_code_map (code, country) VALUES
  ('AE', 'United Arab Emirates'),
  ('AL', 'Albania'),
  ('AR', 'Argentina'),
  ('AT', 'Austria'),
  ('AU', 'Australia'),
  ('AUS', 'Australia'),
  ('BE', 'Belgium'),
  ('BR', 'Brazil'),
  ('CA', 'Canada'),
  ('CH', 'Switzerland'),
  ('CL', 'Chile'),
  ('CO', 'Colombia'),
  ('CZ', 'Czech Republic'),
  ('DE', 'Germany'),
  ('DO', 'Dominican Republic'),
  ('EC', 'Ecuador'),
  ('EE', 'Estonia'),
  ('EG', 'Egypt'),
  ('ES', 'Spain'),
  ('FJ', 'Fiji'),
  ('FR', 'France'),
  ('GB', 'United Kingdom'),
  ('GR', 'Greece'),
  ('GT', 'Guatemala'),
  ('HN', 'Honduras'),
  ('HR', 'Croatia'),
  ('HU', 'Hungary'),
  ('IE', 'Ireland'),
  ('IL', 'Israel'),
  ('IN', 'India'),
  ('IS', 'Iceland'),
  ('IT', 'Italy'),
  ('KH', 'Cambodia'),
  ('LA', 'Laos'),
  ('LV', 'Latvia'),
  ('MA', 'Morocco'),
  ('ME', 'Montenegro'),
  ('MT', 'Malta'),
  ('MX', 'Mexico'),
  ('MY', 'Malaysia'),
  ('NA', 'Namibia'),
  ('NC', 'New Caledonia'),
  ('NL', 'Netherlands'),
  ('NP', 'Nepal'),
  ('NZ', 'New Zealand'),
  ('PA', 'Panama'),
  ('PE', 'Peru'),
  ('PH', 'Philippines'),
  ('PT', 'Portugal'),
  ('PR', 'Puerto Rico'),
  ('PY', 'Paraguay'),
  ('RW', 'Rwanda'),
  ('SC', 'Seychelles'),
  ('SG', 'Singapore'),
  ('SI', 'Slovenia'),
  ('SN', 'Senegal'),
  ('TH', 'Thailand'),
  ('TN', 'Tunisia'),
  ('TR', 'Turkey'),
  ('TW', 'Taiwan'),
  ('US', 'United States'),
  ('UY', 'Uruguay'),
  ('VC', 'Saint Vincent and Grenadines'),
  ('VN', 'Vietnam'),
  ('ZA', 'South Africa');

-- Step 3: Create special name mappings for multi-word cities
CREATE TEMP TABLE city_name_map (file_name TEXT, db_name TEXT);

INSERT INTO city_name_map (file_name, db_name) VALUES
  ('sidney', 'sydney'),
  ('rio', 'rio de janeiro'),
  ('british', 'victoria'),  -- ca-british-columbia-victoria
  ('el', 'el gouna');  -- eg-el-gouna

-- Step 4: Preview matches
SELECT
  t.id,
  t.name AS town_name,
  t.country,
  p1.filename AS photo_1,
  p2.filename AS photo_2,
  p3.filename AS photo_3,
  p1.city_name AS parsed_name
FROM towns t
LEFT JOIN photo_matches p1 ON
  (
    LOWER(t.name) = p1.city_name
    OR LOWER(t.name) LIKE p1.city_name || '%'
    OR p1.city_name IN (SELECT file_name FROM city_name_map WHERE LOWER(t.name) = db_name)
  )
  AND t.country = (SELECT country FROM country_code_map WHERE code = p1.country_code)
  AND p1.photo_rank = 1
LEFT JOIN photo_matches p2 ON
  (
    LOWER(t.name) = p2.city_name
    OR LOWER(t.name) LIKE p2.city_name || '%'
  )
  AND t.country = (SELECT country FROM country_code_map WHERE code = p2.country_code)
  AND p2.photo_rank = 2
LEFT JOIN photo_matches p3 ON
  (
    LOWER(t.name) = p3.city_name
    OR LOWER(t.name) LIKE p3.city_name || '%'
  )
  AND t.country = (SELECT country FROM country_code_map WHERE code = p3.country_code)
  AND p3.photo_rank = 3
WHERE p1.filename IS NOT NULL
  AND t.image_url_1 IS NULL
ORDER BY t.name;

-- Step 5: Update towns WITHOUT photos
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
  AND (
    LOWER(t.name) = p1.city_name
    OR LOWER(t.name) LIKE p1.city_name || '%'
    OR p1.city_name IN (SELECT file_name FROM city_name_map WHERE LOWER(t.name) = db_name)
  )
  AND t.country = (SELECT country FROM country_code_map WHERE code = p1.country_code)
  AND t.image_url_1 IS NULL;

-- Step 6: Summary
SELECT
  COUNT(*) FILTER (WHERE image_url_1 IS NOT NULL) AS towns_with_photos,
  COUNT(*) FILTER (WHERE image_url_2 IS NOT NULL) AS with_photo_2,
  COUNT(*) FILTER (WHERE image_url_3 IS NOT NULL) AS with_photo_3,
  COUNT(*) FILTER (WHERE image_url_1 IS NULL) AS towns_without_photos,
  COUNT(*) AS total_towns
FROM towns;
