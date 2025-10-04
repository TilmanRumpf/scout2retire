import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkUsers() {
  const { data: users, error } = await supabase
    .from('users')
    .select('id, username, email')
    .limit(10);

  console.log('=== ALL USERS ===');
  if (error) console.error('Error:', error);
  console.log(JSON.stringify(users, null, 2));

  process.exit(0);
}

checkUsers();
