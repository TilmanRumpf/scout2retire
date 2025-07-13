import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3MDYzNDUsImV4cCI6MjA2NDI4MjM0NX0.52Jn2n8sRH5TniQ1LqvOw68YOgpRLdK8FL5_ZV2SPe4'
);

async function debugClimate() {
  console.log('🔍 DEBUGGING CLIMATE SCORING ISSUE\n');
  
  // Get your actual user preferences
  const { data: userPrefs } = await supabase
    .from('onboarding_responses')
    .select('*')
    .eq('user_id', '83d285b2-b21b-4d13-a1a1-6d51b6733d52')
    .single();
    
  console.log('1️⃣ USER CLIMATE PREFERENCES:');
  console.log('Raw climate data:', JSON.stringify(userPrefs?.climate_preferences, null, 2));
  
  // Get a sample town's climate data
  const { data: town } = await supabase
    .from('towns')
    .select('*')
    .eq('name', 'Porto')
    .single();
    
  console.log('\n2️⃣ TOWN CLIMATE DATA (Porto):');
  console.log('summer_climate_actual:', town.summer_climate_actual);
  console.log('winter_climate_actual:', town.winter_climate_actual);
  console.log('humidity_level_actual:', town.humidity_level_actual);
  console.log('sunshine_level_actual:', town.sunshine_level_actual);
  console.log('precipitation_level_actual:', town.precipitation_level_actual);
  
  console.log('\n3️⃣ WHAT THE ALGORITHM EXPECTS:');
  console.log('User preferences should have:');
  console.log('- summer_climate_preference');
  console.log('- winter_climate_preference');
  console.log('- humidity_level');
  console.log('- sunshine');
  console.log('- precipitation');
  
  console.log('\n4️⃣ ACTUAL MATCHING ATTEMPT:');
  const climatePrefs = userPrefs?.climate_preferences || {};
  
  console.log('Looking for summer match:');
  console.log(`  User wants: ${climatePrefs.summer_climate_preference}`);
  console.log(`  Town has: ${town.summer_climate_actual}`);
  console.log(`  Match: ${climatePrefs.summer_climate_preference === town.summer_climate_actual}`);
  
  console.log('\nLooking for winter match:');
  console.log(`  User wants: ${climatePrefs.winter_climate_preference}`);
  console.log(`  Town has: ${town.winter_climate_actual}`);
  console.log(`  Match: ${climatePrefs.winter_climate_preference === town.winter_climate_actual}`);
  
  // Check what's actually in the user's climate preferences
  console.log('\n5️⃣ ALL USER CLIMATE FIELDS:');
  Object.keys(climatePrefs).forEach(key => {
    console.log(`  ${key}: ${climatePrefs[key]}`);
  });
}

debugClimate();