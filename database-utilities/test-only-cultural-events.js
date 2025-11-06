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

async function testOnlyCultural() {
  console.log('Testing ONLY cultural_events_frequency...\n');

  // Get Wuppertal's ID
  const { data: town } = await supabase
    .from('towns')
    .select('id, town_name')
    .eq('name', 'Wuppertal')
    .single();

  if (!town) {
    console.log('❌ Wuppertal not found');
    return;
  }

  console.log(`Testing on: ${town.town_name} (${town.id})\n`);

  // Try ONLY cultural_events_frequency
  const testData = {
    cultural_events_frequency: 'frequent'
  };

  console.log('Attempting to update with ONLY:');
  console.log(`  cultural_events_frequency: "frequent"`);
  console.log('');

  const { error } = await supabase
    .from('towns')
    .update(testData)
    .eq('id', town.id);

  if (error) {
    console.log('❌ FAILED!');
    console.log('   Error:', error.message);
  } else {
    console.log('✅ SUCCESS! cultural_events_frequency="frequent" works ALONE');
  }
}

testOnlyCultural();
