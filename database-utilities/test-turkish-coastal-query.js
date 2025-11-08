import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('Testing different query approaches for Turkish coastal towns:\n');

// Test 1: Simple LIKE
const { data: test1, error: err1 } = await supabase
  .from('towns')
  .select('town_name, geographic_features_actual, regions')
  .eq('country', 'Turkey')
  .like('geographic_features_actual', '%coastal%');

console.log('Test 1 - LIKE lowercase:');
console.log('  Results:', test1?.length || 0);
if (err1) console.log('  Error:', err1.message);
test1?.forEach(t => console.log(`    - ${t.town_name}: "${t.geographic_features_actual}"`));

// Test 2: ILIKERegionManager.jsx uses this)
const { data: test2, error: err2 } = await supabase
  .from('towns')
  .select('town_name, geographic_features_actual, regions')
  .eq('country', 'Turkey')
  .ilike('geographic_features_actual', '%coastal%');

console.log('\nTest 2 - ILIKE (case insensitive) - What RegionManager uses:');
console.log('  Results:', test2?.length || 0);
if (err2) console.log('  Error:', err2.message);
test2?.forEach(t => {
  console.log(`    - ${t.town_name}:`);
  console.log(`      geographic_features_actual: "${t.geographic_features_actual}"`);
  console.log(`      regions: ${JSON.stringify(t.regions)}`);
});

// Test 3: Check regions array
console.log('\nTest 3 - Check if regions array contains "coastal":'  );
const { data: allTurkish } = await supabase
  .from('towns')
  .select('town_name, geographic_features_actual, regions')
  .eq('country', 'Turkey');

allTurkish?.forEach(town => {
  const regions = Array.isArray(town.regions) ? town.regions : [];
  const hasCoastalInRegions = regions.some(r => r.toLowerCase().includes('coastal'));
  const hasCoastalInFeatures = town.geographic_features_actual?.toLowerCase().includes('coastal');

  console.log(`    - ${town.town_name}:`);
  console.log(`      In features: ${hasCoastalInFeatures}`);
  console.log(`      In regions: ${hasCoastalInRegions}`);
  console.log(`      Regions: ${JSON.stringify(regions)}`);
});
