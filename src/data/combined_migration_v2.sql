-- Combined migration for data consistency and image validation
-- Run this in Supabase SQL editor

-- PART 1: Create regional inspirations table
-- From: create_regional_inspirations_table_v2.sql

CREATE TABLE IF NOT EXISTS regional_inspirations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Core content
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  region_name TEXT NOT NULL,
  region_type TEXT CHECK (region_type IN ('country', 'region')) NOT NULL,
  
  -- Image data
  image_url TEXT NOT NULL,
  image_source TEXT,
  image_attribution TEXT,
  
  -- ALIGNED WITH ONBOARDING: Regional Preferences
  geographic_features TEXT[] CHECK (
    geographic_features <@ ARRAY['coastal', 'mountains', 'island', 'lakes', 'river', 'valley', 'desert', 'forest', 'plains']::TEXT[]
  ),
  vegetation_types TEXT[] CHECK (
    vegetation_types <@ ARRAY['tropical', 'subtropical', 'mediterranean', 'forest', 'grassland', 'desert']::TEXT[]
  ),
  
  -- ALIGNED WITH ONBOARDING: Climate Preferences
  summer_climate TEXT[] CHECK (
    summer_climate <@ ARRAY['mild', 'warm', 'hot']::TEXT[]
  ),
  winter_climate TEXT[] CHECK (
    winter_climate <@ ARRAY['cold', 'cool', 'mild']::TEXT[]
  ),
  humidity TEXT CHECK (humidity IN ('dry', 'balanced', 'humid')),
  sunshine TEXT CHECK (sunshine IN ('often_sunny', 'balanced', 'less_sunny')),
  precipitation TEXT CHECK (precipitation IN ('mostly_dry', 'balanced', 'often_rainy')),
  
  -- ALIGNED WITH ONBOARDING: Culture & Lifestyle
  living_environments TEXT[] CHECK (
    living_environments <@ ARRAY['rural', 'suburban', 'urban']::TEXT[]
  ),
  pace_of_life TEXT CHECK (pace_of_life IN ('relaxed', 'moderate', 'fast')),
  social_preference TEXT CHECK (social_preference IN ('very_social', 'balanced', 'private')),
  expat_community_size TEXT CHECK (expat_community_size IN ('small', 'moderate', 'large')),
  language_preference TEXT CHECK (language_preference IN ('english_only', 'will_learn', 'flexible')),
  primary_language TEXT,
  english_proficiency TEXT CHECK (english_proficiency IN ('low', 'moderate', 'good', 'high', 'excellent')),
  
  -- ALIGNED WITH ONBOARDING: Administration
  healthcare_quality TEXT CHECK (healthcare_quality IN ('good', 'functional', 'basic')),
  healthcare_ranking INTEGER CHECK (healthcare_ranking >= 1 AND healthcare_ranking <= 200),
  safety_quality TEXT CHECK (safety_quality IN ('good', 'functional', 'basic')),
  safety_index INTEGER CHECK (safety_index >= 0 AND safety_index <= 100),
  visa_process TEXT CHECK (visa_process IN ('good', 'functional', 'basic')),
  visa_free_days INTEGER,
  
  -- ALIGNED WITH ONBOARDING: Budget & Costs
  cost_category TEXT CHECK (cost_category IN ('budget', 'moderate', 'premium')),
  monthly_budget_range INT4RANGE,
  typical_rent_range INT4RANGE,
  
  -- ALIGNED WITH ONBOARDING: Mobility
  local_mobility TEXT[] CHECK (
    local_mobility <@ ARRAY['walk_bike', 'public_transit', 'need_car', 'taxi_rideshare']::TEXT[]
  ),
  regional_mobility TEXT[] CHECK (
    regional_mobility <@ ARRAY['train_access', 'bus_network', 'need_car', 'not_important']::TEXT[]
  ),
  flight_connections TEXT CHECK (flight_connections IN ('major_airport', 'regional_airport', 'train_connections', 'not_important')),
  
  -- Additional practical data
  currency_code TEXT,
  timezone TEXT,
  best_months INTEGER[] CHECK (best_months <@ ARRAY[1,2,3,4,5,6,7,8,9,10,11,12]),
  internet_speed_mbps INTEGER,
  
  -- Keywords and selling points
  keywords TEXT[],
  unique_selling_points TEXT[],
  typical_town_examples TEXT[],
  
  -- Display and status
  display_order INTEGER,
  is_active BOOLEAN DEFAULT true,
  seasonal_notes JSONB,
  
  -- AUTO-CALCULATED from actual town data (via triggers)
  town_count INTEGER DEFAULT 0,
  avg_cost_index DECIMAL(10,2),
  avg_healthcare_score DECIMAL(5,2),
  avg_safety_score DECIMAL(5,2),
  last_town_added TIMESTAMPTZ,
  
  -- Analytics
  view_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  click_through_rate DECIMAL(5,4) GENERATED ALWAYS AS (
    CASE 
      WHEN view_count > 0 THEN CAST(click_count AS DECIMAL) / CAST(view_count AS DECIMAL)
      ELSE 0
    END
  ) STORED,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create comprehensive indexes
