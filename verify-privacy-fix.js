#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Test 1: Anon key (like frontend search)
const anonClient = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Test 2: Service role (for verification)
const adminClient = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verify() {
  console.log('🔍 Verifying Privacy Fix...\n');

  // Test 1: Towns search with anon key
  console.log('📊 Test 1: Towns search (anon key - like frontend)');
  const { data: townsAnon, error: townsError } = await anonClient
    .from('towns')
    .select('id, town_name, country')
    .ilike('town_name', '%lemmer%');

  if (townsError) {
    console.log('  ❌ Error:', townsError.message);
  } else {
    console.log(`  ✅ SUCCESS - Found ${townsAnon.length} towns`);
    if (townsAnon.length > 0) {
      console.log('  📋 Sample:', townsAnon[0].town_name, ',', townsAnon[0].country);
    }
  }

  // Test 2: Check consent columns exist
  console.log('\n📊 Test 2: Consent columns added');
  const { data: prefs } = await adminClient
    .from('user_preferences')
    .select('user_id, admin_access_consent')
    .limit(3);

  if (prefs && prefs.length > 0) {
    console.log('  ✅ user_preferences.admin_access_consent exists');
    console.log('  📋 Sample consents:', prefs.map(p => p.admin_access_consent));
  }

  const { data: responses } = await adminClient
    .from('onboarding_responses')
    .select('user_id, admin_access_consent')
    .limit(3);

  if (responses && responses.length > 0) {
    console.log('  ✅ onboarding_responses.admin_access_consent exists');
    console.log('  📋 Sample consents:', responses.map(r => r.admin_access_consent));
  }

  // Test 3: Check grandfathered users
  console.log('\n📊 Test 3: Existing users grandfathered in');
  const { data: tobias } = await adminClient
    .from('user_preferences')
    .select('admin_access_consent')
    .eq('user_id', 'd1039857-71e2-4562-86aa-1f0b4a0c17c8')
    .maybeSingle();

  if (tobias) {
    console.log('  ✅ tobiasrumpf@gmx.de consent:', tobias.admin_access_consent);
  }

  console.log('\n🎯 SUMMARY:');
  console.log('  Towns search:', townsAnon && townsAnon.length > 0 ? '✅ WORKING' : '❌ BROKEN');
  console.log('  Consent columns:', prefs && responses ? '✅ ADDED' : '❌ MISSING');
  console.log('  Existing users:', tobias?.admin_access_consent ? '✅ GRANDFATHERED' : '❌ NOT SET');
  
  console.log('\n📋 Next: Refresh browser and test:');
  console.log('  1. Search for "Lemmer" in main search bar');
  console.log('  2. Search for "Lemmer" in Algorithm Manager');
  console.log('  3. Both should work now!');
}

verify();
