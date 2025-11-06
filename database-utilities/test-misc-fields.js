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

async function testMiscFields() {
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
  console.log('🧪 Testing miscellaneous fields...\n');

  const tests = [
    // Text/categorical
    { field: 'activity_infrastructure', value: 'excellent' },
    { field: 'banking_infrastructure', value: 'excellent' },
    { field: 'digital_services_availability', value: 'high' },
    { field: 'international_access', value: 'excellent' },
    { field: 'parking_availability', value: 'adequate' },
    { field: 'pet_friendliness', value: 'high' },
    { field: 'pollen_levels', value: 'moderate' },
    { field: 'regional_connectivity', value: 'excellent' },
    { field: 'solo_living_support', value: 'good' },
    { field: 'tourist_season_impact', value: 'low' },
    { field: 'traffic_congestion', value: 'moderate' },

    // Booleans
    { field: 'mountain_activities', value: false },
    { field: 'swimming_facilities', value: true },
    { field: 'water_sports_available', value: false },

    // Integers/floats
    { field: 'healthcare_cost', value: 200 },
    { field: 'healthcare_score', value: 85 },
    { field: 'infrastructure_description', value: 'Modern infrastructure with excellent public transport' },
    { field: 'natural_disaster_risk_score', value: 2 },
    { field: 'private_healthcare_cost_index', value: 75 },
    { field: 'quality_of_life', value: 85 },
    { field: 'regional_airport_distance', value: 30 },
    { field: 'safety_score', value: 90 },
  ];

  for (const { field, value } of tests) {
    const { error } = await supabase
      .from('towns')
      .update({ [field]: value })
      .eq('id', town.id);

    if (error) {
      console.log(`❌ ${field}: ${error.message}`);
    } else {
      console.log(`✅ ${field}: Successfully set`);
    }
  }

  console.log('\n🧪 Testing array fields...\n');

  const arrayTests = [
    { field: 'easy_residency_countries', value: ['EU', 'Schengen'] },
    { field: 'visa_on_arrival_countries', value: ['US', 'Canada', 'Australia'] },
  ];

  for (const { field, value } of arrayTests) {
    const { error } = await supabase
      .from('towns')
      .update({ [field]: value })
      .eq('id', town.id);

    if (error) {
      console.log(`❌ ${field}: ${error.message}`);
    } else {
      console.log(`✅ ${field}: Successfully set`);
    }
  }
}

testMiscFields();
