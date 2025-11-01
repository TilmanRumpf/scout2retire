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

async function test() {
  const { data: town } = await supabase
    .from('towns')
    .select('id')
    .eq('name', 'Wuppertal')
    .single();

  if (!town) {
    console.log('❌ Wuppertal not found');
    return;
  }

  console.log('Testing Safety field types...\n');

  // Test crime_rate
  console.log('1. Testing crime_rate:');
  const { error: crimeError } = await supabase
    .from('towns')
    .update({ crime_rate: 'low' })
    .eq('id', town.id);
  console.log(`   "low": ${crimeError ? '❌ INTEGER (error: ' + crimeError.message.substring(0, 30) + ')' : '✅ TEXT'}`);

  // Test natural_disaster_risk
  console.log('\n2. Testing natural_disaster_risk:');
  const { error: disasterError } = await supabase
    .from('towns')
    .update({ natural_disaster_risk: 'low' })
    .eq('id', town.id);
  console.log(`   "low": ${disasterError ? '❌ INTEGER (error: ' + disasterError.message.substring(0, 30) + ')' : '✅ TEXT'}`);
}

test();
