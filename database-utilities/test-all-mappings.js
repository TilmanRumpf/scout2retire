#!/usr/bin/env node

/**
 * COMPREHENSIVE MAPPING TEST
 * Tests all data transformations and validations
 */

import { toTitleCase, toDatabase, VALUE_LABEL_MAPS } from '../src/utils/dataTransformations.js';
import { ALLOWED_VALUES, validateValue } from './STRICT-DATA-VALIDATOR.js';

console.log('🔍 TESTING ALL DATA MAPPINGS AND VALIDATIONS');
console.log('=' .repeat(50));

// Test 1: Precipitation
console.log('\n1. PRECIPITATION');
const precipValues = ['mostly_dry', 'balanced', 'less_dry'];
precipValues.forEach(val => {
  const titleCase = toTitleCase(val);
  const valid = validateValue('precipitation_level_actual', val);
  console.log(`  ${val} → "${titleCase}" (Valid: ${valid ? '✅' : '❌'})`);
});

// Test 2: Sunshine
console.log('\n2. SUNSHINE');
const sunshineValues = ['often_sunny', 'balanced', 'less_sunny'];
sunshineValues.forEach(val => {
  const titleCase = toTitleCase(val);
  const valid = validateValue('sunshine_level_actual', val);
  console.log(`  ${val} → "${titleCase}" (Valid: ${valid ? '✅' : '❌'})`);
});

// Test 3: Summer Climate
console.log('\n3. SUMMER CLIMATE');
const summerValues = ['hot', 'warm', 'mild'];
summerValues.forEach(val => {
  const titleCase = toTitleCase(val);
  const valid = validateValue('summer_climate_actual', val);
  console.log(`  ${val} → "${titleCase}" (Valid: ${valid ? '✅' : '❌'})`);
});

// Test 4: Humidity (THE PROBLEM AREA)
console.log('\n4. HUMIDITY');
console.log('  Database values:');
const dbHumidity = ['low', 'moderate', 'high', 'very high'];
dbHumidity.forEach(val => {
  const titleCase = toTitleCase(val);
  const valid = validateValue('humidity_level_actual', val);
  const mapped = VALUE_LABEL_MAPS.humidity_level[val] || 'NOT MAPPED';
  console.log(`    ${val} → "${titleCase}" → Map: "${mapped}" (Valid: ${valid ? '✅' : '❌'})`);
});
console.log('  UI values:');
const uiHumidity = ['dry', 'balanced', 'humid'];
uiHumidity.forEach(val => {
  const mapped = VALUE_LABEL_MAPS.humidity_level[val] || 'NOT MAPPED';
  console.log(`    ${val} → Map: "${mapped}"`);
});

// Test 5: Geographic Features (Case Sensitivity)
console.log('\n5. GEOGRAPHIC FEATURES');
const geoTests = ['coastal', 'Coastal', 'COASTAL', 'mountains', 'Mountains'];
geoTests.forEach(val => {
  const lower = val.toLowerCase();
  const mapped = VALUE_LABEL_MAPS.geographic_features[lower];
  console.log(`  "${val}" → lowercase: "${lower}" → Map: "${mapped || 'NOT FOUND'}"`);
});

// Test 6: Vegetation (Case Sensitivity)
console.log('\n6. VEGETATION TYPES');
const vegTests = ['mediterranean', 'Mediterranean', 'MEDITERRANEAN', 'tropical', 'Tropical'];
vegTests.forEach(val => {
  const lower = val.toLowerCase();
  const mapped = VALUE_LABEL_MAPS.vegetation_types[lower];
  console.log(`  "${val}" → lowercase: "${lower}" → Map: "${mapped || 'NOT FOUND'}"`);
});

// Test 7: Check for forbidden values
console.log('\n7. FORBIDDEN VALUES CHECK');
const forbidden = {
  precipitation: ['often_rainy', 'dry', 'moderate'],
  sunshine: ['mostly_sunny', 'abundant', 'sunny', 'partly_sunny', 'often_cloudy'],
  summer: ['moderate', 'cool']
};

Object.entries(forbidden).forEach(([category, values]) => {
  console.log(`\n  ${category.toUpperCase()}:`);
  values.forEach(val => {
    let found = false;
    
    // Check in VALUE_LABEL_MAPS
    if (category === 'precipitation' && VALUE_LABEL_MAPS.precipitation[val]) found = true;
    if (category === 'sunshine' && VALUE_LABEL_MAPS.sunshine_level_actual[val]) found = true;
    if (category === 'summer' && VALUE_LABEL_MAPS.summer_climate_actual[val]) found = true;
    
    // Check in ALLOWED_VALUES
    if (category === 'precipitation' && ALLOWED_VALUES.precipitation_level_actual?.includes(val)) found = true;
    if (category === 'sunshine' && ALLOWED_VALUES.sunshine_level_actual?.includes(val)) found = true;
    if (category === 'summer' && ALLOWED_VALUES.summer_climate_actual?.includes(val)) found = true;
    
    console.log(`    "${val}": ${found ? '❌ FOUND (BAD!)' : '✅ Not found (good)'}`);
  });
});

console.log('\n' + '=' .repeat(50));
console.log('✅ TEST COMPLETE');