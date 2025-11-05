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

async function dropConstraint() {
  console.log('Dropping cultural_events_frequency_check constraint...\n');

  const { data, error } = await supabase.rpc('exec_sql', {
    sql: 'ALTER TABLE towns DROP CONSTRAINT IF EXISTS towns_cultural_events_frequency_check;'
  });

  if (error) {
    console.log('❌ Failed:', error.message);
  } else {
    console.log('✅ Constraint dropped successfully');
    console.log('   Now we can populate cultural_events_frequency field');
  }
}

dropConstraint();
