#!/usr/bin/env node

/**
 * Test the region matching with case sensitivity fixes
 */

import { calculateRegionScore } from './src/utils/enhancedMatchingAlgorithm.js';

// Test data
const userPreferences = {
  countries: ['Spain'],
  regions: ['Mediterranean', 'Southern Europe'],
  geographic_features: ['Coastal'],
  vegetation_types: ['Mediterranean', 'Subtropical']
};

// Test Spanish Mediterranean town
const valenciaTown = {
  name: 'Valencia',
  country: 'Spain',
  geo_region: 'Southern Europe,Western Europe,Mediterranean',
  regions: ['Mediterranean', 'Coastal'],
  geographic_features_actual: ['coastal'],
  vegetation_type_actual: ['mediterranean']
};

// Test Spanish Atlantic town
const baionaTown = {
  name: 'Baiona',
  country: 'Spain',
  geo_region: 'Southern Europe,Western Europe',
  regions: ['Atlantic', 'Coastal'],
  geographic_features_actual: ['coastal'],
  vegetation_type_actual: ['mediterranean']
};

// Test Portuguese town
const lisboaTown = {
  name: 'Lisbon',
  country: 'Portugal',
  geo_region: 'Southern Europe,Western Europe',
  regions: ['Atlantic', 'Coastal'],
  geographic_features_actual: ['coastal'],
  vegetation_type_actual: ['mediterranean']
};

console.log('Testing Region Matching with Case Sensitivity Fixes\n');
console.log('=' .repeat(60));
console.log('User Preferences:');
console.log('  Countries:', userPreferences.countries);
console.log('  Regions:', userPreferences.regions);
console.log('  Geographic:', userPreferences.geographic_features);
console.log('  Vegetation:', userPreferences.vegetation_types);
console.log('=' .repeat(60));

// Test Valencia (Mediterranean Spanish town)
console.log('\n1. Valencia (Spanish Mediterranean):');
const valenciaScore = calculateRegionScore(userPreferences, valenciaTown);
console.log('  Score:', valenciaScore.score + '%');
console.log('  Breakdown:');
valenciaScore.factors.forEach(f => console.log(`    - ${f.factor}: ${f.score} pts`));

// Test Baiona (Atlantic Spanish town)
console.log('\n2. Baiona (Spanish Atlantic):');
const baionaScore = calculateRegionScore(userPreferences, baionaTown);
console.log('  Score:', baionaScore.score + '%');
console.log('  Breakdown:');
baionaScore.factors.forEach(f => console.log(`    - ${f.factor}: ${f.score} pts`));

// Test Lisbon (Portuguese town)
console.log('\n3. Lisbon (Portuguese):');
const lisboaScore = calculateRegionScore(userPreferences, lisboaTown);
console.log('  Score:', lisboaScore.score + '%');
console.log('  Breakdown:');
lisboaScore.factors.forEach(f => console.log(`    - ${f.factor}: ${f.score} pts`));

console.log('\n' + '=' .repeat(60));
console.log('Summary:');
console.log('  Valencia should score 100% (Country + Med region + Coastal + Med vegetation)');
console.log('  Baiona should score ~89% (Country + Southern Europe + Coastal + Med vegetation)');
console.log('  Lisbon should score ~67% (Southern Europe region + Coastal + Med vegetation)');