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

async function testTextFields() {
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
  console.log('🧪 Testing text and description fields...\n');

  // Test text description fields
  const textTests = [
    { field: 'cost_description', value: 'Moderate cost of living' },
    { field: 'healthcare_description', value: 'Good healthcare facilities' },
    { field: 'infrastructure_description', value: 'Modern infrastructure' },
    { field: 'lifestyle_description', value: 'Relaxed lifestyle' },
    { field: 'safety_description', value: 'Very safe city' },
    { field: 'country_code', value: 'DE' },
    { field: 'geo_region', value: 'Europe' },
    { field: 'nearest_major_city', value: 'Düsseldorf' },
    { field: 'timezone', value: 'Europe/Berlin' },
    { field: 'urban_rural_character', value: 'urban' },
    { field: 'subdivision_code', value: 'NW' },
  ];

  for (const { field, value } of textTests) {
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

  console.log('\n🧪 Testing integer/float fields...\n');

  const numericTests = [
    { field: 'cost_index', value: 75 },
    { field: 'distance_to_urban_center', value: 0 },
    { field: 'min_income_requirement_usd', value: 1500 },
    { field: 'property_appreciation_rate_pct', value: 2.5 },
    { field: 'visa_free_days', value: 90 },
  ];

  for (const { field, value } of numericTests) {
    const { error } = await supabase
      .from('towns')
      .update({ [field]: value })
      .eq('id', town.id);

    if (error) {
      console.log(`❌ ${field}: ${error.message}`);
    } else {
      console.log(`✅ ${field}: Successfully set to ${value}`);
    }
  }

  console.log('\n🧪 Testing boolean fields...\n');

  const booleanTests = [
    { field: 'international_flights_direct', value: true },
  ];

  for (const { field, value } of booleanTests) {
    const { error } = await supabase
      .from('towns')
      .update({ [field]: value })
      .eq('id', town.id);

    if (error) {
      console.log(`❌ ${field}: ${error.message}`);
    } else {
      console.log(`✅ ${field}: Successfully set to ${value}`);
    }
  }
}

testTextFields();
