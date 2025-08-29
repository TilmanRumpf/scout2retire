#!/usr/bin/env node

/**
 * NORMALIZE GEOGRAPHIC FEATURES TO USER PREFERENCE FORMAT
 * Only allow: coastal, mountain, island, lake, river, valley, desert, forest, plains
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

console.log('🔄 NORMALIZING GEOGRAPHIC FEATURES TO USER PREFERENCE FORMAT');
console.log('=' .repeat(50));

// Valid values from UI
const VALID_FEATURES = [
  'coastal', 'mountain', 'island', 'lake', 'river', 
  'valley', 'desert', 'forest', 'plains'
];

// Mapping rules
const FEATURE_MAPPINGS = {
  'mountains': 'mountain',
  'islands': 'island',
  'lakes': 'lake',
  'rivers': 'river',
  'high mountains': 'mountain',
  'tropical coastline': 'coastal',
  'coastal plains': ['coastal', 'plains'],
  'continental': null, // Remove
  'hills': null // Remove
};

// Get all towns with geographic features
const { data: towns } = await supabase
  .from('towns')
  .select('id, name, geographic_features_actual')
  .not('geographic_features_actual', 'is', null);

console.log(`\n📊 Processing ${towns.length} towns with geographic features`);

let updatedCount = 0;
let unchangedCount = 0;

for (const town of towns) {
  const originalFeatures = town.geographic_features_actual;
  const normalizedFeatures = new Set();
  
  // Process each feature
  for (const feature of originalFeatures) {
    const lowerFeature = feature.toLowerCase().trim();
    
    // Check if it needs mapping
    if (FEATURE_MAPPINGS.hasOwnProperty(lowerFeature)) {
      const mapped = FEATURE_MAPPINGS[lowerFeature];
      if (mapped === null) {
        // Skip this feature (remove it)
        continue;
      } else if (Array.isArray(mapped)) {
        // Add multiple features
        mapped.forEach(f => normalizedFeatures.add(f));
      } else {
        // Add single mapped feature
        normalizedFeatures.add(mapped);
      }
    } else if (VALID_FEATURES.includes(lowerFeature)) {
      // Already valid
      normalizedFeatures.add(lowerFeature);
    } else {
      console.log(`  ⚠️ Unknown feature "${feature}" in ${town.name} - removing`);
    }
  }
  
  const newFeatures = Array.from(normalizedFeatures).sort();
  
  // Check if changed
  const originalSorted = [...originalFeatures].sort();
  const changed = JSON.stringify(originalSorted) !== JSON.stringify(newFeatures);
  
  if (changed) {
    // Update the town
    const { error } = await supabase
      .from('towns')
      .update({ geographic_features_actual: newFeatures })
      .eq('id', town.id);
    
    if (error) {
      console.error(`❌ Error updating ${town.name}:`, error);
    } else {
      updatedCount++;
      if (updatedCount <= 5) {
        console.log(`  ✅ ${town.name}: [${originalFeatures}] → [${newFeatures}]`);
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
  .select('geographic_features_actual')
  .not('geographic_features_actual', 'is', null);

const allFeaturesAfter = new Set();
verification.forEach(t => {
  t.geographic_features_actual.forEach(f => allFeaturesAfter.add(f));
});

const finalFeatures = Array.from(allFeaturesAfter).sort();
console.log('\n📊 FINAL UNIQUE VALUES IN DATABASE:');
finalFeatures.forEach(f => {
  const isValid = VALID_FEATURES.includes(f);
  console.log(`  ${isValid ? '✅' : '❌'} ${f}`);
});

const invalidFeatures = finalFeatures.filter(f => !VALID_FEATURES.includes(f));
if (invalidFeatures.length > 0) {
  console.error('\n❌ INVALID FEATURES STILL EXIST:', invalidFeatures);
  process.exit(1);
} else {
  console.log('\n✅ ALL GEOGRAPHIC FEATURES NOW MATCH USER PREFERENCES!');
  console.log('Valid values:', VALID_FEATURES.join(', '));
}