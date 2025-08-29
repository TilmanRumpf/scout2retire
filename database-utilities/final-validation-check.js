#!/usr/bin/env node

/**
 * FINAL VALIDATION CHECK
 * Verify all fields match user preference values
 */

import { createClient } from '@supabase/supabase-js';
import { ALLOWED_VALUES, validateTown } from './STRICT-DATA-VALIDATOR.js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

console.log('🔍 FINAL VALIDATION CHECK - ALL FIELDS');
console.log('=' .repeat(50));

// Check all climate fields
const { data: towns } = await supabase
  .from('towns')
  .select('*');

console.log(`\nChecking ${towns.length} towns...\n`);

// Track issues
const issues = {
  precipitation: new Set(),
  sunshine: new Set(),
  humidity: new Set(),
  summer: new Set(),
  winter: new Set(),
  geographic: new Set(),
  vegetation: new Set()
};

let validTowns = 0;
let invalidTowns = 0;
const invalidTownNames = [];

// Check each town
for (const town of towns) {
  const isValid = validateTown(town);
  
  if (isValid) {
    validTowns++;
  } else {
    invalidTowns++;
    invalidTownNames.push(town.name);
    
    // Track specific issues
    if (town.precipitation_level_actual && !ALLOWED_VALUES.precipitation_level_actual.includes(town.precipitation_level_actual)) {
      issues.precipitation.add(town.precipitation_level_actual);
    }
    if (town.sunshine_level_actual && !ALLOWED_VALUES.sunshine_level_actual.includes(town.sunshine_level_actual)) {
      issues.sunshine.add(town.sunshine_level_actual);
    }
    if (town.humidity_level_actual && !ALLOWED_VALUES.humidity_level_actual.includes(town.humidity_level_actual)) {
      issues.humidity.add(town.humidity_level_actual);
    }
    if (town.summer_climate_actual && !ALLOWED_VALUES.summer_climate_actual.includes(town.summer_climate_actual)) {
      issues.summer.add(town.summer_climate_actual);
    }
    if (town.winter_climate_actual && !ALLOWED_VALUES.winter_climate_actual.includes(town.winter_climate_actual)) {
      issues.winter.add(town.winter_climate_actual);
    }
  }
}

// Check arrays separately
for (const town of towns) {
  // Geographic features
  if (town.geographic_features_actual && Array.isArray(town.geographic_features_actual)) {
    for (const feature of town.geographic_features_actual) {
      if (!ALLOWED_VALUES.geographic_features_actual.includes(feature)) {
        issues.geographic.add(feature);
      }
    }
  }
  
  // Vegetation types
  if (town.vegetation_type_actual && Array.isArray(town.vegetation_type_actual)) {
    for (const veg of town.vegetation_type_actual) {
      if (!ALLOWED_VALUES.vegetation_type_actual.includes(veg)) {
        issues.vegetation.add(veg);
      }
    }
  }
}

// Report results
console.log('📊 VALIDATION RESULTS:');
console.log(`  ✅ Valid towns: ${validTowns}`);
console.log(`  ❌ Invalid towns: ${invalidTowns}`);

if (invalidTowns > 0) {
  console.log('\n❌ INVALID TOWNS:');
  invalidTownNames.slice(0, 10).forEach(name => console.log(`  - ${name}`));
  if (invalidTownNames.length > 10) {
    console.log(`  ... and ${invalidTownNames.length - 10} more`);
  }
}

// Report specific issues
console.log('\n📋 FIELD-BY-FIELD ANALYSIS:');

const fields = [
  { name: 'Precipitation', issues: issues.precipitation, allowed: ALLOWED_VALUES.precipitation_level_actual },
  { name: 'Sunshine', issues: issues.sunshine, allowed: ALLOWED_VALUES.sunshine_level_actual },
  { name: 'Humidity', issues: issues.humidity, allowed: ALLOWED_VALUES.humidity_level_actual },
  { name: 'Summer Climate', issues: issues.summer, allowed: ALLOWED_VALUES.summer_climate_actual },
  { name: 'Winter Climate', issues: issues.winter, allowed: ALLOWED_VALUES.winter_climate_actual },
  { name: 'Geographic Features', issues: issues.geographic, allowed: ALLOWED_VALUES.geographic_features_actual },
  { name: 'Vegetation Types', issues: issues.vegetation, allowed: ALLOWED_VALUES.vegetation_type_actual }
];

fields.forEach(field => {
  const invalidValues = Array.from(field.issues);
  if (invalidValues.length === 0) {
    console.log(`\n✅ ${field.name}: CLEAN`);
    console.log(`   Allowed: [${field.allowed.filter(v => v !== null).join(', ')}]`);
  } else {
    console.log(`\n❌ ${field.name}: ISSUES FOUND`);
    console.log(`   Invalid values: [${invalidValues.join(', ')}]`);
    console.log(`   Allowed: [${field.allowed.filter(v => v !== null).join(', ')}]`);
  }
});

// Summary
console.log('\n' + '=' .repeat(50));
if (invalidTowns === 0 && Object.values(issues).every(set => set.size === 0)) {
  console.log('✅ ALL DATA IS CLEAN AND NORMALIZED!');
  console.log('All towns match user preference values exactly.');
} else {
  console.log('❌ DATA ISSUES REMAIN');
  console.log('Some towns still have invalid values that need fixing.');
}