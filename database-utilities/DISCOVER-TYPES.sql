-- Test each column type one by one

-- Test 1: activity_infrastructure (we know this is JSONB)
UPDATE towns SET activity_infrastructure = jsonb_build_array('parks') WHERE name = 'Annapolis Royal';

-- Test 2: local_mobility_options (we know this is text[])
UPDATE towns SET local_mobility_options = ARRAY['walking']::text[] WHERE name = 'Annapolis Royal';

-- Test 3: environmental_factors (ERROR says JSONB)
UPDATE towns SET environmental_factors = jsonb_build_array('clean_air') WHERE name = 'Annapolis Royal';

-- Test 4: medical_specialties_available
UPDATE towns SET medical_specialties_available = ARRAY['cardiology']::text[] WHERE name = 'Annapolis Royal';

-- Test 5: data_sources
UPDATE towns SET data_sources = jsonb_build_array('Statistics Canada') WHERE name = 'Annapolis Royal';

SELECT
    activity_infrastructure,
    local_mobility_options,
    environmental_factors,
    medical_specialties_available,
    data_sources
FROM towns WHERE name = 'Annapolis Royal';
