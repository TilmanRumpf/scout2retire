import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkExclusions() {
  console.log('🔍 Checking for excluded hobbies in database...\n');

  const { data, error } = await supabase
    .from('towns_hobbies')
    .select('*, towns(name), hobbies(name)')
    .eq('is_excluded', true);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  if (data.length === 0) {
    console.log('❌ NO EXCLUDED HOBBIES FOUND IN DATABASE');
    console.log('\nThe exclusion did NOT save to the database!');
    console.log('This means the INSERT/UPDATE is being blocked by RLS.');
  } else {
    console.log(`✅ Found ${data.length} excluded hobby record(s):\n`);
    data.forEach(record => {
      console.log(`  Town: ${record.towns?.name || 'Unknown'}`);
      console.log(`  Hobby: ${record.hobbies?.name || 'Unknown'}`);
      console.log(`  Excluded: ${record.is_excluded}`);
      console.log('  ---');
    });
  }
}

checkExclusions().catch(console.error);
