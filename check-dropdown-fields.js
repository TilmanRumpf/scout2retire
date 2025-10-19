#!/usr/bin/env node

// Extract field names from admin panel files and check against database

const adminPanelFields = {
  'OverviewPanel.jsx': [
    'image_url_1',
    'image_url_2',
    'image_url_3',
    'description',
    'verbose_description',
    'summary',
    'appealStatement'
  ],
  'InfrastructurePanel.jsx': [
    'internet_speed',
    'coworking_spaces_count',
    'digital_nomad_visa',
    'public_transport_quality',
    'airport_distance',
    'international_airport_distance',
    'regional_airport_distance',
    'walkability',
    'infrastructure_description',
    'government_efficiency_rating'
  ],
  'ActivitiesPanel.jsx': [
    'golf_courses_count',
    'tennis_courts_count',
    'dog_parks_count',
    'hiking_trails_km',
    'ski_resorts_within_100km',
    'outdoor_rating',
    'outdoor_activities_rating',
    'beaches_nearby',
    'water_bodies',
    'activities_available'
  ],
  'CostsPanel.jsx': [
    'cost_of_living_usd',
    'typical_monthly_living_cost',
    'rent_1bed',
    'utilities_cost',
    'groceries_cost',
    'meal_cost',
    'income_tax_rate_pct',
    'property_tax_rate_pct',
    'sales_tax_rate_pct',
    'tax_haven_status',
    'foreign_income_taxed'
  ],
  'ClimatePanel.jsx': [
    'avg_temp_summer',
    'summer_climate_actual',
    'avg_temp_winter',
    'winter_climate_actual',
    'sunshine_level_actual',
    'sunshine_hours',
    'precipitation_level_actual',
    'annual_rainfall',
    'seasonal_variation_actual',
    'humidity_level_actual',
    'humidity_average',
    'climate_description',
    'air_quality_index',
    'natural_disaster_risk',
    'environmental_health_rating'
  ],
  'CulturePanel.jsx': [
    'primary_language',
    'english_proficiency_level',
    'pace_of_life_actual',
    'social_atmosphere',
    'traditional_progressive_lean',
    'expat_community_size',
    'retirement_community_presence',
    'cultural_events_frequency',
    'cultural_events_rating',
    'nightlife_rating',
    'restaurants_rating',
    'museums_rating',
    'shopping_rating',
    'outdoor_rating',
    'cultural_landmark_1',
    'cultural_landmark_2',
    'cultural_landmark_3'
  ],
  'RegionPanel.jsx': [
    'country',
    'geo_region',
    'latitude',
    'longitude',
    'geographic_features_actual',
    'vegetation_type_actual',
    'elevation_meters',
    'population',
    'urban_rural_character'
  ],
  'SafetyPanel.jsx': [
    'safety_score',
    'safety_description',
    'crime_rate',
    'political_stability_rating',
    'natural_disaster_risk',
    'natural_disaster_risk_score'
  ],
  'HealthcarePanel.jsx': [
    'healthcare_score',
    'environmental_health_rating',
    'medical_specialties_rating',
    'hospital_count',
    'nearest_major_hospital_km',
    'emergency_services_quality',
    'english_speaking_doctors',
    'healthcare_description',
    'healthcare_cost',
    'healthcare_cost_monthly',
    'private_healthcare_cost_index',
    'insurance_availability_rating',
    'health_insurance_required',
    'medical_specialties_available',
    'healthcare_specialties_available'
  ]
};

