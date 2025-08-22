-- Performance Optimization Indexes for Scout2Retire
-- Run these SQL commands in your Supabase SQL editor

-- Index for towns table to optimize photo filtering (most common filter)
CREATE INDEX IF NOT EXISTS idx_towns_image_url_1 
ON towns(image_url_1) 
WHERE image_url_1 IS NOT NULL AND image_url_1 != '' AND image_url_1 NOT ILIKE 'NULL';

-- Index for favorites table (user_id and town_id combo for fast lookups)
CREATE INDEX IF NOT EXISTS idx_favorites_user_town 
ON favorites(user_id, town_id);

-- Index for towns by state (common filter)
CREATE INDEX IF NOT EXISTS idx_towns_state_code 
ON towns(state_code) 
WHERE state_code IS NOT NULL;

-- Index for towns by country (common filter)
CREATE INDEX IF NOT EXISTS idx_towns_country 
ON towns(country) 
WHERE country IS NOT NULL;

-- Index for towns by population (used in matching)
CREATE INDEX IF NOT EXISTS idx_towns_population 
ON towns(population) 
WHERE population IS NOT NULL;

-- Index for user_preferences by user_id (frequent lookup)
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id 
ON user_preferences(user_id);

-- Index for conversations by user_id (chat feature)
CREATE INDEX IF NOT EXISTS idx_conversations_user_id 
ON conversations(user_id);

-- Index for messages by conversation_id (chat feature)
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id 
ON messages(conversation_id);

-- Composite index for towns with key matching fields
CREATE INDEX IF NOT EXISTS idx_towns_matching_fields 
ON towns(id, name, state_code, country, population, image_url_1);

-- Index for hobbies lookup
CREATE INDEX IF NOT EXISTS idx_towns_activities 
ON towns USING GIN (activities) 
WHERE activities IS NOT NULL;

-- Analyze tables to update statistics after creating indexes
ANALYZE towns;
ANALYZE favorites;
ANALYZE user_preferences;
ANALYZE conversations;
ANALYZE messages;