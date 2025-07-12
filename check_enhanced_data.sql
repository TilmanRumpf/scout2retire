-- Check the enhanced town data

-- 1. Show sample of new fields added
SELECT 
  name, 
  country, 
  primary_language, 
  geographic_features, 
  income_tax_rate_pct,
  data_completeness_score,
  visa_on_arrival_countries
FROM towns 
WHERE primary_language IS NOT NULL 
LIMIT 10;

-- 2. Count how many towns now have the new data
SELECT 
  COUNT(CASE WHEN primary_language IS NOT NULL THEN 1 END) as towns_with_language,
  COUNT(CASE WHEN geographic_features IS NOT NULL THEN 1 END) as towns_with_geo_features,
  COUNT(CASE WHEN income_tax_rate_pct IS NOT NULL THEN 1 END) as towns_with_tax_data,
  COUNT(CASE WHEN data_completeness_score IS NOT NULL THEN 1 END) as towns_with_completeness,
  COUNT(*) as total_towns
FROM towns;

-- 3. Show data completeness distribution
SELECT 
  data_completeness_score,
  COUNT(*) as town_count
FROM towns 
WHERE data_completeness_score IS NOT NULL
GROUP BY data_completeness_score
ORDER BY data_completeness_score DESC;

-- 4. Show language distribution
SELECT 
  primary_language,
  COUNT(*) as town_count
FROM towns 
WHERE primary_language IS NOT NULL
GROUP BY primary_language
ORDER BY town_count DESC;

-- 5. Show geographic features
SELECT 
  UNNEST(geographic_features) as feature,
  COUNT(*) as town_count
FROM towns 
WHERE geographic_features IS NOT NULL
GROUP BY feature
ORDER BY town_count DESC;