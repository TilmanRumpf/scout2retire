-- Auto-connect photos from town-images bucket to towns table
-- ONLY updates towns WITHOUT existing photos
-- Matches based on filename pattern: CC-CityName.jpg

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

-- Step 2: Complete country code mapping (matches YOUR database exactly)
CREATE TEMP TABLE country_code_map (code TEXT, country TEXT);

INSERT INTO country_code_map (code, country) VALUES
  ('AL', 'Albania'),
  ('AS', 'American Samoa'),
  ('AG', 'Antigua and Barbuda'),
  ('AR', 'Argentina'),
  ('AW', 'Aruba'),
  ('AU', 'Australia'),
  ('AT', 'Austria'),
  ('BS', 'Bahamas'),
  ('BB', 'Barbados'),
  ('BE', 'Belgium'),
  ('BZ', 'Belize'),
  ('BW', 'Botswana'),
  ('BR', 'Brazil'),
  ('VG', 'British Virgin Islands'),
  ('KH', 'Cambodia'),
  ('CA', 'Canada'),
  ('CL', 'Chile'),
  ('CO', 'Colombia'),
  ('CK', 'Cook Islands'),
  ('CR', 'Costa Rica'),
  ('HR', 'Croatia'),
  ('CW', 'Curacao'),
  ('CY', 'Cyprus'),
  ('CZ', 'Czech Republic'),
  ('DO', 'Dominican Republic'),
  ('EC', 'Ecuador'),
  ('EG', 'Egypt'),
  ('EE', 'Estonia'),
  ('FJ', 'Fiji'),
  ('FR', 'France'),
  ('PF', 'French Polynesia'),
  ('DE', 'Germany'),
  ('GR', 'Greece'),
  ('GD', 'Grenada'),
  ('GT', 'Guatemala'),
  ('HN', 'Honduras'),
  ('HU', 'Hungary'),
  ('IS', 'Iceland'),
  ('IN', 'India'),
  ('IE', 'Ireland'),
  ('IL', 'Israel'),
  ('IT', 'Italy'),
  ('LA', 'Laos'),
  ('LV', 'Latvia'),
  ('MY', 'Malaysia'),
  ('MT', 'Malta'),
  ('MH', 'Marshall Islands'),
  ('MQ', 'Martinique'),
  ('MU', 'Mauritius'),
  ('MX', 'Mexico'),
  ('FM', 'Micronesia'),
  ('ME', 'Montenegro'),
  ('MA', 'Morocco'),
  ('NA', 'Namibia'),
  ('NP', 'Nepal'),
  ('NL', 'Netherlands'),
  ('NC', 'New Caledonia'),
  ('NZ', 'New Zealand'),
  ('XX', 'Northern Cyprus'),
  ('PW', 'Palau'),
  ('PA', 'Panama'),
  ('PY', 'Paraguay'),
  ('PE', 'Peru'),
  ('PH', 'Philippines'),
  ('PT', 'Portugal'),
  ('PR', 'Puerto Rico'),
  ('RW', 'Rwanda'),
  ('KN', 'Saint Kitts and Nevis'),
  ('LC', 'Saint Lucia'),
  ('MF', 'Saint Martin'),
  ('VC', 'Saint Vincent and Grenadines'),
  ('WS', 'Samoa'),
  ('SN', 'Senegal'),
  ('SC', 'Seychelles'),
  ('SG', 'Singapore'),
  ('SX', 'Sint Maarten'),
  ('SI', 'Slovenia'),
  ('SB', 'Solomon Islands'),
  ('ZA', 'South Africa'),
  ('ES', 'Spain'),
  ('CH', 'Switzerland'),
  ('TW', 'Taiwan'),
  ('TH', 'Thailand'),
  ('TO', 'Tonga'),
  ('TN', 'Tunisia'),
  ('TR', 'Turkey'),
  ('TC', 'Turks and Caicos'),
  ('AE', 'United Arab Emirates'),
  ('GB', 'United Kingdom'),
  ('US', 'United States'),
  ('UY', 'Uruguay'),
  ('VI', 'U.S. Virgin Islands'),
  ('VU', 'Vanuatu'),
  ('VN', 'Vietnam');

-- Step 3: Preview matches (shows what WILL be updated)
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
  AND t.image_url_1 IS NULL  -- Only show towns WITHOUT photos
ORDER BY t.name;

-- Step 4: Update towns WITHOUT photos
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
  AND t.country = (SELECT country FROM country_code_map WHERE code = p1.country_code)
  AND t.image_url_1 IS NULL;  -- ONLY update towns without existing photos

-- Step 5: Summary
SELECT
  COUNT(*) FILTER (WHERE image_url_1 IS NOT NULL) AS towns_with_photos,
  COUNT(*) FILTER (WHERE image_url_1 IS NULL) AS towns_without_photos,
  COUNT(*) AS total_towns
FROM towns;
