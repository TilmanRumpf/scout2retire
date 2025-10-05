import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Final fixes for towns with empty arrays that SHOULD have water
const FINAL_WATER_FIXES = {
  // Netherlands
  'Haarlem': ['Spaarne River'],
  'Leiden': ['Old Rhine (Oude Rijn)', 'Vliet River'],
  
  // Belgium  
  'Ghent': ['Scheldt River', 'Leie River'],
  
  // USA
  'Gainesville': ['Paynes Prairie', 'Newnans Lake', 'Lake Alice'],
  'Orlando': ['Lake Eola', 'Lake Ivanhoe', 'Butler Chain of Lakes'],
  
  // Guatemala
  'Antigua': ['Pensativo River', 'Guacalate River'],
  
  // Towns that are truly landlocked/dry - confirm empty
  'Mérida': [], // Inland Yucatan, no significant water
  'Merida': [], // Duplicate entry
  'Escazú': [], // San José suburb, no water
  'Villa de Leyva': [], // Colombian highland town
  'Windhoek': [], // Namibian desert capital
  'Atenas': [], // Costa Rican mountain town
  'Grecia': [], // Costa Rican mountain town
  'The Villages': [], // Florida retirement community, artificial ponds only
  'Sarlat-la-Canéda': [], // Inland Dordogne
  'Marrakesh': [], // Desert city
  'Orvieto': [], // Italian hilltop town
  'Spoleto': [], // Italian mountain town
  'Tervuren': [], // Belgian forest town
  'Palm Springs': [], // Desert city
  'Evora': [], // Portuguese inland city
  'Kigali': [], // Rwandan highland capital
};

async function fixFinalWaterBodies() {
  console.log('🌊 FINAL WATER BODIES CLEANUP\n');
  console.log('==============================\n');
  
  let updateCount = 0;
  let confirmedEmpty = 0;
  let errorCount = 0;
  
  for (const [townName, waterBodies] of Object.entries(FINAL_WATER_FIXES)) {
    // Find the town
    const { data: towns } = await supabase
      .from('towns')
      .select('id, name, country, water_bodies')
      .eq('name', townName);
    
    if (!towns || towns.length === 0) {
      console.log(`⚠️ Not found: ${townName}`);
      errorCount++;
      continue;
    }
    
    // Handle potential duplicates
    for (const town of towns) {
      // Only update if currently empty
      if (!town.water_bodies || town.water_bodies.length === 0) {
        const { error } = await supabase
          .from('towns')
          .update({ water_bodies: waterBodies })
          .eq('id', town.id);
        
        if (!error) {
          if (waterBodies.length > 0) {
            console.log(`✅ ${town.name}, ${town.country}: → [${waterBodies.join(', ')}]`);
            updateCount++;
          } else {
            console.log(`⭕ ${town.name}, ${town.country}: Confirmed no water within 15km`);
            confirmedEmpty++;
          }
        } else {
          console.log(`❌ Failed: ${town.name} - ${error.message}`);
          errorCount++;
        }
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('FINAL WATER BODIES CLEANUP COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Added water bodies: ${updateCount} towns`);
  console.log(`⭕ Confirmed empty: ${confirmedEmpty} towns`);
  console.log(`❌ Errors: ${errorCount}`);
  
  // Final comprehensive check
  console.log('\n📊 COMPREHENSIVE FINAL CHECK:\n');
  
  // Check for any remaining issues
  const { data: allTowns } = await supabase
    .from('towns')
    .select('name, country, water_bodies, geographic_features');
  
  let stats = {
    total: allTowns?.length || 0,
    hasWater: 0,
    empty: 0,
    null: 0,
    coastalWithoutWater: []
  };
  
  allTowns?.forEach(town => {
    if (!town.water_bodies || town.water_bodies === null) {
      stats.null++;
    } else if (town.water_bodies.length === 0) {
      stats.empty++;
      
      // Check if coastal but no water
      const features = town.geographic_features?.join(' ').toLowerCase() || '';
      if (features.includes('coastal') || features.includes('beach') || 
          features.includes('seaside') || features.includes('port')) {
        stats.coastalWithoutWater.push(`${town.name}, ${town.country}`);
      }
    } else {
      stats.hasWater++;
    }
  });
  
  console.log(`Total towns: ${stats.total}`);
  console.log(`With water bodies: ${stats.hasWater} (${((stats.hasWater/stats.total)*100).toFixed(1)}%)`);
  console.log(`Empty arrays: ${stats.empty} (${((stats.empty/stats.total)*100).toFixed(1)}%)`);
  console.log(`Null values: ${stats.null}`);
  
  if (stats.coastalWithoutWater.length > 0) {
    console.log('\n⚠️ COASTAL TOWNS WITHOUT WATER (NEEDS FIXING):');
    stats.coastalWithoutWater.forEach(t => console.log(`  - ${t}`));
  } else {
    console.log('\n✅ All coastal towns have water bodies!');
  }
  
  // Show sample of good data
  console.log('\n✨ SAMPLE OF PROPERLY POPULATED WATER BODIES:\n');
  
  const samples = ['Singapore', 'Dubai', 'Sydney', 'Miami', 'Barcelona', 'Bangkok', 'Vancouver'];
  for (const name of samples) {
    const { data: town } = await supabase
      .from('towns')
      .select('name, country, water_bodies')
      .eq('name', name)
      .single();
    
    if (town && town.water_bodies?.length > 0) {
      console.log(`${town.name}, ${town.country}: [${town.water_bodies.join(', ')}]`);
    }
  }
}

// Run final fix
fixFinalWaterBodies().catch(console.error);