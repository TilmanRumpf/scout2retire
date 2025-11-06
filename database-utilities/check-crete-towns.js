import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkCrete() {
  const { data, error } = await supabase
    .from('towns')
    .select('town_name, country, regions')
    .ilike('country', '%greece%');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('\n=== CHECKING FOR CRETE TOWNS ===\n');

  const creteTowns = data.filter(town => {
    const regions = town.regions || [];
    return regions.some(r => r.toLowerCase().includes('crete'));
  });

  creteTowns.forEach(town => {
    const hasIsland = (town.regions || []).includes('Island');
    console.log(`${town.town_name}:`);
    console.log(`  Regions: ${JSON.stringify(town.regions)}`);
    console.log(`  Has "Island": ${hasIsland ? 'YES ✅' : 'NO ❌'}`);
    console.log('');
  });

  console.log(`\n=== SUMMARY ===`);
  console.log(`Crete towns: ${creteTowns.length}`);
  console.log(`With "Island" tag: ${creteTowns.filter(t => (t.regions || []).includes('Island')).length}`);
}

checkCrete();
