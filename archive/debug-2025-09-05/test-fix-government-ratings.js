#!/usr/bin/env node

// TEST SCRIPT: Verify government ratings fix is working
// This simulates the exact query used by matchingAlgorithm.js

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function testFixedQuery() {
  console.log('🧪 TESTING FIXED QUERY FROM MATCHING ALGORITHM');
  console.log('=' .repeat(60));
  console.log('');

  try {
    // Use the same selectColumns from the fixed matchingAlgorithm.js
    const selectColumns = `
      id, name, country, population, region,
      image_url_1, image_url_2, image_url_3,
      latitude, longitude, description,
      cost_index, cost_of_living_usd, 
      rent_1bed, rent_2bed_usd, meal_cost, groceries_cost, utilities_cost,
      income_tax_rate_pct, sales_tax_rate_pct, property_tax_rate_pct,
      tax_haven_status, foreign_income_taxed,
      healthcare_score, safety_score, quality_of_life, healthcare_cost_monthly,
      hospital_count, nearest_major_hospital_km, english_speaking_doctors,
      climate, climate_description, avg_temp_summer, avg_temp_winter,
      summer_climate_actual, winter_climate_actual,
      annual_rainfall, sunshine_hours, sunshine_level_actual,
      humidity_average, humidity_level_actual, seasonal_variation_actual,
      air_quality_index,
      activities_available, interests_supported,
      outdoor_rating, outdoor_activities_rating, cultural_rating, nightlife_rating,
      beaches_nearby, golf_courses_count, hiking_trails_km,
      tennis_courts_count, marinas_count, ski_resorts_within_100km,
      dog_parks_count, farmers_markets, water_bodies, walkability,
      expat_community_size, english_proficiency_level,
      primary_language, cultural_events_rating, museums_rating,
      restaurants_rating, shopping_rating, cultural_landmark_1,
      social_atmosphere, pace_of_life_actual, urban_rural_character,
      visa_requirements, visa_on_arrival_countries, residency_path_info,
      retirement_visa_available, digital_nomad_visa, crime_rate,
      natural_disaster_risk, internet_speed,
      geographic_features, geographic_features_actual, vegetation_type_actual,
      elevation_meters, distance_to_ocean_km, nearest_airport,
      airport_distance, geo_region, regions, top_hobbies,
      government_efficiency_rating, political_stability_rating
    `;

    console.log('🔍 STEP 1: TESTING FIXED SELECT QUERY');
    console.log('-'.repeat(40));
    
    const { data: testData, error: testError } = await supabase
      .from('towns')
      .select(selectColumns.trim())
      .not('image_url_1', 'is', null)
      .not('image_url_1', 'eq', '')
      .limit(5);

    if (testError) {
      console.log('❌ Query failed:', testError.message);
      return;
    }

    console.log(`✅ Query successful! Retrieved ${testData.length} towns`);
    console.log('');

    // Test the specific columns we fixed
    console.log('🎯 STEP 2: CHECKING TARGET COLUMNS');
    console.log('-'.repeat(40));
    
    testData.forEach((town, index) => {
      console.log(`${index + 1}. ${town.name}, ${town.country}`);
      console.log(`   🏛️  Government Efficiency: ${town.government_efficiency_rating || 'UNDEFINED'}`);
      console.log(`   🏛️  Political Stability: ${town.political_stability_rating || 'UNDEFINED'}`);
      console.log('');
    });

    // Check if all columns are defined
    const allHaveGovRating = testData.every(town => town.government_efficiency_rating !== undefined);
    const allHavePoliticalRating = testData.every(town => town.political_stability_rating !== undefined);

    console.log('📊 STEP 3: VALIDATION RESULTS');
    console.log('-'.repeat(40));
    console.log(`Government Efficiency Rating: ${allHaveGovRating ? '✅ ALL DEFINED' : '❌ SOME UNDEFINED'}`);
    console.log(`Political Stability Rating: ${allHavePoliticalRating ? '✅ ALL DEFINED' : '❌ SOME UNDEFINED'}`);

    if (allHaveGovRating && allHavePoliticalRating) {
      console.log('');
      console.log('🎉 SUCCESS! The fix is working correctly.');
      console.log('   Both columns are now being fetched by the frontend query.');
      console.log('   The scoring algorithm should now have access to these ratings.');
    } else {
      console.log('');
      console.log('⚠️  WARNING! Some values are still undefined.');
      console.log('   This might indicate a data issue or query problem.');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testFixedQuery().catch(console.error);