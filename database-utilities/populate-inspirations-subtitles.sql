-- Populate subtitle column for all regional inspirations
-- Run this in Supabase SQL Editor

-- First, ensure the column exists
ALTER TABLE regional_inspirations ADD COLUMN IF NOT EXISTS subtitle TEXT;

-- Update each inspiration with evocative, region-specific subtitles (max 5 words)

UPDATE regional_inspirations
SET subtitle = 'Mediterranean glamour meets Alpine charm'
WHERE title = 'French Riviera dreaming?';

UPDATE regional_inspirations
SET subtitle = 'Rainforest paradise, Pacific Ocean bliss'
WHERE title = 'Costa Rica pura vida?';

UPDATE regional_inspirations
SET subtitle = 'Adriatic azure, ancient Roman elegance'
WHERE title = 'Croatian coastline calling?';

UPDATE regional_inspirations
SET subtitle = 'Tropical fusion, English-speaking modernity'
WHERE title = 'Malaysian melting pot?';

UPDATE regional_inspirations
SET subtitle = 'Caribbean sun, colonial culture blend'
WHERE title = 'Mexican beach life?';

UPDATE regional_inspirations
SET subtitle = 'Atlantic islands, eternal spring weather'
WHERE title = 'Portuguese lifestyle ';

UPDATE regional_inspirations
SET subtitle = 'Buddhist serenity, tropical street food'
WHERE title = 'Thai temple towns?';

UPDATE regional_inspirations
SET subtitle = 'Andean peaks, Spanish colonial heritage'
WHERE title = 'Ecuador colonial charm?';

UPDATE regional_inspirations
SET subtitle = 'Eternal spring, vibrant mountain cities'
WHERE title = 'Colombian renaissance?';

UPDATE regional_inspirations
SET subtitle = 'Aegean blue, whitewashed village dreams'
WHERE title = 'Greek island paradise?';

UPDATE regional_inspirations
SET subtitle = 'Canal towns, bicycle-friendly flat landscapes'
WHERE title = 'Dutch waterways and cycling?';

UPDATE regional_inspirations
SET subtitle = 'East meets West, Mediterranean sunshine'
WHERE title = 'Turkish coastal charm?';

UPDATE regional_inspirations
SET subtitle = 'Atlantic port wine, riverside terracotta'
WHERE title = 'Harbor towns and seafood?';

UPDATE regional_inspirations
SET subtitle = 'Plaza life, siesta culture rhythm'
WHERE title = 'Authentic Spanish living?';

UPDATE regional_inspirations
SET subtitle = 'Pristine mountain peaks, clockwork precision'
WHERE title = 'Swiss alpine villages?';

UPDATE regional_inspirations
SET subtitle = 'Tuscan hills, vineyard-covered golden valleys'
WHERE title = 'Italian dolce vita?';

UPDATE regional_inspirations
SET subtitle = 'Coffee highlands, spring-like year-round climate'
WHERE title = 'Panama mountain escape?';

-- Verify updates
SELECT title, subtitle, region_name
FROM regional_inspirations
WHERE is_active = true
ORDER BY display_order;
