import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkRegion() {
  console.log('🔍 CHECKING REGION VALUES FOR NS TOWNS\n');

  const nsTowns = ['Lunenburg', 'Mahone Bay', 'Peggy\'s Cove', 'Chester',
                   'Annapolis Royal', 'Digby', 'Yarmouth', 'Bridgewater',
                   'Truro', 'Lockeport'];

  for (const town of nsTowns) {
    const { data } = await supabase
      .from('towns')
      .select('town_name, region, country')
      .eq('name', town)
      .limit(1);

    if (data && data.length > 0) {
      console.log(`${town}: region = "${data[0].region}", country = "${data[0].country}"`);
    } else {
      console.log(`${town}: NOT FOUND`);
    }
  }
}

checkRegion();
