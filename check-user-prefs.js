#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkColumns() {
  const userId = 'd1039857-71e2-4562-86aa-1f0b4a0c17c8';

  console.log('📊 Checking onboarding_responses columns and data...\n');

  const { data: responses, error } = await supabase
    .from('onboarding_responses')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.log('❌ Error:', error.message);
    return;
  }

  if (!responses) {
    console.log('❌ No data found for user');
    return;
  }

  console.log('✅ Found onboarding_responses record');
  console.log('\n📋 ALL COLUMNS AND VALUES:');
  console.log(JSON.stringify(responses, null, 2));

  console.log('\n🔍 SPECIFIC PREFERENCE FIELDS:');
  console.log('  region_preferences:', responses.region_preferences);
  console.log('  climate_preferences:', responses.climate_preferences);
  console.log('  culture_preferences:', responses.culture_preferences);
  console.log('  region:', responses.region);
  console.log('  climate:', responses.climate);
  console.log('  culture:', responses.culture);
}

checkColumns();
