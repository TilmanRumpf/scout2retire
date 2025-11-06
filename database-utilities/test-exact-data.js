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

async function testExactData() {
  console.log('Testing exact data combination that failed...\n');

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

  // Try ALL Culture fields at once
  const testData = {
    primary_language: 'German',
    english_proficiency_level: 'moderate',
    pace_of_life_actual: 'moderate',
    social_atmosphere: 'moderate',
    cultural_events_frequency: 'frequent',
    traditional_progressive_lean: 'moderate'
  };

  console.log('Attempting to update with:');
  Object.entries(testData).forEach(([k, v]) => console.log(`  ${k}: "${v}"`));
  console.log('');

  const { error } = await supabase
    .from('towns')
    .update(testData)
    .eq('id', town.id);

  if (error) {
    console.log('❌ FAILED!');
    console.log('   Error:', error.message);
    console.log('   Code:', error.code);
    console.log('   Details:', error.details);
  } else {
    console.log('✅ SUCCESS! All Culture fields updated');
  }
}

testExactData();
