import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function updateBubaqueHealthcare() {
  console.log('🏥 UPDATING BUBAQUE HOSPITAL COUNT\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Step 1: Get current data
  console.log('Step 1: Fetching current Bubaque data...');
  const { data: currentData, error: fetchError } = await supabase
    .from('towns')
    .select('id, name, hospital_count')
    .ilike('name', 'Bubaque')
    .single();

  if (fetchError) {
    console.log('❌ Error fetching Bubaque:', fetchError.message);
    return;
  }

  console.log('✅ Current hospital count:', currentData.hospital_count);
  console.log('\n');

  // Step 2: Update hospital count
  console.log('Step 2: Updating hospital count from 0 to 1...');

  const { data: updatedData, error: updateError } = await supabase
    .from('towns')
    .update({ hospital_count: 1 })
    .eq('id', currentData.id)
    .select('id, name, hospital_count')
    .single();

  if (updateError) {
    console.log('❌ Error updating:', updateError.message);
    console.log('   Code:', updateError.code);
    console.log('   Details:', updateError.details);
    return;
  }

  console.log('✅ Successfully updated!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('NEW DATA:');
  console.log('  Name:', updatedData.name);
  console.log('  Hospital count:', updatedData.hospital_count);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('🎉 Done! Refresh the page to see "Hospitals: 1"');
}

updateBubaqueHealthcare().catch(console.error);
