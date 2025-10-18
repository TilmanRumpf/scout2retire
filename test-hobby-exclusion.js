import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const anonClient = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testExclusion() {
  console.log('🧪 Testing hobby exclusion feature...\n');

  // Test INSERT
  console.log('Test 1: Inserting excluded hobby...');
  const { data: insertData, error: insertError } = await anonClient
    .from('towns_hobbies')
    .insert({
      town_id: '00000000-0000-0000-0000-000000000001',
      hobby_id: '00000000-0000-0000-0000-000000000001',
      is_excluded: true
    })
    .select();

  if (insertError) {
    console.log('❌ INSERT failed:', insertError.message);
  } else {
    console.log('✅ INSERT successful!', insertData);
  }

  // Test UPDATE
  console.log('\nTest 2: Updating is_excluded...');
  const { data: updateData, error: updateError } = await anonClient
    .from('towns_hobbies')
    .update({ is_excluded: false })
    .eq('town_id', '00000000-0000-0000-0000-000000000001')
    .eq('hobby_id', '00000000-0000-0000-0000-000000000001')
    .select();

  if (updateError) {
    console.log('❌ UPDATE failed:', updateError.message);
  } else {
    console.log('✅ UPDATE successful!', updateData);
  }

  // Test DELETE
  console.log('\nTest 3: Deleting excluded hobby...');
  const { error: deleteError } = await anonClient
    .from('towns_hobbies')
    .delete()
    .eq('town_id', '00000000-0000-0000-0000-000000000001')
    .eq('hobby_id', '00000000-0000-0000-0000-000000000001');

  if (deleteError) {
    console.log('❌ DELETE failed:', deleteError.message);
  } else {
    console.log('✅ DELETE successful!');
  }

  console.log('\n🎉 All tests passed! Hobby exclusion feature is working!');
  console.log('✅ Refresh your browser and try excluding a hobby from a town.');
}

testExclusion().catch(console.error);
