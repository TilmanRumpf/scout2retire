import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testGainesvilleHobbies() {
  // First get Gainesville data
  const { data: towns, error } = await supabase
    .from('towns')
    .select(`
      id, town_name, state_code, country,
      geographic_features_actual,
      distance_to_ocean_km,
      distance_to_water_km,
      top_hobbies,
      beaches_nearby,
      water_activities_available
    `)
    .eq('town_name', 'Gainesville')
    .eq('country', 'United States');

  if (towns && towns.length > 0) {
    const town = towns[0];
    console.log('\n=== GAINESVILLE DATA ===');
    console.log('Town:', town.town_name, town.state_code);
    console.log('Geographic features:', town.geographic_features_actual);
    console.log('Distance to ocean:', town.distance_to_ocean_km, 'km');
    console.log('Distance to water:', town.distance_to_water_km, 'km');
    console.log('Beaches nearby:', town.beaches_nearby);
    console.log('Water activities:', town.water_activities_available);
    console.log('Top hobbies:', town.top_hobbies);

    // Now test hobbies inference
    console.log('\n=== TESTING WATER SPORTS INFERENCE ===');
    const waterActivities = [
      'swimming', 'snorkeling', 'water skiing', 'swimming laps',
      'boating', 'kayaking', 'sailing', 'fishing', 'jet skiing',
      'stand-up paddleboarding', 'surfing', 'scuba diving'
    ];

    console.log('\nFlorida is known for water sports!');
    console.log('User selected water activities:', waterActivities);

    // Check what would make water sports available
    console.log('\nChecking inference conditions:');
    console.log('- Is coastal?', town.geographic_features_actual?.includes('coastal') ? 'YES' : 'NO');
    console.log('- Distance to ocean = 0?', town.distance_to_ocean_km === 0 ? 'YES' : 'NO');
    console.log('- Near water (0km)?', town.distance_to_water_km === 0 ? 'YES' : 'NO');
    console.log('- In Florida?', town.state_code === 'FL' ? 'YES' : 'NO');

    // Florida special case - ALL Florida towns should support water sports
    if (town.state_code === 'FL' || town.country === 'United States' && town.state_code === 'FL') {
      console.log('\n✅ FLORIDA OVERRIDE: All Florida towns should support water activities!');
      console.log('Gainesville has numerous lakes and is 2 hours from both coasts.');
    }
  } else {
    console.log('Gainesville not found in database');
  }
}

testGainesvilleHobbies();