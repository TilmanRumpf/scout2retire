#!/usr/bin/env node

// QUERY TOBIAS'S PREFERENCES AND LEMMER'S DATA
// Audit script to get actual user data for scoring analysis

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function queryData() {
  console.log('🔍 AUDIT #5: TOBIAS & LEMMER ACTUAL DATA');
  console.log('='.repeat(80));
  console.log('');

  // 1. Get Tobias's user ID
  console.log('1️⃣ Finding Tobias\'s user ID...');
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    console.error('❌ Error fetching users:', authError);
    return;
  }

  const tobiasUser = authData.users.find(u => u.email === 'tobiasrumpf@gmx.de');

  if (!tobiasUser) {
    console.error('❌ User tobiasrumpf@gmx.de not found!');
    return;
  }

  console.log(`✅ Found user: ${tobiasUser.id}`);
  console.log('');

  // 2. Get Tobias's preferences
  console.log('2️⃣ Fetching Tobias\'s preferences...');
  const { data: prefs, error: prefsError } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', tobiasUser.id)
    .single();

  if (prefsError) {
    console.error('❌ Error fetching preferences:', prefsError);
    return;
  }

  console.log('✅ Tobias\'s Preferences:');
  console.log('='.repeat(80));
  console.log(JSON.stringify(prefs, null, 2));
  console.log('');

  // 3. Get Lemmer's town data
  console.log('3️⃣ Fetching Lemmer town data...');
  const { data: lemmer, error: lemmerError } = await supabase
    .from('towns')
    .select('*')
    .eq('name', 'Lemmer')
    .eq('country', 'Netherlands')
    .single();

  if (lemmerError) {
    console.error('❌ Error fetching Lemmer:', lemmerError);
    return;
  }

  console.log('✅ Lemmer Town Data:');
  console.log('='.repeat(80));
  console.log(JSON.stringify(lemmer, null, 2));
  console.log('');

  // 4. Extract key scoring fields for manual calculation
  console.log('4️⃣ KEY SCORING FIELDS SUMMARY:');
  console.log('='.repeat(80));
  console.log('');

  console.log('📍 REGION (30% weight):');
  console.log(`  User countries: ${JSON.stringify(prefs.countries)}`);
  console.log(`  User regions: ${JSON.stringify(prefs.regions)}`);
  console.log(`  User geo features: ${JSON.stringify(prefs.geographic_features)}`);
  console.log(`  User vegetation: ${JSON.stringify(prefs.vegetation_types)}`);
  console.log(`  Town country: ${lemmer.country}`);
  console.log(`  Town region: ${lemmer.region}`);
  console.log(`  Town geo features: ${JSON.stringify(lemmer.geographic_features_actual)}`);
  console.log(`  Town vegetation: ${JSON.stringify(lemmer.vegetation_type_actual)}`);
  console.log('');

  console.log('🌡️ CLIMATE (13% weight):');
  console.log(`  User summer: ${JSON.stringify(prefs.summer_climate_preference)}`);
  console.log(`  User winter: ${JSON.stringify(prefs.winter_climate_preference)}`);
  console.log(`  User humidity: ${JSON.stringify(prefs.humidity_level)}`);
  console.log(`  User sunshine: ${JSON.stringify(prefs.sunshine)}`);
  console.log(`  User precipitation: ${JSON.stringify(prefs.precipitation)}`);
  console.log(`  User seasonal: ${prefs.seasonal_preference}`);
  console.log(`  Town summer actual: ${lemmer.summer_climate_actual}`);
  console.log(`  Town winter actual: ${lemmer.winter_climate_actual}`);
  console.log(`  Town avg summer temp: ${lemmer.avg_temp_summer}°C`);
  console.log(`  Town avg winter temp: ${lemmer.avg_temp_winter}°C`);
  console.log(`  Town humidity: ${lemmer.humidity_level_actual}`);
  console.log(`  Town sunshine: ${lemmer.sunshine_level_actual}`);
  console.log(`  Town precipitation: ${lemmer.precipitation_level_actual}`);
  console.log('');

  console.log('🎭 CULTURE (12% weight):');
  console.log(`  User urban/rural: ${JSON.stringify(prefs.urban_rural_preference)}`);
  console.log(`  User pace: ${JSON.stringify(prefs.pace_of_life_preference)}`);
  console.log(`  User language: ${prefs.language_comfort}`);
  console.log(`  User expat: ${JSON.stringify(prefs.expat_community_preference)}`);
  console.log(`  Town urban/rural: ${lemmer.urban_rural_character}`);
  console.log(`  Town pace: ${lemmer.pace_of_life_actual}`);
  console.log(`  Town primary language: ${lemmer.primary_language}`);
  console.log(`  Town expat: ${lemmer.expat_community_size}`);
  console.log('');

  console.log('🎯 HOBBIES (8% weight):');
  console.log(`  User activities: ${JSON.stringify(prefs.activities)}`);
  console.log(`  User interests: ${JSON.stringify(prefs.interests)}`);
  console.log(`  Town activities: ${JSON.stringify(lemmer.activities_available)}`);
  console.log(`  Town interests: ${JSON.stringify(lemmer.interests_supported)}`);
  console.log('');

  console.log('🏥 ADMIN (18% weight):');
  console.log(`  User healthcare: ${prefs.healthcare_quality}`);
  console.log(`  User safety: ${prefs.safety_importance}`);
  console.log(`  Town healthcare score: ${lemmer.healthcare_score}`);
  console.log(`  Town safety score: ${lemmer.safety_score}`);
  console.log('');

  console.log('💰 COST (19% weight):');
  console.log(`  User total budget: ${prefs.total_monthly_budget}`);
  console.log(`  User max rent: ${prefs.max_monthly_rent}`);
  console.log(`  User tax sensitive (income/property/sales): ${prefs.income_tax_sensitive}/${prefs.property_tax_sensitive}/${prefs.sales_tax_sensitive}`);
  console.log(`  Town cost of living: ${lemmer.cost_of_living_usd}`);
  console.log(`  Town rent 1bed: ${lemmer.rent_1bed}`);
  console.log(`  Town income tax: ${lemmer.income_tax_rate_pct}%`);
  console.log(`  Town property tax: ${lemmer.property_tax_rate_pct}%`);
  console.log(`  Town sales tax: ${lemmer.sales_tax_rate_pct}%`);
  console.log('');

  console.log('='.repeat(80));
  console.log('✅ Data extraction complete!');
  console.log('');
  console.log('📝 Next: Manually trace scoring through each category function');
}

queryData().catch(console.error);
