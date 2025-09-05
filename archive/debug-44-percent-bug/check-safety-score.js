import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function checkSafetyData() {
  const { data: towns, error } = await supabase
    .from('towns')
    .select('id, name, country, safety_score, crime_rate')
    .order('safety_score', { ascending: false, nullsFirst: false });
    
  console.log('🔍 SAFETY DATA REALITY CHECK\n');
  
  if (error || !towns) {
    console.error('Error:', error);
    return;
  }
  
  // Check what we have
  const withSafetyScore = towns.filter(t => t.safety_score !== null);
  const withCrimeRate = towns.filter(t => t.crime_rate !== null);
  
  console.log(`safety_score: ${withSafetyScore.length}/341 populated (${(withSafetyScore.length/341*100).toFixed(1)}%)`);
  console.log(`crime_rate: ${withCrimeRate.length}/341 populated (${(withCrimeRate.length/341*100).toFixed(1)}%)`);
  console.log(`crime_index: Does not exist in database!`);
  
  console.log('\n📊 Sample of existing safety_score values:');
  withSafetyScore.slice(0, 10).forEach(t => {
    console.log(`${t.name}, ${t.country}: ${t.safety_score}/10`);
  });
  
  console.log('\n❌ Towns missing safety_score (sample):');
  towns.filter(t => t.safety_score === null).slice(0, 10).forEach(t => {
    console.log(`- ${t.name}, ${t.country}`);
  });
  
  console.log('\n💭 RECOMMENDATION:');
  console.log('1. Fill the 96 missing safety_score values (28% of towns)');
  console.log('2. Ignore crime_index completely - it adds no value');
  console.log('3. Use simple 1-10 ratings based on country + common sense');
  console.log('4. No algorithm changes needed!');
}

checkSafetyData();