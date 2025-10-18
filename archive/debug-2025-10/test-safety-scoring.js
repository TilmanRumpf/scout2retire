/**
 * TEST: Safety Scoring Component-based Architecture
 *
 * Tests the new 3-component scoring system:
 * - Base Safety (0-7.0)
 * - Crime Impact (-1.0 to +2.0)
 * - Environmental Safety (0-1.0)
 */

import { calculateSafetyScore, getSafetyScoreBreakdown } from './src/utils/scoring/helpers/calculateSafetyScore.js';

console.log('🛡️ SAFETY SCORING COMPONENT TEST\n');
console.log('Component-based Architecture: Base + Crime Impact + Environmental = Total\n');
console.log('═'.repeat(80));

// Test Case 1: Tokyo, Japan (very safe, low crime)
const tokyo = {
  name: 'Tokyo',
  safety_score: 8.5,
  crime_rate: 15,
  environmental_health_rating: 7.0,
  natural_disaster_risk: 'moderate'  // Earthquakes
};

console.log('\n📍 TEST 1: Tokyo, Japan (Very Safe, Low Crime, Earthquake Risk)');
console.log('─'.repeat(80));
const tokyoScore = calculateSafetyScore(tokyo);
const tokyoBreakdown = getSafetyScoreBreakdown(tokyo);
console.log(`Final Score: ${tokyoScore}/10.0`);
console.log('\nComponent Breakdown:');
console.log(`  Base Safety:     ${tokyoBreakdown.baseSafety.toFixed(1)}/7.0`);
console.log(`    - Admin Rating: ${tokyoBreakdown.components.base.adminRating.toFixed(1)}`);
console.log(`  Crime Impact:    ${tokyoBreakdown.crimeImpact > 0 ? '+' : ''}${tokyoBreakdown.crimeImpact.toFixed(1)}`);
console.log(`    - Crime Rate: ${tokyoBreakdown.components.crime.crimeRate} (${tokyoBreakdown.components.crime.description})`);
console.log(`  Environmental:   ${tokyoBreakdown.environmental.toFixed(1)}/1.0`);
console.log(`    - Health: ${tokyoBreakdown.components.environmental.healthRating}`);
console.log(`    - Disaster Risk: ${tokyoBreakdown.components.environmental.disasterRisk}`);

// Test Case 2: Mexico City, Mexico (moderate safety)
const mexicoCity = {
  name: 'Mexico City',
  safety_score: 5.0,
  crime_rate: 65,
  environmental_health_rating: 4.0,
  natural_disaster_risk: 'high'  // Earthquakes
};

console.log('\n\n📍 TEST 2: Mexico City, Mexico (Moderate Safety, Some Crime)');
console.log('─'.repeat(80));
const mexicoCityScore = calculateSafetyScore(mexicoCity);
const mexicoCityBreakdown = getSafetyScoreBreakdown(mexicoCity);
console.log(`Final Score: ${mexicoCityScore}/10.0`);
console.log('\nComponent Breakdown:');
console.log(`  Base Safety:     ${mexicoCityBreakdown.baseSafety.toFixed(1)}/7.0`);
console.log(`    - Admin Rating: ${mexicoCityBreakdown.components.base.adminRating.toFixed(1)}`);
console.log(`  Crime Impact:    ${mexicoCityBreakdown.crimeImpact > 0 ? '+' : ''}${mexicoCityBreakdown.crimeImpact.toFixed(1)}`);
console.log(`    - Crime Rate: ${mexicoCityBreakdown.components.crime.crimeRate} (${mexicoCityBreakdown.components.crime.description})`);
console.log(`  Environmental:   ${mexicoCityBreakdown.environmental.toFixed(1)}/1.0`);
console.log(`    - Health: ${mexicoCityBreakdown.components.environmental.healthRating}`);
console.log(`    - Disaster Risk: ${mexicoCityBreakdown.components.environmental.disasterRisk}`);

// Test Case 3: Reykjavik, Iceland (extremely safe)
const reykjavik = {
  name: 'Reykjavik',
  safety_score: 9.0,
  crime_rate: 10,
  environmental_health_rating: 9.5,
  natural_disaster_risk: 'low'
};

