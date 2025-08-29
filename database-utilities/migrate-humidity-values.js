#!/usr/bin/env node

/**
 * MIGRATE HUMIDITY VALUES TO USER PREFERENCE FORMAT
 * From: low, moderate, high, very high
 * To: dry, balanced, humid
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

console.log('🔄 MIGRATING HUMIDITY VALUES TO USER PREFERENCE FORMAT');
console.log('=' .repeat(50));

// Mapping from old to new values
const HUMIDITY_MAPPING = {
  'low': 'dry',
  'moderate': 'balanced',
  'high': 'humid',
  'very high': 'humid'  // very high also maps to humid
};

// First, check current values
const { data: before } = await supabase
  .from('towns')
  .select('humidity_level_actual')
  .not('humidity_level_actual', 'is', null);

const beforeCounts = {};
before.forEach(t => {
  beforeCounts[t.humidity_level_actual] = (beforeCounts[t.humidity_level_actual] || 0) + 1;
});

console.log('\n📊 BEFORE MIGRATION:');
Object.entries(beforeCounts).forEach(([value, count]) => {
  console.log(`  ${value}: ${count} towns`);
});

// Perform migrations
console.log('\n🔧 PERFORMING MIGRATIONS:');

for (const [oldValue, newValue] of Object.entries(HUMIDITY_MAPPING)) {
  const { data, error } = await supabase
    .from('towns')
    .update({ humidity_level_actual: newValue })
    .eq('humidity_level_actual', oldValue)
    .select();
  
  if (error) {
    console.error(`❌ Error migrating ${oldValue} → ${newValue}:`, error);
  } else {
    console.log(`✅ Migrated ${data.length} towns from "${oldValue}" → "${newValue}"`);
  }
}

// Check after migration
const { data: after } = await supabase
  .from('towns')
  .select('humidity_level_actual')
  .not('humidity_level_actual', 'is', null);

const afterCounts = {};
after.forEach(t => {
  afterCounts[t.humidity_level_actual] = (afterCounts[t.humidity_level_actual] || 0) + 1;
});

console.log('\n📊 AFTER MIGRATION:');
Object.entries(afterCounts).forEach(([value, count]) => {
  console.log(`  ${value}: ${count} towns`);
});

// Validate only correct values remain
const invalidValues = Object.keys(afterCounts).filter(
  v => !['dry', 'balanced', 'humid'].includes(v)
);

if (invalidValues.length > 0) {
  console.error('\n❌ INVALID VALUES STILL EXIST:', invalidValues);
  process.exit(1);
} else {
  console.log('\n✅ ALL HUMIDITY VALUES NOW MATCH USER PREFERENCES!');
  console.log('Only values: dry, balanced, humid');
}