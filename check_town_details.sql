-- Check how many towns have details vs no details

-- 1. Count towns with and without details
SELECT 
  COUNT(*) as total_towns,
  COUNT(CASE WHEN 
    cost_index IS NOT NULL OR 
    climate IS NOT NULL OR 
    healthcare_score IS NOT NULL OR 
    safety_score IS NOT NULL OR 
    description IS NOT NULL OR 
    cost_of_living_usd IS NOT NULL OR 
    population IS NOT NULL OR 
    quality_of_life IS NOT NULL
  THEN 1 END) as towns_with_details,
  COUNT(CASE WHEN 
    cost_index IS NULL AND 
    climate IS NULL AND 
    healthcare_score IS NULL AND 
    safety_score IS NULL AND 
    description IS NULL AND 
    cost_of_living_usd IS NULL AND 
    population IS NULL AND 
    quality_of_life IS NULL
  THEN 1 END) as towns_without_details
FROM towns;

-- 2. Show the towns that have full details
SELECT name, country, cost_index, healthcare_score, safety_score, population
FROM towns 
WHERE cost_index IS NOT NULL 
   OR healthcare_score IS NOT NULL 
   OR safety_score IS NOT NULL
   OR population IS NOT NULL
ORDER BY country, name;

-- 3. Count by level of completeness
SELECT 
  CASE 
    WHEN cost_index IS NOT NULL AND healthcare_score IS NOT NULL AND safety_score IS NOT NULL THEN 'Full scores'
    WHEN cost_index IS NOT NULL OR healthcare_score IS NOT NULL OR safety_score IS NOT NULL THEN 'Partial scores'
    ELSE 'No scores'
  END as detail_level,
  COUNT(*) as count
FROM towns
GROUP BY detail_level
ORDER BY detail_level;