import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('preferences_hash, preferences_updated_at')
    .limit(1)
    .single();
    
  if (error) {
    console.log('❌ ERROR - Migration columns missing!', error.message);
    console.log('Run the migration in Supabase SQL Editor');
  } else {
    console.log('✅ Migration columns exist:', data);
  }
}

check();
