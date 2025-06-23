-- Update towns table to align with improved onboarding questions
-- This migration adds missing fields identified from onboarding improvements

-- Add missing fields that align with onboarding categories
-- Note: Some of these may already exist, so we use IF NOT EXISTS where PostgreSQL supports it

-- 1. REGIONAL PREFERENCES ALIGNMENT
-- These should already exist but let's ensure they match onboarding exactly
ALTER TABLE towns 
ADD COLUMN IF NOT EXISTS vegetation_type TEXT[] CHECK (
  vegetation_type <@ ARRAY['tropical', 'subtropical', 'mediterranean', 'forest', 'grassland', 'desert']::TEXT[]
);

-- 2. CLIMATE PREFERENCES ALIGNMENT (standardize existing fields)
-- Update climate fields to match onboarding categories exactly
ALTER TABLE towns
ADD COLUMN IF NOT EXISTS summer_climate TEXT[] CHECK (
  summer_climate <@ ARRAY['mild', 'warm', 'hot']::TEXT[]
),
ADD COLUMN IF NOT EXISTS winter_climate TEXT[] CHECK (
  winter_climate <@ ARRAY['cold', 'cool', 'mild']::TEXT[]
),
ADD COLUMN IF NOT EXISTS humidity_category TEXT CHECK (
  humidity_category IN ('dry', 'balanced', 'humid')
),
ADD COLUMN IF NOT EXISTS sunshine_category TEXT CHECK (
  sunshine_category IN ('often_sunny', 'balanced', 'less_sunny')
),
ADD COLUMN IF NOT EXISTS precipitation_category TEXT CHECK (
  precipitation_category IN ('mostly_dry', 'balanced', 'often_rainy')
);

-- 3. CULTURE & LIFESTYLE ALIGNMENT (major additions needed)
ALTER TABLE towns
-- Living environment (standardize existing urban_rural_type)
ADD COLUMN IF NOT EXISTS living_environments TEXT[] CHECK (
  living_environments <@ ARRAY['rural', 'suburban', 'urban']::TEXT[]
),
-- Pace of life (standardize to match onboarding)
ADD COLUMN IF NOT EXISTS pace_of_life_category TEXT CHECK (
  pace_of_life_category IN ('relaxed', 'moderate', 'fast')
),
-- Social preference alignment
ADD COLUMN IF NOT EXISTS social_preference TEXT CHECK (
  social_preference IN ('very_social', 'balanced', 'private')
),
-- Expat community size (standardize)
ADD COLUMN IF NOT EXISTS expat_community_size TEXT CHECK (
  expat_community_size IN ('small', 'moderate', 'large')
),
-- Language learning support
ADD COLUMN IF NOT EXISTS language_schools_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS language_exchange_programs BOOLEAN DEFAULT false,
-- Social atmosphere
ADD COLUMN IF NOT EXISTS social_atmosphere TEXT[] CHECK (
  social_atmosphere <@ ARRAY['friendly_locals', 'expat_focused', 'mixed_community', 'reserved', 'welcoming']::TEXT[]
),
-- Traditional vs Progressive scale
ADD COLUMN IF NOT EXISTS traditional_progressive_scale INTEGER CHECK (
  traditional_progressive_scale >= 1 AND traditional_progressive_scale <= 10
),
-- Community integration
ADD COLUMN IF NOT EXISTS expat_integration_services BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS local_community_openness_score INTEGER CHECK (
  local_community_openness_score >= 1 AND local_community_openness_score <= 10
),
ADD COLUMN IF NOT EXISTS volunteer_opportunities_count INTEGER DEFAULT 0;

