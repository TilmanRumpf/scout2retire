-- ================================================
-- UPDATE ALL TOWNS WITH SUPABASE STORAGE IMAGES
-- ================================================
-- This script updates all town images to use your properly named images from Supabase storage

-- First, let's see what we're updating
SELECT 
  id,
  name,
  country,
  SUBSTRING(image_url_1, 1, 50) || '...' as current_image
FROM towns
ORDER BY country, name;

-- Update all towns with the new storage URLs
-- Using the naming convention: {country-code}-{town-name}.jpg
UPDATE towns
SET image_url_1 = CONCAT(
  'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/',
  LOWER(
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
        WHEN 'United States' THEN 'us'
        WHEN 'Thailand' THEN 'th'
        WHEN 'Vietnam' THEN 'vn'
        WHEN 'Malaysia' THEN 'my'
      END,
      '-',
      LOWER(
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(name, ' ', '-'),  -- Replace spaces with hyphens
              ',', ''                   -- Remove commas
            ),
            '.', ''                     -- Remove periods
          ),
          '''', ''                      -- Remove apostrophes
        )
      )
    )
  ),
  '.jpg'
);

-- Create function for US image URLs (future-proof approach)
CREATE OR REPLACE FUNCTION get_us_town_image_url(
  p_town_name TEXT,
  p_town_id UUID
) RETURNS TEXT AS $$
DECLARE
  v_state_code TEXT;
  v_city_name TEXT;
  v_city_slug TEXT;
  v_unique_id TEXT;
BEGIN
  -- Extract state code (e.g., 'FL' from 'Gainesville, FL')
  IF POSITION(', ' IN p_town_name) > 0 THEN
    v_state_code := LOWER(SUBSTRING(p_town_name FROM POSITION(', ' IN p_town_name) + 2));
    v_city_name := SUBSTRING(p_town_name FROM 1 FOR POSITION(', ' IN p_town_name) - 1);
  ELSE
    -- No state code found, use default
    v_state_code := 'xx';
    v_city_name := p_town_name;
  END IF;
  
  -- Create city slug (lowercase, hyphenated)
  v_city_slug := LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(v_city_name, '[^a-zA-Z0-9\s]', '', 'g'), -- Remove special chars
      '\s+', '-', 'g' -- Replace spaces with hyphens
    )
  );
  
  -- Generate unique ID (using first 8 chars of UUID)
  v_unique_id := SUBSTRING(p_town_id::TEXT, 1, 8);
  
  -- Build the URL
  RETURN CONCAT(
    'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/us-',
    v_state_code,
    '-',
    v_city_slug,
    '-',
    v_unique_id,
    '.jpg'
  );
END;
$$ LANGUAGE plpgsql;

-- Update United States cities using the function
UPDATE towns
SET image_url_1 = get_us_town_image_url(name, id)
WHERE country = 'United States';

-- Verify the updates
SELECT 
  country,
  name,
  image_url_1
FROM towns
ORDER BY country, name;

-- Summary of updates
SELECT 
  country,
  COUNT(*) as town_count,
  COUNT(CASE WHEN image_url_1 LIKE '%supabase.co/storage%' THEN 1 END) as using_storage,
  COUNT(CASE WHEN image_url_1 NOT LIKE '%supabase.co/storage%' THEN 1 END) as using_other
FROM towns
GROUP BY country
ORDER BY country;

-- Check for any potential issues
SELECT 
  country,
  name,
  image_url_1
FROM towns
WHERE image_url_1 LIKE '%---%'  -- Triple hyphens might indicate issues
   OR image_url_1 LIKE '%--.jpg' -- Double hyphen at end
   OR LENGTH(image_url_1) > 200;  -- Unusually long URLs

-- List of all generated image filenames for verification
SELECT 
  country,
  name,
  SUBSTRING(image_url_1, 
    POSITION('/town-images/' IN image_url_1) + 13, 
    LENGTH(image_url_1) - POSITION('/town-images/' IN image_url_1) - 12
  ) as image_filename
FROM towns
WHERE image_url_1 LIKE '%supabase.co/storage%'
ORDER BY country, name;

-- Special verification for US cities to ensure correct format
SELECT 
  name,
  id,
  image_url_1,
  SUBSTRING(image_url_1, 
    POSITION('/town-images/' IN image_url_1) + 13, 
    LENGTH(image_url_1) - POSITION('/town-images/' IN image_url_1) - 12
  ) as expected_filename
FROM towns
WHERE country = 'United States'
ORDER BY name;

-- Clean up function after use (optional)
-- DROP FUNCTION IF EXISTS get_us_town_image_url(TEXT, UUID);