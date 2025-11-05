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

async function check() {
  const { data: town } = await supabase
    .from('towns')
    .select('*')
    .eq('name', 'Wuppertal')
    .single();

  if (!town) {
    console.log('Error: Wuppertal not found');
    return;
  }

  console.log('Columns containing "disaster" or "natural" or "risk":\n');
  for (const [key, value] of Object.entries(town)) {
    const keyLower = key.toLowerCase();
    if (keyLower.includes('disaster') || keyLower.includes('natural') || keyLower.includes('risk')) {
      const valueType = value === null ? 'null' : typeof value;
      console.log(`${key}: ${JSON.stringify(value)} (type: ${valueType})`);
    }
  }
}

check();
