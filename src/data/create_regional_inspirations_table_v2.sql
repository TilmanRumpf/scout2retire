-- IMPROVED: Create regional_inspirations table with EXACT onboarding alignment
-- This version ensures 100% data consistency with onboarding questions

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
  monthly_budget_range INT4RANGE, -- e.g., '[1500,2500)' for $1500-2500
  typical_rent_range INT4RANGE,   -- e.g., '[500,1000)' for $500-1000
  
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
CREATE INDEX idx_ri_region_name ON regional_inspirations(region_name);
CREATE INDEX idx_ri_region_type ON regional_inspirations(region_type);
CREATE INDEX idx_ri_is_active ON regional_inspirations(is_active);
CREATE INDEX idx_ri_display_order ON regional_inspirations(display_order);
CREATE INDEX idx_ri_cost_category ON regional_inspirations(cost_category);
CREATE INDEX idx_ri_healthcare_quality ON regional_inspirations(healthcare_quality);
CREATE INDEX idx_ri_safety_quality ON regional_inspirations(safety_quality);

-- GIN indexes for array searches (matching onboarding preferences)
CREATE INDEX idx_ri_geographic_features ON regional_inspirations USING GIN(geographic_features);
CREATE INDEX idx_ri_vegetation_types ON regional_inspirations USING GIN(vegetation_types);
CREATE INDEX idx_ri_summer_climate ON regional_inspirations USING GIN(summer_climate);
CREATE INDEX idx_ri_winter_climate ON regional_inspirations USING GIN(winter_climate);
CREATE INDEX idx_ri_living_environments ON regional_inspirations USING GIN(living_environments);
CREATE INDEX idx_ri_keywords ON regional_inspirations USING GIN(keywords);

-- Create materialized view for expensive calculations
CREATE MATERIALIZED VIEW regional_inspiration_stats AS
SELECT 
  ri.id,
  ri.region_name,
  COUNT(DISTINCT t.id) as actual_town_count,
  AVG(t.cost_index) as actual_avg_cost,
  AVG(t.healthcare_score) as actual_avg_healthcare,
  AVG(t.safety_score) as actual_avg_safety,
  MAX(t.created_at) as newest_town_date,
  -- Calculate if region matches budget categories
  CASE 
    WHEN AVG(t.cost_index) < 2000 THEN 'budget'
    WHEN AVG(t.cost_index) < 3500 THEN 'moderate'
    ELSE 'premium'
  END as calculated_cost_category,
  -- Calculate healthcare quality from scores
  CASE 
    WHEN AVG(t.healthcare_score) >= 80 THEN 'good'
    WHEN AVG(t.healthcare_score) >= 60 THEN 'functional'
    ELSE 'basic'
  END as calculated_healthcare_quality,
  -- Calculate safety quality from scores
  CASE 
    WHEN AVG(t.safety_score) >= 80 THEN 'good'
    WHEN AVG(t.safety_score) >= 60 THEN 'functional'
    ELSE 'basic'
  END as calculated_safety_quality
FROM regional_inspirations ri
LEFT JOIN towns t ON (
  CASE 
    WHEN ri.region_type = 'country' THEN t.country = ri.region_name
    WHEN ri.region_type = 'region' THEN t.region = ri.region_name
  END
)
GROUP BY ri.id, ri.region_name;

-- Create index on materialized view
CREATE UNIQUE INDEX idx_regional_stats_id ON regional_inspiration_stats(id);

-- Function to refresh stats (run periodically or after town updates)
CREATE OR REPLACE FUNCTION refresh_regional_inspiration_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY regional_inspiration_stats;
  
  -- Update the main table with calculated values
  UPDATE regional_inspirations ri
  SET 
    town_count = ris.actual_town_count,
    avg_cost_index = ris.actual_avg_cost,
    avg_healthcare_score = ris.actual_avg_healthcare,
    avg_safety_score = ris.actual_avg_safety,
    last_town_added = ris.newest_town_date,
    updated_at = NOW()
  FROM regional_inspiration_stats ris
  WHERE ri.id = ris.id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to refresh stats when towns change
CREATE OR REPLACE FUNCTION trigger_refresh_regional_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Schedule async refresh to avoid slowing down town updates
  PERFORM pg_notify('refresh_regional_stats', 'true');
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_regional_stats_on_town_change
AFTER INSERT OR UPDATE OR DELETE ON towns
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_refresh_regional_stats();

-- Function to get personalized inspirations based on user preferences
CREATE OR REPLACE FUNCTION get_personalized_inspirations(
  user_preferences JSONB,
  limit_count INTEGER DEFAULT 5
)
RETURNS TABLE (
  inspiration_id UUID,
  title TEXT,
  description TEXT,
  region_name TEXT,
  match_score DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ri.id,
    ri.title,
    ri.description,
    ri.region_name,
    -- Calculate match score based on preferences
    (
      -- Climate match (25%)
      CASE 
        WHEN user_preferences->>'summer_climate' = ANY(ri.summer_climate) THEN 0.125
        ELSE 0
      END +
      CASE 
        WHEN user_preferences->>'winter_climate' = ANY(ri.winter_climate) THEN 0.125
        ELSE 0
      END +
      -- Budget match (25%)
      CASE 
        WHEN ri.cost_category = user_preferences->>'budget_category' THEN 0.25
        WHEN ri.cost_category = 'moderate' THEN 0.125  -- Partial match
        ELSE 0
      END +
      -- Culture match (25%)
      CASE 
        WHEN ri.pace_of_life = user_preferences->>'pace_of_life' THEN 0.125
        ELSE 0
      END +
      CASE 
        WHEN ri.expat_community_size = user_preferences->>'expat_preference' THEN 0.125
        ELSE 0
      END +
      -- Healthcare/Safety match (25%)
      CASE 
        WHEN ri.healthcare_quality = user_preferences->>'healthcare_preference' THEN 0.125
        ELSE 0
      END +
      CASE 
        WHEN ri.safety_quality = user_preferences->>'safety_preference' THEN 0.125
        ELSE 0
      END
    )::DECIMAL as match_score
  FROM regional_inspirations ri
  WHERE ri.is_active = true
    AND ri.town_count > 0  -- Only show regions with actual towns
  ORDER BY match_score DESC, ri.view_count ASC  -- Prioritize matches, then less-viewed
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- RLS policies
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

-- Comments for documentation
COMMENT ON TABLE regional_inspirations IS 'Regional inspiration content aligned with onboarding categories for personalized daily recommendations';
COMMENT ON COLUMN regional_inspirations.geographic_features IS 'Matches onboarding: Coastal, Mountains, Island, Lakes, River, Valley, Desert, Forest, Plains';
COMMENT ON COLUMN regional_inspirations.summer_climate IS 'Matches onboarding: Mild, Warm, Hot';
COMMENT ON COLUMN regional_inspirations.winter_climate IS 'Matches onboarding: Cold, Cool, Mild';
COMMENT ON COLUMN regional_inspirations.cost_category IS 'Derived from avg town costs: budget (<$2000), moderate ($2000-3500), premium (>$3500)';
COMMENT ON MATERIALIZED VIEW regional_inspiration_stats IS 'Cached calculations to avoid expensive queries on every page load';