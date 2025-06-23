-- EMERGENCY FIX: Replace ALL bad/missing images with curated fallbacks
-- This will fix 80% of fucked up images immediately

-- First, let's see how bad it is
SELECT COUNT(*) as total_bad_images
FROM towns 
WHERE image_url_1 IS NULL 
   OR image_url_1 = ''
   OR image_url_1 ~* 'rabbit|bunny|cat[^h]|dog|pet|animal|zoo|placeholder|error|404|stock|getty|shutter'
   OR image_url_1 ~* 'meeting|office|business|corporate';

-- Now let's fix them ALL
UPDATE towns
SET 
  image_url_1 = COALESCE(
    -- Try to get a curated image for the country
    (SELECT image_url 
     FROM curated_location_images 
     WHERE country = towns.country 
     AND is_primary = true 
     LIMIT 1),
    -- If no primary, get any image for the country
    (SELECT image_url 
     FROM curated_location_images 
     WHERE country = towns.country 
     LIMIT 1),
    -- Last resort: use generic by feature
    CASE 
      WHEN geographic_features::text ILIKE '%coastal%' THEN 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800&q=80'
      WHEN geographic_features::text ILIKE '%mountain%' THEN 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'
      WHEN geographic_features::text ILIKE '%island%' THEN 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80'
      WHEN geographic_features::text ILIKE '%lake%' THEN 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&q=80'
      WHEN geographic_features::text ILIKE '%rural%' THEN 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80'
      WHEN geographic_features::text ILIKE '%urban%' THEN 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80'
      ELSE 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80' -- Generic travel
    END
  ),
  image_validation_note = 'Auto-replaced bad image',
  image_is_fallback = true,
  image_validated_at = NOW()
WHERE image_url_1 IS NULL 
   OR image_url_1 = ''
   OR image_url_1 ~* 'rabbit|bunny|cat[^h]|dog|pet|animal|zoo|placeholder|error|404|stock|getty|shutter'
   OR image_url_1 ~* 'meeting|office|business|corporate';

-- Let's also create a mapping for specific known bad cases
UPDATE towns
SET image_url_1 = CASE
  -- Portugal
  WHEN country = 'Portugal' AND name = 'Porto' THEN 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80'
  WHEN country = 'Portugal' AND name = 'Lisbon' THEN 'https://images.unsplash.com/photo-1588442007375-baf24b3d32c2?w=800&q=80'
  WHEN country = 'Portugal' AND name ILIKE '%algarve%' THEN 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80'
  
  -- Spain
  WHEN country = 'Spain' AND name = 'Valencia' THEN 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800&q=80'
  WHEN country = 'Spain' AND name = 'Barcelona' THEN 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80'
  WHEN country = 'Spain' AND name = 'Madrid' THEN 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80'
  
  -- Panama - NO MORE RABBITS!
  WHEN country = 'Panama' AND name = 'Boquete' THEN 'https://images.unsplash.com/photo-1580257521667-116f90abca01?w=800&q=80'
  WHEN country = 'Panama' AND name ILIKE '%panama city%' THEN 'https://images.unsplash.com/photo-1558029062-a37889b87526?w=800&q=80'
  WHEN country = 'Panama' THEN 'https://images.unsplash.com/photo-1580257521667-116f90abca01?w=800&q=80' -- Default to Boquete
  
  -- Mexico
  WHEN country = 'Mexico' AND name ILIKE '%playa%' THEN 'https://images.unsplash.com/photo-1568402102990-bc541580b59f?w=800&q=80'
  WHEN country = 'Mexico' AND name ILIKE '%cancun%' THEN 'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=800&q=80'
  
  -- Italy
  WHEN country = 'Italy' AND name = 'Florence' THEN 'https://images.unsplash.com/photo-1541370976299-4d24ebbc9077?w=800&q=80'
  WHEN country = 'Italy' AND name = 'Rome' THEN 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80'
  WHEN country = 'Italy' AND name = 'Venice' THEN 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&q=80'
  
  -- Greece
  WHEN country = 'Greece' AND name ILIKE '%santorini%' THEN 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=80'
  WHEN country = 'Greece' AND name ILIKE '%athens%' THEN 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&q=80'
  
  -- France
  WHEN country = 'France' AND name = 'Nice' THEN 'https://images.unsplash.com/photo-1584266766915-53036a2c4e3b?w=800&q=80'
  WHEN country = 'France' AND name = 'Paris' THEN 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80'
  
  -- Netherlands
  WHEN country = 'Netherlands' AND name = 'Amsterdam' THEN 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&q=80'
  WHEN country = 'Netherlands' AND name = 'Lemmer' THEN 'https://images.unsplash.com/photo-1583295125721-766a0088cd3f?w=800&q=80'
  
  -- Malta - NO MORE EIFFEL TOWERS!
  WHEN country = 'Malta' THEN 'https://images.unsplash.com/photo-1565071559227-20ab25b7685e?w=800&q=80'
  
  ELSE image_url_1 -- Keep current if not in list
END
WHERE country IN ('Portugal', 'Spain', 'Panama', 'Mexico', 'Italy', 'Greece', 'France', 'Netherlands', 'Malta')
  AND (image_url_1 IS NULL OR image_url_1 ~* 'rabbit|bunny|animal|placeholder|eiffel|wrong');

-- Final check: How many did we fix?
SELECT 
  COUNT(*) FILTER (WHERE image_is_fallback = true) as fixed_images,
  COUNT(*) FILTER (WHERE image_is_fallback = false OR image_is_fallback IS NULL) as original_images,
  COUNT(*) as total_towns
FROM towns;

-- Show me some examples of what we fixed
SELECT name, country, image_url_1, image_validation_note
FROM towns
WHERE image_is_fallback = true
LIMIT 20;