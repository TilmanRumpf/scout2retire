#!/usr/bin/env node

/**
 * NORMALIZE VEGETATION TYPES TO USER PREFERENCE FORMAT
 * Only allow: tropical, subtropical, mediterranean, forest, grassland, desert
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

console.log('🔄 NORMALIZING VEGETATION TYPES TO USER PREFERENCE FORMAT');
console.log('=' .repeat(50));

// Valid values from UI (lowercase)
const VALID_TYPES = [
  'tropical', 'subtropical', 'mediterranean', 'forest', 'grassland', 'desert'
];

// Mapping rules - map various forms to the base type
const TYPE_MAPPINGS = {
  // Mediterranean variations
  'coastal mediterranean': 'mediterranean',
  'mediterranean vegetation': 'mediterranean',
  
  // Tropical variations
  'coastal tropical': 'tropical',
  'tropical vegetation': 'tropical',
  'tropical highlands': 'tropical',
  
  // Forest variations
  'mixed forests': 'forest',
  'mountain forests': 'forest',
  'northern forests': 'forest',
  'temperate forests': 'forest',
  
  // Desert variations
  'desert vegetation': 'desert',
  
  // Subtropical variations
  'subtropical vegetation': 'subtropical',
  
  // Alpine (not in UI, closest is forest for mountain vegetation)
  'alpine vegetation': 'forest',
  
  // Temperate alone becomes forest
  'temperate': 'forest'
};

// Get all towns with vegetation types
const { data: towns } = await supabase
  .from('towns')
  .select('id, name, vegetation_type_actual')
  .not('vegetation_type_actual', 'is', null);

console.log(`\n📊 Processing ${towns.length} towns with vegetation types`);

let updatedCount = 0;
let unchangedCount = 0;

for (const town of towns) {
  const originalTypes = town.vegetation_type_actual;
  const normalizedTypes = new Set();
  
  // Process each type
  for (const type of originalTypes) {
    const lowerType = type.toLowerCase().trim();
    
    // Check if it needs mapping
    if (TYPE_MAPPINGS.hasOwnProperty(lowerType)) {
      const mapped = TYPE_MAPPINGS[lowerType];
      normalizedTypes.add(mapped);
    } else if (VALID_TYPES.includes(lowerType)) {
      // Already valid
      normalizedTypes.add(lowerType);
    } else {
      console.log(`  ⚠️ Unknown vegetation type "${type}" in ${town.name} - will try to map`);
      // Try to extract base type
      if (lowerType.includes('tropical')) normalizedTypes.add('tropical');
      else if (lowerType.includes('subtropical')) normalizedTypes.add('subtropical');
      else if (lowerType.includes('mediterranean')) normalizedTypes.add('mediterranean');
      else if (lowerType.includes('forest')) normalizedTypes.add('forest');
      else if (lowerType.includes('grassland')) normalizedTypes.add('grassland');
      else if (lowerType.includes('desert')) normalizedTypes.add('desert');
      else console.log(`    ❌ Could not map "${type}" - removing`);
    }
  }
  
  const newTypes = Array.from(normalizedTypes).sort();
  
  // Check if changed
  const originalSorted = [...originalTypes].sort();
  const changed = JSON.stringify(originalSorted) !== JSON.stringify(newTypes);
  
  if (changed) {
    // Update the town
    const { error } = await supabase
      .from('towns')
      .update({ vegetation_type_actual: newTypes })
      .eq('id', town.id);
    
    if (error) {
      console.error(`❌ Error updating ${town.name}:`, error);
    } else {
      updatedCount++;
      if (updatedCount <= 5) {
        console.log(`  ✅ ${town.name}: [${originalTypes}] → [${newTypes}]`);
      }
    }
  } else {
    unchangedCount++;
  }
}

console.log(`\n📊 RESULTS:`);
console.log(`  ✅ Updated: ${updatedCount} towns`);
console.log(`  ⭕ Unchanged: ${unchangedCount} towns`);

// Verify final state
const { data: verification } = await supabase
  .from('towns')
  .select('vegetation_type_actual')
  .not('vegetation_type_actual', 'is', null);

const allTypesAfter = new Set();
verification.forEach(t => {
  t.vegetation_type_actual.forEach(v => allTypesAfter.add(v));
});

const finalTypes = Array.from(allTypesAfter).sort();
console.log('\n📊 FINAL UNIQUE VALUES IN DATABASE:');
finalTypes.forEach(t => {
  const isValid = VALID_TYPES.includes(t);
  console.log(`  ${isValid ? '✅' : '❌'} ${t}`);
});

const invalidTypes = finalTypes.filter(t => !VALID_TYPES.includes(t));
if (invalidTypes.length > 0) {
  console.error('\n❌ INVALID TYPES STILL EXIST:', invalidTypes);
  process.exit(1);
} else {
  console.log('\n✅ ALL VEGETATION TYPES NOW MATCH USER PREFERENCES!');
  console.log('Valid values:', VALID_TYPES.join(', '));
}