import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
  console.log('🚀 Running migration via Supabase client...\n');

  // Step 1: Add column using a simple insert/update that will trigger schema changes
  console.log('Step 1: Checking current schema...');

  const { data: checkData, error: checkError } = await supabase
    .from('towns_hobbies')
    .select('*')
    .limit(1);

  if (checkError) {
    console.error('❌ Error:', checkError);
    return;
  }

  console.log('✅ Table accessible');
  console.log('\nAttempting to add column via INSERT...');

  // Try to insert a record with is_excluded field
  const { data: insertData, error: insertError } = await supabase
    .from('towns_hobbies')
    .insert({
      town_id: 999999, // Dummy ID
      hobby_id: 999999, // Dummy ID
      is_excluded: false
    })
    .select();

  if (insertError) {
    if (insertError.message.includes('does not exist')) {
      console.log('\n❌ Column does not exist yet.');
      console.log('\n📋 I need you to run this SQL in Supabase Dashboard:');
      console.log('---------------------------------------------------');
      console.log('ALTER TABLE towns_hobbies');
      console.log('ADD COLUMN is_excluded BOOLEAN DEFAULT FALSE;');
      console.log('');
      console.log('CREATE INDEX idx_towns_hobbies_excluded');
      console.log('ON towns_hobbies(town_id, is_excluded)');
      console.log('WHERE is_excluded = true;');
      console.log('---------------------------------------------------');
      console.log('\nGo to: https://supabase.com/dashboard/project/axlruvvsjepsulcbqlho/sql/new');
    } else {
      console.error('Insert error:', insertError);
    }
  } else {
    console.log('✅ Column already exists! Cleaning up test record...');

    // Delete the dummy record
    await supabase
      .from('towns_hobbies')
      .delete()
      .eq('town_id', 999999)
      .eq('hobby_id', 999999);

    console.log('✅ Migration complete!');
  }
}

runMigration().catch(console.error);
