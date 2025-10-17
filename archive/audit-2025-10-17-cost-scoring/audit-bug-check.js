/**
 * BUG CHECK: Verify no new bugs introduced by the fix
 */

import { calculateCostScore } from './src/utils/scoring/categories/costScoring.js';

console.log('\n' + '='.repeat(80));
console.log('BUG CHECK: Testing Edge Cases for New Issues');
console.log('='.repeat(80));

let bugCount = 0;

// Test 1: Divide by zero protection
console.log('\n1. DIVIDE BY ZERO CHECK:');
try {
  const result = calculateCostScore(
    { total_monthly_budget: 3000 },
    { cost_of_living_usd: 0 } // Zero cost
  );
  console.log(`   ✅ No crash with zero cost - Score: ${result.score}`);
} catch (e) {
  console.log(`   ❌ BUG: Crashes with zero cost - ${e.message}`);
  bugCount++;
}

// Test 2: Null/undefined handling
console.log('\n2. NULL/UNDEFINED HANDLING:');
try {
  const result1 = calculateCostScore(
    { total_monthly_budget: null },
    { cost_of_living_usd: 3000 }
  );
  console.log(`   ✅ Handles null budget - Score: ${result1.score}`);

  const result2 = calculateCostScore(
    { total_monthly_budget: undefined },
    { cost_of_living_usd: 3000 }
  );
  console.log(`   ✅ Handles undefined budget - Score: ${result2.score}`);

  const result3 = calculateCostScore(
    { total_monthly_budget: 3000 },
    { cost_of_living_usd: null }
  );
  console.log(`   ✅ Handles null cost - Score: ${result3.score}`);
} catch (e) {
  console.log(`   ❌ BUG: Crashes on null/undefined - ${e.message}`);
  bugCount++;
}

// Test 3: Negative score check
console.log('\n3. NEGATIVE SCORE PREVENTION:');
const result = calculateCostScore(
  { total_monthly_budget: 100 },
  { cost_of_living_usd: 10000 }
);
if (result.score < 0) {
  console.log(`   ❌ BUG: Score went negative - Score: ${result.score}`);
  bugCount++;
} else {
  console.log(`   ✅ No negative scores - Score: ${result.score}`);
}

// Test 4: Score exceeds 100 before cap
console.log('\n4. SCORE CAP VERIFICATION:');
const result2 = calculateCostScore(
  {
    total_monthly_budget: 10000,
    max_monthly_rent: 5000,
    monthly_healthcare_budget: 1000
  },
  {
    cost_of_living_usd: 1000,
    typical_rent_1bed: 100,
    healthcare_cost_monthly: 50
  }
);
if (result2.score > 100) {
  console.log(`   ❌ BUG: Score exceeds 100 - Score: ${result2.score}`);
  bugCount++;
} else {
  console.log(`   ✅ Score properly capped - Score: ${result2.score}`);
}

// Test 5: String number handling
console.log('\n5. STRING NUMBER CONVERSION:');
try {
  const result = calculateCostScore(
    { total_monthly_budget: "3000" }, // String instead of number
    { cost_of_living_usd: "2900" }
  );
  console.log(`   ✅ Handles string numbers - Score: ${result.score}`);
} catch (e) {
  console.log(`   ❌ BUG: Doesn't handle string numbers - ${e.message}`);
  bugCount++;
}

// Test 6: NaN handling
console.log('\n6. NaN PROTECTION:');
try {
  const result = calculateCostScore(
    { total_monthly_budget: NaN },
    { cost_of_living_usd: 3000 }
  );
  console.log(`   ✅ Handles NaN values - Score: ${result.score}`);
} catch (e) {
  console.log(`   ❌ BUG: Crashes on NaN - ${e.message}`);
  bugCount++;
}

// Test 7: Tax scoring not broken
console.log('\n7. TAX SCORING INTEGRITY:');
const result3 = calculateCostScore(
  {
    total_monthly_budget: 3000,
    income_tax_sensitive: true
  },
  {
    cost_of_living_usd: 2900,
    income_tax_rate_pct: 5
  }
);
const hasTaxScore = result3.factors.some(f => f.factor.includes('tax') || f.factor.includes('Tax'));
if (!hasTaxScore) {
  console.log(`   ❌ BUG: Tax scoring broken`);
  bugCount++;
} else {
  console.log(`   ✅ Tax scoring still works`);
}

// Test 8: Empty object handling
console.log('\n8. EMPTY OBJECT HANDLING:');
try {
  const result = calculateCostScore({}, {});
  console.log(`   ✅ Handles empty objects - Score: ${result.score}`);
} catch (e) {
  console.log(`   ❌ BUG: Crashes on empty objects - ${e.message}`);
  bugCount++;
}

// Test 9: Very large numbers
console.log('\n9. LARGE NUMBER HANDLING:');
try {
  const result = calculateCostScore(
    { total_monthly_budget: 999999999 },
    { cost_of_living_usd: 1 }
  );
  if (result.score > 100) {
    console.log(`   ❌ BUG: Large numbers break cap - Score: ${result.score}`);
    bugCount++;
  } else {
    console.log(`   ✅ Handles large numbers - Score: ${result.score}`);
  }
} catch (e) {
  console.log(`   ❌ BUG: Crashes on large numbers - ${e.message}`);
  bugCount++;
}

// Test 10: Missing town data gracefully
console.log('\n10. MISSING TOWN DATA:');
try {
  const result = calculateCostScore(
    {
      total_monthly_budget: 3000,
      max_monthly_rent: 1200,
      monthly_healthcare_budget: 200
    },
    {
      cost_of_living_usd: 2900
      // No rent or healthcare data
    }
  );
  console.log(`   ✅ Gracefully handles missing data - Score: ${result.score}`);
} catch (e) {
  console.log(`   ❌ BUG: Crashes on missing data - ${e.message}`);
  bugCount++;
}

console.log('\n' + '='.repeat(80));
console.log('BUG CHECK SUMMARY:');
console.log('='.repeat(80));

if (bugCount === 0) {
  console.log('\n✅ NO NEW BUGS DETECTED - All edge cases handled gracefully');
} else {
  console.log(`\n❌ ${bugCount} BUGS FOUND - Needs attention before production`);
}

console.log('\n');
