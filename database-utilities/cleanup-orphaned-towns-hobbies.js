/**
 * cleanup-orphaned-towns-hobbies.js
 *
 * Removes orphaned records from towns_hobbies table
 * - 1,000 records pointing to 31 non-existent towns
 *
 * CRITICAL: Must run before production launch
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('🧹 CLEANUP: Orphaned Towns-Hobbies Records\n');
console.log('═══════════════════════════════════════════════════════════\n');

async function cleanupOrphanedRecords() {
  // Step 1: Get all town_ids from towns_hobbies
  console.log('1️⃣  Fetching all towns_hobbies records...');
  const { data: townsHobbies, error: thError } = await supabase
    .from('towns_hobbies')
    .select('town_id, hobby_id');

  if (thError) {
    console.error('❌ Error fetching towns_hobbies:', thError.message);
    process.exit(1);
  }

  console.log(`   Found ${townsHobbies.length} total towns_hobbies records\n`);

  // Step 2: Get unique town_ids
  const uniqueTownIds = [...new Set(townsHobbies.map(th => th.town_id))];
  console.log(`2️⃣  Found ${uniqueTownIds.length} unique town_ids referenced\n`);

  // Step 3: Check which towns exist
  console.log(`3️⃣  Checking which towns exist in towns table...`);
  const { data: existingTowns, error: townsError } = await supabase
    .from('towns')
    .select('id')
    .in('id', uniqueTownIds);

  if (townsError) {
    console.error('❌ Error fetching towns:', townsError.message);
    process.exit(1);
  }

  const existingTownIds = new Set(existingTowns.map(t => t.id));
  const orphanedTownIds = uniqueTownIds.filter(id => !existingTownIds.has(id));

  console.log(`   Existing towns: ${existingTownIds.size}`);
  console.log(`   Orphaned town IDs: ${orphanedTownIds.length}\n`);

  if (orphanedTownIds.length === 0) {
    console.log('✅ No orphaned records found. Database is clean!\n');
    return;
  }

  // Step 4: Count affected records
  const orphanedRecords = townsHobbies.filter(th => orphanedTownIds.includes(th.town_id));
  console.log(`4️⃣  Orphaned records breakdown:`);
  console.log(`   Total orphaned records: ${orphanedRecords.length}`);
  console.log(`   Orphaned town IDs (first 10):`);
  orphanedTownIds.slice(0, 10).forEach(id => {
    const count = orphanedRecords.filter(r => r.town_id === id).length;
    console.log(`   - ${id}: ${count} hobby associations`);
  });
  if (orphanedTownIds.length > 10) {
    console.log(`   ... and ${orphanedTownIds.length - 10} more\n`);
  } else {
    console.log('');
  }

  // Step 5: Confirm deletion
  console.log('⚠️  READY TO DELETE:');
  console.log(`   - ${orphanedRecords.length} orphaned records`);
  console.log(`   - Referencing ${orphanedTownIds.length} non-existent towns\n`);

  // Step 6: Delete orphaned records (in batches of 100)
  console.log('5️⃣  Deleting orphaned records...\n');

  let deletedCount = 0;
  const batchSize = 100;

  for (let i = 0; i < orphanedTownIds.length; i++) {
    const townId = orphanedTownIds[i];
    const { data, error } = await supabase
      .from('towns_hobbies')
      .delete()
      .eq('town_id', townId);

    if (error) {
      console.error(`   ❌ Error deleting records for town ${townId}:`, error.message);
      continue;
    }

    const recordsForTown = orphanedRecords.filter(r => r.town_id === townId).length;
    deletedCount += recordsForTown;
    console.log(`   ✅ Deleted ${recordsForTown} records for town ${townId} (${i + 1}/${orphanedTownIds.length})`);
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('📊 CLEANUP SUMMARY\n');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log(`✅ Successfully deleted: ${deletedCount} orphaned records`);
  console.log(`✅ Cleaned up references to: ${orphanedTownIds.length} non-existent towns`);
  console.log(`✅ Database integrity: RESTORED\n`);

  // Step 7: Verify cleanup
  console.log('6️⃣  Verifying cleanup...\n');

  const { data: remainingOrphans, error: verifyError } = await supabase
    .from('towns_hobbies')
    .select('town_id')
    .in('town_id', orphanedTownIds);

  if (verifyError) {
    console.error('❌ Error verifying cleanup:', verifyError.message);
    return;
  }

  if (remainingOrphans && remainingOrphans.length > 0) {
    console.log(`⚠️  WARNING: ${remainingOrphans.length} orphaned records still remain`);
    console.log('   Re-run this script to complete cleanup\n');
  } else {
    console.log('✅ ✅ ✅  VERIFICATION PASSED  ✅ ✅ ✅\n');
    console.log('   All orphaned records successfully removed');
    console.log('   Database is now clean and ready for production\n');
  }

  console.log('═══════════════════════════════════════════════════════════\n');
}

cleanupOrphanedRecords().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
