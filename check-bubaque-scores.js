import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkScores() {
  console.log('🔍 Checking Bubaque scores...\n');

  const { data, error } = await supabase
    .from('towns')
    .select('id, name, hospital_count, healthcare_score, admin_score, overall_score, infrastructure_score')
    .ilike('name', 'Bubaque')
    .single();

  if (error) {
    console.log('❌ Error:', error.message);
    return;
  }

  console.log('Current Data:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Hospital count:', data.hospital_count);
  console.log('Healthcare score:', data.healthcare_score);
  console.log('Admin score:', data.admin_score);
  console.log('Infrastructure score:', data.infrastructure_score);
  console.log('Overall score:', data.overall_score);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('⚠️  The scores are NOT automatically recalculated when data changes.');
  console.log('    We need to run the scoring algorithm to update them.');
}

checkScores().catch(console.error);
