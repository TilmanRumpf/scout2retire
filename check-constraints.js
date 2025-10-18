import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkConstraints() {
  console.log('🔍 Checking constraints for culture-related fields...\n');

  // Get sample data to see what values exist
  const { data, error } = await supabase
    .from('towns')
    .select('cultural_events_frequency, pace_of_life_actual, social_atmosphere, traditional_progressive_lean, expat_community_size, retirement_community_presence, english_proficiency_level')
    .not('cultural_events_frequency', 'is', null)
    .limit(20);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Sample cultural_events_frequency values:');
  const uniqueFreq = [...new Set(data.map(t => t.cultural_events_frequency))].sort();
  uniqueFreq.forEach(v => console.log(`  - ${v}`));

  console.log('\nSample pace_of_life_actual values:');
  const uniquePace = [...new Set(data.map(t => t.pace_of_life_actual).filter(Boolean))].sort();
  uniquePace.forEach(v => console.log(`  - ${v}`));

  console.log('\nSample social_atmosphere values:');
  const uniqueSocial = [...new Set(data.map(t => t.social_atmosphere).filter(Boolean))].sort();
  uniqueSocial.forEach(v => console.log(`  - ${v}`));

  console.log('\nSample traditional_progressive_lean values:');
  const uniqueTrad = [...new Set(data.map(t => t.traditional_progressive_lean).filter(Boolean))].sort();
  uniqueTrad.forEach(v => console.log(`  - ${v}`));

  console.log('\nSample expat_community_size values:');
  const uniqueExpat = [...new Set(data.map(t => t.expat_community_size).filter(Boolean))].sort();
  uniqueExpat.forEach(v => console.log(`  - ${v}`));

  console.log('\nSample retirement_community_presence values:');
  const uniqueRetirement = [...new Set(data.map(t => t.retirement_community_presence).filter(Boolean))].sort();
  uniqueRetirement.forEach(v => console.log(`  - ${v}`));

  console.log('\nSample english_proficiency_level values:');
  const uniqueEnglish = [...new Set(data.map(t => t.english_proficiency_level).filter(Boolean))].sort();
  uniqueEnglish.forEach(v => console.log(`  - ${v}`));
}

checkConstraints().catch(console.error);
