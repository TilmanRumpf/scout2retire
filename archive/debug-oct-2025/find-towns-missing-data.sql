-- Find towns missing data (excluding the 10 new Nova Scotia towns)

SELECT
  name,
  country,
  id,
  created_at
FROM towns
WHERE
  summer_climate_actual IS NULL AND
  winter_climate_actual IS NULL AND
  geographic_features_actual IS NULL AND
  vegetation_type_actual IS NULL AND
  pace_of_life_actual IS NULL AND
  typical_monthly_living_cost IS NULL
  AND name NOT IN (
    'Annapolis Royal', 'Bridgewater', 'Chester', 'Digby', 'Lockeport',
    'Lunenburg', 'Mahone Bay', 'Peggy''s Cove', 'Truro', 'Yarmouth'
  )
ORDER BY created_at DESC, name;

-- Summary count
SELECT
  COUNT(*) AS towns_missing_data_excluding_nova_scotia
FROM towns
WHERE
  summer_climate_actual IS NULL AND
  winter_climate_actual IS NULL AND
  geographic_features_actual IS NULL AND
  vegetation_type_actual IS NULL AND
  pace_of_life_actual IS NULL AND
  typical_monthly_living_cost IS NULL
  AND name NOT IN (
    'Annapolis Royal', 'Bridgewater', 'Chester', 'Digby', 'Lockeport',
    'Lunenburg', 'Mahone Bay', 'Peggy''s Cove', 'Truro', 'Yarmouth'
  );
