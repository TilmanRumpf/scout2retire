import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Round to nearest 100
function roundToNearest100(value) {
  if (value === null || value === undefined) return null;
  return Math.round(value / 100) * 100;
}

async function roundPopulation() {
  console.log('👥 ROUNDING POPULATION TO NEAREST 100\n');
  
  // Get all towns
  const { data: towns, error } = await supabase
    .from('towns')
    .select('id, town_name, country, population');
    
  if (error) {
    console.error('Error fetching towns:', error);
    return;
  }
  
  console.log(`Processing ${towns.length} towns...\n`);
  
  let updated = 0;
  let noChange = 0;
  let noPopulation = 0;
  let errorCount = 0;
  
  const samples = [];
  
  for (const town of towns) {
    const oldPopulation = town.population;
    
    // Skip if no population data
    if (oldPopulation === null || oldPopulation === undefined) {
      noPopulation++;
      continue;
    }
    
    const newPopulation = roundToNearest100(oldPopulation);
    
    // Check if any change needed
    if (oldPopulation === newPopulation) {
      noChange++;
      continue;
    }
    
    // Update database
    const { error: updateError } = await supabase
      .from('towns')
      .update({ population: newPopulation })
      .eq('id', town.id);
      
    if (updateError) {
      console.log(`❌ Failed to update ${town.town_name}: ${updateError.message}`);
      errorCount++;
    } else {
      updated++;
      
      // Collect samples for display
      if (samples.length < 15) {
        samples.push({
          name: town.town_name,
          country: town.country,
          oldPopulation: oldPopulation,
          newPopulation: newPopulation,
          difference: newPopulation - oldPopulation
        });
      }
    }
  }
  
  // Show sample changes
  console.log('📊 SAMPLE CHANGES:');
  samples.forEach(s => {
    const sign = s.difference >= 0 ? '+' : '';
    console.log(`  ${s.name}, ${s.country}: ${s.oldPopulation.toLocaleString()} → ${s.newPopulation.toLocaleString()} (${sign}${s.difference})`);
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('POPULATION ROUNDING COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Updated: ${updated} towns`);
  console.log(`⏭️  No change needed: ${noChange} towns`);
  console.log(`⚠️  No population data: ${noPopulation} towns`);
  console.log(`❌ Errors: ${errorCount}`);
  
  const totalProcessed = updated + noChange;
  console.log(`\n📊 Total processed: ${totalProcessed}/${towns.length - noPopulation} towns with data`);
  
  // Verify results
  const { data: verification } = await supabase
    .from('towns')
    .select('population')
    .not('population', 'is', null)
    .limit(20);
    
  console.log('\n✅ VERIFICATION (all should end in 00):');
  let issueCount = 0;
  verification.forEach(t => {
    if (t.population % 100 !== 0) {
      console.log(`  ⚠️ Issue found - Population: ${t.population}`);
      issueCount++;
    }
  });
  
  if (issueCount === 0) {
    console.log('  All sampled values correctly rounded to nearest 100! ✨');
  }
}

// Run rounding
roundPopulation().catch(console.error);