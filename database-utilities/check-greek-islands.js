import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkGreekTowns() {
  const { data, error } = await supabase
    .from('towns')
    .select('name, country, geographic_features_actual, regions')
    .ilike('country', '%greece%');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('\n=== GREEK TOWNS ===\n');

  const islands = [];
  const mainland = [];

  data.forEach(town => {
    const regions = Array.isArray(town.regions)
      ? town.regions
      : [];

    const isIsland = regions.includes('Island');

    if (isIsland) {
      islands.push(town.name);
    } else {
      mainland.push(town.name);
    }

    console.log(`${town.name}:`);
    console.log(`  Features: ${JSON.stringify(town.geographic_features_actual)}`);
    console.log(`  Regions: ${JSON.stringify(town.regions)}`);
    console.log(`  Is Island: ${isIsland ? 'YES ✅' : 'NO ❌'}`);
    console.log('');
  });

  console.log('\n=== SUMMARY ===');
  console.log(`Islands (${islands.length}): ${islands.join(', ')}`);
  console.log(`Mainland (${mainland.length}): ${mainland.join(', ')}`);
}

checkGreekTowns();
