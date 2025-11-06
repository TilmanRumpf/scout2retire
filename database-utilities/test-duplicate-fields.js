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

async function testDuplicates() {
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
  console.log('🧪 Testing potential duplicate/legacy fields...\n');

  const tests = [
    { field: 'climate', value: 'temperate oceanic' },
    { field: 'geographic_features', value: ['mountainous', 'rivers'] },
    { field: 'town_name', value: 'Wuppertal' },
    { field: 'typical_home_price', value: 250000 },
    { field: 'typical_rent_1bed', value: 800 },
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
    { field: 'international_access', value: ['rail', 'air', 'road'] },
    { field: 'regional_connectivity', value: ['excellent rail', 'major highways'] },
    { field: 'medical_specialties_available', value: ['cardiology', 'orthopedics'] },
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

testDuplicates();
