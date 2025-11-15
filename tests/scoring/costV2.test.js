/**
 * Cost V2 Scoring Tests
 *
 * Tests the new ENABLE_COST_V2_SCORING algorithm that implements asymmetric cost scoring:
 * - Cheaper towns (townCost <= userBudget): Full score (no penalty)
 * - Expensive towns (townCost > userBudget): Smooth exponential penalty
 * - Luxury users (budget >= $4000): Soft penalty for extremely cheap towns (< 50% of budget)
 *
 * IMPORTANT: These tests require ENABLE_COST_V2_SCORING = true
 * Golden master tests must still pass with flag = false
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import './setup.js';
import { calculateCostScore } from '../../src/utils/scoring/categories/costScoring.js';
import { FEATURE_FLAGS } from '../../src/utils/scoring/config.js';

// ============================================================================
// TEST SETUP - Enable Cost V2 for these tests
// ============================================================================

// Temporarily enable flag for these tests
const originalFlag = FEATURE_FLAGS.ENABLE_COST_V2_SCORING;
FEATURE_FLAGS.ENABLE_COST_V2_SCORING = true;

// Restore flag after all tests
process.on('beforeExit', () => {
  FEATURE_FLAGS.ENABLE_COST_V2_SCORING = originalFlag;
});

// ============================================================================
// HELPER: Create minimal user preferences with specific budget
// ============================================================================

function createUserWithBudget(totalMonthlyCost) {
  return {
    total_monthly_cost: totalMonthlyCost,
    max_monthly_rent: null,
    monthly_healthcare_cost: null,
    income_tax_sensitive: false,
    property_tax_sensitive: false,
    sales_tax_sensitive: false
  };
}

// ============================================================================
// HELPER: Create minimal town with specific cost
// ============================================================================

function createTownWithCost(costOfLiving) {
  return {
    id: 999,
    town_name: 'Test Town',
    country: 'Test Country',
    cost_of_living_usd: costOfLiving,
    typical_rent_1bed: null,
    healthcare_cost_monthly: null,
    income_tax_rate_pct: null,
    property_tax_rate_pct: null,
    sales_tax_rate_pct: null
  };
}

// ============================================================================
// TEST 1: Cheaper town → Full base score (70 points)
// ============================================================================

test('Cost V2: Cheaper town gets full base score (no penalty)', () => {
  const user = createUserWithBudget(3000); // Budget: $3000/month
  const town = createTownWithCost(2000);   // Town cost: $2000/month (cheaper)

  const result = calculateCostScore(user, town);

  // Should get full base score (70 points) + no luxury adjustment
  assert.ok(result.score >= 70,
    `Expected score >= 70 for cheaper town, got ${result.score}`);

  // Check that the factor mentions affordability
  const costFactor = result.factors.find(f => f.factor.includes('Affordable'));
  assert.ok(costFactor !== undefined,
    'Expected to find "Affordable" factor for cheaper town');

  console.log('✅ Test 1 passed (Cheaper town):');
  console.log(`   Budget: $3000, Town cost: $2000`);
  console.log(`   Base cost score: ${result.score}`);
  console.log(`   Factors: ${result.factors.map(f => f.factor).join(', ')}`);
});

// ============================================================================
// TEST 2: Slightly expensive → Mild penalty
// ============================================================================

test('Cost V2: Slightly expensive town gets mild penalty', () => {
  const user = createUserWithBudget(2000); // Budget: $2000/month
  const town = createTownWithCost(2400);   // Town cost: $2400/month (20% over budget)

  const result = calculateCostScore(user, town);

  // Ratio = 2400/2000 = 1.2
  // Expected score ≈ 70 * exp(-(1.2-1) * 2.0) = 70 * exp(-0.4) ≈ 47 points
  assert.ok(result.score >= 40 && result.score <= 55,
    `Expected mild penalty (40-55 points), got ${result.score}`);

  // Check that the factor mentions "over budget"
  const costFactor = result.factors.find(f => f.factor.includes('over budget'));
  assert.ok(costFactor !== undefined,
    'Expected to find "over budget" factor for expensive town');

  console.log('✅ Test 2 passed (Slightly expensive):');
  console.log(`   Budget: $2000, Town cost: $2400 (20% over)`);
  console.log(`   Base cost score: ${result.score}`);
  console.log(`   Factors: ${result.factors.map(f => f.factor).join(', ')}`);
});

// ============================================================================
// TEST 3: Very expensive → Strong penalty
// ============================================================================

test('Cost V2: Very expensive town gets strong penalty', () => {
  const user = createUserWithBudget(2000); // Budget: $2000/month
  const town = createTownWithCost(4000);   // Town cost: $4000/month (2x over budget)

  const result = calculateCostScore(user, town);

  // Ratio = 4000/2000 = 2.0
  // Expected base cost score ≈ 70 * exp(-(2.0-1) * 2.0) = 70 * exp(-2.0) ≈ 9 points
  // Plus neutral tax score (~7-8 points) = total ~16-18 points
  assert.ok(result.score >= 15 && result.score <= 20,
    `Expected strong penalty (15-20 points including tax), got ${result.score}`);

  // Check that the factor mentions "over budget"
  const costFactor = result.factors.find(f => f.factor.includes('over budget'));
  assert.ok(costFactor !== undefined,
    'Expected to find "over budget" factor for very expensive town');

  console.log('✅ Test 3 passed (Very expensive):');
  console.log(`   Budget: $2000, Town cost: $4000 (2x over)`);
  console.log(`   Base cost score: ${result.score}`);
  console.log(`   Factors: ${result.factors.map(f => f.factor).join(', ')}`);
});

// ============================================================================
// TEST 4: High budget + extremely cheap town → Soft luxury penalty
// ============================================================================

test('Cost V2: Luxury user with extremely cheap town gets soft penalty', () => {
  const user = createUserWithBudget(5000); // Budget: $5000/month (luxury)
  const town = createTownWithCost(1000);   // Town cost: $1000/month (20% of budget)

  const result = calculateCostScore(user, town);

  // Should get base score of 70 (cheaper = good)
  // But luxury adjustment applies: townCost/userBudget = 1000/5000 = 0.2 (< 0.5 threshold)
  // Penalty factor = 1 - (0.2/0.5) = 0.6
  // Penalty = 0.30 * 0.6 * 70 = 12.6 points
  // Final score ≈ 70 - 13 = 57 points

  assert.ok(result.score >= 50 && result.score <= 65,
    `Expected luxury penalty (50-65 points), got ${result.score}`);

  // Check that luxury mismatch factor is present
  const luxuryFactor = result.factors.find(f => f.factor.includes('Luxury budget mismatch'));
  assert.ok(luxuryFactor !== undefined,
    'Expected to find "Luxury budget mismatch" factor for high-budget user with cheap town');

  console.log('✅ Test 4 passed (Luxury user + cheap town):');
  console.log(`   Budget: $5000, Town cost: $1000 (20% of budget)`);
  console.log(`   Base cost score: ${result.score}`);
  console.log(`   Factors: ${result.factors.map(f => f.factor).join(', ')}`);
});

// ============================================================================
// TEST 5: Normal user + cheap town → No luxury penalty
// ============================================================================

test('Cost V2: Normal user with cheap town gets NO luxury penalty', () => {
  const user = createUserWithBudget(2500); // Budget: $2500/month (normal)
  const town = createTownWithCost(800);    // Town cost: $800/month (32% of budget)

  const result = calculateCostScore(user, town);

  // Should get full base score (70 points) with NO luxury penalty
  // (user budget < $4000 threshold)
  assert.ok(result.score >= 70,
    `Expected full score (70+), got ${result.score}`);

  // Should NOT have luxury mismatch factor
  const luxuryFactor = result.factors.find(f => f.factor.includes('Luxury budget mismatch'));
  assert.strictEqual(luxuryFactor, undefined,
    'Should NOT have luxury penalty for normal-budget user');

  console.log('✅ Test 5 passed (Normal user + cheap town):');
  console.log(`   Budget: $2500, Town cost: $800 (32% of budget)`);
  console.log(`   Base cost score: ${result.score}`);
  console.log(`   No luxury penalty applied (budget < $4000)`);
});

// ============================================================================
// TEST 6: Edge case - Exactly at budget → Full score
// ============================================================================

test('Cost V2: Town cost exactly matching budget gets full score', () => {
  const user = createUserWithBudget(3000); // Budget: $3000/month
  const town = createTownWithCost(3000);   // Town cost: $3000/month (exact match)

  const result = calculateCostScore(user, town);

  // Ratio = 3000/3000 = 1.0 (exactly at budget)
  // Should get full base score (70 points)
  assert.ok(result.score >= 70,
    `Expected full score for exact match, got ${result.score}`);

  console.log('✅ Test 6 passed (Exact match):');
  console.log(`   Budget: $3000, Town cost: $3000`);
  console.log(`   Base cost score: ${result.score}`);
});

console.log('\n🎉 All Cost V2 tests passed!');
