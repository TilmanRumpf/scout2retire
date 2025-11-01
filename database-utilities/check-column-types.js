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

const fieldsToCheck = ['english_proficiency', 'pace_of_life_actual', 'social_atmosphere', 'expat_community_size'];

async function checkColumnTypes() {
  // Just try to insert each field with "moderate" to see which one fails
  console.log('Testing which field rejects "moderate"...\n');

  for (const field of fieldsToCheck) {
    const testData = { [field]: 'moderate' };

    // Try to update a fake ID (won't actually update anything, but will validate the type)
    const { error } = await supabase
      .from('towns')
      .update(testData)
      .eq('id', '00000000-0000-0000-0000-000000000000'); // Fake ID

    if (error && error.message.includes('invalid input syntax for type integer')) {
      console.log(`❌ ${field} - REJECTS "moderate" (expects INTEGER)`);
    } else if (error) {
      console.log(`✅ ${field} - accepts "moderate" (error: ${error.message.substring(0, 50)}...)`);
    } else {
      console.log(`✅ ${field} - accepts "moderate"`);
    }
  }
}

checkColumnTypes();
