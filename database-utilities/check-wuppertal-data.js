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

async function checkWuppertalData() {
  const { data, error } = await supabase
    .from('towns')
    .select('*')
    .eq('name', 'Wuppertal')
    .single();

  if (error) {
    console.log('Error:', error.message);
    return;
  }

  console.log('Wuppertal current data (non-null fields only):\n');

  // Show ALL non-null fields
  for (const [key, value] of Object.entries(data)) {
    if (value !== null && value !== undefined) {
      const valueStr = JSON.stringify(value);
      if (valueStr.length > 50) {
        console.log(`${key}: ${valueStr.slice(0, 47)}...`);
      } else {
        console.log(`${key}: ${valueStr}`);
      }
    }
  }
}

checkWuppertalData();
