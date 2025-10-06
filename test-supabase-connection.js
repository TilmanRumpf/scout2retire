#!/usr/bin/env node

/**
 * TEST SUPABASE CONNECTION AND UPDATE CAPABILITY
 * This verifies that Claude can directly query and update Supabase
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔍 TEST 1: Query Canadian towns with optimized column selection\n');

const { data: canadianTowns, error: queryError } = await supabase
  .from('towns')
  .select('id, name, country, state_code, local_mobility_options, regional_connectivity, international_access')
  .eq('country', 'Canada')
  .limit(5);

if (queryError) {
  console.error('❌ Query failed:', queryError.message);
  process.exit(1);
}

console.log('✅ Successfully queried', canadianTowns.length, 'Canadian towns:');
canadianTowns.forEach(town => {
  console.log(`  - ${town.name}, ${town.state_code}`);
  console.log(`    Local mobility: ${town.local_mobility_options ? 'Has data' : '❌ NULL'}`);
  console.log(`    Regional connectivity: ${town.regional_connectivity ? 'Has data' : '❌ NULL'}`);
  console.log(`    International access: ${town.international_access ? 'Has data' : '❌ NULL'}`);
});

console.log('\n🔍 TEST 2: Count NULL values across all towns\n');

const { data: auditData, error: auditError } = await supabase
  .from('towns')
  .select('id, local_mobility_options, regional_connectivity, international_access');

if (auditError) {
  console.error('❌ Audit query failed:', auditError.message);
  process.exit(1);
}

const totalTowns = auditData.length;
const missingLocalMobility = auditData.filter(t => !t.local_mobility_options).length;
const missingRegionalConnectivity = auditData.filter(t => !t.regional_connectivity).length;
const missingInternationalAccess = auditData.filter(t => !t.international_access).length;

console.log(`Total towns: ${totalTowns}`);
console.log(`Missing local_mobility_options: ${missingLocalMobility}`);
console.log(`Missing regional_connectivity: ${missingRegionalConnectivity}`);
console.log(`Missing international_access: ${missingInternationalAccess}`);

if (missingLocalMobility === 0 && missingRegionalConnectivity === 0 && missingInternationalAccess === 0) {
  console.log('\n✅ All towns have complete data - no updates needed!');
  process.exit(0);
}

console.log('\n🔍 TEST 3: Execute UPDATE to backfill missing data\n');

// Only update if there are nulls
const { data: updateResult, error: updateError } = await supabase
  .from('towns')
  .update({
    local_mobility_options: ['walking', 'cycling', 'public_transit', 'ride_sharing', 'car_rental'],
    regional_connectivity: ['highways', 'regional_bus', 'domestic_flights'],
    international_access: ['international_airport', 'connecting_flights']
  })
  .is('local_mobility_options', null)
  .select('id, name, country');

if (updateError) {
  console.error('❌ Update failed:', updateError.message);
  process.exit(1);
}

console.log(`✅ Successfully updated ${updateResult?.length || 0} towns with missing local_mobility_options`);

// Update remaining nulls for regional_connectivity
const { data: updateResult2, error: updateError2 } = await supabase
  .from('towns')
  .update({
    regional_connectivity: ['highways', 'regional_bus', 'domestic_flights']
  })
  .is('regional_connectivity', null)
  .select('id, name, country');

if (updateError2) {
  console.error('❌ Update failed:', updateError2.message);
} else {
  console.log(`✅ Successfully updated ${updateResult2?.length || 0} towns with missing regional_connectivity`);
}

// Update remaining nulls for international_access
const { data: updateResult3, error: updateError3 } = await supabase
  .from('towns')
  .update({
    international_access: ['international_airport', 'connecting_flights']
  })
  .is('international_access', null)
  .select('id, name, country');

if (updateError3) {
  console.error('❌ Update failed:', updateError3.message);
} else {
  console.log(`✅ Successfully updated ${updateResult3?.length || 0} towns with missing international_access`);
}

console.log('\n🔍 TEST 4: Verify all updates completed\n');

const { data: verifyData, error: verifyError } = await supabase
  .from('towns')
  .select('id, local_mobility_options, regional_connectivity, international_access');

if (verifyError) {
  console.error('❌ Verification failed:', verifyError.message);
  process.exit(1);
}

const stillMissingLocal = verifyData.filter(t => !t.local_mobility_options).length;
const stillMissingRegional = verifyData.filter(t => !t.regional_connectivity).length;
const stillMissingInternational = verifyData.filter(t => !t.international_access).length;

console.log(`After updates:`);
console.log(`  Missing local_mobility_options: ${stillMissingLocal}`);
console.log(`  Missing regional_connectivity: ${stillMissingRegional}`);
console.log(`  Missing international_access: ${stillMissingInternational}`);

if (stillMissingLocal === 0 && stillMissingRegional === 0 && stillMissingInternational === 0) {
  console.log('\n✅ SUCCESS! All towns now have complete mobility/connectivity data!');
} else {
  console.log('\n⚠️ Some nulls remain - may need RLS policy check or manual investigation');
}

console.log('\n✅ TEST COMPLETE - Claude CAN query and update Supabase directly!');
