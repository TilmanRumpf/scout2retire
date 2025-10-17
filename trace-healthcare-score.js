import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function traceHealthcareScore() {
  console.log('🔍 TRACING: Where does healthcare_score come from?\n');

  // Get Bubaque's full data
  const { data: bubaque, error } = await supabase
    .from('towns')
    .select('*')
    .ilike('name', 'Bubaque')
    .single();

  if (error) {
    console.log('❌ Error:', error.message);
    return;
  }

  console.log('BUBAQUE HEALTHCARE DATA:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('healthcare_score:', bubaque.healthcare_score);
  console.log('hospital_count:', bubaque.hospital_count);
  console.log('clinic_count:', bubaque.clinic_count || 'null');
  console.log('nearest_major_hospital_km:', bubaque.nearest_major_hospital_km);
  console.log('english_speaking_doctors:', bubaque.english_speaking_doctors);
  console.log('healthcare_description:', bubaque.healthcare_description?.substring(0, 100) + '...');
  console.log('healthcare_cost:', bubaque.healthcare_cost);
  console.log('healthcare_cost_monthly:', bubaque.healthcare_cost_monthly);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Sample other towns to see the pattern
  const { data: sampleTowns } = await supabase
    .from('towns')
    .select('name, country, healthcare_score, hospital_count, nearest_major_hospital_km')
    .not('healthcare_score', 'is', null)
    .order('healthcare_score', { ascending: false })
    .limit(10);

  console.log('SAMPLE: Towns with HIGHEST healthcare_score:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  sampleTowns.forEach(t => {
    console.log(`${t.name} (${t.country}): score=${t.healthcare_score}, hospitals=${t.hospital_count}, nearest=${t.nearest_major_hospital_km}km`);
  });

  console.log('\n');
  
  const { data: lowTowns } = await supabase
    .from('towns')
    .select('name, country, healthcare_score, hospital_count, nearest_major_hospital_km')
    .not('healthcare_score', 'is', null)
    .order('healthcare_score', { ascending: true })
    .limit(10);

  console.log('SAMPLE: Towns with LOWEST healthcare_score:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lowTowns.forEach(t => {
    console.log(`${t.name} (${t.country}): score=${t.healthcare_score}, hospitals=${t.hospital_count}, nearest=${t.nearest_major_hospital_km}km`);
  });

  console.log('\n');
  console.log('ANALYSIS:');
  console.log('Looking at the data pattern to understand if healthcare_score is:');
  console.log('  A) Manually set/AI-generated (static values)');
  console.log('  B) Calculated from a formula');
  console.log('  C) Imported from external source');
}

traceHealthcareScore().catch(console.error);
