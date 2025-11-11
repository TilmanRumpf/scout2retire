#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testGetOnboardingProgress() {
  const userId = 'd1039857-71e2-4562-86aa-1f0b4a0c17c8';

  console.log('🔍 Simulating getOnboardingProgress() logic...\n');

  // Step 1: Read from onboarding_responses (like the function does)
  const { data: responsesData, error: responsesError } = await supabase
    .from('onboarding_responses')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  console.log('📊 Step 1: Read from onboarding_responses');
  console.log('  responsesData exists?', !!responsesData);
  console.log('  responsesError?', responsesError);

  // Step 2: Fallback logic
  let data = responsesData;
  let error = responsesError;

  if (!responsesData && !responsesError) {
    console.log('📊 Step 2: FALLBACK - No data in onboarding_responses, checking user_preferences');
  } else {
    console.log('📊 Step 2: Using data from onboarding_responses (no fallback needed)');
  }

  // Step 3: Extract userData (like function does on lines 275-283)
  const userData = {
    current_status: data?.current_status || null,
    region_preferences: data?.region_preferences || null,
    climate_preferences: data?.climate_preferences || null,
    culture_preferences: data?.culture_preferences || null,
    hobbies: data?.hobbies || null,
    administration: data?.administration || null,
    costs: data?.costs || null
  };

  console.log('\n📊 Step 3: Extract userData (what function returns)');
  console.log('  current_status:', typeof userData.current_status, userData.current_status === null ? 'NULL' : 'HAS DATA');
  console.log('  region_preferences:', typeof userData.region_preferences, userData.region_preferences === null ? 'NULL' : 'HAS DATA');
  console.log('  climate_preferences:', typeof userData.climate_preferences, userData.climate_preferences === null ? 'NULL' : 'HAS DATA');
  console.log('  culture_preferences:', typeof userData.culture_preferences, userData.culture_preferences === null ? 'NULL' : 'HAS DATA');
  console.log('  hobbies:', typeof userData.hobbies, userData.hobbies === null ? 'NULL' : 'HAS DATA');
  console.log('  administration:', typeof userData.administration, userData.administration === null ? 'NULL' : 'HAS DATA');
  console.log('  costs:', typeof userData.costs, userData.costs === null ? 'NULL' : 'HAS DATA');

  console.log('\n📋 Full userData object:');
  console.log(JSON.stringify(userData, null, 2));
}

testGetOnboardingProgress();
