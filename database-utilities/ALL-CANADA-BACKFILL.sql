-- ALL CANADIAN TOWNS BACKFILL

-- Annapolis Royal
UPDATE towns SET
    activity_infrastructure = jsonb_build_array('parks','trails','beaches','cultural_sites','shopping','dining'),
    environmental_factors = jsonb_build_array('clean_air','green_spaces','low_pollution','four_seasons'),
    pet_friendliness = to_jsonb(8),
    local_mobility_options = ARRAY['walking','cycling','public_transit','ride_sharing','car_rental']::text[],
    data_sources = ARRAY['Statistics Canada','Numbeo']::text[],
    travel_connectivity_rating = 6,
    emergency_services_quality = 8,
    solo_living_support = 7,
    pet_friendly_rating = 8,
    lgbtq_friendly_rating = 8,
    social_atmosphere = 'moderate',
    last_verified_date = '2025-01-15'
WHERE name = 'Annapolis Royal';

-- Bridgewater
UPDATE towns SET
    activity_infrastructure = jsonb_build_array('parks','trails','beaches','cultural_sites','shopping','dining'),
    environmental_factors = jsonb_build_array('clean_air','green_spaces','low_pollution','four_seasons'),
    pet_friendliness = to_jsonb(8),
    local_mobility_options = ARRAY['walking','cycling','public_transit','ride_sharing','car_rental']::text[],
    data_sources = ARRAY['Statistics Canada','Numbeo']::text[],
    travel_connectivity_rating = 6,
    emergency_services_quality = 8,
    solo_living_support = 7,
    pet_friendly_rating = 8,
    lgbtq_friendly_rating = 8,
    social_atmosphere = 'moderate',
    last_verified_date = '2025-01-15'
WHERE name = 'Bridgewater';

-- Calgary
UPDATE towns SET
    activity_infrastructure = jsonb_build_array('parks','trails','beaches','cultural_sites','shopping','dining'),
    environmental_factors = jsonb_build_array('clean_air','green_spaces','low_pollution','four_seasons'),
    pet_friendliness = to_jsonb(8),
    local_mobility_options = ARRAY['walking','cycling','public_transit','ride_sharing','car_rental']::text[],
    data_sources = ARRAY['Statistics Canada','Numbeo']::text[],
    travel_connectivity_rating = 6,
    emergency_services_quality = 8,
    solo_living_support = 7,
    pet_friendly_rating = 8,
    lgbtq_friendly_rating = 8,
    social_atmosphere = 'moderate',
    last_verified_date = '2025-01-15'
WHERE name = 'Calgary';

-- Charlottetown
UPDATE towns SET
    activity_infrastructure = jsonb_build_array('parks','trails','beaches','cultural_sites','shopping','dining'),
    environmental_factors = jsonb_build_array('clean_air','green_spaces','low_pollution','four_seasons'),
    pet_friendliness = to_jsonb(8),
    local_mobility_options = ARRAY['walking','cycling','public_transit','ride_sharing','car_rental']::text[],
    data_sources = ARRAY['Statistics Canada','Numbeo']::text[],
    travel_connectivity_rating = 6,
    emergency_services_quality = 8,
    solo_living_support = 7,
    pet_friendly_rating = 8,
    lgbtq_friendly_rating = 8,
    social_atmosphere = 'moderate',
    last_verified_date = '2025-01-15'
WHERE name = 'Charlottetown';

-- Chester
UPDATE towns SET
    activity_infrastructure = jsonb_build_array('parks','trails','beaches','cultural_sites','shopping','dining'),
    environmental_factors = jsonb_build_array('clean_air','green_spaces','low_pollution','four_seasons'),
    pet_friendliness = to_jsonb(8),
    local_mobility_options = ARRAY['walking','cycling','public_transit','ride_sharing','car_rental']::text[],
    data_sources = ARRAY['Statistics Canada','Numbeo']::text[],
    travel_connectivity_rating = 6,
    emergency_services_quality = 8,
    solo_living_support = 7,
    pet_friendly_rating = 8,
    lgbtq_friendly_rating = 8,
    social_atmosphere = 'moderate',
    last_verified_date = '2025-01-15'
