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

const testValues = ['rare', 'occasional', 'monthly', 'frequent', 'weekly', 'constant', 'daily'];

async function checkConstraint() {
  console.log('Testing cultural_events_frequency constraint...\n');

  for (const value of testValues) {
    const { error } = await supabase
      .from('towns')
      .update({ cultural_events_frequency: value })
      .eq('id', '00000000-0000-0000-0000-000000000000');

    if (error && error.message.includes('check constraint')) {
      console.log(`❌ "${value}" - REJECTED by check constraint`);
    } else if (error) {
      const msg = error.message.slice(0, 30);
      console.log(`✅ "${value}" - ACCEPTED (error: ${msg}...)`);
    } else {
      console.log(`✅ "${value}" - ACCEPTED`);
    }
  }
}

checkConstraint();
