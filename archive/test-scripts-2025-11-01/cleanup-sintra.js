import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanupSintra() {
  console.log('Searching for Sintra entries...');
  
  const { data: sintras, error: searchError } = await supabase
    .from('towns')
    .select('id, name, country, region, created_at')
    .ilike('name', 'sintra');
  
  if (searchError) {
    console.error('Search failed:', searchError);
    return;
  }
  
  if (!sintras || sintras.length === 0) {
    console.log('No Sintra entries found');
    return;
  }
  
  console.log('\nFound', sintras.length, 'Sintra entry/entries:');
  sintras.forEach(t => {
    console.log('  - ID:', t.id, 'Name:', t.name, 'Country:', t.country, 'Created:', t.created_at);
  });
  
  console.log('\nDeleting all Sintra entries...');
  
  const { error: deleteError } = await supabase
    .from('towns')
    .delete()
    .ilike('name', 'sintra');
  
  if (deleteError) {
    console.error('Delete failed:', deleteError);
    return;
  }
  
  console.log('Successfully deleted', sintras.length, 'Sintra entry/entries');
}

cleanupSintra();
