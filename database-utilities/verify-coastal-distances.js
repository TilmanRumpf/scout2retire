import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyCoastalDistances() {
  console.log('🔍 COASTAL DISTANCE VERIFICATION\n');
  console.log('='.repeat(100));

  // Check 1: Coastal towns with high ocean distance
  console.log('\n1. COASTAL TOWNS WITH SUSPICIOUSLY HIGH OCEAN DISTANCE (>50km)');
  console.log('-'.repeat(100));

  const { data: coastalFar } = await supabase
    .from('towns')
    .select('id, name, country, distance_to_ocean_km, geographic_features_actual')
    .like('geographic_features_actual', '%coastal%')
    .gt('distance_to_ocean_km', 50)
    .order('distance_to_ocean_km', { ascending: false });

  console.log(`Found ${coastalFar?.length || 0} coastal towns >50km from ocean:`);
  if (coastalFar && coastalFar.length > 0) {
    coastalFar.forEach(t => {
      console.log(`  ❌ ${t.name}, ${t.country}: ${t.distance_to_ocean_km}km`);
      console.log(`     Features: ${t.geographic_features_actual}`);
    });
    console.log('\n  RECOMMENDATION: These should have distance_to_ocean_km < 50');
  }

  // Check 2: Island towns far from ocean
  console.log('\n\n2. ISLAND TOWNS FAR FROM OCEAN (>10km)');
  console.log('-'.repeat(100));

  const { data: islandFar } = await supabase
    .from('towns')
    .select('id, name, country, distance_to_ocean_km, geographic_features_actual')
    .like('geographic_features_actual', '%island%')
    .gt('distance_to_ocean_km', 10)
    .order('distance_to_ocean_km', { ascending: false });

  console.log(`Found ${islandFar?.length || 0} island towns >10km from ocean:`);
  if (islandFar && islandFar.length > 0) {
    islandFar.forEach(t => {
      console.log(`  ❌ ${t.name}, ${t.country}: ${t.distance_to_ocean_km}km`);
      console.log(`     Features: ${t.geographic_features_actual}`);
    });
    console.log('\n  RECOMMENDATION: Islands should have distance_to_ocean_km ≤ 5');
  }

  // Check 3: Beach towns far from ocean
  console.log('\n\n3. BEACH TOWNS FAR FROM OCEAN (>5km)');
  console.log('-'.repeat(100));

  const { data: beachFar } = await supabase
    .from('towns')
    .select('id, name, country, distance_to_ocean_km, geographic_features_actual')
    .like('geographic_features_actual', '%beach%')
    .gt('distance_to_ocean_km', 5)
    .order('distance_to_ocean_km', { ascending: false });

  console.log(`Found ${beachFar?.length || 0} beach towns >5km from ocean:`);
  if (beachFar && beachFar.length > 0) {
    beachFar.forEach(t => {
      console.log(`  ❌ ${t.name}, ${t.country}: ${t.distance_to_ocean_km}km`);
      console.log(`     Features: ${t.geographic_features_actual}`);
    });
    console.log('\n  RECOMMENDATION: Beach towns should have distance_to_ocean_km ≤ 5');
  }

  // Check 4: Towns with NULL distance but coastal features
  console.log('\n\n4. COASTAL TOWNS WITH NULL OCEAN DISTANCE');
  console.log('-'.repeat(100));

  const { data: coastalNull } = await supabase
    .from('towns')
    .select('id, name, country, distance_to_ocean_km, geographic_features_actual')
    .like('geographic_features_actual', '%coastal%')
    .is('distance_to_ocean_km', null);

  console.log(`Found ${coastalNull?.length || 0} coastal towns with NULL distance:`);
  if (coastalNull && coastalNull.length > 0) {
    coastalNull.forEach(t => {
      console.log(`  ⚠️  ${t.name}, ${t.country}: NULL`);
      console.log(`     Features: ${t.geographic_features_actual}`);
    });
    console.log('\n  RECOMMENDATION: Set distance_to_ocean_km to 0-10 for coastal towns');
  }

  // Check 5: Non-coastal towns very close to ocean (<10km)
  console.log('\n\n5. NON-COASTAL TOWNS VERY CLOSE TO OCEAN (<10km but no coastal feature)');
  console.log('-'.repeat(100));

  const { data: nonCoastalClose } = await supabase
    .from('towns')
    .select('id, name, country, distance_to_ocean_km, geographic_features_actual')
    .not('geographic_features_actual', 'like', '%coastal%')
    .not('geographic_features_actual', 'like', '%beach%')
    .not('geographic_features_actual', 'like', '%island%')
    .lt('distance_to_ocean_km', 10)
    .gt('distance_to_ocean_km', 0)
    .order('distance_to_ocean_km');

  console.log(`Found ${nonCoastalClose?.length || 0} non-coastal towns <10km from ocean:`);
  if (nonCoastalClose && nonCoastalClose.length > 0) {
    nonCoastalClose.slice(0, 20).forEach(t => {
      console.log(`  ⚠️  ${t.name}, ${t.country}: ${t.distance_to_ocean_km}km`);
      console.log(`     Features: ${t.geographic_features_actual || 'NULL'}`);
    });
    if (nonCoastalClose.length > 20) {
      console.log(`  ... and ${nonCoastalClose.length - 20} more`);
    }
    console.log('\n  RECOMMENDATION: Consider adding "coastal" to geographic_features_actual');
  }

  // Check 6: Summary statistics
  console.log('\n\n6. DISTANCE TO OCEAN STATISTICS');
  console.log('-'.repeat(100));

  const { data: allDistances } = await supabase
    .from('towns')
    .select('distance_to_ocean_km, geographic_features_actual')
    .not('distance_to_ocean_km', 'is', null);

  if (allDistances && allDistances.length > 0) {
    const distances = allDistances.map(t => t.distance_to_ocean_km);
    const avg = distances.reduce((a, b) => a + b, 0) / distances.length;
    const min = Math.min(...distances);
    const max = Math.max(...distances);
    const median = distances.sort((a, b) => a - b)[Math.floor(distances.length / 2)];

    const coastal = allDistances.filter(t => t.geographic_features_actual?.includes('coastal'));
    const nonCoastal = allDistances.filter(t => !t.geographic_features_actual?.includes('coastal'));

    console.log(`Total towns with distance data: ${allDistances.length}`);
    console.log(`  Min: ${min}km`);
    console.log(`  Max: ${max}km`);
    console.log(`  Average: ${avg.toFixed(1)}km`);
    console.log(`  Median: ${median}km`);
    console.log(`\nCoastal towns (${coastal.length}):`);
    const coastalDistances = coastal.map(t => t.distance_to_ocean_km);
    if (coastalDistances.length > 0) {
      const coastalAvg = coastalDistances.reduce((a, b) => a + b, 0) / coastalDistances.length;
      const coastalMin = Math.min(...coastalDistances);
      const coastalMax = Math.max(...coastalDistances);
      console.log(`  Average: ${coastalAvg.toFixed(1)}km (should be <10)`);
      console.log(`  Min: ${coastalMin}km`);
      console.log(`  Max: ${coastalMax}km (likely data error if >50)`);
    }

    console.log(`\nNon-coastal towns (${nonCoastal.length}):`);
    const nonCoastalDistances = nonCoastal.map(t => t.distance_to_ocean_km);
    if (nonCoastalDistances.length > 0) {
      const nonCoastalAvg = nonCoastalDistances.reduce((a, b) => a + b, 0) / nonCoastalDistances.length;
      const nonCoastalMin = Math.min(...nonCoastalDistances);
      const nonCoastalMax = Math.max(...nonCoastalDistances);
      console.log(`  Average: ${nonCoastalAvg.toFixed(1)}km`);
      console.log(`  Min: ${nonCoastalMin}km`);
      console.log(`  Max: ${nonCoastalMax}km`);
    }
  }

  // Generate SQL fix script
  console.log('\n\n7. SUGGESTED SQL FIXES');
  console.log('-'.repeat(100));

  console.log('\n-- Fix 1: Set coastal towns to reasonable ocean distance (0-5km)');
  if (coastalFar && coastalFar.length > 0) {
    coastalFar.slice(0, 10).forEach(t => {
      console.log(`UPDATE towns SET distance_to_ocean_km = 2 WHERE id = ${t.id}; -- ${t.name}`);
    });
    if (coastalFar.length > 10) {
      console.log(`-- ... and ${coastalFar.length - 10} more coastal towns need fixing`);
    }
  }

  console.log('\n-- Fix 2: Set island towns to 0-1km from ocean');
  if (islandFar && islandFar.length > 0) {
    islandFar.slice(0, 10).forEach(t => {
      console.log(`UPDATE towns SET distance_to_ocean_km = 0 WHERE id = ${t.id}; -- ${t.name}`);
    });
    if (islandFar.length > 10) {
      console.log(`-- ... and ${islandFar.length - 10} more island towns need fixing`);
    }
  }

  console.log('\n-- Fix 3: Set beach towns to 0-2km from ocean');
  if (beachFar && beachFar.length > 0) {
    beachFar.slice(0, 10).forEach(t => {
      console.log(`UPDATE towns SET distance_to_ocean_km = 1 WHERE id = ${t.id}; -- ${t.name}`);
    });
    if (beachFar.length > 10) {
      console.log(`-- ... and ${beachFar.length - 10} more beach towns need fixing`);
    }
  }

  console.log('\n' + '='.repeat(100));
  console.log('✅ COASTAL DISTANCE VERIFICATION COMPLETE');
  console.log('='.repeat(100));
}

verifyCoastalDistances().catch(console.error);
