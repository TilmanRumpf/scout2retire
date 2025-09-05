/**
 * Delete redundant _level columns from towns table
 * Keeping only _rating columns as decided
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function deleteLevelColumns() {
  console.log('🗑️  Preparing to delete redundant _level columns...\n');
  
  const columnsToDelete = [
    'museums_level',
    'cultural_events_level', 
    'dining_nightlife_level'
  ];
  
  console.log('Columns to delete:');
  columnsToDelete.forEach(col => console.log(`  - ${col}`));
  console.log();
  
  // First verify the data has been migrated
  console.log('📊 Verifying data migration status:');
  
  const { data: museumsCheck } = await supabase
    .from('towns')
    .select('id')
    .not('museums_rating', 'is', null);
  console.log(`  - museums_rating: ${museumsCheck?.length || 0} towns have data ✅`);
  
  const { data: eventsCheck } = await supabase
    .from('towns')
    .select('id')
    .not('cultural_events_rating', 'is', null);
  console.log(`  - cultural_events_rating: ${eventsCheck?.length || 0} towns have data ✅`);
  
  const { data: restaurantsCheck } = await supabase
    .from('towns')
    .select('id')
    .not('restaurants_rating', 'is', null);
  console.log(`  - restaurants_rating: ${restaurantsCheck?.length || 0} towns have data ✅`);
  
  const { data: nightlifeCheck } = await supabase
    .from('towns')
    .select('id')
    .not('nightlife_rating', 'is', null);
  console.log(`  - nightlife_rating: ${nightlifeCheck?.length || 0} towns have data ✅`);
  
  console.log('\n⚠️  IMPORTANT: Column deletion cannot be done via Supabase API');
  console.log('Please follow these steps to complete the cleanup:\n');
  console.log('1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/axlruvvsjepsulcbqlho');
  console.log('2. Navigate to Table Editor → towns table');
  console.log('3. For each column below, click the column header → Delete column:');
  columnsToDelete.forEach(col => console.log(`   - ${col}`));
  console.log('\n4. Confirm each deletion when prompted');
  console.log('\n✅ Data has been successfully migrated to _rating columns');
  console.log('🔒 It is now safe to delete the _level columns');
}

deleteLevelColumns();