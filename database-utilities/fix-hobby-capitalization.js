/**
 * Fix all hobby names to use proper Title Case
 * This fixes the case sensitivity issues that cause matching failures
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

// Convert string to Title Case
function toTitleCase(str) {
  return str.split(' ')
    .map(word => {
      // Handle special cases like "&"
      if (word === '&') return '&';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

async function fixHobbyCapitalization() {
  console.log('🔧 Fixing hobby capitalization issues...\n');
  
  // Step 1: Get all hobbies
  console.log('Step 1: Fetching all hobbies...');
  const { data: hobbies, error: fetchError } = await supabase
    .from('hobbies')
    .select('id, name')
    .order('name');
  
  if (fetchError) {
    console.error('❌ Error fetching hobbies:', fetchError);
    return;
  }
  
  console.log(`Found ${hobbies.length} total hobbies\n`);
  
  // Step 2: Find hobbies that need fixing
  console.log('Step 2: Identifying hobbies with incorrect capitalization...');
  const needsFix = [];
  
  hobbies.forEach(hobby => {
    const correctName = toTitleCase(hobby.name);
    if (hobby.name !== correctName) {
      needsFix.push({
        id: hobby.id,
        current: hobby.name,
        corrected: correctName
      });
    }
  });
  
  console.log(`Found ${needsFix.length} hobbies that need fixing:\n`);
  
  // Show first 10 examples
  needsFix.slice(0, 10).forEach(h => {
    console.log(`  "${h.current}" → "${h.corrected}"`);
  });
  
  if (needsFix.length > 10) {
    console.log(`  ... and ${needsFix.length - 10} more`);
  }
  
  // Step 3: Fix each hobby
  console.log('\nStep 3: Updating hobby names to Title Case...');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const hobby of needsFix) {
    const { error: updateError } = await supabase
      .from('hobbies')
      .update({ name: hobby.corrected })
      .eq('id', hobby.id);
    
    if (updateError) {
      console.error(`❌ Failed to update "${hobby.current}":`, updateError.message);
      errorCount++;
    } else {
      successCount++;
      if (successCount % 10 === 0) {
        console.log(`  Updated ${successCount}/${needsFix.length}...`);
      }
    }
  }
  
  console.log(`\n✅ Successfully updated ${successCount} hobbies`);
  if (errorCount > 0) {
    console.log(`❌ Failed to update ${errorCount} hobbies`);
  }
  
  // Step 4: Handle duplicates
  console.log('\nStep 4: Checking for duplicates...');
  
  // Check for "Birdwatching" vs "Bird Watching"
  const { data: birdwatching } = await supabase
    .from('hobbies')
    .select('id, name')
    .in('name', ['Birdwatching', 'Bird Watching']);
  
  if (birdwatching && birdwatching.length > 1) {
    console.log('Found duplicate: "Birdwatching" and "Bird Watching"');
    
    // Keep "Birdwatching" (without space), delete "Bird Watching"
    const toDelete = birdwatching.find(h => h.name === 'Bird Watching');
    if (toDelete) {
      const { error: deleteError } = await supabase
        .from('hobbies')
        .delete()
        .eq('id', toDelete.id);
      
      if (deleteError) {
        console.error('❌ Failed to delete duplicate:', deleteError);
      } else {
        console.log('✅ Deleted duplicate "Bird Watching"');
      }
    }
  }
  
  // Step 5: Final verification
  console.log('\nStep 5: Final verification...');
  
  const { data: finalCheck, error: finalError } = await supabase
    .from('hobbies')
    .select('name')
    .order('name');
  
  if (finalError) {
    console.error('❌ Error in final check:', finalError);
    return;
  }
  
  // Check if any still have bad capitalization
  const stillBad = finalCheck.filter(h => h.name !== toTitleCase(h.name));
  
  if (stillBad.length === 0) {
    console.log('✅ SUCCESS: All hobbies now use proper Title Case!');
  } else {
    console.log(`⚠️  Warning: ${stillBad.length} hobbies still have capitalization issues:`);
    stillBad.forEach(h => console.log(`  - "${h.name}"`));
  }
  
  console.log('\n🎯 Summary:');
  console.log(`  - Total hobbies: ${hobbies.length}`);
  console.log(`  - Fixed: ${successCount}`);
  console.log(`  - Errors: ${errorCount}`);
  console.log(`  - Remaining issues: ${stillBad.length}`);
}

// Run the fix
fixHobbyCapitalization();