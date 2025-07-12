-- Check current town statistics

-- Total count
SELECT COUNT(*) as total_towns FROM towns;

-- Count by country (top 20)
SELECT country, COUNT(*) as count 
FROM towns 
GROUP BY country 
ORDER BY count DESC, country
LIMIT 20;

-- Check for any remaining typos
SELECT DISTINCT country 
FROM towns 
WHERE country LIKE '%Sainttes%' 
   OR country LIKE '%(%' 
   OR country LIKE '%.S.%'
ORDER BY country;

-- Overall summary
SELECT 
  COUNT(DISTINCT country) as unique_countries,
  COUNT(*) as total_towns,
  COUNT(DISTINCT name) as unique_town_names
FROM towns;