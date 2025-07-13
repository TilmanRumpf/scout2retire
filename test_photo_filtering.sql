-- Test photo filtering query to see the impact of our safety feature

-- Count towns WITH photos (will be displayed)
SELECT COUNT(*) as towns_with_photos
FROM towns
WHERE image_url_1 IS NOT NULL;

-- Count towns WITHOUT photos (will be filtered out)
SELECT COUNT(*) as towns_without_photos
FROM towns
WHERE image_url_1 IS NULL;

-- Total towns in database
SELECT COUNT(*) as total_towns
FROM towns;

-- Sample of towns without photos to understand what's being filtered
SELECT id, name, country, cost_index, healthcare_score
FROM towns
WHERE image_url_1 IS NULL
ORDER BY name
LIMIT 10;

-- Percentage of towns that have photos
SELECT 
  COUNT(*) FILTER (WHERE image_url_1 IS NOT NULL) as with_photos,
  COUNT(*) FILTER (WHERE image_url_1 IS NULL) as without_photos,
  COUNT(*) as total,
  ROUND(100.0 * COUNT(*) FILTER (WHERE image_url_1 IS NOT NULL) / COUNT(*), 2) as percentage_with_photos
FROM towns;