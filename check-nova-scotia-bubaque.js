import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function checkTowns() {
  // Check for Nova Scotia towns
  console.log('🔍 Looking for Nova Scotia towns...\n');
  const { data: nsTowns, error: nsError } = await supabase
    .from('towns')
    .select('id, name, country, region')
    .or('country.ilike.%canada%,region.ilike.%nova scotia%')
    .limit(20);

  if (nsError) {
    console.error('Error:', nsError);
  } else {
    console.log('Canadian/Nova Scotia related towns:');
    nsTowns?.forEach(t => console.log(`  - ${t.name}, ${t.country} (region: ${t.region})`));
  }

  // Check for Bubaque
  console.log('\n🔍 Looking for Bubaque...\n');
  const { data: bubaque, error: bubError } = await supabase
    .from('towns')
    .select('id, name, country, mobile_coverage, internet_reliability, public_transport_quality')
    .eq('name', 'Bubaque')
    .single();

  if (bubError && bubError.code !== 'PGRST116') {
    console.error('Error:', bubError);
  } else if (bubaque) {
    console.log('Found Bubaque:');
    console.log(`  - ${bubaque.name}, ${bubaque.country}`);
    console.log(`  - mobile_coverage: "${bubaque.mobile_coverage}"`);
    console.log(`  - internet_reliability: "${bubaque.internet_reliability}"`);
    console.log(`  - public_transport_quality: "${bubaque.public_transport_quality}"`);
  } else {
    console.log('Bubaque not found');
  }

  // Sample some infrastructure values to see the pattern
  console.log('\n🔍 Sample infrastructure values from random towns...\n');
  const { data: sample } = await supabase
    .from('towns')
    .select('name, mobile_coverage, internet_reliability')
    .not('mobile_coverage', 'is', null)
    .limit(5);

  sample?.forEach(t => {
    console.log(`  - ${t.name}: mobile="${t.mobile_coverage}", internet="${t.internet_reliability}"`);
  });
}

checkTowns();