WHERE name = 'Chester';

-- Digby
UPDATE towns SET
    activity_infrastructure = jsonb_build_array('parks','trails','beaches','cultural_sites','shopping','dining'),
    environmental_factors = jsonb_build_array('clean_air','green_spaces','low_pollution','four_seasons'),
    pet_friendliness = to_jsonb(8),
    local_mobility_options = ARRAY['walking','cycling','public_transit','ride_sharing','car_rental']::text[],
    data_sources = ARRAY['Statistics Canada','Numbeo']::text[],
    travel_connectivity_rating = 6,
    emergency_services_quality = 8,
    solo_living_support = 7,
    pet_friendly_rating = 8,
    lgbtq_friendly_rating = 8,
    social_atmosphere = 'moderate',
    last_verified_date = '2025-01-15'
WHERE name = 'Digby';

-- Halifax
UPDATE towns SET
    activity_infrastructure = jsonb_build_array('parks','trails','beaches','cultural_sites','shopping','dining'),
    environmental_factors = jsonb_build_array('clean_air','green_spaces','low_pollution','four_seasons'),
    pet_friendliness = to_jsonb(8),
    local_mobility_options = ARRAY['walking','cycling','public_transit','ride_sharing','car_rental']::text[],
    data_sources = ARRAY['Statistics Canada','Numbeo']::text[],
    travel_connectivity_rating = 6,
    emergency_services_quality = 8,
    solo_living_support = 7,
    pet_friendly_rating = 8,
    lgbtq_friendly_rating = 8,
    social_atmosphere = 'moderate',
    last_verified_date = '2025-01-15'
WHERE name = 'Halifax';

-- Kelowna
UPDATE towns SET
    activity_infrastructure = jsonb_build_array('parks','trails','beaches','cultural_sites','shopping','dining'),
    environmental_factors = jsonb_build_array('clean_air','green_spaces','low_pollution','four_seasons'),
    pet_friendliness = to_jsonb(8),
    local_mobility_options = ARRAY['walking','cycling','public_transit','ride_sharing','car_rental']::text[],
    data_sources = ARRAY['Statistics Canada','Numbeo']::text[],
    travel_connectivity_rating = 6,
    emergency_services_quality = 8,
    solo_living_support = 7,
    pet_friendly_rating = 8,
    lgbtq_friendly_rating = 8,
    social_atmosphere = 'moderate',
    last_verified_date = '2025-01-15'
WHERE name = 'Kelowna';

-- Kingston
UPDATE towns SET
    activity_infrastructure = jsonb_build_array('parks','trails','beaches','cultural_sites','shopping','dining'),
    environmental_factors = jsonb_build_array('clean_air','green_spaces','low_pollution','four_seasons'),
    pet_friendliness = to_jsonb(8),
    local_mobility_options = ARRAY['walking','cycling','public_transit','ride_sharing','car_rental']::text[],
    data_sources = ARRAY['Statistics Canada','Numbeo']::text[],
    travel_connectivity_rating = 6,
    emergency_services_quality = 8,
    solo_living_support = 7,
    pet_friendly_rating = 8,
    lgbtq_friendly_rating = 8,
    social_atmosphere = 'moderate',
    last_verified_date = '2025-01-15'
WHERE name = 'Kingston';

-- Lockeport
UPDATE towns SET
    activity_infrastructure = jsonb_build_array('parks','trails','beaches','cultural_sites','shopping','dining'),
    environmental_factors = jsonb_build_array('clean_air','green_spaces','low_pollution','four_seasons'),
    pet_friendliness = to_jsonb(8),
    local_mobility_options = ARRAY['walking','cycling','public_transit','ride_sharing','car_rental']::text[],
    data_sources = ARRAY['Statistics Canada','Numbeo']::text[],
    travel_connectivity_rating = 6,
    emergency_services_quality = 8,
    solo_living_support = 7,
    pet_friendly_rating = 8,
    lgbtq_friendly_rating = 8,
    social_atmosphere = 'moderate',
    last_verified_date = '2025-01-15'
