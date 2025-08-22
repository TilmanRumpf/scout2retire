import { calculateRegionScore } from './src/utils/enhancedMatchingAlgorithm.js';

// Test cases for region scoring
const testCases = [
  {
    name: "No preferences = 100%",
    preferences: {
      countries: [],
      regions: [],
      geographic_features: [],
      vegetation_types: []
    },
    town: {
      country: 'Portugal',
      region: 'Algarve',
      regions: ['Algarve', 'Southern Portugal'],
      geographic_features_actual: ['coastal'],
      vegetation_type_actual: ['mediterranean']
    },
    expected: 100
  },
  {
    name: "Country match = 100%",
    preferences: {
      countries: ['Portugal'],
      regions: [],
      geographic_features: [],
      vegetation_types: []
    },
    town: {
      country: 'Portugal',
      region: 'Algarve',
      regions: ['Algarve', 'Southern Portugal'],
      geographic_features_actual: [],
      vegetation_type_actual: []
    },
    expected: 100 // 40/40 + 30/30 + 20/20 = 90/90 = 100%
  },
  {
    name: "Region match only = ~33%",
    preferences: {
      countries: ['Spain'],
      regions: ['Algarve'],
      geographic_features: [],
      vegetation_types: []
    },
    town: {
      country: 'Portugal',
      region: 'Algarve',
      regions: ['Algarve', 'Southern Portugal'],
      geographic_features_actual: [],
      vegetation_type_actual: []
    },
    expected: 56 // 30/90 (region match) + 30/90 (no geo pref) + 20/90 (no veg pref) = 80/90 = 89%
  },
  {
    name: "No match at all = ~56%",
    preferences: {
      countries: ['Spain'],
      regions: ['Costa del Sol'],
      geographic_features: [],
      vegetation_types: []
    },
    town: {
      country: 'Portugal',
      region: 'Algarve',
      regions: ['Algarve', 'Southern Portugal'],
      geographic_features_actual: [],
      vegetation_type_actual: []
    },
    expected: 56 // 0/90 (no match) + 30/90 (no geo pref) + 20/90 (no veg pref) = 50/90 = 56%
  },
  {
    name: "Full match with all features = 100%",
    preferences: {
      countries: ['Portugal'],
      regions: ['Algarve'],
      geographic_features: ['coastal'],
      vegetation_types: ['mediterranean']
    },
    town: {
      country: 'Portugal',
      region: 'Algarve',
      regions: ['Algarve', 'Southern Portugal'],
      geographic_features_actual: ['coastal', 'beach'],
      vegetation_type_actual: ['mediterranean', 'subtropical']
    },
    expected: 100 // 40/90 + 30/90 + 20/90 = 90/90 = 100%
  },
  {
    name: "Country match but wrong features = ~44%",
    preferences: {
      countries: ['Portugal'],
      regions: [],
      geographic_features: ['mountainous'],
      vegetation_types: ['alpine']
    },
    town: {
      country: 'Portugal',
      region: 'Algarve',
      regions: ['Algarve', 'Southern Portugal'],
      geographic_features_actual: ['coastal', 'beach'],
      vegetation_type_actual: ['mediterranean', 'subtropical']
    },
    expected: 44 // 40/90 (country) + 0/90 (wrong geo) + 0/90 (wrong veg) = 40/90 = 44%
  }
];

// Run tests
console.log('Testing Region Scoring Algorithm\n');
console.log('=' .repeat(60));

testCases.forEach(test => {
  const result = calculateRegionScore(test.preferences, test.town);
  const passed = result.score === test.expected;
  
  console.log(`\nTest: ${test.name}`);
  console.log(`Expected: ${test.expected}%`);
  console.log(`Actual: ${result.score}%`);
  console.log(`Status: ${passed ? '✅ PASS' : '❌ FAIL'}`);
  
  if (!passed) {
    console.log('Factors:', result.factors);
    console.log(`Raw score: ${result.rawScore}/${result.maxScore}`);
  }
});

console.log('\n' + '=' .repeat(60));
console.log('Test Summary:');
const passed = testCases.filter(t => {
  const result = calculateRegionScore(t.preferences, t.town);
  return result.score === t.expected;
}).length;
console.log(`${passed}/${testCases.length} tests passed`);