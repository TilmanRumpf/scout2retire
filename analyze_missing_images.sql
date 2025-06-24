-- ANALYZE ALL MISSING AND PROBLEMATIC IMAGES
-- Run this to understand the scope of the image problem

-- 1. Overall image status summary
WITH image_analysis AS (
  SELECT 
    id,
    country,
    name,
    image_url_1,
    CASE 
      WHEN image_url_1 IS NULL THEN 'NULL'
      WHEN image_url_1 = '' THEN 'EMPTY'
      WHEN image_url_1 ~* 'rabbit|bunny|cat|dog|animal|pet' THEN 'ANIMAL'
      WHEN image_url_1 ~* 'placeholder|error|404|default' THEN 'ERROR'
      WHEN image_url_1 LIKE '%supabase.co/storage%' THEN 'SUPABASE'
      WHEN image_url_1 LIKE '%unsplash.com%' THEN 'UNSPLASH'
      ELSE 'OTHER'
    END as image_status
  FROM towns
)
SELECT 
  image_status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM towns), 2) as percentage
FROM image_analysis
GROUP BY image_status
ORDER BY count DESC;

-- 2. Countries with the most problems
WITH problem_images AS (
  SELECT 
    country,
    COUNT(*) as total_towns,
    COUNT(CASE WHEN image_url_1 IS NULL OR image_url_1 = '' THEN 1 END) as missing_images,
    COUNT(CASE WHEN image_url_1 ~* 'rabbit|bunny|animal|placeholder|error|404' THEN 1 END) as bad_images
  FROM towns
  GROUP BY country
)
SELECT 
  country,
  total_towns,
  missing_images,
  bad_images,
  missing_images + bad_images as total_problems,
  ROUND((missing_images + bad_images) * 100.0 / total_towns, 2) as problem_percentage
FROM problem_images
WHERE missing_images + bad_images > 0
ORDER BY total_problems DESC;

-- 3. Sample of problematic images by country
SELECT 
  country,
  name,
  CASE 
    WHEN image_url_1 IS NULL THEN 'NULL'
    WHEN image_url_1 = '' THEN 'EMPTY'
    WHEN image_url_1 ~* 'rabbit' THEN 'RABBIT IMAGE'
    WHEN image_url_1 ~* 'bunny' THEN 'BUNNY IMAGE'
    WHEN image_url_1 ~* 'animal' THEN 'ANIMAL IMAGE'
    WHEN image_url_1 ~* 'placeholder' THEN 'PLACEHOLDER'
    WHEN image_url_1 ~* 'error|404' THEN 'ERROR/404'
    ELSE SUBSTRING(image_url_1, 1, 50) || '...'
  END as image_issue,
  image_url_1
FROM towns
WHERE 
  image_url_1 IS NULL 
  OR image_url_1 = ''
  OR image_url_1 ~* 'rabbit|bunny|animal|placeholder|error|404'
ORDER BY country, name
LIMIT 50;

-- 4. Generate the expected filenames for missing images
-- This helps us know what files to look for in Supabase storage
SELECT 
  country,
  name,
  CASE 
    WHEN country = 'United States' AND POSITION(', ' IN name) > 0 THEN
      CONCAT(
        'us-',
        LOWER(SUBSTRING(name FROM POSITION(', ' IN name) + 2)),
        '-',
        LOWER(REGEXP_REPLACE(REGEXP_REPLACE(SUBSTRING(name FROM 1 FOR POSITION(', ' IN name) - 1), '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g')),
        '.jpg'
      )
    ELSE
      CONCAT(
        CASE country
          WHEN 'Portugal' THEN 'pt'
          WHEN 'Spain' THEN 'es'
          WHEN 'France' THEN 'fr'
          WHEN 'Italy' THEN 'it'
          WHEN 'Greece' THEN 'gr'
          WHEN 'Croatia' THEN 'hr'
          WHEN 'Slovenia' THEN 'si'
          WHEN 'Netherlands' THEN 'nl'
          WHEN 'Latvia' THEN 'lv'
          WHEN 'Malta' THEN 'mt'
          WHEN 'Mexico' THEN 'mx'
          WHEN 'Panama' THEN 'pa'
          WHEN 'Colombia' THEN 'co'
          WHEN 'Ecuador' THEN 'ec'
          WHEN 'Thailand' THEN 'th'
          WHEN 'Vietnam' THEN 'vn'
          WHEN 'Malaysia' THEN 'my'
          ELSE LOWER(LEFT(country, 2))
        END,
        '-',
        LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g')),
        '.jpg'
      )
  END as expected_filename
FROM towns
WHERE 
  image_url_1 IS NULL 
  OR image_url_1 = ''
  OR image_url_1 ~* 'rabbit|bunny|animal|placeholder|error|404'
ORDER BY country, name;

-- 5. Count of expected files by country
SELECT 
  country,
  COUNT(*) as towns_needing_images,
  STRING_AGG(
    CASE 
      WHEN country = 'United States' AND POSITION(', ' IN name) > 0 THEN
        CONCAT(
          'us-',
          LOWER(SUBSTRING(name FROM POSITION(', ' IN name) + 2)),
          '-',
          LOWER(REGEXP_REPLACE(REGEXP_REPLACE(SUBSTRING(name FROM 1 FOR POSITION(', ' IN name) - 1), '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g')),
          '.jpg'
        )
      ELSE
        CONCAT(
          CASE country
            WHEN 'Portugal' THEN 'pt'
            WHEN 'Spain' THEN 'es'
            WHEN 'France' THEN 'fr'
            WHEN 'Italy' THEN 'it'
            WHEN 'Greece' THEN 'gr'
            WHEN 'Croatia' THEN 'hr'
            WHEN 'Slovenia' THEN 'si'
            WHEN 'Netherlands' THEN 'nl'
            WHEN 'Latvia' THEN 'lv'
            WHEN 'Malta' THEN 'mt'
            WHEN 'Mexico' THEN 'mx'
            WHEN 'Panama' THEN 'pa'
            WHEN 'Colombia' THEN 'co'
            WHEN 'Ecuador' THEN 'ec'
            WHEN 'Thailand' THEN 'th'
            WHEN 'Vietnam' THEN 'vn'
            WHEN 'Malaysia' THEN 'my'
            ELSE LOWER(LEFT(country, 2))
          END,
          '-',
          LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g')),
          '.jpg'
        )
    END,
    ', '
  ) as expected_files
FROM towns
WHERE 
  image_url_1 IS NULL 
  OR image_url_1 = ''
  OR image_url_1 ~* 'rabbit|bunny|animal|placeholder|error|404'
GROUP BY country
ORDER BY towns_needing_images DESC;