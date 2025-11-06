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

async function fixWuppertal() {
  console.log('🔍 Checking Wuppertal...');
  
  const { data: towns, error: searchError } = await supabase
    .from('towns')
    .select('id, town_name, country')
    .ilike('town_name', 'wuppertal');
  
  if (searchError) {
    console.error('Error:', searchError);
    return;
  }
  
  if (!towns || towns.length === 0) {
    console.log('❌ No wuppertal found');
    return;
  }
  
  console.log(`Found ${towns.length} wuppertal entry/entries`);
  
  for (const town of towns) {
    console.log(`\n🔧 Fixing: ${town.town_name} → Wuppertal`);
    
    const { error: updateError } = await supabase
      .from('towns')
      .update({ name: 'Wuppertal' })
      .eq('id', town.id);
    
    if (updateError) {
      console.error('Update failed:', updateError);
    } else {
      console.log('✅ Updated successfully');
    }
  }
}

fixWuppertal();
