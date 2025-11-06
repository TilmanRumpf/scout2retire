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

async function testTypeMismatches() {
  // Get Wuppertal
  const { data: town } = await supabase
    .from('towns')
    .select('id, town_name')
    .eq('name', 'Wuppertal')
    .single();

  if (!town) {
    console.log('❌ Wuppertal not found');
    return;
  }

  console.log(`✅ Found Wuppertal (ID: ${town.id})\n`);
  console.log('🧪 Testing type mismatch fields...\n');

  // Test english_proficiency as INTEGER (1-10 scale)
  console.log('Testing english_proficiency as INTEGER (rating 1-10):');
  const englishTests = [
    { value: 7, description: '7 (moderate-high proficiency)' },
    { value: 1, description: '1 (low proficiency)' },
    { value: 10, description: '10 (very high proficiency)' },
  ];

  for (const { value, description } of englishTests) {
    const { error } = await supabase
      .from('towns')
      .update({ english_proficiency: value })
      .eq('id', town.id);

    if (error) {
      console.log(`  ❌ ${description}: ${error.message}`);
    } else {
      console.log(`  ✅ ${description}: Success`);
    }
  }

  console.log('\n🧪 Testing solo_living_support as INTEGER (rating 1-10):\n');

  const soloTests = [
    { value: 8, description: '8 (good support)' },
    { value: 5, description: '5 (moderate support)' },
    { value: 2, description: '2 (limited support)' },
  ];

  for (const { value, description } of soloTests) {
    const { error } = await supabase
      .from('towns')
      .update({ solo_living_support: value })
      .eq('id', town.id);

    if (error) {
      console.log(`  ❌ ${description}: ${error.message}`);
    } else {
      console.log(`  ✅ ${description}: Success`);
    }
  }

  // Verify the values
  console.log('\n🔍 Verifying inserted values:\n');
  const { data: updated } = await supabase
    .from('towns')
    .select('english_proficiency, solo_living_support')
    .eq('id', town.id)
    .single();

  if (updated) {
    console.log(`english_proficiency: ${updated.english_proficiency} (${typeof updated.english_proficiency})`);
    console.log(`solo_living_support: ${updated.solo_living_support} (${typeof updated.solo_living_support})`);
  }
}

testTypeMismatches();
