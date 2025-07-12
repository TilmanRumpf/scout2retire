import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function dropRetirementStatus() {
  console.log('Dropping retirement_status column...');
  
  const { data, error } = await supabase.rpc('query', {
    query: 'ALTER TABLE users DROP COLUMN IF EXISTS retirement_status'
  });
  
  if (error) {
    console.error('Error:', error);
    console.log('\nPlease run this SQL directly in Supabase:');
    console.log('ALTER TABLE users DROP COLUMN IF EXISTS retirement_status;');
  } else {
    console.log('✅ retirement_status column dropped successfully');
  }
}

dropRetirementStatus();