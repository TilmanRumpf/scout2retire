-- Create a table to track image updates and validation
CREATE TABLE IF NOT EXISTS image_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  town_id UUID REFERENCES towns(id) ON DELETE CASCADE,
  image_type VARCHAR(50) DEFAULT 'primary', -- primary, alternate, seasonal
  storage_path VARCHAR(255) NOT NULL, -- e.g., 'pt-porto.jpg'
  storage_bucket VARCHAR(50) NOT NULL, -- 'town-images' or 'region-images'
  full_url TEXT GENERATED ALWAYS AS (
    'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/' || storage_bucket || '/' || storage_path
  ) STORED,
  file_size_kb INTEGER,
  dimensions VARCHAR(20), -- e.g., '800x600'
  upload_date TIMESTAMP DEFAULT NOW(),
  validated BOOLEAN DEFAULT false,
  validation_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_image_tracking_town_id ON image_tracking(town_id);
CREATE INDEX idx_image_tracking_validated ON image_tracking(validated);

-- Create a view for easy access to current town images
CREATE OR REPLACE VIEW town_images_current AS
SELECT 
  t.id,
  t.name,
  t.country,
  it.full_url as image_url,
  it.storage_path,
  it.validated,
  it.upload_date
FROM towns t
LEFT JOIN image_tracking it ON t.id = it.town_id AND it.image_type = 'primary'
ORDER BY t.country, t.name;

-- Function to update town image URLs after upload
CREATE OR REPLACE FUNCTION update_town_image_url(
  p_town_id UUID,
  p_storage_path VARCHAR(255),
  p_file_size_kb INTEGER DEFAULT NULL,
  p_dimensions VARCHAR(20) DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  v_full_url TEXT;
BEGIN
  -- Insert or update image tracking
  INSERT INTO image_tracking (
    town_id, 
    storage_path, 
    storage_bucket,
    file_size_kb,
    dimensions
  ) VALUES (
    p_town_id,
    p_storage_path,
    'town-images',
    p_file_size_kb,
    p_dimensions
  )
  ON CONFLICT (town_id) WHERE image_type = 'primary'
  DO UPDATE SET
    storage_path = EXCLUDED.storage_path,
    file_size_kb = EXCLUDED.file_size_kb,
    dimensions = EXCLUDED.dimensions,
    upload_date = NOW(),
    updated_at = NOW();
  
  -- Get the generated full URL
  SELECT full_url INTO v_full_url
  FROM image_tracking
  WHERE town_id = p_town_id AND image_type = 'primary';
  
  -- Update the towns table
  UPDATE towns
  SET image_url_1 = v_full_url
  WHERE id = p_town_id;
END;
$$ LANGUAGE plpgsql;

-- Example usage after uploading images:
/*
-- Update Porto image
SELECT update_town_image_url(
  'd2085a2d-03db-4248-8aa8-5f73fab0ecc6'::UUID,
  'pt-porto.jpg',
  156, -- file size in KB
  '800x600' -- dimensions
);

-- Batch update from a mapping
WITH image_mappings AS (
  SELECT 
    id,
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
        LOWER(REPLACE(REPLACE(REPLACE(name, ' ', '-'), ',', ''), '.', ''))
      )
    ) || '.jpg' as storage_path
  FROM towns
)
SELECT update_town_image_url(id, storage_path)
FROM image_mappings;
*/