// Actual database columns (from previous output)
const dbColumns = [
  'activities_available', 'activity_infrastructure', 'air_quality_index', 'airport_distance', 
  'annual_rainfall', 'audit_data', 'avg_temp_summer', 'avg_temp_winter', 'beaches_nearby', 
  'childcare_available', 'climate', 'climate_description', 'cost_description', 'cost_index', 
  'cost_of_living_usd', 'country', 'coworking_spaces_count', 'created_at', 'crime_rate', 
  'cultural_events_frequency', 'cultural_events_rating', 'cultural_landmark_1', 
  'cultural_landmark_2', 'cultural_landmark_3', 'cultural_rating', 'data_completeness_score', 
  'data_sources', 'description', 'digital_nomad_visa', 'distance_to_ocean_km', 
  'distance_to_urban_center', 'dog_parks_count', 'easy_residency_countries', 
  'elevation_meters', 'emergency_services_quality', 'english_proficiency_level', 
  'english_speaking_doctors', 'environmental_factors', 'environmental_health_rating', 
  'expat_community_size', 'expat_groups', 'family_friendliness_rating', 'farmers_markets', 
  'foreign_income_taxed', 'geo_region', 'geographic_features', 'geographic_features_actual', 
  'golf_courses_count', 'google_maps_link', 'government_efficiency_rating', 'groceries_cost', 
  'has_public_transit', 'has_uber', 'health_insurance_required', 'healthcare_cost', 
  'healthcare_cost_monthly', 'healthcare_description', 'healthcare_score', 
  'healthcare_specialties_available', 'hiking_trails_km', 'hospital_count', 'humidity_average', 
  'humidity_level_actual', 'id', 'image_is_fallback', 'image_license', 'image_photographer', 
  'image_source', 'image_url_1', 'image_url_2', 'image_url_3', 'image_urls', 
  'image_validated_at', 'image_validation_note', 'income_tax_rate_pct', 
  'infrastructure_description', 'insurance_availability_rating', 'interests_supported', 
  'international_access', 'international_airport_distance', 'international_flights_direct', 
  'international_schools_available', 'international_schools_count', 'internet_speed', 
  'languages_spoken', 'last_ai_update', 'last_verified_date', 'latitude', 
  'lgbtq_friendly_rating', 'lifestyle_description', 'local_mobility_options', 'longitude', 
  'marinas_count', 'meal_cost', 'medical_specialties_available', 'medical_specialties_rating', 
  'min_income_requirement_usd', 'museums_rating', 'name', 'natural_disaster_risk', 
  'natural_disaster_risk_score', 'nearest_airport', 'nearest_major_hospital_km', 
  'needs_update', 'nightlife_rating', 'outdoor_activities_rating', 'outdoor_rating', 
  'pace_of_life_actual', 'pet_friendliness', 'pet_friendly_rating', 
  'political_stability_rating', 'pollen_levels', 'population', 'precipitation_level_actual', 
  'primary_language', 'private_healthcare_cost_index', 'property_appreciation_rate_pct', 
  'property_tax_rate_pct', 'public_transport_quality', 'purchase_apartment_sqm_usd', 
  'purchase_house_avg_usd', 'quality_of_life', 'region', 'regional_airport_distance', 
  'regional_connectivity', 'regions', 'rent_1bed', 'rent_2bed_usd', 'rent_house_usd', 
  'requires_car', 'residency_path_info', 'restaurants_rating', 'retirement_community_presence', 
  'retirement_visa_available', 'safety_description', 'safety_score', 'sales_tax_rate_pct', 
  'search_vector', 'seasonal_variation_actual', 'secondary_languages', 
  'senior_friendly_rating', 'shopping_rating', 'ski_resorts_within_100km', 
  'social_atmosphere', 'solo_living_support', 'startup_ecosystem_rating', 
  'summer_climate_actual', 'sunshine_hours', 'sunshine_level_actual', 'swimming_facilities', 
  'tax_haven_status', 'tax_treaty_us', 'tennis_courts_count', 'top_hobbies', 
  'tourist_season_impact', 'traditional_progressive_lean', 'train_station', 
  'travel_connectivity_rating', 'typical_home_price', 'typical_monthly_living_cost', 
  'typical_rent_1bed', 'urban_rural_character', 'utilities_cost', 'vegetation_type_actual', 
  'veterinary_clinics_count', 'visa_on_arrival_countries', 'visa_requirements', 'walkability', 
  'water_bodies', 'wellness_rating', 'winter_climate_actual'
];

console.log('🔍 CHECKING ADMIN PANEL FIELD NAMES VS DATABASE COLUMNS');
console.log('='.repeat(80));
console.log('');

let totalFields = 0;
let missingFields = 0;
let matchingFields = 0;

const allMissingFields = [];

for (const [panelName, fields] of Object.entries(adminPanelFields)) {
  console.log(`\n📄 ${panelName}`);
  console.log('-'.repeat(80));
  
  const panelMissing = [];
  
  for (const field of fields) {
    totalFields++;
    if (!dbColumns.includes(field)) {
      missingFields++;
      panelMissing.push(field);
      allMissingFields.push({ panel: panelName, field });
    } else {
      matchingFields++;
    }
  }
  
  if (panelMissing.length > 0) {
    console.log(`❌ MISSING FIELDS (${panelMissing.length}):`);
    panelMissing.forEach(f => console.log(`   - ${f}`));
  } else {
    console.log(`✅ All fields exist in database`);
  }
}

console.log('\n\n📊 SUMMARY');
console.log('='.repeat(80));
console.log(`Total fields checked: ${totalFields}`);
console.log(`✅ Matching fields: ${matchingFields} (${(matchingFields/totalFields*100).toFixed(1)}%)`);
console.log(`❌ Missing fields: ${missingFields} (${(missingFields/totalFields*100).toFixed(1)}%)`);

if (allMissingFields.length > 0) {
  console.log('\n\n🚨 ALL MISSING FIELDS:');
  console.log('='.repeat(80));
  allMissingFields.forEach(({ panel, field }) => {
    console.log(`${panel.padEnd(30, ' ')} → ${field}`);
  });
  
  console.log('\n\n⚠️  CRITICAL: These fields will NOT save data!');
  console.log('Data will appear to save but will be silently dropped by database.');
} else {
  console.log('\n\n✅ SUCCESS: All dropdown fields exist in database!');
}
