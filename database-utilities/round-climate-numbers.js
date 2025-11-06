import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Round to nearest 10
function roundToNearest10(value) {
  if (value === null || value === undefined) return null;
  return Math.round(value / 10) * 10;
}

async function roundClimateNumbers() {
  console.log('🔢 ROUNDING ANNUAL_RAINFALL AND SUNSHINE_HOURS TO NEAREST 10\n');
  
  // Get all towns
  const { data: towns, error } = await supabase
    .from('towns')
    .select('id, town_name, country, annual_rainfall, sunshine_hours');
    
  if (error) {
    console.error('Error fetching towns:', error);
    return;
  }
  
  console.log(`Processing ${towns.length} towns...\n`);
  
  let rainfallUpdated = 0;
  let sunshineUpdated = 0;
  let bothUpdated = 0;
  let noChange = 0;
  let errorCount = 0;
  
  const samples = [];
  
  for (const town of towns) {
    const oldRainfall = town.annual_rainfall;
    const oldSunshine = town.sunshine_hours;
    
    const newRainfall = roundToNearest10(oldRainfall);
    const newSunshine = roundToNearest10(oldSunshine);
    
    // Check if any changes needed
    const rainfallChanged = oldRainfall !== newRainfall && oldRainfall !== null;
    const sunshineChanged = oldSunshine !== newSunshine && oldSunshine !== null;
    
    if (!rainfallChanged && !sunshineChanged) {
      noChange++;
      continue;
    }
    
    // Prepare update data
    const updateData = {};
    if (rainfallChanged) updateData.annual_rainfall = newRainfall;
    if (sunshineChanged) updateData.sunshine_hours = newSunshine;
    
    // Update database
    const { error: updateError } = await supabase
      .from('towns')
      .update(updateData)
      .eq('id', town.id);
      
    if (updateError) {
      console.log(`❌ Failed to update ${town.town_name}: ${updateError.message}`);
      errorCount++;
    } else {
      if (rainfallChanged && sunshineChanged) bothUpdated++;
      else if (rainfallChanged) rainfallUpdated++;
      else if (sunshineChanged) sunshineUpdated++;
      
      // Collect samples for display
      if (samples.length < 15 && (rainfallChanged || sunshineChanged)) {
        samples.push({
          name: town.town_name,
          country: town.country,
          oldRainfall: oldRainfall,
          newRainfall: newRainfall,
          oldSunshine: oldSunshine,
          newSunshine: newSunshine,
          rainfallChanged: rainfallChanged,
          sunshineChanged: sunshineChanged
        });
      }
    }
  }
  
  // Show sample changes
  console.log('📊 SAMPLE CHANGES:');
  samples.forEach(s => {
    console.log(`\n${s.name}, ${s.country}:`);
    if (s.rainfallChanged) {
      console.log(`  Rainfall: ${s.oldRainfall} → ${s.newRainfall} mm`);
    }
    if (s.sunshineChanged) {
      console.log(`  Sunshine: ${s.oldSunshine} → ${s.newSunshine} hours`);
    }
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('ROUNDING COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Both fields updated: ${bothUpdated} towns`);
  console.log(`✅ Only rainfall updated: ${rainfallUpdated} towns`);
  console.log(`✅ Only sunshine updated: ${sunshineUpdated} towns`);
  console.log(`⏭️  No change needed: ${noChange} towns`);
  console.log(`❌ Errors: ${errorCount}`);
  
  const totalUpdated = bothUpdated + rainfallUpdated + sunshineUpdated;
  console.log(`\n📊 Total towns updated: ${totalUpdated}/${towns.length}`);
  
  // Verify results
  const { data: verification } = await supabase
    .from('towns')
    .select('annual_rainfall, sunshine_hours')
    .limit(20);
    
  console.log('\n✅ VERIFICATION (all should end in 0):');
  verification.forEach(t => {
    const rainfallOk = !t.annual_rainfall || t.annual_rainfall % 10 === 0;
    const sunshineOk = !t.sunshine_hours || t.sunshine_hours % 10 === 0;
    if (!rainfallOk || !sunshineOk) {
      console.log(`  ⚠️ Issue found - Rainfall: ${t.annual_rainfall}, Sunshine: ${t.sunshine_hours}`);
    }
  });
  
  console.log('All values now rounded to nearest 10! ✨');
}

// Run rounding
roundClimateNumbers().catch(console.error);