CREATE INDEX IF NOT EXISTS idx_ri_region_name ON regional_inspirations(region_name);
CREATE INDEX IF NOT EXISTS idx_ri_region_type ON regional_inspirations(region_type);
CREATE INDEX IF NOT EXISTS idx_ri_is_active ON regional_inspirations(is_active);
CREATE INDEX IF NOT EXISTS idx_ri_display_order ON regional_inspirations(display_order);
CREATE INDEX IF NOT EXISTS idx_ri_cost_category ON regional_inspirations(cost_category);
CREATE INDEX IF NOT EXISTS idx_ri_healthcare_quality ON regional_inspirations(healthcare_quality);
CREATE INDEX IF NOT EXISTS idx_ri_safety_quality ON regional_inspirations(safety_quality);

-- GIN indexes for array searches
CREATE INDEX IF NOT EXISTS idx_ri_geographic_features ON regional_inspirations USING GIN(geographic_features);
CREATE INDEX IF NOT EXISTS idx_ri_vegetation_types ON regional_inspirations USING GIN(vegetation_types);
CREATE INDEX IF NOT EXISTS idx_ri_summer_climate ON regional_inspirations USING GIN(summer_climate);
CREATE INDEX IF NOT EXISTS idx_ri_winter_climate ON regional_inspirations USING GIN(winter_climate);
CREATE INDEX IF NOT EXISTS idx_ri_living_environments ON regional_inspirations USING GIN(living_environments);
CREATE INDEX IF NOT EXISTS idx_ri_keywords ON regional_inspirations USING GIN(keywords);

-- Enable RLS
ALTER TABLE regional_inspirations ENABLE ROW LEVEL SECURITY;

-- Everyone can read active inspirations
CREATE POLICY "Public can view active regional inspirations" ON regional_inspirations
FOR SELECT
USING (is_active = true);

-- Only authenticated users can update analytics
CREATE POLICY "Authenticated users can update analytics" ON regional_inspirations
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- PART 2: Add image validation fields
-- From: add_image_validation_fields.sql

ALTER TABLE towns
ADD COLUMN IF NOT EXISTS image_validation_note TEXT,
ADD COLUMN IF NOT EXISTS image_validated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS image_is_fallback BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS image_source TEXT CHECK (
  image_source IN ('original', 'unsplash', 'pexels', 'pixabay', 'generated', 'fallback')
);

-- Add backup image URLs
ALTER TABLE towns
ADD COLUMN IF NOT EXISTS image_url_2 TEXT,
ADD COLUMN IF NOT EXISTS image_url_3 TEXT,
ADD COLUMN IF NOT EXISTS image_urls TEXT[];

-- Create curated images table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_curated_images_country ON curated_location_images(country);
CREATE INDEX IF NOT EXISTS idx_curated_images_region ON curated_location_images(region);
CREATE INDEX IF NOT EXISTS idx_curated_images_feature ON curated_location_images(geographic_feature);
CREATE INDEX IF NOT EXISTS idx_curated_images_tags ON curated_location_images USING GIN(tags);

-- Function to get best image
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
  
  -- Update usage count
  IF best_image IS NOT NULL THEN
    UPDATE curated_location_images
    SET usage_count = usage_count + 1
    WHERE image_url = best_image;
  END IF;
  
  RETURN best_image;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate images
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
DROP TRIGGER IF EXISTS validate_town_image_trigger ON towns;
CREATE TRIGGER validate_town_image_trigger
BEFORE INSERT OR UPDATE OF image_url_1 ON towns
FOR EACH ROW
EXECUTE FUNCTION validate_town_image();

-- Note: The full towns table update is in update_towns_table_v2.sql
-- Run that separately after this migration completes