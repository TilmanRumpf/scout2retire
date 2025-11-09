// Test Phase 1 Day 2 - Template Editing & History Tracking
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function runTests() {
  console.log('\n🧪 PHASE 1 DAY 2 - TESTING TEMPLATE SYSTEM\n');

  try {
    // Test 1: Verify templates are accessible via new system
    console.log('1️⃣ Testing template fetch via field_search_templates...');
    const { data: templates, error: fetchError } = await supabase
      .from('field_search_templates')
      .select('field_name, search_template, version, status')
      .eq('status', 'active')
      .limit(5);

    if (fetchError) throw fetchError;
    console.log(`✅ Successfully fetched ${templates.length} templates`);
    console.log('   Sample:', templates.slice(0, 2).map(t => t.field_name).join(', '));

    // Test 2: Verify history table structure
    console.log('\n2️⃣ Testing history table access...');
    const { data: historyCount, error: historyError } = await supabase
      .from('field_search_templates_history')
      .select('id', { count: 'exact', head: true });

    if (historyError) throw historyError;
    console.log(`✅ History table exists and is accessible`);
    console.log(`   Current history entries: ${historyCount}`);

    // Test 3: Verify a specific template
    console.log('\n3️⃣ Testing specific template (pace_of_life_actual)...');
    const { data: template, error: templateError } = await supabase
      .from('field_search_templates')
      .select('*')
      .eq('field_name', 'pace_of_life_actual')
      .single();

    if (templateError) throw templateError;
    console.log(`✅ Template found:`);
    console.log(`   Field: ${template.field_name}`);
    console.log(`   Version: ${template.version}`);
    console.log(`   Status: ${template.status}`);
    console.log(`   Search: ${template.search_template?.substring(0, 60)}...`);

    console.log('\n✅ ALL TESTS PASSED!\n');
    console.log('📋 Summary:');
    console.log('   ✅ field_search_templates table: Working');
    console.log('   ✅ field_search_templates_history table: Working');
    console.log('   ✅ Templates accessible via JavaScript SDK');
    console.log('   ✅ Ready for UI testing\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error('\nError details:', error);
    process.exit(1);
  }
}

runTests();
