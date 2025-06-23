-- ============================================
-- UPDATE ALL TOWN IMAGES FROM SUPABASE STORAGE
-- ============================================
-- This script updates all town images to use your Supabase storage bucket
-- Choose the appropriate section based on how your images are stored

-- First, let's see current data
SELECT 
  id,
  name,
  country,
  SUBSTRING(image_url_1, 1, 50) || '...' as current_image
FROM towns
ORDER BY country, name
LIMIT 10;

-- ============================================
-- OPTION 1: Images stored as country-name.jpg (e.g., "portugal-porto.jpg")
-- ============================================
/*
UPDATE towns
SET image_url_1 = CONCAT(
  'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/',
  LOWER(REPLACE(country, ' ', '-')),
  '-',
  LOWER(REPLACE(REPLACE(REPLACE(name, ' ', '-'), ',', ''), '.', '')),
  '.jpg'
);
*/

-- ============================================
-- OPTION 2: Images stored in country folders (e.g., "portugal/porto.jpg")
-- ============================================
/*
UPDATE towns
SET image_url_1 = CONCAT(
  'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/',
  LOWER(REPLACE(country, ' ', '-')),
  '/',
  LOWER(REPLACE(REPLACE(REPLACE(name, ' ', '-'), ',', ''), '.', '')),
  '.jpg'
);
*/

-- ============================================
-- OPTION 3: Images stored by town ID (e.g., "334739b3-016c-4cda-af2b-1b90116aee3f.jpg")
-- ============================================
/*
UPDATE towns
SET image_url_1 = CONCAT(
  'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/',
  id,
  '.jpg'
);
*/

-- ============================================
-- OPTION 4: Manual mapping for each town
-- ============================================
-- Uncomment and run this if you have specific filenames

UPDATE towns
SET image_url_1 = CASE
  -- Portugal
  WHEN id = 'd2085a2d-03db-4248-8aa8-5f73fab0ecc6' THEN 'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/porto.jpg'
  WHEN id = '286843dc-1919-4bf3-bbf6-79b751b20e8a' THEN 'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/lisbon.jpg'
  WHEN id = '2e00a26c-874f-4a40-8f29-241d1c970674' THEN 'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/tavira.jpg'
  
  -- Spain
  WHEN id = '3fadbd1c-04d3-4a0a-9b10-64baf7d1dd5c' THEN 'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/valencia.jpg'
  WHEN id = '104f60bd-12a3-44ca-8a8d-ddbdae8fea6a' THEN 'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/alicante.jpg'
  
  -- Mexico
  WHEN id = 'f34aa383-9d64-4957-8c34-e4dc9e3e2f73' THEN 'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/san-miguel-de-allende.jpg'
  WHEN id = '25c6f8d8-326b-414f-b50f-5944b239e430' THEN 'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/lake-chapala.jpg'
  WHEN id = 'a718f196-6f83-4a49-9554-94ae4e33fb22' THEN 'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/merida.jpg'
  
  -- Thailand
  WHEN id = '334739b3-016c-4cda-af2b-1b90116aee3f' THEN 'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/chiang-mai.jpg'
  
  -- Panama
  WHEN id = '8f0739b5-20ad-4813-a9bb-f36c26d4195f' THEN 'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/boquete.jpg'
  
  -- France
  WHEN id = '7ab8285e-3edc-4b3e-9c97-13faf7d39339' THEN 'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/bordeaux.jpg'
  WHEN id = '821e7932-3a5f-4c77-98a8-cf7dd5ab9c65' THEN 'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/saint-tropez.jpg'
  WHEN id = '87df20b8-2a73-40a5-9f5b-c1b30d9b5e2e' THEN 'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/paris.jpg'
  
  -- Italy
  WHEN id = '5b79d4c8-5a09-4c16-b1b6-fea9f0c9f9f0' THEN 'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/rome.jpg'
  
  -- Others
  WHEN id = '33a72b07-3c37-439e-9e67-b7b8e8f9ff0f' THEN 'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/split.jpg'
  WHEN id = '83b319b5-c80e-4ddd-9ce3-5e890b8daeab' THEN 'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/ljubljana.jpg'
  WHEN id = 'f7c0d1e0-7b9a-4f47-9f87-8e1a0b2c3d4e' THEN 'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/lemmer.jpg'
  WHEN id = '2d5e7f91-3c4a-4b5c-8d9e-1f2a3b4c5d6e' THEN 'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/riga.jpg'
  WHEN id = '9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d' THEN 'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/medellin.jpg'
  WHEN id = 'e1f2d3c4-b5a6-9788-9c8b-7a6f5e4d3c2b' THEN 'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/cuenca.jpg'
  WHEN id = 'a9b8c7d6-e5f4-3b2a-1d0c-8e7f6a5b4c3d' THEN 'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/da-nang.jpg'
  WHEN id = '7f8e9d0c-1b2a-3c4d-5e6f-7a8b9c0d1e2f' THEN 'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/george-town.jpg'
  WHEN id = '1234567-890a-bcde-fghi-jklmnopqrstu' THEN 'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/gainesville.jpg'
  
  ELSE image_url_1 -- Keep existing if no match
END;


-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Check the results
SELECT 
  country,
  name,
  SUBSTRING(image_url_1, 1, 80) || '...' as new_image_url
FROM towns
ORDER BY country, name
LIMIT 30;

-- Count how many were updated
SELECT 
  COUNT(*) as total_towns,
  COUNT(CASE WHEN image_url_1 LIKE '%supabase.co/storage%' THEN 1 END) as using_storage,
  COUNT(CASE WHEN image_url_1 NOT LIKE '%supabase.co/storage%' THEN 1 END) as using_other
FROM towns;