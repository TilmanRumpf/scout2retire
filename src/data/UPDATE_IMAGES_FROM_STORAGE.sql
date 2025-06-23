-- Update all town images to use Supabase storage bucket URLs
-- This script updates image_url_1 to point to the town-images bucket

-- First, let's see what we're working with
SELECT 
  id,
  name,
  country,
  image_url_1
FROM towns
ORDER BY country, name
LIMIT 10;

-- Update all towns to use Supabase storage URLs
-- The pattern is: https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/[filename]
-- We'll use a combination of country and town name for the filename

UPDATE towns
SET image_url_1 = CONCAT(
  'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/',
  LOWER(REPLACE(country, ' ', '-')),
  '/',
  LOWER(REPLACE(name, ' ', '-')),
  '.jpg'
);

-- Verify the update
SELECT 
  country,
  name,
  image_url_1
FROM towns
ORDER BY country, name
LIMIT 20;

-- Alternative: If the images are stored with town IDs as filenames
-- Uncomment and run this instead if needed:
/*
UPDATE towns
SET image_url_1 = CONCAT(
  'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/',
  id,
  '.jpg'
);
*/

-- Alternative: If images are stored in a flat structure with specific naming
-- Uncomment and modify as needed:
/*
UPDATE towns
SET image_url_1 = CASE
  WHEN country = 'Thailand' AND name = 'Chiang Mai' THEN 'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/thailand-chiang-mai.jpg'
  WHEN country = 'Portugal' AND name = 'Porto' THEN 'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/portugal-porto.jpg'
  WHEN country = 'Portugal' AND name = 'Lisbon' THEN 'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/portugal-lisbon.jpg'
  -- Add more cases as needed
  ELSE image_url_1 -- Keep existing if no match
END;
*/