import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function installActivitiesTrigger() {
  console.log('🔧 INSTALLING ACTIVITIES AUTO-UPDATE TRIGGER\n');
  console.log('============================================\n');
  
  // Read the SQL file
  const triggerSQL = fs.readFileSync('./create-activities-trigger.sql', 'utf8');
  
  // Execute the SQL to create the trigger
  const { data, error } = await supabase.rpc('exec_sql', {
    sql_query: triggerSQL
  });
  
  if (error) {
    // If RPC doesn't exist, we need to use a different approach
    console.log('⚠️ Cannot execute SQL directly via RPC. Please run the following SQL in Supabase SQL Editor:\n');
    console.log('1. Go to: https://supabase.com/dashboard/project/axlruvvsjepsulcbqlho/sql/new');
    console.log('2. Copy and paste the contents of create-activities-trigger.sql');
    console.log('3. Click "Run"\n');
    
    // Test if we can at least update a town
    console.log('Testing if we can update towns...\n');
    await testTriggerFunctionality();
    
    return;
  }
  
  console.log('✅ Trigger installed successfully!\n');
  
  // Test the trigger
  await testTriggerFunctionality();
}

async function testTriggerFunctionality() {
  console.log('🧪 TESTING TRIGGER FUNCTIONALITY\n');
  console.log('================================\n');
  
  // Find a town to test with
  const { data: testTown, error: fetchError } = await supabase
    .from('towns')
    .select('id, name, country, golf_courses_count, activities_available')
    .eq('name', 'Bangkok')
    .eq('country', 'Thailand')
    .single();
  
  if (fetchError || !testTown) {
    console.error('Could not find test town:', fetchError);
    return;
  }
  
  console.log(`Test town: ${testTown.name}, ${testTown.country}`);
  console.log(`Current golf courses: ${testTown.golf_courses_count}`);
  console.log(`Has golf activity: ${testTown.activities_available?.includes('golf') ? 'YES' : 'NO'}\n`);
  
  // Test 1: Add a golf course
  console.log('TEST 1: Adding a golf course...');
  const { error: updateError1 } = await supabase
    .from('towns')
    .update({ golf_courses_count: 3 })
    .eq('id', testTown.id);
  
  if (updateError1) {
    console.error('Update failed:', updateError1);
    return;
  }
  
  // Check if activities updated
  const { data: updatedTown1 } = await supabase
    .from('towns')
    .select('golf_courses_count, activities_available')
    .eq('id', testTown.id)
    .single();
  
  console.log(`  Golf courses: ${updatedTown1.golf_courses_count}`);
  console.log(`  Has golf: ${updatedTown1.activities_available?.includes('golf') ? '✅ YES' : '❌ NO'}`);
  console.log(`  Has golf_variety: ${updatedTown1.activities_available?.includes('golf_variety') ? '✅ YES' : '❌ NO'}\n`);
  
  // Test 2: Remove golf courses
  console.log('TEST 2: Removing golf courses...');
  const { error: updateError2 } = await supabase
    .from('towns')
    .update({ golf_courses_count: 0 })
    .eq('id', testTown.id);
  
  if (updateError2) {
    console.error('Update failed:', updateError2);
    return;
  }
  
  // Check if activities updated
  const { data: updatedTown2 } = await supabase
    .from('towns')
    .select('golf_courses_count, activities_available')
    .eq('id', testTown.id)
    .single();
  
  console.log(`  Golf courses: ${updatedTown2.golf_courses_count}`);
  console.log(`  Has golf: ${updatedTown2.activities_available?.includes('golf') ? '❌ Still has golf!' : '✅ Golf removed'}`);
  console.log(`  Has golf_variety: ${updatedTown2.activities_available?.includes('golf_variety') ? '❌ Still has variety!' : '✅ Variety removed'}\n`);
  
  // Restore original value
  console.log('Restoring original value...');
  await supabase
    .from('towns')
    .update({ golf_courses_count: testTown.golf_courses_count })
    .eq('id', testTown.id);
  
  console.log('✅ Test complete!\n');
  
  // Show more examples
  console.log('📋 HOW THE TRIGGER WORKS:\n');
  console.log('When you update infrastructure columns, activities automatically update:');
  console.log('  - golf_courses_count: 0→1 adds "golf", 1→2 adds "golf_variety"');
  console.log('  - tennis_courts_count: 0→5 adds "tennis" + "pickleball"');
  console.log('  - beaches_nearby: false→true adds beach activities');
  console.log('  - marinas_count: 0→1 adds "sailing", "boating"');
  console.log('  - hiking_trails_km: 0→100 adds hiking activities');
  console.log('  - ski_resorts_within_100km: 0→1 adds winter sports');
  console.log('  - coworking_spaces_count: 0→1 adds digital nomad activities');
  console.log('  - dog_parks_count: 0→1 adds pet activities\n');
  
  console.log('The trigger ensures activities ALWAYS match infrastructure! 🎯');
}

// Run installation
installActivitiesTrigger().catch(console.error);