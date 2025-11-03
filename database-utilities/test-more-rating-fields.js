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

async function testMoreRatings() {
  // Get Wuppertal
  const { data: town } = await supabase
    .from('towns')
    .select('id, name')
    .eq('name', 'Wuppertal')
    .single();

  if (!town) {
    console.log('❌ Wuppertal not found');
    return;
  }

  console.log(`✅ Found Wuppertal (ID: ${town.id})\n`);
  console.log('🧪 Testing additional rating fields...\n');

  // Test additional rating fields
  const ratingFields = [
    'cultural_events_rating',
    'cultural_rating',
    'family_friendliness_rating',
    'government_efficiency_rating',
    'medical_specialties_rating',
    'museums_rating',
    'outdoor_rating',
    'senior_friendly_rating',
    'startup_ecosystem_rating',
    'travel_connectivity_rating',
    'wellness_rating'
  ];

  for (const field of ratingFields) {
    const testValue = 7;

    const { error } = await supabase
      .from('towns')
      .update({ [field]: testValue })
      .eq('id', town.id);

    if (error) {
      console.log(`❌ ${field}: ${error.message}`);
    } else {
      console.log(`✅ ${field}: Successfully set to ${testValue}`);
    }
  }
}

testMoreRatings();
