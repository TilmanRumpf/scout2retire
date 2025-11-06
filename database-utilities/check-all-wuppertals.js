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

async function checkAllWuppertals() {
  const { data, error } = await supabase
    .from('towns')
    .select('id, town_name, country, created_at, summer_climate_actual, description')
    .ilike('town_name', '%wuppertal%')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('\n🔍 ALL WUPPERTAL ENTRIES:');
  console.log('='.repeat(80));
  
  if (!data || data.length === 0) {
    console.log('❌ No Wuppertal entries found');
    return;
  }
  
  data.forEach((town, idx) => {
    console.log(`\n#${idx + 1} - ID: ${town.id}`);
    console.log('  Name:', town.town_name);
    console.log('  Country:', town.country);
    console.log('  Created:', town.created_at);
    console.log('  summer_climate_actual:', town.summer_climate_actual || 'NULL');
    console.log('  description:', town.description ? 'POPULATED (' + town.description.length + ' chars)' : 'NULL');
  });
  
  console.log('\n' + '='.repeat(80));
  console.log('Total Wuppertal entries:', data.length);
}

checkAllWuppertals();
