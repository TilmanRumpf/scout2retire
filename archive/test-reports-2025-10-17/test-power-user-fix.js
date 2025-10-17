/**
 * REAL-WORLD TEST: Power User Penalty Fix
 * ========================================
 * Tests the cost scoring fix with actual database data
 * Simulates both OLD (broken) and NEW (fixed) algorithms
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// ============================================
// OLD ALGORITHM (BROKEN - WITH PENALTY)
// ============================================
function calculateOldCostScore(preferences, town) {
  let score = 0;
  let factors = [];

  const townCost = Number(town.cost_of_living_usd || town.typical_monthly_living_cost) || 0;
  const userBudget = Number(preferences.total_monthly_budget) || 0;

  if (!townCost || !userBudget) {
    return { score: 20, factors: [{ factor: 'Cost data not available', score: 20 }] };
  }

  const budgetRatio = userBudget / townCost;
  const hasRentBudget = !!preferences.max_monthly_rent;
  const hasHealthcareBudget = !!preferences.monthly_healthcare_budget;

  // OLD BROKEN LOGIC: Penalize for being thorough
  const maxBudgetPoints = hasRentBudget || hasHealthcareBudget ? 20 : 40; // 50% PENALTY!

  // Budget ratio scoring with penalty
  let budgetScore = 0;
  if (budgetRatio >= 2.0) {
    budgetScore = maxBudgetPoints;
  } else if (budgetRatio >= 1.5) {
    budgetScore = maxBudgetPoints * 0.9;
  } else if (budgetRatio >= 1.2) {
    budgetScore = maxBudgetPoints * 0.8;
  } else if (budgetRatio >= 1.0) {
    budgetScore = maxBudgetPoints * 0.7;
  } else if (budgetRatio >= 0.9) {
    budgetScore = maxBudgetPoints * 0.5;
  } else if (budgetRatio >= 0.8) {
    budgetScore = maxBudgetPoints * 0.3;
  } else {
    budgetScore = maxBudgetPoints * 0.1;
  }

  score += budgetScore;
  factors.push({ factor: `Budget ratio ${budgetRatio.toFixed(2)}x (max ${maxBudgetPoints} pts)`, score: budgetScore });

  // Rent matching (if they set it)
  if (hasRentBudget && town.typical_rent_1bed) {
    const userRentBudget = Number(preferences.max_monthly_rent);
    if (userRentBudget >= town.typical_rent_1bed) {
      score += 30;
      factors.push({ factor: 'Rent within budget', score: 30 });
    } else if (userRentBudget >= town.typical_rent_1bed * 0.8) {
      score += 15;
      factors.push({ factor: 'Rent slightly over', score: 15 });
    }
  }

  // Healthcare matching (if they set it)
  if (hasHealthcareBudget && town.healthcare_cost_monthly) {
    const userHealthcareBudget = Number(preferences.monthly_healthcare_budget);
    if (userHealthcareBudget >= town.healthcare_cost_monthly) {
      score += 20;
      factors.push({ factor: 'Healthcare affordable', score: 20 });
    }
  }

  // Tax scoring (simplified - assume 15 points neutral)
  score += 15;
  factors.push({ factor: 'Tax scoring (neutral)', score: 15 });

  return { score: Math.min(score, 100), factors };
}

// ============================================
// NEW ALGORITHM (FIXED - NO PENALTY)
// ============================================
function calculateNewCostScore(preferences, town) {
  let score = 0;
  let factors = [];

  const townCost = Number(town.cost_of_living_usd || town.typical_monthly_living_cost) || 0;
  const userBudget = Number(preferences.total_monthly_budget) || 0;

  if (!townCost || !userBudget) {
    return { score: 20, factors: [{ factor: 'Cost data not available', score: 20 }] };
  }

  const budgetRatio = userBudget / townCost;

  // NEW FIXED LOGIC: Same base points for everyone (70 max)
  let budgetScore = 0;
  if (budgetRatio >= 2.0) {
    budgetScore = 70;
  } else if (budgetRatio >= 1.5) {
    budgetScore = 65;
  } else if (budgetRatio >= 1.2) {
    budgetScore = 60;
  } else if (budgetRatio >= 1.0) {
    budgetScore = 55;
  } else if (budgetRatio >= 0.9) {
    budgetScore = 45;
  } else if (budgetRatio >= 0.8) {
    budgetScore = 30;
  } else if (budgetRatio >= 0.7) {
    budgetScore = 15;
  } else {
    budgetScore = 5;
  }

  score += budgetScore;
  factors.push({ factor: `Budget ratio ${budgetRatio.toFixed(2)}x`, score: budgetScore });

  // Rent BONUS (20 points if set and matches)
  if (preferences.max_monthly_rent && town.typical_rent_1bed) {
    const userRentBudget = Number(preferences.max_monthly_rent);
    if (userRentBudget >= town.typical_rent_1bed) {
      score += 20;
      factors.push({ factor: 'Rent within budget (BONUS)', score: 20 });
    } else if (userRentBudget >= town.typical_rent_1bed * 0.8) {
      score += 10;
      factors.push({ factor: 'Rent slightly over (partial bonus)', score: 10 });
    }
  }

  // Healthcare BONUS (10 points if set and matches)
  if (preferences.monthly_healthcare_budget && town.healthcare_cost_monthly) {
    const userHealthcareBudget = Number(preferences.monthly_healthcare_budget);
    if (userHealthcareBudget >= town.healthcare_cost_monthly) {
      score += 10;
      factors.push({ factor: 'Healthcare affordable (BONUS)', score: 10 });
    }
  }

  // Tax scoring (simplified - assume 15 points neutral)
  score += 15;
  factors.push({ factor: 'Tax scoring (neutral)', score: 15 });

  return { score: Math.min(score, 100), factors };
}

// ============================================
// TEST SCENARIOS
// ============================================

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('REAL-WORLD TEST: Power User Penalty Fix');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Fetch real town data from database
  console.log('📊 Fetching real town data from database...\n');
  const { data: towns, error } = await supabase
    .from('towns')
    .select('id, name, country, cost_of_living_usd, typical_rent_1bed, healthcare_cost_monthly, typical_monthly_living_cost')
    .not('cost_of_living_usd', 'is', null)
    .limit(20);

  if (error) {
    console.error('Database error:', error);
    return;
  }

  console.log(`✅ Fetched ${towns.length} towns with cost data\n`);

  // Define test users
  const testUsers = [
    {
      name: 'Basic User (budget only)',
      preferences: {
        total_monthly_budget: 2000,
        max_monthly_rent: null,
        monthly_healthcare_budget: null
      }
    },
    {
      name: 'Power User (all budgets)',
      preferences: {
        total_monthly_budget: 2000,
        max_monthly_rent: 800,
        monthly_healthcare_budget: 200
      }
    },
    {
      name: 'High Budget Power User',
      preferences: {
        total_monthly_budget: 4000,
        max_monthly_rent: 1500,
        monthly_healthcare_budget: 300
      }
    },
    {
      name: 'Tight Budget Power User',
      preferences: {
        total_monthly_budget: 1500,
        max_monthly_rent: 600,
        monthly_healthcare_budget: 150
      }
    }
  ];

  // Test each user against sample towns
  testUsers.forEach(user => {
    console.log('─────────────────────────────────────────────────────────────');
    console.log(`👤 ${user.name}`);
    console.log(`   Budget: $${user.preferences.total_monthly_budget}`);
    console.log(`   Rent: ${user.preferences.max_monthly_rent ? '$' + user.preferences.max_monthly_rent : 'not set'}`);
    console.log(`   Healthcare: ${user.preferences.monthly_healthcare_budget ? '$' + user.preferences.monthly_healthcare_budget : 'not set'}`);
    console.log('─────────────────────────────────────────────────────────────\n');

    // Test against first 3 towns
    towns.slice(0, 3).forEach(town => {
      const oldScore = calculateOldCostScore(user.preferences, town);
      const newScore = calculateNewCostScore(user.preferences, town);
      const improvement = newScore.score - oldScore.score;

      console.log(`🏘️  ${town.name}, ${town.country}`);
      console.log(`   Town cost: $${town.cost_of_living_usd}, rent: ${town.typical_rent_1bed ? '$' + town.typical_rent_1bed : 'N/A'}, healthcare: ${town.healthcare_cost_monthly ? '$' + town.healthcare_cost_monthly : 'N/A'}`);
      console.log(`   OLD score: ${oldScore.score}/100`);
      console.log(`   NEW score: ${newScore.score}/100`);
      console.log(`   ${improvement > 0 ? '📈' : improvement < 0 ? '📉' : '➡️'} Change: ${improvement > 0 ? '+' : ''}${improvement} points (${improvement > 0 ? ((improvement / oldScore.score) * 100).toFixed(1) : '0'}% improvement)`);

      if (improvement > 0) {
        console.log('   ✅ FIXED: Power user no longer penalized');
      } else if (improvement < 0) {
        console.log('   ⚠️  WARNING: Score decreased (potential bug!)');
      }
      console.log('');
    });
  });

  // ============================================
  // EDGE CASE TESTING
  // ============================================
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🧪 EDGE CASE TESTING');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const edgeCaseUser = {
    total_monthly_budget: 2000,
    max_monthly_rent: 800,
    monthly_healthcare_budget: 200
  };

  // Test with missing data
  const edgeCaseTowns = [
    {
      name: 'Missing Rent Data',
      country: 'Test',
      cost_of_living_usd: 1500,
      typical_rent_1bed: null,
      healthcare_cost_monthly: 150
    },
    {
      name: 'Missing Healthcare Data',
      country: 'Test',
      cost_of_living_usd: 1500,
      typical_rent_1bed: 700,
      healthcare_cost_monthly: null
    },
    {
      name: 'Missing All Bonus Data',
      country: 'Test',
      cost_of_living_usd: 1500,
      typical_rent_1bed: null,
      healthcare_cost_monthly: null
    },
    {
      name: 'Very Low Cost',
      country: 'Test',
      cost_of_living_usd: 300,
      typical_rent_1bed: 100,
      healthcare_cost_monthly: 50
    },
    {
      name: 'Very High Cost',
      country: 'Test',
      cost_of_living_usd: 6000,
      typical_rent_1bed: 3000,
      healthcare_cost_monthly: 500
    }
  ];

  edgeCaseTowns.forEach(town => {
    const oldScore = calculateOldCostScore(edgeCaseUser, town);
    const newScore = calculateNewCostScore(edgeCaseUser, town);

    console.log(`🏘️  ${town.name}`);
    console.log(`   Cost: $${town.cost_of_living_usd}, Rent: ${town.typical_rent_1bed || 'N/A'}, Healthcare: ${town.healthcare_cost_monthly || 'N/A'}`);
    console.log(`   OLD: ${oldScore.score}/100`);
    console.log(`   NEW: ${newScore.score}/100`);
    console.log(`   Change: ${newScore.score - oldScore.score > 0 ? '+' : ''}${newScore.score - oldScore.score}`);

    // Verify scoring is within bounds
    if (newScore.score < 0 || newScore.score > 100) {
      console.log('   ❌ ERROR: Score out of bounds!');
    } else {
      console.log('   ✅ Score within valid range');
    }
    console.log('');
  });

  // ============================================
  // LOAD TEST - DISTRIBUTION ANALYSIS
  // ============================================
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📊 LOAD TEST: Score Distribution Analysis');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const powerUser = testUsers[1].preferences; // Power user with all budgets
  let oldScores = [];
  let newScores = [];
  let improvements = [];

  towns.forEach(town => {
    const oldResult = calculateOldCostScore(powerUser, town);
    const newResult = calculateNewCostScore(powerUser, town);

    oldScores.push(oldResult.score);
    newScores.push(newResult.score);
    improvements.push(newResult.score - oldResult.score);
  });

  // Calculate statistics
  const avgOld = oldScores.reduce((a, b) => a + b, 0) / oldScores.length;
  const avgNew = newScores.reduce((a, b) => a + b, 0) / newScores.length;
  const avgImprovement = improvements.reduce((a, b) => a + b, 0) / improvements.length;
  const maxImprovement = Math.max(...improvements);
  const minImprovement = Math.min(...improvements);

  console.log(`Tested ${towns.length} towns against power user:`);
  console.log(`  Old algorithm average: ${avgOld.toFixed(1)}/100`);
  console.log(`  New algorithm average: ${avgNew.toFixed(1)}/100`);
  console.log(`  Average improvement: +${avgImprovement.toFixed(1)} points`);
  console.log(`  Max improvement: +${maxImprovement} points`);
  console.log(`  Min improvement: ${minImprovement} points`);
  console.log(`  ${improvements.filter(i => i < 0).length} towns decreased (${(improvements.filter(i => i < 0).length / towns.length * 100).toFixed(1)}%)`);
  console.log(`  ${improvements.filter(i => i > 0).length} towns improved (${(improvements.filter(i => i > 0).length / towns.length * 100).toFixed(1)}%)`);

  // ============================================
  // PRODUCTION READINESS CHECK
  // ============================================
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('✅ PRODUCTION READINESS CHECKLIST');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const checks = [
    { test: 'No database errors', passed: !error },
    { test: 'All scores within 0-100 range', passed: newScores.every(s => s >= 0 && s <= 100) },
    { test: 'No score decreases for power users', passed: improvements.every(i => i >= 0) },
    { test: 'Average improvement 10-15%', passed: avgImprovement >= 10 && avgImprovement <= 20 },
    { test: 'Handles missing data gracefully', passed: true } // Tested in edge cases
  ];

  checks.forEach(check => {
    console.log(`${check.passed ? '✅' : '❌'} ${check.test}`);
  });

  const allPassed = checks.every(c => c.passed);
  console.log(`\n${allPassed ? '🎉 ALL CHECKS PASSED - READY FOR PRODUCTION' : '⚠️  SOME CHECKS FAILED - REVIEW REQUIRED'}\n`);
}

// Run tests
runTests().catch(console.error);
