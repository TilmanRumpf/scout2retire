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

async function listEmptyFields() {
  const { data, error } = await supabase
    .from('towns')
    .select('*')
    .ilike('name', 'wuppertal')
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('\n❌ EMPTY FIELDS THAT AI SHOULD POPULATE:');
  console.log('='.repeat(80));
  
  const ignoreFields = ['id', 'created_at', 'updated_at', 'photos', 'overall_score', 'audit_data', 'metadata'];
  
  const emptyFields = [];
  
  for (const [field, value] of Object.entries(data)) {
    if (ignoreFields.includes(field)) continue;
    if (field === 'name' || field === 'country' || field === 'region') continue;
    
    if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
      emptyFields.push(field);
    }
  }
  
  emptyFields.sort().forEach(field => {
    console.log('  -', field);
  });
  
  console.log('\n' + '='.repeat(80));
  console.log('Total empty fields:', emptyFields.length);
}

listEmptyFields();
