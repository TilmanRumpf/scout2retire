import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTestCities() {
  console.log('🔍 Checking farmers_markets for test cities...\n');

  const testCities = ['Vienna', 'Paris', 'Bangkok', 'Rome'];

  for (const cityName of testCities) {
    const { data, error } = await supabase
      .from('towns')
      .select('name, country, farmers_markets, population')
      .eq('name', cityName)
      .single();

    if (error) {
      console.log(`❌ ${cityName}: ${error.message}\n`);
    } else {
      const status = data.farmers_markets === true ? '✅ YES' :
                     data.farmers_markets === false ? '❌ NO' :
                     '❓ NULL';
      console.log(`${status} - ${data.name}, ${data.country}`);
      console.log(`   Population: ${data.population?.toLocaleString() || 'N/A'}`);
      console.log(`   farmers_markets: ${data.farmers_markets}`);
      console.log('');
    }
  }
}

checkTestCities();