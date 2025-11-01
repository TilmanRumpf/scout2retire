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

async function testAllValues() {
  console.log('Testing ALL possible cultural_events_frequency values on Wuppertal...\n');

  // Get Wuppertal's ID
  const { data: town } = await supabase
    .from('towns')
    .select('id, name')
    .eq('name', 'Wuppertal')
    .single();

  if (!town) {
    console.log('❌ Wuppertal not found');
    return;
  }

  const testValues = ['rare', 'occasional', 'monthly', 'frequent', 'weekly', 'constant', 'daily', 'null', 'moderate'];

  for (const value of testValues) {
    const testData = value === 'null' ? { cultural_events_frequency: null } : { cultural_events_frequency: value };

    const { error } = await supabase
      .from('towns')
      .update(testData)
      .eq('id', town.id);

    if (error) {
      console.log(`❌ "${value}" - FAILED: ${error.message.substring(0, 60)}`);
    } else {
      console.log(`✅ "${value}" - SUCCESS!`);
    }
  }
}

testAllValues();
