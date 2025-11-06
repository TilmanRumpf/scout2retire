import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkTurkeyTowns() {
  const { data, error } = await supabase
    .from('towns')
    .select('town_name, country, geographic_features_actual, water_bodies, distance_to_ocean_km')
    .ilike('country', '%turkey%');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('\n=== TURKISH TOWNS ===\n');
  data.forEach(town => {
    console.log(`${town.town_name}:`);
    console.log(`  Geographic features: ${town.geographic_features_actual || 'NONE'}`);
    console.log(`  Water bodies: ${town.water_bodies || 'NONE'}`);
    console.log(`  Distance to ocean: ${town.distance_to_ocean_km || 'UNKNOWN'} km`);
    console.log('');
  });

  // Check if Antalya exists and is coastal
  const antalya = data.find(t => t.town_name.toLowerCase().includes('antalya'));
  if (antalya) {
    const isCoastal = antalya.geographic_features_actual?.toLowerCase().includes('coastal') ||
                     antalya.water_bodies?.toLowerCase().includes('mediterranean') ||
                     (antalya.distance_to_ocean_km !== null && antalya.distance_to_ocean_km === 0);

    console.log('=== ANTALYA CHECK ===');
    console.log('Is coastal?', isCoastal ? 'YES ✅' : 'NO ❌');
  } else {
    console.log('⚠️  Antalya NOT in database');
  }
}

checkTurkeyTowns();
