import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// USE SERVICE ROLE KEY - HAS FULL PERMISSIONS
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateBubaqueHospital() {
  console.log('🏥 UPDATING BUBAQUE HOSPITAL COUNT (with service role)\n');

  // Update hospital count
  const { data, error } = await supabase
    .from('towns')
    .update({ hospital_count: 1 })
    .ilike('name', 'Bubaque')
    .select('id, name, hospital_count')
    .single();

  if (error) {
    console.log('❌ Error:', error.message);
    return;
  }

  console.log('✅ SUCCESS!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Name:', data.name);
  console.log('Hospital count:', data.hospital_count);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n🎉 Bubaque now shows "Hospitals: 1"');
  console.log('   Refresh the page to see the change!');
}

updateBubaqueHospital().catch(console.error);
