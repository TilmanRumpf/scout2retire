-- ================================================
-- US CITIES IMAGE MAPPING WITH UNIQUE IDS
-- ================================================
-- This approach uses a temporary mapping table for US cities

-- Create a temporary mapping table for US city images
CREATE TEMP TABLE IF NOT EXISTS us_city_image_mapping (
  town_name VARCHAR(255),
  state_code VARCHAR(2),
  city_slug VARCHAR(255),
  unique_id VARCHAR(50),
  full_filename VARCHAR(255)
);

-- Insert your US city mappings here
-- Replace the unique IDs with your actual values
INSERT INTO us_city_image_mapping (town_name, state_code, city_slug, unique_id, full_filename) VALUES
('Gainesville, FL', 'fl', 'gainesville', 'REPLACE_ID_1', 'us-fl-gainesville-REPLACE_ID_1.jpg'),
('Tallahassee, FL', 'fl', 'tallahassee', 'REPLACE_ID_2', 'us-fl-tallahassee-REPLACE_ID_2.jpg');
-- Add more cities as needed:
-- ('Austin, TX', 'tx', 'austin', 'abc123def', 'us-tx-austin-abc123def.jpg'),
-- ('Denver, CO', 'co', 'denver', 'xyz789uvw', 'us-co-denver-xyz789uvw.jpg'),

-- Update US cities using the mapping
UPDATE towns t
SET image_url_1 = CONCAT(
  'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/',
  m.full_filename
)
FROM us_city_image_mapping m
WHERE t.country = 'United States' 
  AND t.name = m.town_name;

-- Show what was updated
SELECT 
  t.name,
  t.image_url_1
FROM towns t
WHERE t.country = 'United States'
ORDER BY t.name;

-- Clean up
DROP TABLE IF EXISTS us_city_image_mapping;

-- ================================================
-- ALTERNATIVE: Pattern-based approach if IDs follow a pattern
-- ================================================
-- If your unique IDs follow a predictable pattern (e.g., first 8 chars of town ID),
-- you can use this approach instead:

/*
UPDATE towns
SET image_url_1 = CONCAT(
  'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/us-',
  LOWER(
    -- Extract state code
    SUBSTRING(name FROM POSITION(', ' IN name) + 2)
  ),
  '-',
  LOWER(
    -- Extract and clean city name
    REPLACE(
      REPLACE(
        SUBSTRING(name FROM 1 FOR POSITION(', ' IN name) - 1),
        ' ', '-'
      ),
      '.', ''
    )
  ),
  '-',
  -- Use first 8 characters of the town ID as unique identifier
  SUBSTRING(id::TEXT, 1, 8),
  '.jpg'
)
WHERE country = 'United States' 
  AND POSITION(', ' IN name) > 0;
*/

-- ================================================
-- FUTURE-PROOF FUNCTION APPROACH
-- ================================================
-- Create a function to generate US image URLs dynamically

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

-- Example usage of the function:
/*
UPDATE towns
SET image_url_1 = get_us_town_image_url(name, id)
WHERE country = 'United States';
*/