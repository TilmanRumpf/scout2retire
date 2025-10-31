/**
 * MAKE ALL TEMPLATES UNIVERSAL
 *
 * Updates all 19 templates to always include {subdivision} placeholder
 * This ensures templates work for ALL towns, not just those with subdivisions
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

async function makeTemplatesUniversal() {
  console.log('🔧 MAKING ALL TEMPLATES UNIVERSAL\n');
  console.log('Updating templates to always include {subdivision} placeholder...\n');

  // Get all current templates
  const { data: templates, error: fetchError } = await supabase
    .from('field_search_templates')
    .select('*')
    .eq('status', 'active');

  if (fetchError) {
    console.error('❌ Error fetching templates:', fetchError);
    process.exit(1);
  }

  console.log(`Found ${templates.length} active templates\n`);

  let updateCount = 0;
  let alreadyUniversal = 0;

  for (const template of templates) {
    const original = template.search_template;

    // Check if template already has {subdivision}
    if (original.includes('{subdivision}')) {
      console.log(`✓ ${template.field_name} - Already universal`);
      alreadyUniversal++;
      continue;
    }

    // Make it universal: Insert {subdivision} between {town_name} and {country}
    const universal = original.replace(
      /\{town_name\},\s*\{country\}/gi,
      '{town_name}, {subdivision}, {country}'
    );

    // Update in database
    const { error: updateError } = await supabase
      .from('field_search_templates')
      .update({ search_template: universal })
      .eq('field_name', template.field_name);

    if (updateError) {
      console.error(`✗ ${template.field_name} - Error:`, updateError.message);
    } else {
      console.log(`✓ ${template.field_name}`);
      console.log(`  BEFORE: ${original}`);
      console.log(`  AFTER:  ${universal}\n`);
      updateCount++;
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('RESULTS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log(`✓ Already universal: ${alreadyUniversal} templates`);
  console.log(`✓ Updated to universal: ${updateCount} templates`);
  console.log(`✓ Total templates: ${templates.length}\n`);

  // Verify all templates now have {subdivision}
  const { data: verifyTemplates } = await supabase
    .from('field_search_templates')
    .select('field_name, search_template')
    .eq('status', 'active');

  const missingSubdivision = verifyTemplates.filter(t => !t.search_template.includes('{subdivision}'));

  if (missingSubdivision.length === 0) {
    console.log('✅ SUCCESS: All templates are now universal!\n');
  } else {
    console.log(`⚠️  WARNING: ${missingSubdivision.length} templates still missing {subdivision}:`);
    missingSubdivision.forEach(t => console.log(`  - ${t.field_name}`));
  }

  process.exit(0);
}

makeTemplatesUniversal().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
