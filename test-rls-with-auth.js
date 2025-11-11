#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testWithAuth() {
  const targetUserId = 'd1039857-71e2-4562-86aa-1f0b4a0c17c8'; // tobiasrumpf@gmx.de
  
  console.log('🔍 Testing RLS with authenticated admin user...\n');

  // First, check if we have a valid session in Algorithm Manager
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    console.log('✅ Already authenticated as:', session.user.email);
    console.log('   User ID:', session.user.id);
  } else {
    console.log('⚠️  No active session - need to sign in first');
    console.log('   This test needs to run while you are logged in to the app\n');
    console.log('📋 Alternative: Test in browser console instead');
    return;
  }

  console.log('\n📊 Attempting to read onboarding_responses for target user...');
  const { data, error } = await supabase
    .from('onboarding_responses')
    .select('*')
    .eq('user_id', targetUserId)
    .maybeSingle();

  if (error) {
    console.log('❌ Error:', error.message);
    console.log('❌ RLS still blocking - policy may not be working');
  } else if (data) {
    console.log('✅ SUCCESS! Admin can now read other users\' data');
    console.log('   region_preferences exists?', !!data.region_preferences);
    console.log('   climate_preferences exists?', !!data.climate_preferences);
  } else {
    console.log('⚠️  No data found');
  }
}

testWithAuth();
