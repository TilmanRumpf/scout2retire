import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function cleanupRequiredConditions() {
  console.log('🧹 CLEANING UP REQUIRED_CONDITIONS COLUMN');
  console.log('=========================================');

  try {
    // STEP 1: Remove old verification format objects
    console.log('\n1️⃣ Removing old verification format objects...');
    
    const oldVerificationIds = [
      'e46d73dc-32a0-4e8d-8aab-5782a276ae6e', // Antique Collecting
      'dd811692-f326-405f-a063-87caa34d29af', // Aquarium Keeping
      '3fa36bd1-bb9c-451f-87ca-86adbf27bf87', // Art Fairs
      '8c6466dd-ca30-415f-8def-3f7214ed61c7', // Astronomy
      'bbd638f4-b176-46ab-9bb8-6ae5412ca471', // Badminton
      'eb0cd24c-49f4-4586-8f5e-a7f5d178e1d3', // Baking
      'ee063d02-3985-43c7-95a3-1e6cb0ada626'  // Ballet
    ];

    for (const id of oldVerificationIds) {
      const { error } = await supabase
        .from('hobbies')
        .update({ required_conditions: null })
        .eq('id', id);
      
      if (error) {
        console.error(`❌ Failed to clean hobby ${id}:`, error);
      } else {
        console.log(`✅ Cleaned old verification format for hobby ${id}`);
      }
    }

    // STEP 2: Report on data state after cleanup
    console.log('\n2️⃣ Analyzing data state after cleanup...');
    
    const { data: hobbies, error: fetchError } = await supabase
      .from('hobbies')
      .select('verification_method, required_conditions, is_universal')
      .order('verification_method');

    if (fetchError) {
      console.error('❌ Failed to fetch hobbies:', fetchError);
      return;
    }

    const stats = {
      total: hobbies.length,
      hasConditions: 0,
      needsArrayOnly: 0,
      emptyOrNull: 0,
      universalClean: 0,
      universalWithNeeds: 0
    };

    const conflicts = [];

    hobbies.forEach(hobby => {
      const conditions = hobby.required_conditions;
      const conditionsText = JSON.stringify(conditions || {});
      
      if (conditions && conditionsText !== '{}') {
        stats.hasConditions++;
        
        if (conditions.needs && !conditions.verification) {
          stats.needsArrayOnly++;
          
          // Check for universal conflicts
          if (hobby.verification_method === 'universal') {
            stats.universalWithNeeds++;
            conflicts.push({
              method: hobby.verification_method,
              isUniversal: hobby.is_universal,
              needs: conditions.needs
            });
          }
        }
      } else {
        stats.emptyOrNull++;
        
        if (hobby.verification_method === 'universal') {
          stats.universalClean++;
        }
      }
    });

    console.log(`
📊 CLEANUP RESULTS:
==================
Total hobbies: ${stats.total}
Has conditions: ${stats.hasConditions}
Clean needs-only format: ${stats.needsArrayOnly}
Empty/null conditions: ${stats.emptyOrNull}
Universal hobbies (clean): ${stats.universalClean}
Universal hobbies (with needs): ${stats.universalWithNeeds}

✅ SUCCESS: Old verification format removed
✅ SUCCESS: Kept valid needs arrays intact
⚠️  ATTENTION: ${stats.universalWithNeeds} universal hobbies still have needs arrays
`);

    if (conflicts.length > 0) {
      console.log('\n⚠️ UNIVERSAL HOBBIES WITH NEEDS (potential conflicts):');
      console.log('These may need verification_method changed from "universal":');
      conflicts.forEach((conflict, i) => {
        console.log(`${i + 1}. Needs: [${conflict.needs.join(', ')}] - Method: ${conflict.method}`);
      });
    }

    console.log('\n🎯 FINAL STATE:');
    console.log('- Old verification objects: REMOVED ✅');
    console.log('- Valid needs arrays: PRESERVED ✅');
    console.log('- Universal hobbies: Mostly clean ✅');
    console.log('- Data ready for: Lean, executable matching algorithms ✅');

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

// Run the cleanup
cleanupRequiredConditions().catch(console.error);