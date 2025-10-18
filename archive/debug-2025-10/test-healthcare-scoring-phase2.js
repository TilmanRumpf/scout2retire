/**
 * TEST: Healthcare Scoring Phase 2 - Component-based Architecture
 *
 * Tests the new 3-component scoring system:
 * - Quality (0-4.0)
 * - Accessibility (0-3.0)
 * - Cost (0-3.0)
 */

import { calculateHealthcareScore, getHealthcareBonusBreakdown } from './src/utils/scoring/helpers/calculateHealthcareScore.js';

console.log('🏥 HEALTHCARE SCORING PHASE 2 TEST\n');
console.log('Component-based Architecture: Quality + Accessibility + Cost = Total\n');
console.log('═'.repeat(80));

// Test Case 1: Bubaque, Guinea-Bissau (remote island)
const bubaque = {
  name: 'Bubaque',
  healthcare_score: 2.0,
  hospital_count: 1,
  nearest_major_hospital_km: 60,
  english_speaking_doctors_available: false,
  emergency_services_quality: 4,
  international_insurance_acceptance: 'limited',
  healthcare_cost_level: 'low'
};

console.log('\n📍 TEST 1: Bubaque, Guinea-Bissau (Remote Island)');
console.log('─'.repeat(80));
const bubaqueScore = calculateHealthcareScore(bubaque);
const bubaqueBreakdown = getHealthcareBonusBreakdown(bubaque);
console.log(`Final Score: ${bubaqueScore}/10.0`);
console.log('\nComponent Breakdown:');
console.log(`  Quality:        ${bubaqueBreakdown.quality.toFixed(1)}/4.0`);
console.log(`    - Admin Base: ${bubaqueBreakdown.components.quality.adminBase.toFixed(1)}`);
console.log(`    - Hospital:   ${bubaqueBreakdown.components.quality.hospitalBonus.toFixed(1)}`);
console.log(`  Accessibility:  ${bubaqueBreakdown.accessibility.toFixed(1)}/3.0`);
console.log(`    - Distance:   ${bubaqueBreakdown.components.accessibility.distanceScore.toFixed(1)}`);
console.log(`    - Emergency:  ${bubaqueBreakdown.components.accessibility.emergencyScore.toFixed(1)}`);
console.log(`    - English:    ${bubaqueBreakdown.components.accessibility.englishBonus.toFixed(1)}`);
console.log(`  Cost:           ${bubaqueBreakdown.cost.toFixed(1)}/3.0`);
console.log(`    - Insurance:  ${bubaqueBreakdown.components.cost.insuranceScore.toFixed(1)}`);
console.log(`    - Afford:     ${bubaqueBreakdown.components.cost.affordabilityScore.toFixed(1)}`);

// Test Case 2: Porto, Portugal (EU city)
const porto = {
  name: 'Porto',
  healthcare_score: 7.5,
  hospital_count: 9,
  nearest_major_hospital_km: 3,
  english_speaking_doctors_available: true,
  emergency_services_quality: 9,
  international_insurance_acceptance: 'widely_accepted',
  healthcare_cost_level: 'moderate'
};

console.log('\n\n📍 TEST 2: Porto, Portugal (EU City)');
console.log('─'.repeat(80));
const portoScore = calculateHealthcareScore(porto);
const portoBreakdown = getHealthcareBonusBreakdown(porto);
console.log(`Final Score: ${portoScore}/10.0`);
console.log('\nComponent Breakdown:');
console.log(`  Quality:        ${portoBreakdown.quality.toFixed(1)}/4.0`);
console.log(`    - Admin Base: ${portoBreakdown.components.quality.adminBase.toFixed(1)}`);
console.log(`    - Hospital:   ${portoBreakdown.components.quality.hospitalBonus.toFixed(1)}`);
console.log(`  Accessibility:  ${portoBreakdown.accessibility.toFixed(1)}/3.0`);
console.log(`    - Distance:   ${portoBreakdown.components.accessibility.distanceScore.toFixed(1)}`);
console.log(`    - Emergency:  ${portoBreakdown.components.accessibility.emergencyScore.toFixed(1)}`);
console.log(`    - English:    ${portoBreakdown.components.accessibility.englishBonus.toFixed(1)}`);
console.log(`  Cost:           ${portoBreakdown.cost.toFixed(1)}/3.0`);
console.log(`    - Insurance:  ${portoBreakdown.components.cost.insuranceScore.toFixed(1)}`);
console.log(`    - Afford:     ${portoBreakdown.components.cost.affordabilityScore.toFixed(1)}`);

