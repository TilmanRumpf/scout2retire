import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanupWuppertal() {
  console.log('🔍 Searching for wuppertal entries...');
  
  const { data: wuppertals, error: searchError } = await supabase
    .from('towns')
    .select('id, name, country, region, created_at')
    .ilike('name', 'wuppertal');
  
  if (searchError) {
    console.error('❌ Search failed:', searchError);
    return;
  }
  
  if (!wuppertals || wuppertals.length === 0) {
    console.log('✅ No wuppertal entries found in database');
    return;
  }
  
  console.log(`\n⚠️  Found ${wuppertals.length} wuppertal entry/entries:`);
  wuppertals.forEach(t => {
    console.log(`   - ID: ${t.id}, Name: ${t.name}, Country: ${t.country}, Created: ${t.created_at}`);
  });
  
  console.log('\n🗑️  Deleting all wuppertal entries...');
  
  const { error: deleteError } = await supabase
    .from('towns')
    .delete()
    .ilike('name', 'wuppertal');
  
  if (deleteError) {
    console.error('❌ Delete failed:', deleteError);
    return;
  }
  
  console.log(`✅ Successfully deleted ${wuppertals.length} wuppertal entry/entries`);
}

cleanupWuppertal();
