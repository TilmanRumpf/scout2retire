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

async function deleteWuppertal() {
  console.log('🗑️  Deleting Wuppertal...');

  const { error } = await supabase
    .from('towns')
    .delete()
    .ilike('name', 'wuppertal');

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('✅ Wuppertal deleted - ready for comprehensive AI test!');
  }
}

deleteWuppertal();
