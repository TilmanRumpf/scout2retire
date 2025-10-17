import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkBubaqueData() {
  console.log('Fetching Bubaque data from database...\n');

  const { data, error } = await supabase
    .from('towns')
    .select('*')
    .ilike('name', '%bubaque%')
    .single();

  if (error) {
    console.error('Error:', error.message);
    return;
  }

  if (!data) {
    console.log('No town found matching "Bubaque"');
    return;
  }

  console.log('=== BUBAQUE DATA ===\n');
  console.log('ID:', data.id);
  console.log('Name:', data.name);
  console.log('Country:', data.country);
  console.log('State/Region:', data.state_code || data.region);
  console.log('Overall Score:', data.overall_score);
  console.log('\n--- PHOTOS ---');
  console.log('Photos:', data.photos || 'MISSING');

  // Count populated fields
  const allFields = Object.keys(data);
  const totalFields = allFields.length;
  let populatedFields = 0;
  let emptyFields = [];

  for (const [key, value] of Object.entries(data)) {
    if (value !== null && value !== '' && value !== undefined) {
      populatedFields++;
    } else {
      emptyFields.push(key);
    }
  }

  const completeness = ((populatedFields / totalFields) * 100).toFixed(1);

  console.log('\n--- DATA COMPLETENESS ---');
  console.log('Total Fields:', totalFields);
  console.log('Populated Fields:', populatedFields);
  console.log('Empty/Null Fields:', totalFields - populatedFields);
  console.log('Completeness Score:', completeness + '%');

  console.log('\n--- EMPTY/NULL FIELDS (' + emptyFields.length + ') ---');
  emptyFields.forEach(field => console.log('  -', field));

  console.log('\n--- SAMPLE POPULATED FIELDS ---');
  const sampleFields = ['description', 'climate_type', 'cost_of_living_index',
                        'healthcare_quality', 'english_speakers_percentage',
                        'geographic_features_actual', 'vegetation_type_actual'];
  sampleFields.forEach(field => {
    if (data[field]) {
      const value = typeof data[field] === 'string' && data[field].length > 50
        ? data[field].substring(0, 50) + '...'
        : data[field];
      console.log('  ' + field + ':', value);
    } else {
      console.log('  ' + field + ': NULL/EMPTY');
    }
  });
}

checkBubaqueData().then(() => process.exit(0));
