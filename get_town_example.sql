SELECT * FROM towns 
WHERE name IS NOT NULL 
AND country IS NOT NULL
AND cost_index IS NOT NULL
AND climate IS NOT NULL
AND healthcare_score IS NOT NULL
AND safety_score IS NOT NULL
AND description IS NOT NULL
AND cost_of_living_usd IS NOT NULL
AND population IS NOT NULL
AND quality_of_life IS NOT NULL
LIMIT 1;
