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

async function testArrayFields() {
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
  console.log('🧪 Testing array field insertions...\n');

  // Test cultural_activities
  const testActivities = ['museums', 'theaters', 'festivals', 'concerts'];
  const { error: activitiesError } = await supabase
    .from('towns')
    .update({ cultural_activities: testActivities })
    .eq('id', town.id);

  if (activitiesError) {
    console.log(`❌ cultural_activities: ${activitiesError.message}`);
  } else {
    console.log(`✅ cultural_activities: Successfully set to ${JSON.stringify(testActivities)}`);
  }

  // Test sports_facilities
  const testFacilities = ['gyms', 'swimming pools', 'tennis courts', 'soccer fields'];
  const { error: facilitiesError } = await supabase
    .from('towns')
    .update({ sports_facilities: testFacilities })
    .eq('id', town.id);

  if (facilitiesError) {
    console.log(`❌ sports_facilities: ${facilitiesError.message}`);
  } else {
    console.log(`✅ sports_facilities: Successfully set to ${JSON.stringify(testFacilities)}`);
  }

  // Test natural_disaster_risk (integer field)
  console.log('\n🧪 Testing natural_disaster_risk...\n');

  const { error: riskError } = await supabase
    .from('towns')
    .update({ natural_disaster_risk: 3 })
    .eq('id', town.id);

  if (riskError) {
    console.log(`❌ natural_disaster_risk (integer): ${riskError.message}`);
  } else {
    console.log(`✅ natural_disaster_risk: Successfully set to 3`);
  }
}

testArrayFields();
