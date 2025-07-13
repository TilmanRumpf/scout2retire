import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3MDYzNDUsImV4cCI6MjA2NDI4MjM0NX0.52Jn2n8sRH5TniQ1LqvOw68YOgpRLdK8FL5_ZV2SPe4'
);

async function findPreferences() {
  console.log('🔍 FINDING WHERE YOUR PREFERENCES ARE ACTUALLY STORED\n');
  
  const userId = '83d285b2-b21b-4d13-a1a1-6d51b6733d52';
  
  // Check users table
  console.log('1️⃣ USERS TABLE:');
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
    
  console.log('User data keys:', Object.keys(user || {}));
  
  // Look for any climate-related fields
  Object.keys(user || {}).forEach(key => {
    if (key.toLowerCase().includes('climate') || key.toLowerCase().includes('onboarding')) {
      console.log(`${key}:`, JSON.stringify(user[key], null, 2));
    }
  });
  
  // Check user_preferences table
  console.log('\n2️⃣ USER_PREFERENCES TABLE:');
  const { data: userPrefs } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  if (userPrefs) {
    console.log('User preferences found!');
    console.log('Keys:', Object.keys(userPrefs));
    
    Object.keys(userPrefs).forEach(key => {
      if (key !== 'user_id' && key !== 'id') {
        console.log(`\n${key}:`, JSON.stringify(userPrefs[key], null, 2));
      }
    });
  } else {
    console.log('No user_preferences found');
  }
  
  // Check what the algorithm is actually getting
  console.log('\n3️⃣ WHAT THE MATCHING ALGORITHM LOADS:');
  
  // This simulates what happens in matchingAlgorithm.js
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (!userError && userData) {
    console.log('Algorithm loads from users table:');
    console.log('- onboarding_completed:', userData.onboarding_completed);
    
    const userPreferences = {
      region_preferences: userData.onboarding_region || {},
      climate_preferences: userData.onboarding_climate || {},
      culture_preferences: userData.onboarding_culture || {},
      hobbies_preferences: userData.onboarding_hobbies || {},
      admin_preferences: userData.onboarding_admin || {},
      budget_preferences: userData.onboarding_budget || {},
      citizenship: userData.citizenship || 'USA'
    };
    
    console.log('\nConverted preferences structure:');
    console.log('climate_preferences:', JSON.stringify(userPreferences.climate_preferences, null, 2));
    console.log('region_preferences:', JSON.stringify(userPreferences.region_preferences, null, 2));
  }
}

findPreferences();