// Quick test to verify the climate preference fix works
import { calculateClimateScore } from './src/utils/scoring/enhancedMatchingAlgorithm.js';

// Test with array preferences (like Tilman's data)
const testPreferences = {
  summer_climate_preference: ['warm', 'hot'],
  winter_climate_preference: ['mild'],
  humidity_level: ['balanced', 'dry']
};

const testTown = {
  name: 'Granada',
  summer_climate_actual: 'hot',
  winter_climate_actual: 'cool',
  humidity_level_actual: 'balanced',
  avg_temp_summer: 28,
  avg_temp_winter: 12
};

console.log('Testing climate scoring with array preferences...');
try {
  const result = calculateClimateScore(testPreferences, testTown);
  console.log('✅ SUCCESS! Climate score calculated:', result);
  console.log('Score:', result.score);
  console.log('Factors:', result.factors);
} catch (error) {
  console.error('❌ FAILED:', error.message);
  console.error('Stack:', error.stack);
}

// Test with string preferences (backward compatibility)
const stringPreferences = {
  summer_climate_preference: 'warm',
  winter_climate_preference: 'mild',
  humidity_level: 'balanced'
};

console.log('\nTesting with string preferences...');
try {
  const result = calculateClimateScore(stringPreferences, testTown);
  console.log('✅ SUCCESS! Climate score calculated:', result);
  console.log('Score:', result.score);
  console.log('Factors:', result.factors);
} catch (error) {
  console.error('❌ FAILED:', error.message);
}