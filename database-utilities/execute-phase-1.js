#!/usr/bin/env node

/**
 * PHASE 1: DATABASE NORMALIZATION
 * Convert all data to lowercase
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

console.log('🔧 PHASE 1: DATABASE NORMALIZATION');
console.log('=' .repeat(50));

async function normalizeData() {
  try {
    // 1. Normalize user_preferences
    console.log('\n📝 Normalizing user_preferences...');
    
    const { data: users } = await supabase
      .from('user_preferences')
      .select('*');
    
    for (const user of users || []) {
      const updates = {};
      
      // Normalize arrays to lowercase
      if (user.geographic_features) {
        updates.geographic_features = user.geographic_features.map(f => f?.toLowerCase());
      }
      if (user.vegetation_types) {
        updates.vegetation_types = user.vegetation_types.map(v => v?.toLowerCase());
      }
      if (user.activities) {
        // Expand compound activities
        const expanded = new Set();
        user.activities.forEach(a => {
          const lower = a?.toLowerCase();
          if (lower === 'walking_cycling') {
            expanded.add('walking');
            expanded.add('cycling');
          } else if (lower === 'cooking_wine') {
            expanded.add('cooking');
            expanded.add('wine');
          } else if (lower) {
            expanded.add(lower);
          }
        });
        updates.activities = Array.from(expanded);
      }
      
      // Update if changes needed
      if (Object.keys(updates).length > 0) {
        await supabase
          .from('user_preferences')
          .update(updates)
          .eq('user_id', user.user_id);
        console.log(`  ✅ Updated: ${user.email}`);
      }
    }
    
    // 2. Normalize towns
    console.log('\n📝 Normalizing towns...');
    
    const { data: towns } = await supabase
      .from('towns')
      .select('*');
    
    let townCount = 0;
    for (const town of towns || []) {
      const updates = {};
      
      if (town.geographic_features_actual && typeof town.geographic_features_actual === 'string') {
        updates.geographic_features_actual = town.geographic_features_actual.toLowerCase();
      }
      if (town.vegetation_type_actual && typeof town.vegetation_type_actual === 'string') {
        updates.vegetation_type_actual = town.vegetation_type_actual.toLowerCase();
      }
      
      if (Object.keys(updates).length > 0) {
        await supabase
          .from('towns')
          .update(updates)
          .eq('id', town.id);
        townCount++;
      }
    }
    console.log(`  ✅ Normalized ${townCount} towns`);
    
    // 3. Verify normalization
    console.log('\n🔍 Verifying normalization...');
    
    const { data: checkUser } = await supabase
      .from('user_preferences')
      .select('email, geographic_features')
      .limit(1)
      .single();
    
    const { data: checkTown } = await supabase
      .from('towns')
      .select('name, geographic_features_actual')
      .limit(1)
      .single();
    
    console.log(`  Sample user: ${checkUser?.email}`);
    console.log(`    Features: ${JSON.stringify(checkUser?.geographic_features)}`);
    console.log(`  Sample town: ${checkTown?.name}`);
    console.log(`    Features: ${checkTown?.geographic_features_actual}`);
    
    console.log('\n✅ PHASE 1 COMPLETE - All data normalized to lowercase');
    
  } catch (error) {
    console.error('❌ Phase 1 failed:', error.message);
    process.exit(1);
  }
}

normalizeData();