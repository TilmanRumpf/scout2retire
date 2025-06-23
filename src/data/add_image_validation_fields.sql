-- Add image validation fields to towns table
-- This ensures we can track and fix image issues

ALTER TABLE towns
ADD COLUMN IF NOT EXISTS image_validation_note TEXT,
ADD COLUMN IF NOT EXISTS image_validated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS image_is_fallback BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS image_source TEXT CHECK (
  image_source IN ('original', 'unsplash', 'pexels', 'pixabay', 'generated', 'fallback')
);

-- Add backup image URLs for redundancy
ALTER TABLE towns
ADD COLUMN IF NOT EXISTS image_url_2 TEXT,
ADD COLUMN IF NOT EXISTS image_url_3 TEXT,
ADD COLUMN IF NOT EXISTS image_urls TEXT[]; -- Array of all available images

-- Create a table for curated location images
CREATE TABLE IF NOT EXISTS curated_location_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country TEXT NOT NULL,
  region TEXT,
  city TEXT,
  geographic_feature TEXT,
  image_url TEXT NOT NULL,
  image_source TEXT NOT NULL,
  description TEXT,
  photographer TEXT,
  license TEXT,
  tags TEXT[],
  is_primary BOOLEAN DEFAULT false,
  quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 10),
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_curated_images_country ON curated_location_images(country);
CREATE INDEX IF NOT EXISTS idx_curated_images_region ON curated_location_images(region);
CREATE INDEX IF NOT EXISTS idx_curated_images_feature ON curated_location_images(geographic_feature);
CREATE INDEX IF NOT EXISTS idx_curated_images_tags ON curated_location_images USING GIN(tags);

