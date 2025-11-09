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

async function verify() {
  console.log('🔍 VERIFYING TEMPLATE MIGRATION\n');

  const { data, error, count } = await supabase
    .from('field_search_templates')
    .select('field_name, status, search_template', { count: 'exact' })
    .eq('status', 'active')
    .order('field_name');

  if (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  console.log(`✅ Total active templates: ${count}\n`);
  console.log('Templates:');
  data.forEach((t, i) => {
    console.log(`${i + 1}. ${t.field_name}`);
    console.log(`   Query: ${t.search_template.substring(0, 80)}...`);
  });

  console.log('\n✅ Verification complete!');
  process.exit(0);
}

verify();
