-- Create regional_inspirations table with comprehensive data structure
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
  
  -- Climate and lifestyle tags
  climate_tags TEXT[],
  lifestyle_tags TEXT[],
  
  -- Cost and timing
  cost_range TEXT CHECK (cost_range IN ('budget', 'moderate', 'premium')),
  best_months INTEGER[],
  
  -- Language and practical info
  primary_language TEXT,
  currency_code TEXT,
  visa_free_days INTEGER,
  
  -- Rankings and scores
  healthcare_ranking INTEGER,
  safety_index INTEGER CHECK (safety_index >= 0 AND safety_index <= 100),
  english_proficiency TEXT CHECK (english_proficiency IN ('low', 'moderate', 'good', 'high', 'excellent')),
  
  -- Infrastructure
  timezone TEXT,
  flight_connections TEXT CHECK (flight_connections IN ('moderate', 'good', 'excellent')),
  expat_community_size TEXT CHECK (expat_community_size IN ('small', 'moderate', 'large', 'very_large')),
  internet_speed_mbps INTEGER,
  
  -- Additional data
  weather_api_code TEXT,
  keywords TEXT[],
  unique_selling_points TEXT[],
  typical_town_examples TEXT[],
  
  -- Display and status
  display_order INTEGER,
  is_active BOOLEAN DEFAULT true,
  
  -- Seasonal information
  seasonal_notes JSONB,
  
  -- Auto-calculated fields (to be updated via triggers/functions)
  town_count INTEGER DEFAULT 0,
  avg_cost_index DECIMAL(10,2),
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

-- Create indexes for common queries
CREATE INDEX idx_regional_inspirations_region_name ON regional_inspirations(region_name);
CREATE INDEX idx_regional_inspirations_region_type ON regional_inspirations(region_type);
CREATE INDEX idx_regional_inspirations_is_active ON regional_inspirations(is_active);
CREATE INDEX idx_regional_inspirations_display_order ON regional_inspirations(display_order);
CREATE INDEX idx_regional_inspirations_cost_range ON regional_inspirations(cost_range);

-- Create GIN indexes for array searches
CREATE INDEX idx_regional_inspirations_climate_tags ON regional_inspirations USING GIN(climate_tags);
CREATE INDEX idx_regional_inspirations_lifestyle_tags ON regional_inspirations USING GIN(lifestyle_tags);
CREATE INDEX idx_regional_inspirations_keywords ON regional_inspirations USING GIN(keywords);

-- Create function to update town_count and avg_cost_index
CREATE OR REPLACE FUNCTION update_regional_inspiration_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update town count and average cost for the affected region
  UPDATE regional_inspirations ri
  SET 
    town_count = (
      SELECT COUNT(*) 
      FROM towns t 
      WHERE t.country = ri.region_name 
         OR t.region = ri.region_name
    ),
    avg_cost_index = (
      SELECT AVG(t.cost_index) 
      FROM towns t 
      WHERE (t.country = ri.region_name OR t.region = ri.region_name)
        AND t.cost_index IS NOT NULL
    ),
    last_town_added = (
      SELECT MAX(t.created_at) 
      FROM towns t 
      WHERE t.country = ri.region_name 
         OR t.region = ri.region_name
    ),
    updated_at = NOW()
  WHERE ri.region_name = NEW.country 
     OR ri.region_name = NEW.region;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update stats when towns are added/updated
CREATE TRIGGER update_regional_stats_on_town_change
AFTER INSERT OR UPDATE ON towns
FOR EACH ROW
EXECUTE FUNCTION update_regional_inspiration_stats();

-- Create function to track views
CREATE OR REPLACE FUNCTION increment_regional_inspiration_views(inspiration_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE regional_inspirations
  SET view_count = view_count + 1
  WHERE id = inspiration_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to track clicks
CREATE OR REPLACE FUNCTION increment_regional_inspiration_clicks(inspiration_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE regional_inspirations
  SET click_count = click_count + 1
  WHERE id = inspiration_id;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_regional_inspirations_updated_at 
BEFORE UPDATE ON regional_inspirations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
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

-- Add comments for documentation
COMMENT ON TABLE regional_inspirations IS 'Stores regional inspiration content for daily rotation on the home page';
COMMENT ON COLUMN regional_inspirations.region_type IS 'Either "country" for specific countries or "region" for broader areas like Europe';
COMMENT ON COLUMN regional_inspirations.climate_tags IS 'Array of climate descriptors like mediterranean, tropical, temperate';
COMMENT ON COLUMN regional_inspirations.lifestyle_tags IS 'Array of lifestyle descriptors like beach, mountain, urban, rural';
COMMENT ON COLUMN regional_inspirations.best_months IS 'Array of month numbers (1-12) when this region is best to visit';
COMMENT ON COLUMN regional_inspirations.click_through_rate IS 'Auto-calculated CTR based on views and clicks';