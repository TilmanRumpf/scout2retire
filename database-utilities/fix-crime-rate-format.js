import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Convert numeric crime rate to verbose description
function convertToVerbose(crimeRate, townName, country) {
  const rate = parseFloat(crimeRate);
  
  if (isNaN(rate)) {
    // Already verbose, return as is
    return crimeRate;
  }
  
  // Crime rate is per 100,000 people
  // Based on international standards:
  // < 500 = Very Low
  // 500-1000 = Low  
  // 1000-2000 = Low to Moderate
  // 2000-3000 = Moderate
  // 3000-5000 = Moderate to High
  // > 5000 = High
  
  if (rate < 500) {
    return "Very Low - One of the safest destinations with minimal crime";
  } else if (rate < 1000) {
    return "Low - Generally safe with occasional petty crime";
  } else if (rate < 1500) {
    return "Low to Moderate - Safe for retirees with standard precautions";
  } else if (rate < 2000) {
    return "Low to Moderate - Generally safe, some property crime exists";
  } else if (rate < 2500) {
    return "Moderate - Average safety, stay aware in tourist areas";
  } else if (rate < 3000) {
    return "Moderate - Some crime exists, choose neighborhoods carefully";
  } else if (rate < 4000) {
    return "Moderate to High - Research safe neighborhoods before moving";
  } else if (rate < 5000) {
    return "Moderate to High - Crime is a concern, security measures recommended";
  } else {
    return "High - Significant crime rates, thorough research essential";
  }
}

async function fixCrimeRates() {
  console.log('🔧 FIXING CRIME RATE FORMAT CHAOS\n');
  console.log('Converting numeric rates to verbose descriptions...\n');
  
  // Get all towns with numeric crime rates
  const { data: towns, error } = await supabase
    .from('towns')
    .select('id, name, country, crime_rate')
    .not('crime_rate', 'is', null);
    
  if (error) {
    console.error('Error fetching towns:', error);
    return;
  }
  
  let updated = 0;
  let alreadyVerbose = 0;
  let errors = 0;
  
  console.log(`Found ${towns.length} towns with crime rate data\n`);
  
  for (const town of towns) {
    // Check if it's numeric
    if (/^[0-9.]+$/.test(town.crime_rate)) {
      const verboseDescription = convertToVerbose(
        town.crime_rate, 
        town.name, 
        town.country
      );
      
      console.log(`📝 ${town.name}, ${town.country}:`);
      console.log(`   ${town.crime_rate} → "${verboseDescription}"`);
      
      // Update in database
      const { error: updateError } = await supabase
        .from('towns')
        .update({ crime_rate: verboseDescription })
        .eq('id', town.id);
        
      if (updateError) {
        console.log(`   ❌ Update failed: ${updateError.message}`);
        errors++;
      } else {
        console.log(`   ✅ Updated successfully`);
        updated++;
      }
    } else {
      // Already verbose
      alreadyVerbose++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('CRIME RATE FORMAT FIX COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Converted to verbose: ${updated} towns`);
  console.log(`📝 Already verbose: ${alreadyVerbose} towns`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`⚠️  Still NULL: ${342 - towns.length} towns`);
  
  // Show sample of results
  console.log('\nVERIFYING RESULTS...\n');
  
  const { data: samples } = await supabase
    .from('towns')
    .select('name, country, crime_rate')
    .not('crime_rate', 'is', null)
    .limit(10);
    
  console.log('Sample of updated crime rates:');
  samples.forEach(t => {
    console.log(`  ${t.name}: "${t.crime_rate}"`);
  });
}

// Run the fix
fixCrimeRates().catch(console.error);