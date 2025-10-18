import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verify() {
  console.log('🔍 Verifying migration...\n');

  // Test that we can query with is_excluded
  const { data, error } = await supabase
    .from('towns_hobbies')
    .select('town_id, hobby_id, is_excluded')
    .limit(5);

  if (error) {
    console.error('❌ Verification failed:', error);
    return;
  }

  console.log('✅ Migration successful!');
  console.log('✅ is_excluded column exists and is queryable');
  console.log('\nSample data:');
  console.log(data);
  console.log('\n🎉 Feature is ready to use! Refresh your browser at localhost:5173');
}

verify().catch(console.error);
