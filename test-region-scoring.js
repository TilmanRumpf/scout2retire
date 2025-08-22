import { calculateRegionScore } from './src/utils/enhancedMatchingAlgorithm.js';

// Test Spanish town matching
const spanishTown = {
  id: 1,
  name: 'Granada',
  country: 'Spain',
  region: 'Andalusia'
};

// Test user with Spain preference
const userWithSpainPref = {
  countries: ['Spain'],
  regions: ['Europe', 'Mediterranean']
};

// Test user with no preferences (should get 100%)
const userWithNoPrefs = {};

console.log('=== Testing Region Scoring ===');
console.log('Spanish town:', spanishTown.name, spanishTown.country);

console.log('\n1. User with Spain preference:');
const result1 = calculateRegionScore(userWithSpainPref, spanishTown);
console.log('Score:', result1.score);
console.log('Factors:', result1.factors);

console.log('\n2. User with no preferences:');
const result2 = calculateRegionScore(userWithNoPrefs, spanishTown);
console.log('Score:', result2.score);
console.log('Factors:', result2.factors);

console.log('\n3. User with different country preference (Portugal):');
const userWithPortugalPref = {
  countries: ['Portugal'],
  regions: ['Europe']
};
const result3 = calculateRegionScore(userWithPortugalPref, spanishTown);
console.log('Score:', result3.score);
console.log('Factors:', result3.factors);
