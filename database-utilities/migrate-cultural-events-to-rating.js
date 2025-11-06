/**
 * Migrate cultural_events_level to cultural_events_rating
 * 283 towns need migration (have _level but not _rating)
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function migrateCulturalEvents() {
  console.log('🎭 Starting cultural_events migration...\n');
  
  // First, check current state
  const { data: needsMigration, error: fetchError } = await supabase
    .from('towns')
    .select('id, town_name, cultural_events_level, cultural_events_rating')
    .not('cultural_events_level', 'is', null)
    .is('cultural_events_rating', null);
  
  if (fetchError) {
    console.error('❌ Error fetching data:', fetchError);
    return;
  }
  
  console.log(`Found ${needsMigration.length} towns needing migration\n`);
  
  if (needsMigration.length === 0) {
    console.log('✅ No migration needed!');
    return;
  }
  
  // Show sample of data to be migrated
  console.log('Sample of data to be migrated:');
  needsMigration.slice(0, 5).forEach(town => {
    console.log(`  ${town.town_name}: cultural_events_level = ${town.cultural_events_level}`);
  });
  console.log();
  
  // Perform migration - copy cultural_events_level to cultural_events_rating
  let successCount = 0;
  let errorCount = 0;
  
  for (const town of needsMigration) {
    const { error: updateError } = await supabase
      .from('towns')
      .update({ cultural_events_rating: town.cultural_events_level })
      .eq('id', town.id);
    
    if (updateError) {
      console.error(`❌ Error updating ${town.town_name}:`, updateError);
      errorCount++;
    } else {
      successCount++;
      if (successCount % 50 === 0) {
        console.log(`  Progress: ${successCount}/${needsMigration.length} migrated...`);
      }
    }
  }
  
  console.log('\n📊 Migration Results:');
  console.log(`✅ Successfully migrated: ${successCount} towns`);
  if (errorCount > 0) {
    console.log(`❌ Errors: ${errorCount} towns`);
  }
  
  // Verify final state
  const { data: finalCheck } = await supabase
    .from('towns')
    .select('id')
    .not('cultural_events_rating', 'is', null);
  
  console.log(`\n🔍 Final verification: ${finalCheck?.length || 0} towns now have cultural_events_rating`);
  console.log('   (Should be 341 if all migrations successful)');
}

migrateCulturalEvents();