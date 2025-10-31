/**
 * ADD TEMPLATE FOR REGIONS FIELD
 */

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

async function addRegionsTemplate() {
  console.log('Adding template for "regions" field...\n');

  const template = {
    field_name: 'regions',
    search_template: 'What geographic regions or broader areas does {town_name}, {subdivision}, {country} belong to?',
    expected_format: 'Comma-separated list (e.g., Middle East, Arab World, Persian Gulf)',
    human_description: 'Multiple region classifications if applicable',
    status: 'active'
  };

  // Get admin user ID
  const { data: adminUsers } = await supabase
    .from('users')
    .select('id')
    .eq('admin_role', 'executive_admin')
    .limit(1);

  if (adminUsers && adminUsers.length > 0) {
    template.updated_by = adminUsers[0].id;
  }

  const { error } = await supabase
    .from('field_search_templates')
    .upsert(template, { onConflict: 'field_name' });

  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }

  console.log('✅ Template created:');
  console.log('   Field: regions');
  console.log('   Query:', template.search_template);
  console.log('   Expected:', template.expected_format);
  console.log('\nTotal templates: 20\n');

  process.exit(0);
}

addRegionsTemplate().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
