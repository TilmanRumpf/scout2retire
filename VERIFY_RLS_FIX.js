// Run this AFTER applying the SQL fix to verify it worked
// This tests with actual authentication

import { createClient } from '@supabase/supabase-js';

// Create client with YOUR session (you must be logged in)
const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMDc5NTMsImV4cCI6MjA3MjY4Mzk1M30.-VRSBZu7cElt4LXPVT_tm3ilsuj_UojDOvOP_UVCVHs'
);

console.log('🔍 VERIFYING RLS FIX FOR USER_PREFERENCES\n');

// Test 1: Can you access your own preferences when authenticated?
async function testAuthenticatedAccess() {
  // First, sign in as tilman.rumpf@gmail.com
  // You'll need to replace 'your-password' with your actual password
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'tilman.rumpf@gmail.com',
    password: 'your-password-here'  // REPLACE THIS
  });

  if (authError) {
    console.log('❌ Could not sign in:', authError.message);
    console.log('Please update the password in this script');
    return;
  }

  console.log('✅ Signed in as:', authData.user.email);
  console.log('User ID:', authData.user.id);

  // Now try to fetch preferences
  const { data: prefs, error: prefError } = await supabase
    .from('user_preferences')
    .select('summer_climate_preference, winter_climate_preference, humidity_level')
    .eq('user_id', authData.user.id)
    .single();

  if (prefError) {
    console.log('❌ STILL BROKEN! Error:', prefError.message);
    console.log('RLS is still blocking access');
  } else if (!prefs) {
    console.log('❌ No data returned - RLS might still be blocking');
  } else {
    console.log('✅ SUCCESS! Can read preferences:');
    console.log('  Summer:', prefs.summer_climate_preference);
    console.log('  Winter:', prefs.winter_climate_preference);
    console.log('  Humidity:', prefs.humidity_level);
    console.log('\n🎉 RLS IS FIXED! Granada should now show correct percentage!');
  }

  // Sign out
  await supabase.auth.signOut();
}

// Test 2: Verify anonymous users are blocked
async function testAnonymousBlocked() {
  console.log('\n📋 Testing that anonymous users are blocked...');

  // Sign out first
  await supabase.auth.signOut();

  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', '83d285b2-b21b-4d13-a1a1-6d51b6733d52');

  if (!data || data.length === 0) {
    console.log('✅ Good! Anonymous users cannot read preferences');
  } else {
    console.log('⚠️ WARNING: Anonymous users can read preferences!');
  }
}

// Run tests
await testAuthenticatedAccess();
await testAnonymousBlocked();