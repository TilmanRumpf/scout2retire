import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixIncorrectCoastalFeatures() {
  console.log('🔧 FIXING INCORRECT COASTAL GEOGRAPHIC FEATURES\n');
  console.log('===============================================\n');
  
  // These towns are marked as coastal but are NOT
  const incorrectCoastal = [
    'Mérida', 'Merida',  // Inland Yucatan, 30km from coast
    'Escazú'  // San José suburb, mountain town
  ];
  
  // Check current features
  for (const townName of incorrectCoastal) {
    const { data: towns } = await supabase
      .from('towns')
      .select('id, name, country, geographic_features')
      .eq('name', townName);
    
    if (towns && towns.length > 0) {
      for (const town of towns) {
        console.log(`Current features for ${town.name}, ${town.country}:`);
        console.log(`  ${town.geographic_features?.join(', ') || 'null'}\n`);
        
        // Fix Mérida/Merida (Mexico)
        if (town.country === 'Mexico' && (town.name === 'Mérida' || town.name === 'Merida')) {
          const newFeatures = ['flat', 'tropical', 'colonial', 'inland'];
          const { error } = await supabase
            .from('towns')
            .update({ geographic_features: newFeatures })
            .eq('id', town.id);
          
          if (!error) {
            console.log(`✅ Fixed ${town.name}, Mexico: removed "coastal", now: [${newFeatures.join(', ')}]`);
          }
        }
        
        // Fix Escazú (Costa Rica)
        if (town.country === 'Costa Rica' && town.name === 'Escazú') {
          const newFeatures = ['mountainous', 'tropical', 'highland', 'suburban'];
          const { error } = await supabase
            .from('towns')
            .update({ geographic_features: newFeatures })
            .eq('id', town.id);
          
          if (!error) {
            console.log(`✅ Fixed ${town.name}, Costa Rica: removed "coastal", now: [${newFeatures.join(', ')}]`);
          }
        }
      }
    }
  }
  
  console.log('\n📊 FINAL WATER BODIES SUMMARY:\n');
  
  // Get final statistics
  const { data: allTowns } = await supabase
    .from('towns')
    .select('water_bodies');
  
  let hasWater = 0;
  let empty = 0;
  let totalWaterBodies = 0;
  
  allTowns?.forEach(town => {
    if (town.water_bodies && town.water_bodies.length > 0) {
      hasWater++;
      totalWaterBodies += town.water_bodies.length;
    } else {
      empty++;
    }
  });
  
  console.log(`Total towns: ${allTowns?.length || 0}`);
  console.log(`Towns with water bodies: ${hasWater} (${((hasWater/allTowns.length)*100).toFixed(1)}%)`);
  console.log(`Towns without water bodies: ${empty} (${((empty/allTowns.length)*100).toFixed(1)}%)`);
  console.log(`Average water bodies per town: ${(totalWaterBodies/hasWater).toFixed(1)}`);
  console.log(`Total unique water bodies: ${totalWaterBodies}`);
}

// Run fix
fixIncorrectCoastalFeatures().catch(console.error);