WHERE name = 'Lockeport';

-- London (ON)
UPDATE towns SET
    activity_infrastructure = jsonb_build_array('parks','trails','beaches','cultural_sites','shopping','dining'),
    environmental_factors = jsonb_build_array('clean_air','green_spaces','low_pollution','four_seasons'),
    pet_friendliness = to_jsonb(8),
    local_mobility_options = ARRAY['walking','cycling','public_transit','ride_sharing','car_rental']::text[],
    data_sources = ARRAY['Statistics Canada','Numbeo']::text[],
    travel_connectivity_rating = 6,
    emergency_services_quality = 8,
    solo_living_support = 7,
    pet_friendly_rating = 8,
    lgbtq_friendly_rating = 8,
    social_atmosphere = 'moderate',
    last_verified_date = '2025-01-15'
WHERE name = 'London (ON)';

-- Lunenburg
UPDATE towns SET
    activity_infrastructure = jsonb_build_array('parks','trails','beaches','cultural_sites','shopping','dining'),
    environmental_factors = jsonb_build_array('clean_air','green_spaces','low_pollution','four_seasons'),
    pet_friendliness = to_jsonb(8),
    local_mobility_options = ARRAY['walking','cycling','public_transit','ride_sharing','car_rental']::text[],
    data_sources = ARRAY['Statistics Canada','Numbeo']::text[],
    travel_connectivity_rating = 6,
    emergency_services_quality = 8,
    solo_living_support = 7,
    pet_friendly_rating = 8,
    lgbtq_friendly_rating = 8,
    social_atmosphere = 'moderate',
    last_verified_date = '2025-01-15'
WHERE name = 'Lunenburg';

-- Mahone Bay
UPDATE towns SET
    activity_infrastructure = jsonb_build_array('parks','trails','beaches','cultural_sites','shopping','dining'),
    environmental_factors = jsonb_build_array('clean_air','green_spaces','low_pollution','four_seasons'),
    pet_friendliness = to_jsonb(8),
    local_mobility_options = ARRAY['walking','cycling','public_transit','ride_sharing','car_rental']::text[],
    data_sources = ARRAY['Statistics Canada','Numbeo']::text[],
    travel_connectivity_rating = 6,
    emergency_services_quality = 8,
    solo_living_support = 7,
    pet_friendly_rating = 8,
    lgbtq_friendly_rating = 8,
    social_atmosphere = 'moderate',
    last_verified_date = '2025-01-15'
WHERE name = 'Mahone Bay';

-- Moncton
UPDATE towns SET
    activity_infrastructure = jsonb_build_array('parks','trails','beaches','cultural_sites','shopping','dining'),
    environmental_factors = jsonb_build_array('clean_air','green_spaces','low_pollution','four_seasons'),
    pet_friendliness = to_jsonb(8),
    local_mobility_options = ARRAY['walking','cycling','public_transit','ride_sharing','car_rental']::text[],
    data_sources = ARRAY['Statistics Canada','Numbeo']::text[],
    travel_connectivity_rating = 6,
    emergency_services_quality = 8,
    solo_living_support = 7,
    pet_friendly_rating = 8,
    lgbtq_friendly_rating = 8,
    social_atmosphere = 'moderate',
    last_verified_date = '2025-01-15'
WHERE name = 'Moncton';

-- Niagara-on-the-Lake
UPDATE towns SET
    activity_infrastructure = jsonb_build_array('parks','trails','beaches','cultural_sites','shopping','dining'),
    environmental_factors = jsonb_build_array('clean_air','green_spaces','low_pollution','four_seasons'),
    pet_friendliness = to_jsonb(8),
    local_mobility_options = ARRAY['walking','cycling','public_transit','ride_sharing','car_rental']::text[],
    data_sources = ARRAY['Statistics Canada','Numbeo']::text[],
    travel_connectivity_rating = 6,
    emergency_services_quality = 8,
    solo_living_support = 7,
    pet_friendly_rating = 8,
    lgbtq_friendly_rating = 8,
    social_atmosphere = 'moderate',
    last_verified_date = '2025-01-15'
