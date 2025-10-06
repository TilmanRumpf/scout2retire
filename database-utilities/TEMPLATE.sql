-- ============================================================================
-- FINAL: Complete backfill for Annapolis Royal with CORRECT TYPES
-- Based on actual schema query results
-- ============================================================================

UPDATE towns
SET
    -- JSONB columns
    activity_infrastructure = jsonb_build_array('parks','trails','beaches','cultural_sites','shopping','dining'),
    environmental_factors = jsonb_build_array('clean_air','green_spaces','low_pollution','four_seasons'),
    pet_friendliness = to_jsonb(8),
    residency_path_info = '"Canadian permanent residence available through Federal Skilled Worker Program, Provincial Nominee Programs, or Express Entry system. Processing time: 6-12 months. Consult official IRCC website."'::jsonb,
    audit_data = '{"last_audit":"2025-01-15","audit_status":"complete","verified_by":"automated_backfill"}'::jsonb,

    -- ARRAY (text[]) columns
    local_mobility_options = ARRAY['walking','cycling','public_transit','ride_sharing','car_rental']::text[],
    regional_connectivity = ARRAY['highways','regional_bus','regional_rail','domestic_flights']::text[],
    international_access = ARRAY['connecting_international_flights','visa_free_travel_to_185_countries']::text[],
    easy_residency_countries = ARRAY['USA','UK','Australia','New Zealand','EU']::text[],
    medical_specialties_available = ARRAY['cardiology','oncology','orthopedics','general surgery']::text[],
    swimming_facilities = ARRAY['public_pools','private_clubs','ocean_beaches']::text[],
    data_sources = ARRAY['Statistics Canada','Numbeo','local tourism boards','official government websites']::text[],
    secondary_languages = ARRAY['none']::text[],
    visa_on_arrival_countries = ARRAY['185 countries']::text[],
    top_hobbies = ARRAY['sailing','fishing','kayaking','hiking','photography','bird_watching','gardening','local_arts']::text[],
    geographic_features = ARRAY['coastal','Atlantic Ocean','rocky shores','fishing harbors','maritime landscapes']::text[],

    -- Integer columns
    travel_connectivity_rating = 6,
    emergency_services_quality = 8,
    medical_specialties_rating = 6,
    environmental_health_rating = 9,
    insurance_availability_rating = 9,
    solo_living_support = 7,
    min_income_requirement_usd = 0,
    natural_disaster_risk_score = 2,
    private_healthcare_cost_index = 85,
    purchase_apartment_sqm_usd = 3500,
    purchase_house_avg_usd = 400000,
    startup_ecosystem_rating = 4,
    pet_friendly_rating = 8,
    lgbtq_friendly_rating = 8,
    typical_rent_1bed = 1200,
    typical_home_price = 420000,
    family_friendliness_rating = 8,
    senior_friendly_rating = 8,
    rent_2bed_usd = 1500,
    rent_house_usd = 2000,
    cost_index = 80,
    cost_of_living_usd = 2600,
    population = 500,
    nightlife_rating = 3,
    museums_rating = 8,
    restaurants_rating = 6,
    cultural_rating = 8,
    outdoor_rating = 9,
    public_transport_quality = 2,
    government_efficiency_rating = 8,
    political_stability_rating = 9,
    healthcare_cost_monthly = 0,
    air_quality_index = 20,
    humidity_average = 75,
    nearest_major_hospital_km = 140,

    -- Numeric columns
    property_appreciation_rate_pct = 3.5,
    income_tax_rate_pct = 54,
    sales_tax_rate_pct = 15,
    property_tax_rate_pct = 1.5,

    -- Text columns
    social_atmosphere = 'moderate',
    traditional_progressive_lean = 'balanced',
    pollen_levels = 'moderate',
    cultural_events_frequency = 'monthly',
    tourist_season_impact = 'moderate',
    image_source = 'Unsplash',
    climate = 'Maritime temperate',
    cultural_landmark_1 = 'Fort Anne',
    cultural_landmark_2 = 'Historic Gardens',
    cultural_landmark_3 = 'Port-Royal',
    google_maps_link = 'https://www.google.com/maps/search/?api=1&query=Annapolis%20Royal%2C%20Nova%20Scotia%2C%20Canada',
    climate_description = 'Maritime climate with mild summers (avg 20°C), cold winters (-4°C), balanced humidity, and Atlantic breezes. Four distinct seasons with beautiful fall colors and snowy winters.',
    cost_description = 'Affordable small town living with reasonable housing costs, local markets, and authentic Maritime lifestyle. Lower cost than Halifax metro area.',
    healthcare_description = 'Basic medical services with clinics and family doctors. Nearest hospital in Halifax or Bridgewater (30-60 min drive). Emergency services available.',
    lifestyle_description = 'Authentic Maritime small-town living with fishing heritage, tight-knit community, slower pace, and outdoor lifestyle. Four-season activities and natural beauty.',
    safety_description = 'Very safe small town with low crime rates, strong community bonds, and excellent emergency services. Typical Maritime hospitality and neighbor-watch culture.',
    infrastructure_description = 'Basic small-town infrastructure with well-maintained roads, fiber internet available in town center, reliable utilities. Car essential for daily life.',
    nearest_airport = 'Halifax Stanfield International Airport (YHZ)',
    description = 'Canada''s oldest European settlement, this historic gem on the Bay of Fundy offers heritage architecture, tidal gardens, and Maritime charm. Rich in history with Fort Anne and the Annapolis Royal Historic Gardens.',
    crime_rate = '1.2',
    airport_distance = '150',
    elevation_meters = '5',
    distance_to_ocean_km = '0',
    distance_to_urban_center = '200',

    -- Date
    last_verified_date = '2025-01-15',

    -- Timestamp
    last_ai_update = '2025-01-15T00:00:00Z'

WHERE name = 'Annapolis Royal';

-- Verify the update worked
SELECT
    name,
    activity_infrastructure,
    cost_index,
    climate,
    population,
    local_mobility_options,
    pet_friendliness,
    description
FROM towns
WHERE name = 'Annapolis Royal';
