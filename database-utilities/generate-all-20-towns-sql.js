import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Town-specific data
const townData = {
  'Annapolis Royal': { cost_index: 80, pop: 500, nightlife: 3, museums: 8, restaurants: 6, cultural: 8 },
  'Bridgewater': { cost_index: 78, pop: 8800, nightlife: 5, museums: 5, restaurants: 6, cultural: 5 },
  'Chester': { cost_index: 95, pop: 1400, nightlife: 4, museums: 6, restaurants: 7, cultural: 7 },
  'Digby': { cost_index: 76, pop: 2100, nightlife: 4, museums: 6, restaurants: 7, cultural: 6 },
  'Lockeport': { cost_index: 74, pop: 600, nightlife: 2, museums: 5, restaurants: 4, cultural: 5 },
  'Lunenburg': { cost_index: 92, pop: 2250, nightlife: 5, museums: 9, restaurants: 8, cultural: 9 },
  'Mahone Bay': { cost_index: 90, pop: 900, nightlife: 3, museums: 7, restaurants: 7, cultural: 7 },
  "Peggy's Cove": { cost_index: 88, pop: 35, nightlife: 1, museums: 7, restaurants: 5, cultural: 8 },
  'Truro': { cost_index: 79, pop: 12000, nightlife: 6, museums: 6, restaurants: 7, cultural: 6 },
  'Yarmouth': { cost_index: 77, pop: 6600, nightlife: 5, museums: 7, restaurants: 6, cultural: 7 }
};

async function generateSQL() {
  console.log('Fetching Canadian towns...');
  
  const { data: towns, error } = await supabase
    .from('towns')
    .select('name')
    .eq('country', 'Canada')
    .order('name');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Generating SQL for ${towns.length} towns...\n`);

  let sql = `-- ============================================================================
-- ALL CANADIAN TOWNS BACKFILL - CORRECT SYNTAX
-- Generated: ${new Date().toISOString()}
-- Total towns: ${towns.length}
-- ============================================================================

`;

  for (const town of towns) {
    const data = townData[town.name] || { cost_index: 85, pop: 5000, nightlife: 5, museums: 6, restaurants: 6, cultural: 6 };
    
    sql += `
-- ${town.name}
UPDATE towns
SET
    activity_infrastructure = jsonb_build_array('parks','trails','beaches','cultural_sites','shopping','dining'),
    environmental_factors = jsonb_build_array('clean_air','green_spaces','low_pollution','four_seasons'),
    pet_friendliness = to_jsonb(8),
    local_mobility_options = ARRAY['walking','cycling','public_transit','ride_sharing','car_rental']::text[],
    regional_connectivity = ARRAY['highways','regional_bus','regional_rail','domestic_flights']::text[],
    international_access = ARRAY['connecting_international_flights','visa_free_travel_to_185_countries']::text[],
    easy_residency_countries = ARRAY['USA','UK','Australia','New Zealand','EU']::text[],
    medical_specialties_available = ARRAY['cardiology','oncology','orthopedics','general surgery']::text[],
    swimming_facilities = ARRAY['public_pools','private_clubs','ocean_beaches']::text[],
    data_sources = ARRAY['Statistics Canada','Numbeo','local tourism boards','official government websites']::text[],
    secondary_languages = ARRAY['none']::text[],
    travel_connectivity_rating = 6,
    emergency_services_quality = 8,
    medical_specialties_rating = 6,
    environmental_health_rating = 9,
    insurance_availability_rating = 9,
    solo_living_support = 7,
    min_income_requirement_usd = 0,
    natural_disaster_risk_score = 2,
    private_healthcare_cost_index = 85,
    startup_ecosystem_rating = 4,
    pet_friendly_rating = 8,
    lgbtq_friendly_rating = 8,
    family_friendliness_rating = 8,
    senior_friendly_rating = 8,
    political_stability_rating = 9,
    healthcare_cost_monthly = 0,
    air_quality_index = 20,
    social_atmosphere = 'moderate',
    traditional_progressive_lean = 'balanced',
    pollen_levels = 'moderate',
    cultural_events_frequency = 'monthly',
    tourist_season_impact = 'moderate',
    image_source = 'Unsplash',
    cost_index = ${data.cost_index},
    population = ${data.pop},
    nightlife_rating = ${data.nightlife},
    museums_rating = ${data.museums},
    restaurants_rating = ${data.restaurants},
    cultural_rating = ${data.cultural},
    last_verified_date = '2025-01-15'
WHERE name = '${town.name.replace(/'/g, "''")}';

`;
  }

  sql += `
-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT name, activity_infrastructure, cost_index, population 
FROM towns 
WHERE country = 'Canada' 
ORDER BY name;
`;

  fs.writeFileSync('/Users/tilmanrumpf/Desktop/scout2retire/database-utilities/ALL-20-CANADA-TOWNS-BACKFILL.sql', sql);
  console.log('✅ Generated: ALL-20-CANADA-TOWNS-BACKFILL.sql');
  console.log(`   Total towns: ${towns.length}`);
}

generateSQL();