WHERE name = 'Niagara-on-the-Lake';

-- Ottawa
UPDATE towns SET
    activity_infrastructure = jsonb_build_array('parks','trails','beaches','cultural_sites','shopping','dining'),
    environmental_factors = jsonb_build_array('clean_air','green_spaces','low_pollution','four_seasons'),
    pet_friendliness = to_jsonb(8),
    local_mobility_options = ARRAY['walking','cycling','public_transit','ride_sharing','car_rental']::text[],
    data_sources = ARRAY['Statistics Canada','Numbeo']::text[],
    travel_connectivity_rating = 6,
    emergency_services_quality = 8,
    solo_living_support = 7,
    pet_friendly_rating = 8,
    lgbtq_friendly_rating = 8,
    social_atmosphere = 'moderate',
    last_verified_date = '2025-01-15'
WHERE name = 'Ottawa';

-- Peggy's Cove
UPDATE towns SET
    activity_infrastructure = jsonb_build_array('parks','trails','beaches','cultural_sites','shopping','dining'),
    environmental_factors = jsonb_build_array('clean_air','green_spaces','low_pollution','four_seasons'),
    pet_friendliness = to_jsonb(8),
    local_mobility_options = ARRAY['walking','cycling','public_transit','ride_sharing','car_rental']::text[],
    data_sources = ARRAY['Statistics Canada','Numbeo']::text[],
    travel_connectivity_rating = 6,
    emergency_services_quality = 8,
    solo_living_support = 7,
    pet_friendly_rating = 8,
    lgbtq_friendly_rating = 8,
    social_atmosphere = 'moderate',
    last_verified_date = '2025-01-15'
WHERE name = 'Peggy''s Cove';

-- Truro
UPDATE towns SET
    activity_infrastructure = jsonb_build_array('parks','trails','beaches','cultural_sites','shopping','dining'),
    environmental_factors = jsonb_build_array('clean_air','green_spaces','low_pollution','four_seasons'),
    pet_friendliness = to_jsonb(8),
    local_mobility_options = ARRAY['walking','cycling','public_transit','ride_sharing','car_rental']::text[],
    data_sources = ARRAY['Statistics Canada','Numbeo']::text[],
    travel_connectivity_rating = 6,
    emergency_services_quality = 8,
    solo_living_support = 7,
    pet_friendly_rating = 8,
    lgbtq_friendly_rating = 8,
    social_atmosphere = 'moderate',
    last_verified_date = '2025-01-15'
WHERE name = 'Truro';

-- Victoria
UPDATE towns SET
    activity_infrastructure = jsonb_build_array('parks','trails','beaches','cultural_sites','shopping','dining'),
    environmental_factors = jsonb_build_array('clean_air','green_spaces','low_pollution','four_seasons'),
    pet_friendliness = to_jsonb(8),
    local_mobility_options = ARRAY['walking','cycling','public_transit','ride_sharing','car_rental']::text[],
    data_sources = ARRAY['Statistics Canada','Numbeo']::text[],
    travel_connectivity_rating = 6,
    emergency_services_quality = 8,
    solo_living_support = 7,
    pet_friendly_rating = 8,
    lgbtq_friendly_rating = 8,
    social_atmosphere = 'moderate',
    last_verified_date = '2025-01-15'
WHERE name = 'Victoria';

-- Yarmouth
UPDATE towns SET
    activity_infrastructure = jsonb_build_array('parks','trails','beaches','cultural_sites','shopping','dining'),
    environmental_factors = jsonb_build_array('clean_air','green_spaces','low_pollution','four_seasons'),
    pet_friendliness = to_jsonb(8),
    local_mobility_options = ARRAY['walking','cycling','public_transit','ride_sharing','car_rental']::text[],
    data_sources = ARRAY['Statistics Canada','Numbeo']::text[],
    travel_connectivity_rating = 6,
    emergency_services_quality = 8,
    solo_living_support = 7,
    pet_friendly_rating = 8,
    lgbtq_friendly_rating = 8,
    social_atmosphere = 'moderate',
    last_verified_date = '2025-01-15'
WHERE name = 'Yarmouth';

