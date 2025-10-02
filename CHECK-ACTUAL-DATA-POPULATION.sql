-- CHECK ACTUAL DATA POPULATION FOR ALL TOWNS
-- Shows which towns have NO data vs complete data

SELECT
  COUNT(*) AS total_towns,
  COUNT(*) FILTER (
    WHERE
      summer_climate_actual IS NOT NULL OR
      winter_climate_actual IS NOT NULL OR
      geographic_features_actual IS NOT NULL OR
      vegetation_type_actual IS NOT NULL OR
      pace_of_life_actual IS NOT NULL OR
      typical_monthly_living_cost IS NOT NULL OR
      overall_score IS NOT NULL
  ) AS towns_with_some_data,
  COUNT(*) FILTER (
    WHERE
      summer_climate_actual IS NULL AND
      winter_climate_actual IS NULL AND
      geographic_features_actual IS NULL AND
      vegetation_type_actual IS NULL AND
      pace_of_life_actual IS NULL AND
      typical_monthly_living_cost IS NULL AND
      overall_score IS NULL
  ) AS towns_with_NO_data
FROM towns;

-- List towns with NO data
SELECT name, country, image_url_1
FROM towns
WHERE
  summer_climate_actual IS NULL AND
  winter_climate_actual IS NULL AND
  geographic_features_actual IS NULL AND
  vegetation_type_actual IS NULL AND
  pace_of_life_actual IS NULL AND
  typical_monthly_living_cost IS NULL AND
  overall_score IS NULL
ORDER BY name
LIMIT 100;