-- 4. ADMINISTRATION ALIGNMENT (standardize to match onboarding)
ALTER TABLE towns
-- Healthcare quality (standardize healthcare_score to categories)
ADD COLUMN IF NOT EXISTS healthcare_quality TEXT CHECK (
  healthcare_quality IN ('good', 'functional', 'basic')
),
-- Safety quality (standardize safety_score to categories)
ADD COLUMN IF NOT EXISTS safety_quality TEXT CHECK (
  safety_quality IN ('good', 'functional', 'basic')
),
-- Emergency services
ADD COLUMN IF NOT EXISTS emergency_services_quality TEXT CHECK (
  emergency_services_quality IN ('good', 'functional', 'basic')
),
-- Political stability (standardize)
ADD COLUMN IF NOT EXISTS political_stability_quality TEXT CHECK (
  political_stability_quality IN ('good', 'functional', 'basic')
),
-- Tax system quality
ADD COLUMN IF NOT EXISTS tax_system_quality TEXT CHECK (
  tax_system_quality IN ('good', 'functional', 'basic')
),
-- Government efficiency
ADD COLUMN IF NOT EXISTS government_efficiency TEXT CHECK (
  government_efficiency IN ('good', 'functional', 'basic')
),
-- Visa process
ADD COLUMN IF NOT EXISTS visa_process_quality TEXT CHECK (
  visa_process_quality IN ('good', 'functional', 'basic')
),
-- Healthcare access levels
ADD COLUMN IF NOT EXISTS healthcare_access_level TEXT CHECK (
  healthcare_access_level IN ('full_access', 'hospital_specialists', 'hospital_general', 'general_practitioner', 'pharmacy_only')
),
-- Special medical facilities
ADD COLUMN IF NOT EXISTS dialysis_centers_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cancer_treatment_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cardiac_care_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS diabetes_care_available BOOLEAN DEFAULT false;

-- 5. BUDGET & COSTS ALIGNMENT
ALTER TABLE towns
-- Cost category (derived from cost_index)
ADD COLUMN IF NOT EXISTS cost_category TEXT GENERATED ALWAYS AS (
  CASE 
    WHEN cost_index < 2000 THEN 'budget'
    WHEN cost_index < 3500 THEN 'moderate'
    ELSE 'premium'
  END
) STORED,
-- Typical rent ranges
ADD COLUMN IF NOT EXISTS typical_rent_range INT4RANGE,
-- Add housing details
ADD COLUMN IF NOT EXISTS neighborhood_types TEXT[] CHECK (
  neighborhood_types <@ ARRAY['historic_center', 'modern_suburbs', 'beachfront', 'rural_outskirts', 'gated_community', 'city_center', 'residential_quiet']::TEXT[]
),
ADD COLUMN IF NOT EXISTS housing_styles TEXT[] CHECK (
  housing_styles <@ ARRAY['apartments', 'villas', 'townhouses', 'condos', 'single_family', 'high_rise']::TEXT[]
);

-- 6. MOBILITY ALIGNMENT (match onboarding exactly)
ALTER TABLE towns
-- Local mobility options
ADD COLUMN IF NOT EXISTS local_mobility_options TEXT[] CHECK (
  local_mobility_options <@ ARRAY['walk_bike', 'public_transit', 'need_car', 'taxi_rideshare']::TEXT[]
),
-- Regional mobility options
ADD COLUMN IF NOT EXISTS regional_mobility_options TEXT[] CHECK (
  regional_mobility_options <@ ARRAY['train_access', 'bus_network', 'need_car', 'not_important']::TEXT[]
),
-- Flight connections (standardize airport_distance_km)
ADD COLUMN IF NOT EXISTS flight_connection_type TEXT CHECK (
  flight_connection_type IN ('major_airport', 'regional_airport', 'train_connections', 'not_important')
);

