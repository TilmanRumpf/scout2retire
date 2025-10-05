-- Fix government_efficiency_rating and political_stability_rating scale
-- Some towns have ratings on 0-10 scale, need to convert to 0-100 scale
-- The scoring algorithm expects 0-100 and divides by 10 internally

-- First, let's see which towns have values under 10 (wrong scale)
SELECT 
    name, 
    country,
    government_efficiency_rating,
    political_stability_rating
FROM towns
WHERE government_efficiency_rating < 10 
   OR political_stability_rating < 10
ORDER BY country, name;

-- Update towns with values under 10 by multiplying by 10
-- This converts from 0-10 scale to 0-100 scale
UPDATE towns
SET 
    government_efficiency_rating = government_efficiency_rating * 10
WHERE government_efficiency_rating IS NOT NULL 
  AND government_efficiency_rating < 10;

UPDATE towns
SET 
    political_stability_rating = political_stability_rating * 10
WHERE political_stability_rating IS NOT NULL
  AND political_stability_rating < 10;

-- Verify the update worked
SELECT 
    COUNT(*) as towns_with_low_values
FROM towns
WHERE government_efficiency_rating < 10 
   OR political_stability_rating < 10;

-- Show sample of updated data
SELECT 
    name,
    country,
    government_efficiency_rating,
    political_stability_rating
FROM towns
WHERE country IN ('Spain', 'United States', 'Singapore', 'Mexico')
ORDER BY country, name
LIMIT 20;