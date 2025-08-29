#!/usr/bin/env node

/**
 * FIX PRECIPITATION VALUES - One-time migration
 * Standardizes to EXACTLY 3 values: mostly_dry, balanced, less_dry
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfc2VydmljZV9yb2xlIiwiaWF0IjoxNzQ4NzA2MzQ1LCJleHAiOjIwNjQyODIzNDV9.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

console.log('🔧 FIXING PRECIPITATION VALUES');
console.log('=' .repeat(50));

// THE ONLY 3 ALLOWED VALUES - NOTHING ELSE!
const ALLOWED_PRECIPITATION = {
  'mostly_dry': 'Mostly Dry',
  'balanced': 'Balanced', 
  'less_dry': 'Less Dry'
};

// Migration mapping
const MIGRATION_MAP = {
  'dry': 'mostly_dry',
  'moderate': 'balanced',
  'often_rainy': 'less_dry',
  // Keep as is
  'mostly_dry': 'mostly_dry',
  'balanced': 'balanced'
};

async function migrate() {
  try {
    // 1. Get current state
    console.log('\n📊 Current state:');
    const { data: before, error: beforeError } = await supabase.from('towns').select('precipitation_level_actual');
    if (beforeError) throw beforeError;
    
    const beforeCounts = {};
    (before || []).forEach(t => {
      const val = t.precipitation_level_actual || 'null';
      beforeCounts[val] = (beforeCounts[val] || 0) + 1;
    });
    Object.entries(beforeCounts).forEach(([k,v]) => console.log(`  ${k}: ${v} towns`));
    
    // 2. Perform migration
    console.log('\n🔄 Migrating values...');
    
    // Update each non-standard value
    for (const [oldValue, newValue] of Object.entries(MIGRATION_MAP)) {
      if (oldValue !== newValue) {
        const { error, count } = await supabase
          .from('towns')
          .update({ precipitation_level_actual: newValue })
          .eq('precipitation_level_actual', oldValue);
        
        if (error) throw error;
        console.log(`  ✅ ${oldValue} → ${newValue} (${count || 0} towns)`);
      }
    }
    
    // 3. Verify final state
    console.log('\n✅ Final state:');
    const { data: after, error: afterError } = await supabase.from('towns').select('precipitation_level_actual');
    if (afterError) throw afterError;
    
    const afterCounts = {};
    (after || []).forEach(t => {
      const val = t.precipitation_level_actual || 'null';
      afterCounts[val] = (afterCounts[val] || 0) + 1;
    });
    Object.entries(afterCounts).forEach(([k,v]) => console.log(`  ${k}: ${v} towns`));
    
    // 4. Validate - CRITICAL CHECK
    console.log('\n🔍 Validation:');
    const invalidValues = Object.keys(afterCounts).filter(
      k => k !== 'null' && !Object.keys(ALLOWED_PRECIPITATION).includes(k)
    );
    
    if (invalidValues.length > 0) {
      console.error('❌ INVALID VALUES FOUND:', invalidValues);
      throw new Error('Migration failed - invalid values remain!');
    }
    
    console.log('✅ All values are valid!');
    console.log('\n✅ MIGRATION COMPLETE');
    console.log('\nNext steps:');
    console.log('1. Update UI components');
    console.log('2. Update VALUE_LABEL_MAPS');
    console.log('3. Create validation guards');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();