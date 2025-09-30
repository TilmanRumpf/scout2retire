import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAllFarmersMarkets() {
  console.log('🔍 Checking farmers_markets data for all towns...\n');

  const { data: towns, error } = await supabase
    .from('towns')
    .select('id, name, country, farmers_markets, population')
    .order('population', { ascending: false });

  if (error) {
    console.error('❌ Error fetching towns:', error);
    return;
  }

  // Group by farmers_markets value
  const withMarkets = towns.filter(t => t.farmers_markets === true);
  const withoutMarkets = towns.filter(t => t.farmers_markets === false);
  const nullMarkets = towns.filter(t => t.farmers_markets === null);

  console.log('📊 SUMMARY:');
  console.log(`✅ Towns WITH farmers markets: ${withMarkets.length}`);
  console.log(`❌ Towns WITHOUT farmers markets: ${withoutMarkets.length}`);
  console.log(`❓ Towns with NULL farmers markets: ${nullMarkets.length}`);
  console.log(`📍 Total towns: ${towns.length}\n`);

  console.log('🏙️  Major cities WITHOUT farmers markets (pop > 500k):');
  const majorCitiesWithout = withoutMarkets.filter(t => t.population > 500000);
  majorCitiesWithout.slice(0, 20).forEach(t => {
    console.log(`   - ${t.name}, ${t.country} (pop: ${t.population.toLocaleString()})`);
  });

  if (majorCitiesWithout.length > 20) {
    console.log(`   ... and ${majorCitiesWithout.length - 20} more major cities`);
  }

  console.log('\n🏘️  Sample of smaller towns without farmers markets:');
  const smallerTowns = withoutMarkets.filter(t => t.population <= 500000);
  smallerTowns.slice(0, 10).forEach(t => {
    console.log(`   - ${t.name}, ${t.country} (pop: ${t.population?.toLocaleString() || 'N/A'})`);
  });

  // Check if this seems like a data quality issue
  const percentWithout = (withoutMarkets.length / towns.length) * 100;
  console.log(`\n⚠️  ${percentWithout.toFixed(1)}% of towns marked as having NO farmers markets`);

  if (percentWithout > 50) {
    console.log('🚨 This seems like a DATA QUALITY ISSUE - most towns should have farmers markets!');
  }
}

checkAllFarmersMarkets();