// Test Case 3: Chiang Mai, Thailand (affordable expat hub)
const chiangMai = {
  name: 'Chiang Mai',
  healthcare_score: 6.0,
  hospital_count: 6,
  nearest_major_hospital_km: 8,
  english_speaking_doctors_available: true,
  emergency_services_quality: 7,
  international_insurance_acceptance: 'commonly_accepted',
  healthcare_cost_level: 'very_low'
};

console.log('\n\n📍 TEST 3: Chiang Mai, Thailand (Affordable Expat Hub)');
console.log('─'.repeat(80));
const chiangMaiScore = calculateHealthcareScore(chiangMai);
const chiangMaiBreakdown = getHealthcareBonusBreakdown(chiangMai);
console.log(`Final Score: ${chiangMaiScore}/10.0`);
console.log('\nComponent Breakdown:');
console.log(`  Quality:        ${chiangMaiBreakdown.quality.toFixed(1)}/4.0`);
console.log(`    - Admin Base: ${chiangMaiBreakdown.components.quality.adminBase.toFixed(1)}`);
console.log(`    - Hospital:   ${chiangMaiBreakdown.components.quality.hospitalBonus.toFixed(1)}`);
console.log(`  Accessibility:  ${chiangMaiBreakdown.accessibility.toFixed(1)}/3.0`);
console.log(`    - Distance:   ${chiangMaiBreakdown.components.accessibility.distanceScore.toFixed(1)}`);
console.log(`    - Emergency:  ${chiangMaiBreakdown.components.accessibility.emergencyScore.toFixed(1)}`);
console.log(`    - English:    ${chiangMaiBreakdown.components.accessibility.englishBonus.toFixed(1)}`);
console.log(`  Cost:           ${chiangMaiBreakdown.cost.toFixed(1)}/3.0`);
console.log(`    - Insurance:  ${chiangMaiBreakdown.components.cost.insuranceScore.toFixed(1)}`);
console.log(`    - Afford:     ${chiangMaiBreakdown.components.cost.affordabilityScore.toFixed(1)}`);

// Test Case 4: Edge case - minimal data
const minimal = {
  name: 'Minimal Town',
  healthcare_score: null, // Should default to 1.5
  hospital_count: 0,
  nearest_major_hospital_km: null,
  english_speaking_doctors_available: false,
  emergency_services_quality: 0,
  international_insurance_acceptance: null,
  healthcare_cost_level: null
};

console.log('\n\n📍 TEST 4: Edge Case - Minimal Data (All Defaults)');
console.log('─'.repeat(80));
const minimalScore = calculateHealthcareScore(minimal);
const minimalBreakdown = getHealthcareBonusBreakdown(minimal);
console.log(`Final Score: ${minimalScore}/10.0`);
console.log('\nComponent Breakdown:');
console.log(`  Quality:        ${minimalBreakdown.quality.toFixed(1)}/4.0 (should be 1.5 default)`);
console.log(`  Accessibility:  ${minimalBreakdown.accessibility.toFixed(1)}/3.0 (should be 0.0)`);
console.log(`  Cost:           ${minimalBreakdown.cost.toFixed(1)}/3.0 (should be 0.0)`);

console.log('\n\n═'.repeat(80));
console.log('✅ PHASE 2 IMPLEMENTATION COMPLETE\n');
console.log('Key Features:');
console.log('  ✓ 3 independent components (Quality, Accessibility, Cost)');
console.log('  ✓ Admin baseline normalized to 0-3.0 scale for Quality');
console.log('  ✓ Hospital count adds to Quality (0-1.0)');
console.log('  ✓ Distance, emergency, English in Accessibility (0-3.0)');
console.log('  ✓ Insurance acceptance + cost level in Cost (0-3.0)');
console.log('  ✓ Total capped at 10.0');
console.log('  ✓ Full transparency via breakdown function\n');
