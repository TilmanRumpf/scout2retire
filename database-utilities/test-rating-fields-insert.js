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

async function testRatingInsert() {
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

  // Test each rating field one by one
  const ratingFields = [
    'bike_infrastructure',
    'internet_reliability',
    'public_transport_quality',
    'road_quality',
    'walkability',
    'outdoor_activities_rating',
    'restaurants_rating',
    'nightlife_rating',
    'shopping_rating',
    'lgbtq_friendly_rating',
    'pet_friendly_rating',
    'insurance_availability_rating',
    'emergency_services_quality',
    'political_stability_rating',
    'environmental_health_rating'
  ];

  console.log('🧪 Testing rating field insertions...\n');

  for (const field of ratingFields) {
    const testValue = 7; // Valid 1-10 value

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

testRatingInsert();
