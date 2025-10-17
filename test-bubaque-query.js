import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testBubaqueQuery() {
  console.log('🔍 Searching for Bubaque in towns table...\n');
  
  // Get Bubaque with healthcare data
  const { data, error } = await supabase
    .from('towns')
    .select('id, name, country, region, healthcare_quality_actual, hospital_count, clinic_count, medical_facilities')
    .ilike('name', 'Bubaque')
    .single();
  
  if (error) {
    console.log('❌ Error:', error);
    return;
  }
  
  console.log('✅ Found Bubaque!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('ID:', data.id);
  console.log('Name:', data.name);
  console.log('Country:', data.country);
  console.log('Region:', data.region);
  console.log('\n🏥 HEALTHCARE DATA:');
  console.log('Healthcare Quality:', data.healthcare_quality_actual);
  console.log('Hospital Count:', data.hospital_count);
  console.log('Clinic Count:', data.clinic_count);
  console.log('Medical Facilities:', data.medical_facilities);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

testBubaqueQuery().catch(console.error);
