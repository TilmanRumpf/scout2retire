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
  // Get Wuppertal
  const { data: town } = await supabase
    .from('towns')
    .select('id')
    .eq('name', 'Wuppertal')
    .single();

  if (!town) {
    console.log('❌ Wuppertal not found');
    return;
  }

  console.log('Testing english_speaking_doctors field type...\n');

  // Test if it's boolean
  console.log('1. Testing boolean values:');
  for (const value of [true, false]) {
    const { error } = await supabase
      .from('towns')
      .update({ english_speaking_doctors: value })
      .eq('id', town.id);

    console.log(`   ${value}: ${error ? '❌ ' + error.message.substring(0, 40) : '✅ works'}`);
  }

  // Test if it's text
  console.log('\n2. Testing text values:');
  for (const value of ['rare', 'limited', 'moderate', 'common', 'widespread', 'some']) {
    const { error } = await supabase
      .from('towns')
      .update({ english_speaking_doctors: value })
      .eq('id', town.id);

    console.log(`   "${value}": ${error ? '❌ ' + error.message.substring(0, 40) : '✅ works'}`);
  }
}

test();