-- Insert high-quality fallback images
INSERT INTO curated_location_images (
  country, image_url, image_source, description, tags, is_primary, quality_score
) VALUES 
-- Portugal
('Portugal', 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1200&q=80', 'unsplash', 'Porto riverside with Dom Luis bridge', ARRAY['porto', 'river', 'bridge', 'cityscape', 'historic'], true, 10),
('Portugal', 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=1200&q=80', 'unsplash', 'Porto wine cellars and colorful buildings', ARRAY['porto', 'wine', 'culture', 'architecture'], false, 9),
('Portugal', 'https://images.unsplash.com/photo-1588442007375-baf24b3d32c2?w=1200&q=80', 'unsplash', 'Lisbon yellow tram on historic street', ARRAY['lisbon', 'tram', 'urban', 'transport'], false, 9),

-- Spain  
('Spain', 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=1200&q=80', 'unsplash', 'Valencia City of Arts and Sciences', ARRAY['valencia', 'modern', 'architecture', 'culture'], true, 10),
('Spain', 'https://images.unsplash.com/photo-1558642084-fd07fae5282e?w=1200&q=80', 'unsplash', 'Spanish plaza with traditional architecture', ARRAY['plaza', 'traditional', 'urban', 'lifestyle'], false, 9),

-- France
('France', 'https://images.unsplash.com/photo-1584266766915-53036a2c4e3b?w=1200&q=80', 'unsplash', 'Nice Promenade des Anglais', ARRAY['nice', 'riviera', 'coastal', 'beach'], true, 10),
('France', 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200&q=80', 'unsplash', 'Provence lavender fields', ARRAY['provence', 'rural', 'nature', 'lavender'], false, 9),

-- Italy
('Italy', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80', 'unsplash', 'Lucca historic walls and towers', ARRAY['lucca', 'tuscany', 'historic', 'walls'], true, 10),
('Italy', 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1200&q=80', 'unsplash', 'Venice Grand Canal', ARRAY['venice', 'canal', 'water', 'romantic'], false, 10),

-- Greece
('Greece', 'https://images.unsplash.com/photo-1598037001124-55ddd0f00baf?w=1200&q=80', 'unsplash', 'Crete Balos Lagoon pink sand beach', ARRAY['crete', 'beach', 'island', 'paradise'], true, 10),
('Greece', 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&q=80', 'unsplash', 'Santorini white buildings blue domes', ARRAY['santorini', 'island', 'iconic', 'architecture'], false, 10),

-- Turkey
('Turkey', 'https://images.unsplash.com/photo-1593238739364-18cfde30e522?w=1200&q=80', 'unsplash', 'Antalya harbor with mountains', ARRAY['antalya', 'coastal', 'harbor', 'mountains'], true, 10),

-- Mexico
('Mexico', 'https://images.unsplash.com/photo-1568402102990-bc541580b59f?w=1200&q=80', 'unsplash', 'Playa del Carmen turquoise beach', ARRAY['playa del carmen', 'beach', 'caribbean', 'tropical'], true, 10),
('Mexico', 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=1200&q=80', 'unsplash', 'Mexican colonial architecture', ARRAY['colonial', 'architecture', 'culture', 'historic'], false, 9),

-- Costa Rica
('Costa Rica', 'https://images.unsplash.com/photo-1605723517503-3cadb5818a0c?w=1200&q=80', 'unsplash', 'Tamarindo beach sunset', ARRAY['tamarindo', 'beach', 'sunset', 'pacific'], true, 10),

-- Panama
('Panama', 'https://images.unsplash.com/photo-1580257521667-116f90abca01?w=1200&q=80', 'unsplash', 'Boquete mountain valley landscape', ARRAY['boquete', 'mountains', 'valley', 'nature'], true, 10),
('Panama', 'https://images.unsplash.com/photo-1558029062-a37889b87526?w=1200&q=80', 'unsplash', 'Panama City modern skyline', ARRAY['panama city', 'skyline', 'urban', 'modern'], false, 9),

-- Ecuador
('Ecuador', 'https://images.unsplash.com/photo-1533600298287-9a3629a89789?w=1200&q=80', 'unsplash', 'Cuenca blue domed cathedral', ARRAY['cuenca', 'cathedral', 'architecture', 'historic'], true, 10),

-- Colombia
('Colombia', 'https://images.unsplash.com/photo-1597531013114-d5e317a08c17?w=1200&q=80', 'unsplash', 'Medellin modern skyline with mountains', ARRAY['medellin', 'skyline', 'mountains', 'modern'], true, 10),
('Colombia', 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=1200&q=80', 'unsplash', 'Cartagena colorful colonial streets', ARRAY['cartagena', 'colonial', 'colorful', 'historic'], false, 10),

-- Thailand
('Thailand', 'https://images.unsplash.com/photo-1598981457915-aea220950616?w=1200&q=80', 'unsplash', 'Chiang Mai Doi Suthep temple', ARRAY['chiang mai', 'temple', 'buddhist', 'culture'], true, 10),

-- Malaysia
('Malaysia', 'https://images.unsplash.com/photo-1581622558663-b2e33377dfb2?w=1200&q=80', 'unsplash', 'Penang George Town street art', ARRAY['penang', 'street art', 'culture', 'urban'], true, 10),

-- Vietnam
('Vietnam', 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200&q=80', 'unsplash', 'Da Nang Dragon Bridge', ARRAY['da nang', 'bridge', 'modern', 'landmark'], true, 10),

-- Netherlands
('Netherlands', 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1200&q=80', 'unsplash', 'Amsterdam canal houses', ARRAY['amsterdam', 'canals', 'architecture', 'water'], true, 10),

-- Latvia
('Latvia', 'https://images.unsplash.com/photo-1599057463911-0649c7711f85?w=1200&q=80', 'unsplash', 'Riga Art Nouveau architecture', ARRAY['riga', 'art nouveau', 'architecture', 'historic'], true, 10),

-- Slovenia
('Slovenia', 'https://images.unsplash.com/photo-1558271736-cd043ef2e855?w=1200&q=80', 'unsplash', 'Ljubljana castle and river', ARRAY['ljubljana', 'castle', 'river', 'capital'], true, 10),

-- Croatia
('Croatia', 'https://images.unsplash.com/photo-1555990538-1e6e5b3d0b3b?w=1200&q=80', 'unsplash', 'Split waterfront promenade', ARRAY['split', 'waterfront', 'adriatic', 'coastal'], true, 10),

-- Malta
('Malta', 'https://images.unsplash.com/photo-1565071559227-20ab25b7685e?w=1200&q=80', 'unsplash', 'Valletta harbor fortifications', ARRAY['valletta', 'harbor', 'fortifications', 'historic'], true, 10);

-- Function to get best image for a town
CREATE OR REPLACE FUNCTION get_best_image_for_town(
  town_country TEXT,
  town_region TEXT DEFAULT NULL,
  town_features TEXT[] DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
  best_image TEXT;
BEGIN
  -- First try exact country match with highest quality
  SELECT image_url INTO best_image
  FROM curated_location_images
  WHERE country = town_country
    AND is_primary = true
  ORDER BY quality_score DESC
  LIMIT 1;
  
  -- If no primary image, get any high-quality image for the country
  IF best_image IS NULL THEN
    SELECT image_url INTO best_image
    FROM curated_location_images
    WHERE country = town_country
    ORDER BY quality_score DESC, usage_count ASC
    LIMIT 1;
  END IF;
  
  -- If still no image and we have features, try feature match
  IF best_image IS NULL AND town_features IS NOT NULL THEN
    SELECT image_url INTO best_image
    FROM curated_location_images
    WHERE tags && town_features
    ORDER BY quality_score DESC
    LIMIT 1;
  END IF;
  
  -- Update usage count
  IF best_image IS NOT NULL THEN
    UPDATE curated_location_images
    SET usage_count = usage_count + 1
    WHERE image_url = best_image;
  END IF;
  
  RETURN best_image;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate images on insert/update
CREATE OR REPLACE FUNCTION validate_town_image()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if image URL contains blocked patterns
  IF NEW.image_url_1 IS NOT NULL AND (
    NEW.image_url_1 ~* 'rabbit|bunny|cat[^h]|dog|pet|animal|zoo|placeholder|error|404'
  ) THEN
    -- Get a better image
    NEW.image_url_1 = get_best_image_for_town(
      NEW.country,
      NEW.region,
      NEW.geographic_features
    );
    NEW.image_validation_note = 'Auto-replaced inappropriate image';
    NEW.image_is_fallback = true;
  END IF;
  
  -- If no image at all, get a fallback
  IF NEW.image_url_1 IS NULL OR NEW.image_url_1 = '' THEN
    NEW.image_url_1 = get_best_image_for_town(
      NEW.country,
      NEW.region,
      NEW.geographic_features
    );
    NEW.image_validation_note = 'Auto-added missing image';
    NEW.image_is_fallback = true;
  END IF;
  
  NEW.image_validated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER validate_town_image_trigger
BEFORE INSERT OR UPDATE OF image_url_1 ON towns
FOR EACH ROW
EXECUTE FUNCTION validate_town_image();

-- Run validation on existing data
UPDATE towns
SET image_url_1 = image_url_1
WHERE image_url_1 IS NULL 
   OR image_url_1 = ''
   OR image_url_1 ~* 'rabbit|bunny|cat[^h]|dog|pet|animal|zoo|placeholder|error|404';