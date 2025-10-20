-- Drop 20 empty columns from towns table
-- These columns were identified as 100% NULL in data audit on 2025-10-19

ALTER TABLE towns
DROP COLUMN IF EXISTS smart_city_rank,
DROP COLUMN IF EXISTS global_peace_index,
DROP COLUMN IF EXISTS disaster_risk,
DROP COLUMN IF EXISTS cultural_attractions,
DROP COLUMN IF EXISTS natural_attractions,
DROP COLUMN IF EXISTS annual_events,
DROP COLUMN IF EXISTS co_working_spaces,
DROP COLUMN IF EXISTS public_spaces,
DROP COLUMN IF EXISTS healthcare_facilities,
DROP COLUMN IF EXISTS education_institutions,
DROP COLUMN IF EXISTS transport_options,
DROP COLUMN IF EXISTS outdoor_recreation,
DROP COLUMN IF EXISTS wellness_amenities,
DROP COLUMN IF EXISTS shopping_dining,
DROP COLUMN IF EXISTS travel_connectivity,
DROP COLUMN IF EXISTS sustainable_living,
DROP COLUMN IF EXISTS innovation_index,
DROP COLUMN IF EXISTS retirement_friendliness,
DROP COLUMN IF EXISTS volunteer_opportunities,
DROP COLUMN IF EXISTS learning_programs;