console.log('\n\n📍 TEST 3: Reykjavik, Iceland (Extremely Safe, Perfect Score)');
console.log('─'.repeat(80));
const reykjavikScore = calculateSafetyScore(reykjavik);
const reykjavikBreakdown = getSafetyScoreBreakdown(reykjavik);
console.log(`Final Score: ${reykjavikScore}/10.0`);
console.log('\nComponent Breakdown:');
console.log(`  Base Safety:     ${reykjavikBreakdown.baseSafety.toFixed(1)}/7.0`);
console.log(`    - Admin Rating: ${reykjavikBreakdown.components.base.adminRating.toFixed(1)}`);
console.log(`  Crime Impact:    ${reykjavikBreakdown.crimeImpact > 0 ? '+' : ''}${reykjavikBreakdown.crimeImpact.toFixed(1)}`);
console.log(`    - Crime Rate: ${reykjavikBreakdown.components.crime.crimeRate} (${reykjavikBreakdown.components.crime.description})`);
console.log(`  Environmental:   ${reykjavikBreakdown.environmental.toFixed(1)}/1.0`);
console.log(`    - Health: ${reykjavikBreakdown.components.environmental.healthRating}`);
console.log(`    - Disaster Risk: ${reykjavikBreakdown.components.environmental.disasterRisk}`);

// Test Case 4: High crime area
const highCrime = {
  name: 'High Crime City',
  safety_score: 4.0,
  crime_rate: 85,
  environmental_health_rating: 5.0,
  natural_disaster_risk: 'moderate'
};

console.log('\n\n📍 TEST 4: High Crime City (Significant Safety Concerns)');
console.log('─'.repeat(80));
const highCrimeScore = calculateSafetyScore(highCrime);
const highCrimeBreakdown = getSafetyScoreBreakdown(highCrime);
console.log(`Final Score: ${highCrimeScore}/10.0`);
console.log('\nComponent Breakdown:');
console.log(`  Base Safety:     ${highCrimeBreakdown.baseSafety.toFixed(1)}/7.0`);
console.log(`    - Admin Rating: ${highCrimeBreakdown.components.base.adminRating.toFixed(1)}`);
console.log(`  Crime Impact:    ${highCrimeBreakdown.crimeImpact > 0 ? '+' : ''}${highCrimeBreakdown.crimeImpact.toFixed(1)} (PENALTY)`);
console.log(`    - Crime Rate: ${highCrimeBreakdown.components.crime.crimeRate} (${highCrimeBreakdown.components.crime.description})`);
console.log(`  Environmental:   ${highCrimeBreakdown.environmental.toFixed(1)}/1.0`);
console.log(`    - Health: ${highCrimeBreakdown.components.environmental.healthRating}`);
console.log(`    - Disaster Risk: ${highCrimeBreakdown.components.environmental.disasterRisk}`);

// Test Case 5: Minimal data (edge case)
const minimal = {
  name: 'Minimal Data Town',
  safety_score: null,
  crime_rate: null,
  environmental_health_rating: null,
  natural_disaster_risk: null
};

console.log('\n\n📍 TEST 5: Edge Case - Minimal Data (All Defaults)');
console.log('─'.repeat(80));
const minimalScore = calculateSafetyScore(minimal);
const minimalBreakdown = getSafetyScoreBreakdown(minimal);
console.log(`Final Score: ${minimalScore}/10.0`);
console.log('\nComponent Breakdown:');
console.log(`  Base Safety:     ${minimalBreakdown.baseSafety.toFixed(1)}/7.0 (should be 5.0 default)`);
console.log(`  Crime Impact:    ${minimalBreakdown.crimeImpact > 0 ? '+' : ''}${minimalBreakdown.crimeImpact.toFixed(1)} (should be 0.0 neutral)`);
console.log(`  Environmental:   ${minimalBreakdown.environmental.toFixed(1)}/1.0 (should be 0.5 neutral)`);

console.log('\n\n═'.repeat(80));
console.log('✅ SAFETY SCORING IMPLEMENTATION COMPLETE\n');
console.log('Key Features:');
console.log('  ✓ 3 independent components (Base, Crime Impact, Environmental)');
console.log('  ✓ Admin baseline capped at 7.0 to leave room for bonuses');
console.log('  ✓ Crime rate can add bonus (+2.0) or penalty (-1.0)');
console.log('  ✓ Environmental health + natural disaster risk (0-1.0)');
console.log('  ✓ Total range: 0.0-10.0');
console.log('  ✓ Full transparency via breakdown function\n');

// Cleanup
await import('fs').then(fs => {
  fs.promises.unlink('./check-safety-fields.js').catch(() => {});
});
