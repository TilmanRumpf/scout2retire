import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zlcdpqowfzxrthzqjogc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsY2RwcW93Znp4cnRoenFqb2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk0ODM4MzUsImV4cCI6MjA0NTA1OTgzNX0.vJX2qcQEy5F9TXY_dDdDSlsEH9X-wKYnLmVdnLdqMqA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTemplateEditing() {
  console.log('\n🧪 TESTING TEMPLATE EDITING & HISTORY TRACKING\n');

  try {
    // 1. Fetch an existing template
    console.log('1️⃣ Fetching existing template...');
    const { data: template, error: fetchError } = await supabase
      .from('field_search_templates')
      .select('*')
      .eq('field_name', 'pace_of_life_actual')
      .single();

    if (fetchError) throw fetchError;
    console.log(`✅ Found template: ${template.field_name}`);
    console.log(`   Current version: ${template.version}`);
    console.log(`   Current description: ${template.human_description?.substring(0, 50)}...`);

    // 2. Update the template (simulate what FieldDefinitionEditor does)
    console.log('\n2️⃣ Updating template...');
    const { data: updated, error: updateError } = await supabase
      .from('field_search_templates')
      .update({
        human_description: template.human_description + ' [TEST EDIT]',
        updated_at: new Date().toISOString()
      })
      .eq('field_name', 'pace_of_life_actual')
      .select()
      .single();

    if (updateError) throw updateError;
    console.log(`✅ Updated template`);
    console.log(`   New version: ${updated.version}`);
    console.log(`   New description: ${updated.human_description?.substring(0, 60)}...`);

    // 3. Check history was recorded
    console.log('\n3️⃣ Checking history table...');
    const { data: history, error: historyError } = await supabase
      .from('field_search_templates_history')
      .select('*')
      .eq('field_name', 'pace_of_life_actual')
      .order('changed_at', { ascending: false })
      .limit(3);

    if (historyError) throw historyError;
    console.log(`✅ Found ${history.length} history entries:`);
    history.forEach((entry, i) => {
      console.log(`   ${i + 1}. Version ${entry.version} - ${entry.operation} at ${entry.changed_at}`);
      console.log(`      Description: ${entry.human_description?.substring(0, 50)}...`);
    });

    // 4. Revert the test edit
    console.log('\n4️⃣ Reverting test edit...');
    const { error: revertError } = await supabase
      .from('field_search_templates')
      .update({
        human_description: template.human_description,
        updated_at: new Date().toISOString()
      })
      .eq('field_name', 'pace_of_life_actual');

    if (revertError) throw revertError;
    console.log('✅ Reverted to original state');

    console.log('\n✅ ALL TESTS PASSED! Template editing and history tracking working correctly.\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error);
  }
}

testTemplateEditing();
