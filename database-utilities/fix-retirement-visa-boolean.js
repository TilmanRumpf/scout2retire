/**
 * Fix retirement_visa_available boolean to match visa_requirements text
 * CRITICAL: 340 towns have false but text says "retirement visa available"
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function fixRetirementVisaBoolean() {
  console.log('🛂 Fixing retirement_visa_available boolean field...\n');
  
  // Get all towns
  const { data: towns, error } = await supabase
    .from('towns')
    .select('id, name, visa_requirements, retirement_visa_available');
  
  if (error) {
    console.error('❌ Error fetching towns:', error);
    return;
  }
  
  let toUpdate = [];
  let alreadyCorrect = 0;
  
  towns.forEach(town => {
    const textSaysRetirement = town.visa_requirements?.toLowerCase().includes('retirement visa available');
    const booleanSaysRetirement = town.retirement_visa_available === true;
    
    if (textSaysRetirement && !booleanSaysRetirement) {
      toUpdate.push(town);
    } else if (textSaysRetirement && booleanSaysRetirement) {
      alreadyCorrect++;
    }
  });
  
  console.log(`Found ${toUpdate.length} towns needing update`);
  console.log(`${alreadyCorrect} towns already correct\n`);
  
  if (toUpdate.length === 0) {
    console.log('✅ No updates needed!');
    return;
  }
  
  // Show sample of what will be updated
  console.log('Sample of towns to update:');
  toUpdate.slice(0, 3).forEach(t => {
    console.log(`  ${t.name}: "${t.visa_requirements?.substring(0, 50)}..."`);
  });
  console.log();
  
  // Update all mismatched towns
  let successCount = 0;
  let errorCount = 0;
  
  for (const town of toUpdate) {
    const { error: updateError } = await supabase
      .from('towns')
      .update({ retirement_visa_available: true })
      .eq('id', town.id);
    
    if (updateError) {
      console.error(`❌ Error updating ${town.name}:`, updateError);
      errorCount++;
    } else {
      successCount++;
      if (successCount % 50 === 0) {
        console.log(`  Progress: ${successCount}/${toUpdate.length} updated...`);
      }
    }
  }
  
  console.log('\n📊 Results:');
  console.log(`✅ Successfully updated: ${successCount} towns`);
  if (errorCount > 0) {
    console.log(`❌ Errors: ${errorCount} towns`);
  }
  
  // Verify the fix
  const { data: verification } = await supabase
    .from('towns')
    .select('visa_requirements, retirement_visa_available');
  
  let stillMismatched = 0;
  verification?.forEach(t => {
    const textSaysRetirement = t.visa_requirements?.toLowerCase().includes('retirement visa available');
    const booleanSaysRetirement = t.retirement_visa_available === true;
    
    if (textSaysRetirement && !booleanSaysRetirement) {
      stillMismatched++;
    }
  });
  
  if (stillMismatched === 0) {
    console.log('\n✅ VERIFICATION: All retirement visa booleans now match the text!');
  } else {
    console.log(`\n⚠️ VERIFICATION: ${stillMismatched} towns still have mismatches`);
  }
}

fixRetirementVisaBoolean();