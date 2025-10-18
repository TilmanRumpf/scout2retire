import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkPolicies() {
  console.log('🔍 Checking RLS policies for towns_hobbies...\n');

  const { data, error } = await supabase
    .rpc('exec_sql', {
      query: `
        SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
        FROM pg_policies 
        WHERE tablename = 'towns_hobbies';
      `
    });

  if (error) {
    console.log('Cannot query policies with RPC. Trying manual check...\n');
    
    // Try to insert with anon key
    const anonClient = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );

    const { error: insertError } = await anonClient
      .from('towns_hobbies')
      .insert({
        town_id: '00000000-0000-0000-0000-000000000000',
        hobby_id: '00000000-0000-0000-0000-000000000000',
        is_excluded: true
      });

    if (insertError) {
      console.log('❌ INSERT failed with anon key:', insertError.message);
      console.log('\n💡 SOLUTION: You need to add RLS policy for INSERT on towns_hobbies');
      console.log('\nRun this SQL in Supabase:');
      console.log('---------------------------------------------------');
      console.log('CREATE POLICY "Allow authenticated users to manage towns_hobbies"');
      console.log('ON towns_hobbies FOR ALL');
      console.log('TO authenticated');
      console.log('USING (true)');
      console.log('WITH CHECK (true);');
      console.log('---------------------------------------------------');
    } else {
      console.log('✅ INSERT works with anon key - cleaning up test record...');
      await anonClient
        .from('towns_hobbies')
        .delete()
        .eq('town_id', '00000000-0000-0000-0000-000000000000');
    }
  } else {
    console.log('Policies:', data);
  }
}

checkPolicies().catch(console.error);
