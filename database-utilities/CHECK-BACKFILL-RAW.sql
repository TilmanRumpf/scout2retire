-- RUN THIS IN SUPABASE SQL EDITOR TO CHECK IF BACKFILL WORKED
-- RLS may be preventing client SELECT, but data might be there

SELECT
  name,
  activity_infrastructure,
  travel_connectivity_rating,
  social_atmosphere,
  traditional_progressive_lean,
  SUBSTRING(residency_path_info, 1, 50) as residency_info_preview,
  emergency_services_quality,
  typical_rent_1bed,
  cost_index,
  climate,
  SUBSTRING(description, 1, 50) as description_preview
FROM towns
WHERE name = 'Annapolis Royal'
LIMIT 1;

-- If these columns show actual data (not NULL), backfill worked but RLS is blocking client access
-- If these columns show NULL, the UPDATE never worked
