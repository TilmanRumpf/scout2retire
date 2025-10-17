import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function verifyUpdate() {
  console.log('🔍 Checking Bubaque hospital count...\n');

  const { data, error } = await supabase
    .from('towns')
    .select('id, name, hospital_count')
    .ilike('name', 'Bubaque')
    .single();

  if (error) {
    console.log('❌ Error:', error.message);
    return;
  }

  console.log('Current hospital count:', data.hospital_count);
  
  if (data.hospital_count === 1) {
    console.log('✅ SUCCESS! Update worked despite the error message.');
  } else {
    console.log('❌ Update did NOT work. Still showing:', data.hospital_count);
    console.log('\nThis is likely an RLS (Row Level Security) issue.');
    console.log('The anon key may not have UPDATE permissions on the towns table.');
  }
}

verifyUpdate().catch(console.error);
