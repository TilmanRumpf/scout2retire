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

async function testArrayTextFields() {
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
  console.log('🧪 Testing array fields...\n');

  const arrayTests = [
    { field: 'activities_available', value: ['hiking', 'cycling', 'museums'] },
    { field: 'environmental_factors', value: ['clean air', 'green spaces'] },
    { field: 'expat_groups', value: ['International Community', 'Expat Meetup'] },
    { field: 'interests_supported', value: ['arts', 'culture', 'sports'] },
    { field: 'international_flights_direct', value: ['Amsterdam', 'Paris', 'London'] },
    { field: 'local_mobility_options', value: ['bus', 'train', 'tram'] },
    { field: 'regions', value: ['North Rhine-Westphalia'] },
    { field: 'secondary_languages', value: ['English', 'Turkish'] },
    { field: 'top_hobbies', value: ['hiking', 'cycling', 'theater'] },
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

  console.log('\n🧪 Testing landmark text fields...\n');

  const landmarkTests = [
    { field: 'cultural_landmark_1', value: 'Wuppertal Suspension Railway' },
    { field: 'cultural_landmark_2', value: 'Von der Heydt Museum' },
    { field: 'cultural_landmark_3', value: 'Historic City Center' },
  ];

  for (const { field, value } of landmarkTests) {
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

  console.log('\n🧪 Testing visa/residency text fields...\n');

  const visaTests = [
    { field: 'residency_path_info', value: 'EU Blue Card available for skilled workers' },
    { field: 'visa_requirements', value: 'Schengen visa required for non-EU citizens' },
  ];

  for (const { field, value } of visaTests) {
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

testArrayTextFields();
