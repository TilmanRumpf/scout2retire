/**
 * QUALITY AUDIT: Verify Power User Penalty Fix
 * Date: 2025-10-17
 *
 * Tests all edge cases for the costScoring.js fix that removed
 * the power user penalty (50% reduction for setting rent/healthcare budgets)
 */

import { calculateCostScore } from './src/utils/scoring/categories/costScoring.js';

// Test helper to format results
function runTest(testName, preferences, town, expectedScore, expectedRange = null) {
  console.log('\n' + '='.repeat(80));
  console.log(`TEST: ${testName}`);
  console.log('='.repeat(80));

  console.log('\nInputs:');
  console.log('User Preferences:', JSON.stringify(preferences, null, 2));
  console.log('Town Data:', JSON.stringify(town, null, 2));

  const result = calculateCostScore(preferences, town);

  console.log('\nResults:');
  console.log(`Score: ${result.score}/100`);
  console.log('Factors:');
  result.factors.forEach(f => {
    console.log(`  - ${f.factor}: ${f.score} points`);
  });

  // Verify score is in expected range or exact match
  let passed = false;
  if (expectedRange) {
    passed = result.score >= expectedRange[0] && result.score <= expectedRange[1];
    console.log(`\nExpected Range: ${expectedRange[0]}-${expectedRange[1]}`);
  } else {
    passed = result.score === expectedScore;
    console.log(`\nExpected Score: ${expectedScore}`);
  }

  console.log(`Status: ${passed ? '✅ PASS' : '❌ FAIL'}`);

  if (!passed) {
    console.log(`\n⚠️ MISMATCH: Got ${result.score}, expected ${expectedRange || expectedScore}`);
  }

  return { passed, result };
}

// =============================================================================
// EDGE CASE TESTS
// =============================================================================

console.log('\n\n');
console.log('█'.repeat(80));
console.log('COST SCORING FIX - QUALITY AUDIT');
console.log('Testing removal of power user penalty');
console.log('█'.repeat(80));

// -----------------------------------------------------------------------------
// TEST 1: User sets ONLY total budget (no rent/healthcare)
// -----------------------------------------------------------------------------
const test1 = runTest(
  'Scenario A: User sets ONLY budget (no rent/healthcare)',
  {
    total_monthly_budget: 3000,
    // No rent or healthcare budgets
  },
  {
    cost_of_living_usd: 2900,
    // No rent or healthcare data
  },
  70, // Expected: 55 base + 0 bonuses + 7.5 tax (neutral) = 62.5 ≈ 63-70 (tax varies)
  [60, 75] // Allow range due to tax scoring
);

// -----------------------------------------------------------------------------
// TEST 2: User sets budget + rent
// -----------------------------------------------------------------------------
const test2 = runTest(
  'Scenario B: User sets budget + rent',
  {
    total_monthly_budget: 3000,
    max_monthly_rent: 1200,
  },
  {
    cost_of_living_usd: 2900,
    typical_rent_1bed: 800,
  },
  75, // Expected: 55 base + 20 rent bonus + 7.5 tax = 82.5 ≈ 75-85
  [75, 85]
);

// -----------------------------------------------------------------------------
// TEST 3: User sets all three (budget + rent + healthcare)
// -----------------------------------------------------------------------------
const test3 = runTest(
  'Scenario C: User sets all three budgets',
  {
    total_monthly_budget: 3000,
    max_monthly_rent: 1200,
    monthly_healthcare_budget: 200,
  },
  {
    cost_of_living_usd: 2900,
    typical_rent_1bed: 800,
    healthcare_cost_monthly: 150,
  },
  95, // Expected: 55 base + 20 rent + 10 healthcare + 7.5 tax = 92.5 ≈ 85-95
  [85, 100] // Should be capped at 100
);

// -----------------------------------------------------------------------------
// TEST 4: Town missing rent data (graceful handling)
// -----------------------------------------------------------------------------
const test4 = runTest(
  'Scenario D: Town missing rent data (no errors expected)',
  {
    total_monthly_budget: 3000,
    max_monthly_rent: 1200,
  },
  {
    cost_of_living_usd: 2900,
    typical_rent_1bed: null, // Missing data
  },
  70, // Expected: 55 base + 0 (no data) + 7.5 tax = 62.5 ≈ 63-70
  [60, 75]
);

// -----------------------------------------------------------------------------
// TEST 5: Budget ratio 2.0x (excellent value)
// -----------------------------------------------------------------------------
const test5 = runTest(
  'Scenario E: Budget 2x town cost (excellent value)',
  {
    total_monthly_budget: 6000,
  },
  {
    cost_of_living_usd: 3000,
  },
  78, // Expected: 70 (2.0x ratio) + 7.5 tax = 77.5 ≈ 75-80
  [75, 80]
);

