#!/usr/bin/env node

/**
 * MIGRATE WINTER TEMPERATURE VALUES TO USER PREFERENCE FORMAT
 * From: cold, cool, mild, warm
 * To: cold, cool, mild (NO WARM)
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

console.log('🔄 MIGRATING WINTER TEMPERATURE VALUES TO USER PREFERENCE FORMAT');
console.log('=' .repeat(50));

// First, check current values
const { data: before } = await supabase
  .from('towns')
  .select('winter_climate_actual')
  .not('winter_climate_actual', 'is', null);

const beforeCounts = {};
before.forEach(t => {
  beforeCounts[t.winter_climate_actual] = (beforeCounts[t.winter_climate_actual] || 0) + 1;
});

console.log('\n📊 BEFORE MIGRATION:');
Object.entries(beforeCounts).forEach(([value, count]) => {
  console.log(`  ${value}: ${count} towns`);
});

// Migrate warm → mild
console.log('\n🔧 PERFORMING MIGRATION:');
console.log('  warm → mild (user preferences only allow cold/cool/mild)');

const { data, error } = await supabase
  .from('towns')
  .update({ winter_climate_actual: 'mild' })
  .eq('winter_climate_actual', 'warm')
  .select();

if (error) {
  console.error('❌ Error migrating warm → mild:', error);
  process.exit(1);
} else {
  console.log(`✅ Migrated ${data.length} towns from "warm" → "mild"`);
}

// Check after migration
const { data: after } = await supabase
  .from('towns')
  .select('winter_climate_actual')
  .not('winter_climate_actual', 'is', null);

const afterCounts = {};
after.forEach(t => {
  afterCounts[t.winter_climate_actual] = (afterCounts[t.winter_climate_actual] || 0) + 1;
});

console.log('\n📊 AFTER MIGRATION:');
Object.entries(afterCounts).forEach(([value, count]) => {
  console.log(`  ${value}: ${count} towns`);
});

// Validate only correct values remain
const allowedValues = ['cold', 'cool', 'mild'];
const invalidValues = Object.keys(afterCounts).filter(
  v => !allowedValues.includes(v)
);

if (invalidValues.length > 0) {
  console.error('\n❌ INVALID VALUES STILL EXIST:', invalidValues);
  process.exit(1);
} else {
  console.log('\n✅ ALL WINTER VALUES NOW MATCH USER PREFERENCES!');
  console.log('Only values: cold, cool, mild');
}