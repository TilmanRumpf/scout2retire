/**
 * VERIFY TEMPLATE INTEGRATION
 * Checks that all 19 templates are accessible and will be used by the UI
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
  process.env.VITE_SUPABASE_ANON_KEY  // Use anon key like the UI does
);

async function verifyIntegration() {
  console.log('🔍 VERIFYING TEMPLATE INTEGRATION\n');

  // Simulate what EditableDataField does on mount
  console.log('Simulating EditableDataField.jsx lines 68-96 (template loading)...\n');

  const { data, error } = await supabase
    .from('field_search_templates')
    .select('field_name, search_template, expected_format, human_description')
    .eq('status', 'active');

  if (error) {
    console.error('❌ ERROR loading templates:', error);
    console.error('\nThis means templates will NOT be available in the UI!');
    process.exit(1);
  }

  console.log(`✅ Successfully loaded ${data.length} templates\n`);

  // Convert to map like EditableDataField does
  const templatesMap = {};
  data.forEach(t => {
    templatesMap[t.field_name] = t;
  });

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('TEMPLATE VERIFICATION');
  console.log('═══════════════════════════════════════════════════════════════\n');

  let allUniversal = true;

  data.forEach((template, idx) => {
    const hasSubdivision = template.search_template.includes('{subdivision}');
    const status = hasSubdivision ? '✅' : '❌';

    if (!hasSubdivision) allUniversal = false;

    console.log(`${idx + 1}. ${template.field_name} ${status}`);
    console.log(`   Query: ${template.search_template}`);
    console.log(`   Expected: ${template.expected_format}\n`);
  });

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('INTEGRATION STATUS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log(`✓ Templates in database: ${data.length}`);
  console.log(`✓ All include {subdivision}: ${allUniversal ? 'YES' : 'NO'}`);
  console.log(`✓ Accessible via anon key: YES`);
  console.log(`✓ Will load in EditableDataField: YES\n`);

  console.log('Integration check: ' + (allUniversal ? '✅ PERFECT' : '⚠️  NEEDS FIXING') + '\n');

  process.exit(allUniversal ? 0 : 1);
}

verifyIntegration().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
