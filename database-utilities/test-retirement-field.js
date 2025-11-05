import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  console.log('Testing retirement_community_presence with "moderate"...');

  const { error } = await supabase
    .from('towns')
    .update({ retirement_community_presence: 'moderate' })
    .eq('id', '00000000-0000-0000-0000-000000000000');

  if (error && error.message.includes('invalid input syntax for type integer')) {
    console.log('❌ retirement_community_presence REJECTS "moderate" - THIS IS THE PROBLEM!');
    console.log('   This field is defined as INTEGER in the database but should be TEXT');
  } else if (error) {
    console.log('✅ retirement_community_presence accepts "moderate"');
  } else {
    console.log('✅ retirement_community_presence accepts "moderate"');
  }
}

test();
