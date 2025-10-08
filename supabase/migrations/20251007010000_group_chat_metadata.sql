-- Add category and geographic scope columns to chat_threads
ALTER TABLE chat_threads
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS geo_region TEXT,
ADD COLUMN IF NOT EXISTS geo_country TEXT,
ADD COLUMN IF NOT EXISTS geo_province TEXT;

-- Add index for category filtering
CREATE INDEX IF NOT EXISTS idx_chat_threads_category ON chat_threads(category);

-- Add index for geographic filtering
CREATE INDEX IF NOT EXISTS idx_chat_threads_geo_region ON chat_threads(geo_region);
CREATE INDEX IF NOT EXISTS idx_chat_threads_geo_country ON chat_threads(geo_country);

-- Comments for documentation
COMMENT ON COLUMN chat_threads.category IS 'Group chat category: general, hobbies, destinations, lifestyle, moving, money, housing, health, community, pets';
COMMENT ON COLUMN chat_threads.geo_region IS 'Geographic region for location-based groups (e.g., Mediterranean)';
COMMENT ON COLUMN chat_threads.geo_country IS 'Country for location-based groups (e.g., Spain)';
COMMENT ON COLUMN chat_threads.geo_province IS 'Province/state for location-based groups (e.g., Andalusia)';