// -----------------------------------------------------------------------------
// TEST 6: Budget ratio 1.5x (very comfortable)
// -----------------------------------------------------------------------------
const test6 = runTest(
  'Scenario F: Budget 1.5x town cost (very comfortable)',
  {
    total_monthly_budget: 4500,
  },
  {
    cost_of_living_usd: 3000,
  },
  73, // Expected: 65 (1.5x ratio) + 7.5 tax = 72.5 ≈ 70-75
  [70, 75]
);

// -----------------------------------------------------------------------------
// TEST 7: Budget ratio 1.2x (comfortable)
// -----------------------------------------------------------------------------
const test7 = runTest(
  'Scenario G: Budget 1.2x town cost (comfortable)',
  {
    total_monthly_budget: 3600,
  },
  {
    cost_of_living_usd: 3000,
  },
  68, // Expected: 60 (1.2x ratio) + 7.5 tax = 67.5 ≈ 65-70
  [65, 70]
);

// -----------------------------------------------------------------------------
// TEST 8: Budget ratio 1.0x (exact match)
// -----------------------------------------------------------------------------
const test8 = runTest(
  'Scenario H: Budget exactly matches cost',
  {
    total_monthly_budget: 3000,
  },
  {
    cost_of_living_usd: 3000,
  },
  63, // Expected: 55 (1.0x ratio) + 7.5 tax = 62.5 ≈ 60-65
  [60, 65]
);

// -----------------------------------------------------------------------------
// TEST 9: Budget ratio 0.9x (slightly tight)
// -----------------------------------------------------------------------------
const test9 = runTest(
  'Scenario I: Budget 90% of cost (slightly tight)',
  {
    total_monthly_budget: 2700,
  },
  {
    cost_of_living_usd: 3000,
  },
  53, // Expected: 45 (0.9x ratio) + 7.5 tax = 52.5 ≈ 50-55
  [50, 55]
);

// -----------------------------------------------------------------------------
// TEST 10: Budget ratio 0.8x (challenging)
// -----------------------------------------------------------------------------
const test10 = runTest(
  'Scenario J: Budget 80% of cost (challenging)',
  {
    total_monthly_budget: 2400,
  },
  {
    cost_of_living_usd: 3000,
  },
  38, // Expected: 30 (0.8x ratio) + 7.5 tax = 37.5 ≈ 35-40
  [35, 40]
);

// -----------------------------------------------------------------------------
// TEST 11: No preferences (should return 100)
// -----------------------------------------------------------------------------
const test11 = runTest(
  'Scenario K: No budget preferences (flexible user)',
  {},
  {
    cost_of_living_usd: 3000,
  },
  100, // Expected: 100 (no preferences = perfect match)
  [100, 100]
);

// -----------------------------------------------------------------------------
// TEST 12: Score cap at 100 (maximum possible)
// -----------------------------------------------------------------------------
const test12 = runTest(
  'Scenario L: Maximum score should be capped at 100',
  {
    total_monthly_budget: 10000,
    max_monthly_rent: 5000,
    monthly_healthcare_budget: 1000,
  },
  {
    cost_of_living_usd: 2000,
    typical_rent_1bed: 500,
    healthcare_cost_monthly: 100,
  },
  100, // Expected: 70 (2.0x) + 20 (rent) + 10 (healthcare) + 7.5 (tax) = 107.5 → capped at 100
  [100, 100]
);

// -----------------------------------------------------------------------------
// TEST 13: Negative score protection (should be 0 minimum)
// -----------------------------------------------------------------------------
const test13 = runTest(
  'Scenario M: Very low budget (should not go negative)',
  {
    total_monthly_budget: 1000,
  },
  {
    cost_of_living_usd: 5000,
  },
  5, // Expected: 5 (0.2x ratio, over budget) + 7.5 tax = 12.5 ≈ 10-15
  [5, 15]
);

// -----------------------------------------------------------------------------
// TEST 14: Partial rent match (80% threshold)
// -----------------------------------------------------------------------------
const test14 = runTest(
  'Scenario N: Rent budget at 80% threshold (partial bonus)',
  {
    total_monthly_budget: 3000,
    max_monthly_rent: 800,
  },
  {
    cost_of_living_usd: 2900,
    typical_rent_1bed: 1000, // User budget is 80% of rent
  },
  65, // Expected: 55 base + 10 partial rent + 7.5 tax = 72.5 ≈ 65-75
  [65, 75]
);

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n\n');
console.log('█'.repeat(80));
console.log('AUDIT SUMMARY');
console.log('█'.repeat(80));

const allTests = [test1, test2, test3, test4, test5, test6, test7, test8, test9, test10, test11, test12, test13, test14];
const passedTests = allTests.filter(t => t.passed).length;
const totalTests = allTests.length;

console.log(`\nTotal Tests: ${totalTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${totalTests - passedTests}`);
console.log(`Success Rate: ${((passedTests/totalTests)*100).toFixed(1)}%`);

if (passedTests === totalTests) {
  console.log('\n✅ ALL TESTS PASSED - FIX IS PRODUCTION READY');
} else {
  console.log('\n❌ SOME TESTS FAILED - FIX NEEDS ATTENTION');
}

console.log('\n');