-- 7. HOBBIES ALIGNMENT (enhance activities data)
ALTER TABLE towns
-- Activities available (ensure it's an array matching onboarding)
ADD COLUMN IF NOT EXISTS activities_available TEXT[] CHECK (
  activities_available <@ ARRAY['water_sports', 'golf', 'hiking', 'cycling', 'fishing', 'photography', 'gardening', 'cooking', 'skiing', 'tennis', 'yoga', 'sailing']::TEXT[]
),
-- Interests support
ADD COLUMN IF NOT EXISTS interests_supported TEXT[] CHECK (
  interests_supported <@ ARRAY['history', 'nature', 'arts', 'music', 'wellness', 'wine', 'volunteering', 'technology', 'crafts']::TEXT[]
);

-- 8. DAILY LIFE PRACTICALITIES
ALTER TABLE towns
ADD COLUMN IF NOT EXISTS grocery_shopping_ease_score INTEGER CHECK (
  grocery_shopping_ease_score >= 1 AND grocery_shopping_ease_score <= 10
),
ADD COLUMN IF NOT EXISTS walkability_score INTEGER CHECK (
  walkability_score >= 0 AND walkability_score <= 100
),
ADD COLUMN IF NOT EXISTS public_services_english BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS banking_ease_score INTEGER CHECK (
  banking_ease_score >= 1 AND banking_ease_score <= 10
);

-- 9. SOCIAL SCENE DETAILS
ALTER TABLE towns
ADD COLUMN IF NOT EXISTS social_clubs_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS community_centers_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS religious_facilities_diversity_score INTEGER CHECK (
  religious_facilities_diversity_score >= 1 AND religious_facilities_diversity_score <= 10
),
ADD COLUMN IF NOT EXISTS dining_scene_score INTEGER CHECK (
  dining_scene_score >= 1 AND dining_scene_score <= 10
),
ADD COLUMN IF NOT EXISTS nightlife_score INTEGER CHECK (
  nightlife_score >= 1 AND nightlife_score <= 10
),
ADD COLUMN IF NOT EXISTS cultural_events_types TEXT[] CHECK (
  cultural_events_types <@ ARRAY['music_festivals', 'art_exhibitions', 'theater', 'dance', 'film', 'literary', 'food_wine', 'traditional_celebrations']::TEXT[]
);

-- 10. SEASONAL VARIATIONS
ALTER TABLE towns
ADD COLUMN IF NOT EXISTS busy_season_months INTEGER[] CHECK (
  busy_season_months <@ ARRAY[1,2,3,4,5,6,7,8,9,10,11,12]
),
ADD COLUMN IF NOT EXISTS quiet_season_months INTEGER[] CHECK (
  quiet_season_months <@ ARRAY[1,2,3,4,5,6,7,8,9,10,11,12]
),
ADD COLUMN IF NOT EXISTS best_weather_months INTEGER[] CHECK (
  best_weather_months <@ ARRAY[1,2,3,4,5,6,7,8,9,10,11,12]
);

-- Create indexes for new fields that will be frequently queried
CREATE INDEX IF NOT EXISTS idx_towns_cost_category ON towns(cost_category);
CREATE INDEX IF NOT EXISTS idx_towns_healthcare_quality ON towns(healthcare_quality);
CREATE INDEX IF NOT EXISTS idx_towns_safety_quality ON towns(safety_quality);
CREATE INDEX IF NOT EXISTS idx_towns_expat_community_size ON towns(expat_community_size);
CREATE INDEX IF NOT EXISTS idx_towns_pace_of_life_category ON towns(pace_of_life_category);

-- GIN indexes for array fields
CREATE INDEX IF NOT EXISTS idx_towns_living_environments ON towns USING GIN(living_environments);
CREATE INDEX IF NOT EXISTS idx_towns_local_mobility ON towns USING GIN(local_mobility_options);
CREATE INDEX IF NOT EXISTS idx_towns_activities ON towns USING GIN(activities_available);
CREATE INDEX IF NOT EXISTS idx_towns_interests ON towns USING GIN(interests_supported);

-- Create a function to derive categories from numeric scores
CREATE OR REPLACE FUNCTION derive_quality_categories()
RETURNS TRIGGER AS $$
BEGIN
  -- Derive healthcare_quality from healthcare_score
  IF NEW.healthcare_score IS NOT NULL THEN
    NEW.healthcare_quality = CASE
      WHEN NEW.healthcare_score >= 8 THEN 'good'
      WHEN NEW.healthcare_score >= 6 THEN 'functional'
      ELSE 'basic'
    END;
  END IF;

  -- Derive safety_quality from safety_score
  IF NEW.safety_score IS NOT NULL THEN
    NEW.safety_quality = CASE
      WHEN NEW.safety_score >= 8 THEN 'good'
      WHEN NEW.safety_score >= 6 THEN 'functional'
      ELSE 'basic'
    END;
  END IF;

  -- Derive sunshine_category from sunny_days_per_year
  IF NEW.sunny_days_per_year IS NOT NULL THEN
    NEW.sunshine_category = CASE
      WHEN NEW.sunny_days_per_year >= 250 THEN 'often_sunny'
      WHEN NEW.sunny_days_per_year >= 150 THEN 'balanced'
      ELSE 'less_sunny'
    END;
  END IF;

  -- Derive humidity_category from humidity_avg
  IF NEW.humidity_avg IS NOT NULL THEN
    NEW.humidity_category = CASE
      WHEN NEW.humidity_avg < 50 THEN 'dry'
      WHEN NEW.humidity_avg <= 70 THEN 'balanced'
      ELSE 'humid'
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically derive categories
CREATE TRIGGER derive_categories_before_insert_update
BEFORE INSERT OR UPDATE ON towns
FOR EACH ROW
EXECUTE FUNCTION derive_quality_categories();

-- Create a view that shows towns with all their derived categories
CREATE OR REPLACE VIEW towns_with_categories AS
SELECT 
  t.*,
  -- Budget alignment
  CASE 
    WHEN t.cost_index < 2000 THEN 'Perfect for budget seekers'
    WHEN t.cost_index < 3500 THEN 'Good value for money'
    ELSE 'Premium location'
  END as budget_description,
  -- Healthcare alignment
  CASE 
    WHEN t.healthcare_quality = 'good' THEN 'Excellent healthcare system'
    WHEN t.healthcare_quality = 'functional' THEN 'Reliable healthcare available'
    ELSE 'Basic healthcare services'
  END as healthcare_description_category,
  -- Climate summary
  CONCAT_WS(' ', 
    t.summer_climate[1], 'summers,',
    t.winter_climate[1], 'winters,',
    t.humidity_category, 'humidity'
  ) as climate_summary
FROM towns t;

-- Add comments for documentation
COMMENT ON COLUMN towns.living_environments IS 'Matches onboarding: rural, suburban, urban';
COMMENT ON COLUMN towns.pace_of_life_category IS 'Matches onboarding: relaxed, moderate, fast';
COMMENT ON COLUMN towns.healthcare_quality IS 'Derived from healthcare_score: good (8+), functional (6-7), basic (<6)';
COMMENT ON COLUMN towns.cost_category IS 'Auto-calculated: budget (<$2000), moderate ($2000-3500), premium (>$3500)';
COMMENT ON COLUMN towns.local_mobility_options IS 'Matches onboarding mobility preferences exactly';

-- Migration helper: Update existing data to populate new category fields
-- This should be run after adding the new columns
UPDATE towns SET
  -- Derive climate categories from existing data
  summer_climate = CASE
    WHEN summer_temp_avg < 25 THEN ARRAY['mild']
    WHEN summer_temp_avg < 30 THEN ARRAY['warm']
    ELSE ARRAY['hot']
  END,
  winter_climate = CASE
    WHEN winter_temp_avg < 5 THEN ARRAY['cold']
    WHEN winter_temp_avg < 15 THEN ARRAY['cool']
    ELSE ARRAY['mild']
  END,
  -- Derive pace from existing pace_of_life string
  pace_of_life_category = CASE
    WHEN pace_of_life ILIKE '%slow%' OR pace_of_life ILIKE '%relax%' THEN 'relaxed'
    WHEN pace_of_life ILIKE '%fast%' OR pace_of_life ILIKE '%busy%' THEN 'fast'
    ELSE 'moderate'
  END,
  -- Derive expat community size from population description
  expat_community_size = CASE
    WHEN expat_population ILIKE '%large%' OR expat_population ILIKE '%thriving%' THEN 'large'
    WHEN expat_population ILIKE '%small%' OR expat_population ILIKE '%emerging%' THEN 'small'
    ELSE 'moderate'
  END
WHERE summer_climate IS NULL OR winter_climate IS NULL;