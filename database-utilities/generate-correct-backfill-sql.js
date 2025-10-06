// Generate SQL with correct PostgreSQL syntax
// JSONB arrays: jsonb_build_array()
// Text arrays: ARRAY[]::text[]

const fs = require('fs');

const towns = [
  { name: 'Annapolis Royal', cost_index: 80, climate: 'Maritime temperate', population: 500 },
  { name: 'Bridgewater', cost_index: 78, climate: 'Maritime temperate', population: 8800 },
  // ... will do all 20 towns
];

const jsonbArrays = {
  activity_infrastructure: ['parks','trails','beaches','cultural_sites','shopping','dining'],
  local_mobility_options: ['walking','cycling','public_transit','ride_sharing','car_rental'],
  regional_connectivity: ['highways','regional_bus','regional_rail','domestic_flights'],
  international_access: ['connecting_international_flights','visa_free_travel_to_185_countries'],
  environmental_factors: ['clean_air','green_spaces','low_pollution','four_seasons'],
  easy_residency_countries: ['USA','UK','Australia','New Zealand','EU'],
  medical_specialties_available: ['cardiology','oncology','orthopedics','general surgery'],
  swimming_facilities: ['public_pools','private_clubs','ocean_beaches'],
  data_sources: ['Statistics Canada','Numbeo','local tourism boards','official government websites']
};

console.log('-- Test: One town with correct JSONB syntax\n');
console.log('UPDATE towns SET');
console.log(`  activity_infrastructure = jsonb_build_array(${jsonbArrays.activity_infrastructure.map(v => `'${v}'`).join(',')}),`);
console.log(`  travel_connectivity_rating = 6,`);
console.log(`  cost_index = 80`);
console.log(`WHERE name = 'Annapolis Royal';\n`);
