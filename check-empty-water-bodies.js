import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkEmptyWaterBodies() {
  console.log('🔍 CHECKING TOWNS WITH EMPTY WATER_BODIES\n');
  console.log('==========================================\n');
  
  // Get towns with empty water_bodies arrays
  const { data: towns, error } = await supabase
    .from('towns')
    .select('id, name, country, water_bodies, geographic_features')
    .or('water_bodies.eq.{},water_bodies.is.null')
    .order('country, name');
    
  if (error) {
    console.error('Error fetching towns:', error);
    return;
  }
  
  console.log(`Found ${towns.length} towns with empty/null water_bodies:\n`);
  
  // Categorize by likely water access
  const definitelyNeedWater = [];
  const probablyNeedWater = [];
  const maybeNeedWater = [];
  const landlockedOk = [];
  
  for (const town of towns) {
    const features = town.geographic_features ? town.geographic_features.join(' ').toLowerCase() : '';
    const name = town.name.toLowerCase();
    
    // Check for definite water indicators
    if (features.includes('coastal') || features.includes('beach') || 
        features.includes('port') || features.includes('harbor') ||
        features.includes('island') || features.includes('seaside') ||
        features.includes('oceanfront') || name.includes('beach') ||
        name.includes('port') || name.includes('bay')) {
      definitelyNeedWater.push(town);
    }
    // Check for probable water
    else if (features.includes('river') || features.includes('lake') ||
             features.includes('waterfront') || features.includes('marina') ||
             features.includes('canal') || features.includes('lagoon') ||
             name.includes('lake') || name.includes('river')) {
      probablyNeedWater.push(town);
    }
    // Check for possible water
    else if (features.includes('valley') || features.includes('delta') ||
             features.includes('wetland') || features.includes('estuary')) {
      maybeNeedWater.push(town);
    }
    // Likely landlocked
    else {
      landlockedOk.push(town);
    }
  }
  
  console.log('🚨 DEFINITELY NEED WATER BODIES (coastal/island/port):\n');
  if (definitelyNeedWater.length === 0) {
    console.log('  None found - all coastal towns have water_bodies!\n');
  } else {
    definitelyNeedWater.forEach(t => {
      console.log(`  ❌ ${t.name}, ${t.country}`);
      if (t.geographic_features) {
        console.log(`     Features: ${t.geographic_features.join(', ')}`);
      }
    });
  }
  
  console.log('\n⚠️ PROBABLY NEED WATER BODIES (river/lake mentioned):\n');
  if (probablyNeedWater.length === 0) {
    console.log('  None found\n');
  } else {
    probablyNeedWater.forEach(t => {
      console.log(`  ${t.name}, ${t.country}`);
      if (t.geographic_features) {
        console.log(`     Features: ${t.geographic_features.join(', ')}`);
      }
    });
  }
  
  console.log('\n❓ POSSIBLY NEED WATER BODIES (valley/delta/wetland):\n');
  if (maybeNeedWater.length === 0) {
    console.log('  None found\n');
  } else {
    maybeNeedWater.slice(0, 10).forEach(t => {
      console.log(`  ${t.name}, ${t.country}`);
    });
  }
  
  console.log('\n✅ LANDLOCKED/INLAND (probably OK with no water):\n');
  console.log(`  ${landlockedOk.length} towns`);
  console.log('  Examples:');
  landlockedOk.slice(0, 10).forEach(t => {
    console.log(`    - ${t.name}, ${t.country}`);
  });
  
  // List all empty water bodies towns for review
  console.log('\n📋 ALL TOWNS WITH EMPTY WATER BODIES:\n');
  towns.forEach(t => {
    console.log(`${t.name}, ${t.country}`);
  });
}

// Run check
checkEmptyWaterBodies().catch(console.error);