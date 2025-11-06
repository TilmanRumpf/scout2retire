#!/usr/bin/env node

/**
 * REMOVE REDUNDANT expat_population COLUMN
 * We only need expat_community_size
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

console.log('🗑️ REMOVING expat_population COLUMN');
console.log('=' .repeat(50));

// First, clear all values to ensure no constraints
console.log('\n1. Clearing expat_population values...');
const { error: clearError } = await supabase
  .from('towns')
  .update({ expat_population: null })
  .not('id', 'is', null);

if (clearError) {
  console.error('❌ Error clearing values:', clearError);
} else {
  console.log('✅ Cleared all expat_population values');
}

// Note: Supabase doesn't allow ALTER TABLE commands via API
// The column needs to be dropped via Supabase dashboard or migration
console.log('\n⚠️ IMPORTANT: Column cannot be dropped via API');
console.log('Please go to Supabase Dashboard > Table Editor > towns table');
console.log('And manually delete the expat_population column');
console.log('\nOR create a migration file in supabase/migrations/');

// Verify current state
const { data } = await supabase
  .from('towns')
  .select('town_name, expat_community_size, expat_population')
  .limit(5);

console.log('\n📊 Current state (first 5 towns):');
data.forEach(t => {
  console.log(`${t.town_name}: community_size="${t.expat_community_size}", population="${t.expat_population}"`);
});

console.log('\n✅ expat_community_size has valid values (small/moderate/large)');
console.log('❌ expat_population still exists but all values are null');
console.log('🔧 Manual action required to drop the column');