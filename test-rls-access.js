#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Use ANON key (like Algorithm Manager does)
const supabaseAnon = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Use SERVICE ROLE key (like our test script)
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testRLS() {
  const targetUserId = 'd1039857-71e2-4562-86aa-1f0b4a0c17c8'; // tobiasrumpf@gmx.de

  console.log('🔍 Testing RLS access to onboarding_responses...\n');

  console.log('📊 Test 1: Service Role Key (should work)');
  const { data: adminData, error: adminError } = await supabaseAdmin
    .from('onboarding_responses')
    .select('*')
    .eq('user_id', targetUserId)
    .maybeSingle();

  if (adminError) {
    console.log('  ❌ Error:', adminError.message);
  } else if (adminData) {
    console.log('  ✅ SUCCESS - Got data');
    console.log('  region_preferences exists?', !!adminData.region_preferences);
    console.log('  climate_preferences exists?', !!adminData.climate_preferences);
  } else {
    console.log('  ⚠️  No data found');
  }

  console.log('\n📊 Test 2: Anon Key WITHOUT auth (like Algorithm Manager)');
  const { data: anonData, error: anonError } = await supabaseAnon
    .from('onboarding_responses')
    .select('*')
    .eq('user_id', targetUserId)
    .maybeSingle();

  if (anonError) {
    console.log('  ❌ Error:', anonError.message);
    console.log('  ❌ RLS IS BLOCKING ACCESS!');
  } else if (anonData) {
    console.log('  ✅ SUCCESS - Got data');
    console.log('  region_preferences exists?', !!anonData.region_preferences);
  } else {
    console.log('  ⚠️  No data found (RLS might be blocking)');
  }

  console.log('\n🎯 DIAGNOSIS:');
  if (anonError || !anonData) {
    console.log('RLS is blocking Algorithm Manager from reading other users\' onboarding_responses!');
    console.log('This explains why Algorithm Manager sees NULL preferences.');
  } else {
    console.log('RLS allows access. Problem must be elsewhere.');
  }
}

testRLS();
