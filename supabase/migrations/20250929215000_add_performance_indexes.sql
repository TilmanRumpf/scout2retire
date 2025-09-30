-- Add performance indexes for frequently queried columns
-- Expected performance gain: 50-100ms per query
-- Note: Many indexes already exist from 20250707043225_town_schema_additions.sql
-- This migration adds only the missing essential indexes

-- Index for country filtering (used in search)
CREATE INDEX IF NOT EXISTS idx_towns_country ON towns(country);

-- Index for towns with images (used to filter towns that have photos)
CREATE INDEX IF NOT EXISTS idx_towns_has_image ON towns(image_url_1) WHERE image_url_1 IS NOT NULL;

-- Index for region filtering (used in location search)
CREATE INDEX IF NOT EXISTS idx_towns_region ON towns(region);

-- Index for city name searches
CREATE INDEX IF NOT EXISTS idx_towns_name ON towns(name);

-- Index for cost filtering (used in budget searches)
CREATE INDEX IF NOT EXISTS idx_towns_cost_index ON towns(cost_index);

COMMENT ON INDEX idx_towns_country IS 'Performance index for country filtering';
COMMENT ON INDEX idx_towns_has_image IS 'Performance index for finding towns with photos';
COMMENT ON INDEX idx_towns_region IS 'Performance index for region filtering';
COMMENT ON INDEX idx_towns_name IS 'Performance index for city name searches';
COMMENT ON INDEX idx_towns_cost_index IS 'Performance index for cost filtering';