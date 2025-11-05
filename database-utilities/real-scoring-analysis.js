#!/usr/bin/env node

// USE THE ACTUAL SCORING ALGORITHM - NO WORKAROUNDS

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Import the REAL scoring functions
import { calculateRegionScore } from './src/utils/scoring/categories/regionScoring.js';
import { calculateClimateScore } from './src/utils/scoring/categories/climateScoring.js';
import { calculateCultureScore } from './src/utils/scoring/categories/cultureScoring.js';
import { calculateHobbiesScore } from './src/utils/scoring/categories/hobbiesScoring.js';
import { calculateAdminScore } from './src/utils/scoring/categories/adminScoring.js';
import { calculateCostScore } from './src/utils/scoring/categories/costScoring.js';
import { CATEGORY_WEIGHTS } from './src/utils/scoring/config.js';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function realScoringAnalysis() {
  console.log('🔍 REAL SCORING ANALYSIS: Lemmer vs tobias.rumpf1@gmail.com');
  console.log('Using ACTUAL algorithm from src/utils/scoring/');
  console.log('='.repeat(150));

  // Get user
  const { data: user } = await supabase
    .from('users')
    .select('id, email')
    .eq('email', 'tobias.rumpf1@gmail.com')
    .single();

  // Get preferences
  const { data: rawPrefs } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Get Lemmer with ALL fields needed for scoring
  const { data: town } = await supabase
    .from('towns')
    .select('*')
    .ilike('town_name', '%lemmer%')
    .single();

  console.log(`✅ User: ${user.email}`);
  console.log(`✅ Town: ${town.town_name}, ${town.country}\n`);

  // Convert preferences to algorithm format (from unifiedScoring.js logic)
  const prefs = {
    region_preferences: {
      regions: rawPrefs.regions || [],
      countries: rawPrefs.countries || [],
      provinces: rawPrefs.provinces || [],
      geographic_features: rawPrefs.geographic_features || [],
      vegetation_types: rawPrefs.vegetation_types || []
    },
    climate_preferences: {
      summer_climate_preference: rawPrefs.summer_climate_preference || [],
      winter_climate_preference: rawPrefs.winter_climate_preference || [],
      sunshine: rawPrefs.sunshine || [],
      precipitation: rawPrefs.precipitation || [],
      humidity_level: rawPrefs.humidity_level || [],
      seasonal_preference: rawPrefs.seasonal_preference || 'Optional'
    },
    culture_preferences: {
      lifestyle_preferences: rawPrefs.lifestyle_preferences || {},
      language_comfort: rawPrefs.language_comfort || {},
      expat_community_preference: rawPrefs.expat_community_preference || [],
      cultural_importance: rawPrefs.cultural_importance || {}
    },
    hobbies_preferences: {
      activities: rawPrefs.activities || [],
      interests: rawPrefs.interests || [],
      custom_hobbies: rawPrefs.custom_hobbies || [],
      travel_frequency: rawPrefs.travel_frequency || 'rare'
    },
    admin_preferences: {
      healthcare_quality: rawPrefs.healthcare_quality || [],
      safety_importance: rawPrefs.safety_importance || [],
      visa_preference: rawPrefs.visa_preference || []
    },
    cost_preferences: {
      total_monthly_budget: rawPrefs.total_monthly_budget || [],
      max_monthly_rent: rawPrefs.max_monthly_rent || [],
      max_home_price: rawPrefs.max_home_price || []
    },
    current_status: {
      citizenship: rawPrefs.primary_citizenship || 'de'
    }
  };

  // Calculate scores using ACTUAL algorithm
  console.log('🎯 CALCULATING SCORES WITH REAL ALGORITHM...\n');

  const regionResult = calculateRegionScore(prefs.region_preferences, town);
  const climateResult = calculateClimateScore(prefs.climate_preferences, town);
  const cultureResult = calculateCultureScore(prefs.culture_preferences, town);
  const hobbiesResult = await calculateHobbiesScore(prefs.hobbies_preferences, town);
  const adminResult = calculateAdminScore({
    ...prefs.admin_preferences,
    citizenship: prefs.current_status.citizenship
  }, town);
  const costResult = calculateCostScore(prefs.cost_preferences, town);

  // Calculate weighted total
  const totalScore = Math.min(100, Math.round(
    (regionResult.score * CATEGORY_WEIGHTS.region / 100) +
    (climateResult.score * CATEGORY_WEIGHTS.climate / 100) +
    (cultureResult.score * CATEGORY_WEIGHTS.culture / 100) +
    (hobbiesResult.score * CATEGORY_WEIGHTS.hobbies / 100) +
    (adminResult.score * CATEGORY_WEIGHTS.administration / 100) +
    (costResult.score * CATEGORY_WEIGHTS.cost / 100)
  ));

  // Print detailed table
  console.log('='.repeat(150));
  console.log('📊 SCORING BREAKDOWN - STEP BY STEP');
  console.log('='.repeat(150));
  console.log(
    'CATEGORY'.padEnd(20) +
    'FIELD'.padEnd(35) +
    'TOWN VALUE'.padEnd(30) +
    'USER PREFERENCE'.padEnd(30) +
    'RESULT'
  );
  console.log('='.repeat(150));

  // REGION
  console.log('\n🌍 REGION SCORING (Weight: 30%)');
  console.log('-'.repeat(150));
  console.log('Region'.padEnd(20) + 'country'.padEnd(35) + town.country.padEnd(30) + (prefs.region_preferences.countries.join(', ') || 'Any').padEnd(30));
  console.log('Region'.padEnd(20) + 'geographic_features'.padEnd(35) + (town.geographic_features_actual?.join(', ') || 'N/A').substring(0,28).padEnd(30) + (prefs.region_preferences.geographic_features.join(', ') || 'Any').substring(0,28).padEnd(30));
  console.log('Region'.padEnd(20) + 'vegetation_type'.padEnd(35) + (town.vegetation_type_actual?.join(', ') || 'N/A').substring(0,28).padEnd(30) + (prefs.region_preferences.vegetation_types.join(', ') || 'Any').substring(0,28).padEnd(30));
  console.log('');
  regionResult.factors.forEach(f => {
    console.log(`  ${f.factor}: ${f.score > 0 ? '+' : ''}${f.score} points`);
  });
  console.log(`  → Category Score: ${regionResult.score}%`);
  console.log(`  → Weighted Score: ${regionResult.score}% × 30% = ${(regionResult.score * 0.30).toFixed(1)} points`);

  // CLIMATE
  console.log('\n🌤️  CLIMATE SCORING (Weight: 13%)');
  console.log('-'.repeat(150));
  console.log('Climate'.padEnd(20) + 'summer_climate_actual'.padEnd(35) + (town.summer_climate_actual || 'N/A').padEnd(30) + (prefs.climate_preferences.summer_climate_preference.join(', ') || 'Any').padEnd(30));
  console.log('Climate'.padEnd(20) + 'winter_climate_actual'.padEnd(35) + (town.winter_climate_actual || 'N/A').padEnd(30) + (prefs.climate_preferences.winter_climate_preference.join(', ') || 'Any').padEnd(30));
  console.log('Climate'.padEnd(20) + 'sunshine_level_actual'.padEnd(35) + (town.sunshine_level_actual || 'N/A').padEnd(30) + (prefs.climate_preferences.sunshine.join(', ') || 'Any').padEnd(30));
  console.log('Climate'.padEnd(20) + 'precipitation_level'.padEnd(35) + (town.precipitation_level_actual || 'N/A').padEnd(30) + (prefs.climate_preferences.precipitation.join(', ') || 'Any').padEnd(30));
  console.log('Climate'.padEnd(20) + 'humidity_level'.padEnd(35) + (town.humidity_level_actual || 'N/A').padEnd(30) + (prefs.climate_preferences.humidity_level.join(', ') || 'Any').padEnd(30));
  console.log('Climate'.padEnd(20) + 'seasonal_preference'.padEnd(35) + (town.seasonal_variation_actual || 'N/A').padEnd(30) + (prefs.climate_preferences.seasonal_preference || 'Optional').padEnd(30));
  console.log('');
  climateResult.factors.forEach(f => {
    console.log(`  ${f.factor}: ${f.score > 0 ? '+' : ''}${f.score} points`);
  });
  console.log(`  → Category Score: ${climateResult.score}%`);
  console.log(`  → Weighted Score: ${climateResult.score}% × 13% = ${(climateResult.score * 0.13).toFixed(1)} points`);

  // CULTURE
  console.log('\n🏛️  CULTURE SCORING (Weight: 12%)');
  console.log('-'.repeat(150));
  console.log('Culture'.padEnd(20) + 'pace_of_life_actual'.padEnd(35) + (town.pace_of_life_actual || 'N/A').padEnd(30) + (prefs.culture_preferences.lifestyle_preferences?.pace_of_life_preference?.join(', ') || 'Any').padEnd(30));
  console.log('Culture'.padEnd(20) + 'expat_community_size'.padEnd(35) + (town.expat_community_size || 'N/A').padEnd(30) + (prefs.culture_preferences.expat_community_preference.join(', ') || 'Any').padEnd(30));
  console.log('Culture'.padEnd(20) + 'primary_language'.padEnd(35) + (town.primary_language || 'N/A').padEnd(30) + (prefs.culture_preferences.language_comfort?.already_speak?.join(', ') || 'Any').padEnd(30));
  console.log('');
  cultureResult.factors.forEach(f => {
    console.log(`  ${f.factor}: ${f.score > 0 ? '+' : ''}${f.score} points`);
  });
  console.log(`  → Category Score: ${cultureResult.score}%`);
  console.log(`  → Weighted Score: ${cultureResult.score}% × 12% = ${(cultureResult.score * 0.12).toFixed(1)} points`);

  // HOBBIES
  console.log('\n🎨 HOBBIES SCORING (Weight: 8%)');
  console.log('-'.repeat(150));
  console.log('Hobbies'.padEnd(20) + 'outdoor_activities'.padEnd(35) + 'From towns_hobbies junction'.padEnd(30) + (prefs.hobbies_preferences.custom_hobbies.join(', ') || 'N/A').padEnd(30));
  console.log('Hobbies'.padEnd(20) + 'airport_distance'.padEnd(35) + (`${town.airport_distance}km` || 'N/A').padEnd(30) + (prefs.hobbies_preferences.travel_frequency || 'N/A').padEnd(30));
  console.log('');
  hobbiesResult.factors.forEach(f => {
    console.log(`  ${f.factor}: ${f.score > 0 ? '+' : ''}${f.score} points`);
  });
  console.log(`  → Category Score: ${hobbiesResult.score}%`);
  console.log(`  → Weighted Score: ${hobbiesResult.score}% × 8% = ${(hobbiesResult.score * 0.08).toFixed(1)} points`);

  // ADMIN
  console.log('\n🏥 ADMINISTRATION SCORING (Weight: 18%)');
  console.log('-'.repeat(150));
  console.log('Admin'.padEnd(20) + 'healthcare_score'.padEnd(35) + String(town.healthcare_score || 'N/A').padEnd(30) + 'High quality'.padEnd(30));
  console.log('Admin'.padEnd(20) + 'safety_score'.padEnd(35) + String(town.safety_score || 'N/A').padEnd(30) + 'High safety'.padEnd(30));
  console.log('Admin'.padEnd(20) + 'visa_requirements'.padEnd(35) + (town.visa_requirements || 'N/A').substring(0,28).padEnd(30) + (prefs.current_status.citizenship || 'de').padEnd(30));
  console.log('');
  adminResult.factors.forEach(f => {
    console.log(`  ${f.factor}: ${f.score > 0 ? '+' : ''}${f.score} points`);
  });
  console.log(`  → Category Score: ${adminResult.score}%`);
  console.log(`  → Weighted Score: ${adminResult.score}% × 18% = ${(adminResult.score * 0.18).toFixed(1)} points`);

  // COST
  console.log('\n💰 COST SCORING (Weight: 19%)');
  console.log('-'.repeat(150));
  console.log('Cost'.padEnd(20) + 'cost_of_living_usd'.padEnd(35) + (`$${town.cost_of_living_usd}/mo` || 'N/A').padEnd(30) + (`Budget: $${prefs.cost_preferences.total_monthly_budget[0] || 'N/A'}/mo`).padEnd(30));
  console.log('Cost'.padEnd(20) + 'rent_1bed'.padEnd(35) + (`$${town.rent_1bed}/mo` || 'N/A').padEnd(30) + (`Max: $${prefs.cost_preferences.max_monthly_rent[0] || 'N/A'}/mo`).padEnd(30));
  console.log('');
  costResult.factors.forEach(f => {
    console.log(`  ${f.factor}: ${f.score > 0 ? '+' : ''}${f.score} points`);
  });
  console.log(`  → Category Score: ${costResult.score}%`);
  console.log(`  → Weighted Score: ${costResult.score}% × 19% = ${(costResult.score * 0.19).toFixed(1)} points`);

  // FINAL
  console.log('\n' + '='.repeat(150));
  console.log('🎯 FINAL MATCH SCORE CALCULATION:');
  console.log('='.repeat(150));
  console.log(`Region:         ${regionResult.score}% × 30% = ${(regionResult.score * 0.30).toFixed(1)} points`);
  console.log(`Climate:        ${climateResult.score}% × 13% = ${(climateResult.score * 0.13).toFixed(1)} points`);
  console.log(`Culture:        ${cultureResult.score}% × 12% = ${(cultureResult.score * 0.12).toFixed(1)} points`);
  console.log(`Hobbies:        ${hobbiesResult.score}% × 8%  = ${(hobbiesResult.score * 0.08).toFixed(1)} points`);
  console.log(`Administration: ${adminResult.score}% × 18% = ${(adminResult.score * 0.18).toFixed(1)} points`);
  console.log(`Cost:           ${costResult.score}% × 19% = ${(costResult.score * 0.19).toFixed(1)} points`);
  console.log('-'.repeat(150));
  console.log(`TOTAL: ${totalScore}%`);
  console.log('='.repeat(150));
  console.log('\n✅ THIS IS THE ACTUAL ALGORITHM - NO WORKAROUNDS\n');
}

realScoringAnalysis().catch(console.error);
