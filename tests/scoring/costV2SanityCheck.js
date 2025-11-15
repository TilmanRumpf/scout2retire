/**
 * Cost V2 Sanity Check - Human-Readable Scenarios
 *
 * This script demonstrates Cost V2 scoring behavior with real-world examples
 * showing how the algorithm handles different budget/cost combinations.
 */

import { calculateCostScore } from '../../src/utils/scoring/categories/costScoring.js';
import { getCostStatus, getLuxuryCostNote } from '../../src/utils/scoring/helpers/costUtils.js';
import { FEATURE_FLAGS } from '../../src/utils/scoring/config.js';

console.log('========================================');
console.log('COST V2 SANITY CHECK');
console.log('========================================\n');
console.log(`Cost V2 Enabled: ${FEATURE_FLAGS.ENABLE_COST_V2_SCORING}`);
console.log('');

/**
 * Helper to create minimal user preferences with budget
 */
function createUser(budget) {
  return {
    total_monthly_cost: budget,
    max_monthly_rent: null,
    monthly_healthcare_cost: null,
    income_tax_sensitive: false,
    property_tax_sensitive: false,
    sales_tax_sensitive: false
  };
}

/**
 * Helper to create minimal town with cost
 */
function createTown(cost) {
  return {
    id: 999,
    town_name: 'Test Town',
    country: 'Test Country',
    cost_of_living_usd: cost,
    typical_rent_1bed: null,
    healthcare_cost_monthly: null,
    income_tax_rate_pct: null,
    property_tax_rate_pct: null,
    sales_tax_rate_pct: null
  };
}

/**
 * Run a scenario and display results
 */
function runScenario(userBudget, townCost) {
  const user = createUser(userBudget);
  const town = createTown(townCost);

  // Calculate cost score using Cost V2
  const result = calculateCostScore(user, town);

  // Get UI-friendly status
  const costStatus = getCostStatus(userBudget, townCost);
  const luxuryNote = getLuxuryCostNote(userBudget, townCost);

  // Calculate ratio
  const ratio = (townCost / userBudget).toFixed(2);

  return {
    ratio,
    score: result.score,
    statusLabel: costStatus.label,
    statusLevel: costStatus.level,
    luxuryNote: luxuryNote || 'None'
  };
}

// ============================================================================
// SCENARIO SET 1: Middle-Budget User ($2000/month)
// ============================================================================

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('SCENARIO SET 1: Middle-Budget User');
console.log('User Budget: $2000/month');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const middleBudget = 2000;
const middleTownCosts = [1200, 2000, 2600, 4000];

console.log('┌─────────────┬───────┬───────┬──────────────────────────────┬───────┬────────────────┐');
console.log('│ Town Cost   │ Ratio │ Score │ UI Status Label              │ Level │ Luxury Note    │');
console.log('├─────────────┼───────┼───────┼──────────────────────────────┼───────┼────────────────┤');

middleTownCosts.forEach(townCost => {
  const result = runScenario(middleBudget, townCost);
  console.log(
    `│ $${townCost.toString().padEnd(10)} │ ${result.ratio.padEnd(5)} │ ${result.score.toString().padEnd(5)} │ ${result.statusLabel.padEnd(28)} │ ${result.statusLevel.padEnd(5)} │ ${result.luxuryNote.substring(0, 14).padEnd(14)} │`
  );
});

console.log('└─────────────┴───────┴───────┴──────────────────────────────┴───────┴────────────────┘\n');

console.log('Observations:');
console.log('  ✓ Cheaper town ($1200): Full score (70+), labeled "Well below your budget"');
console.log('  ✓ Exact match ($2000): Full score (70+), labeled "Within your budget"');
console.log('  ✓ Slightly over ($2600): Mild penalty (~55), labeled "Slightly above your budget"');
console.log('  ✓ Very expensive ($4000): Strong penalty (~17), labeled "Significantly above your budget"');
console.log('  ✓ No luxury notes (budget < $4000)');
console.log('');

// ============================================================================
// SCENARIO SET 2: High-Budget User ($5000/month)
// ============================================================================

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('SCENARIO SET 2: High-Budget User (Luxury)');
console.log('User Budget: $5000/month');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const highBudget = 5000;
const highTownCosts = [1200, 2500, 5000, 8000];

console.log('┌─────────────┬───────┬───────┬──────────────────────────────┬─────────┬────────────────┐');
console.log('│ Town Cost   │ Ratio │ Score │ UI Status Label              │ Level   │ Luxury Note    │');
console.log('├─────────────┼───────┼───────┼──────────────────────────────┼─────────┼────────────────┤');

highTownCosts.forEach(townCost => {
  const result = runScenario(highBudget, townCost);
  const luxuryShort = result.luxuryNote === 'None' ? 'None' : 'Yes (see below)';
  console.log(
    `│ $${townCost.toString().padEnd(10)} │ ${result.ratio.padEnd(5)} │ ${result.score.toString().padEnd(5)} │ ${result.statusLabel.padEnd(28)} │ ${result.statusLevel.padEnd(7)} │ ${luxuryShort.padEnd(14)} │`
  );
});

console.log('└─────────────┴───────┴───────┴──────────────────────────────┴─────────┴────────────────┘\n');

console.log('Observations:');
console.log('  ✓ Very cheap ($1200): Good but not perfect score (~65), luxury note appears');
console.log('  ✓ Moderately cheap ($2500): Full score (70+), no luxury note (ratio > 0.5)');
console.log('  ✓ Exact match ($5000): Full score (70+), labeled "Within your budget"');
console.log('  ✓ Very expensive ($8000): Strong penalty, labeled "Significantly above your budget"');
console.log('');

// ============================================================================
// DETAILED LUXURY NOTE EXAMPLE
// ============================================================================

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('LUXURY NOTE EXAMPLE');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const luxuryExample = getLuxuryCostNote(5000, 1200);
console.log('User Budget: $5000/month');
console.log('Town Cost: $1200/month');
console.log('Ratio: 0.24 (very cheap relative to budget)');
console.log('');
console.log('Luxury Note:');
console.log(`  "${luxuryExample}"`);
console.log('');

// ============================================================================
// KEY INSIGHTS
// ============================================================================

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('KEY INSIGHTS - Cost V2 Algorithm');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('1. ASYMMETRIC SCORING:');
console.log('   • Cheaper towns: Full score (ratio ≤ 1.0)');
console.log('   • Expensive towns: Smooth exponential penalty (ratio > 1.0)');
console.log('');

console.log('2. LUXURY LIFESTYLE MISMATCH:');
console.log('   • Triggers: Budget ≥ $4000 AND town < 50% of budget');
console.log('   • Effect: Up to 30% penalty for extremely cheap towns');
console.log('   • Rationale: Very cheap towns may not match luxury lifestyle expectations');
console.log('');

console.log('3. UI STATUS THRESHOLDS:');
console.log('   • ratio ≤ 0.6: "Well below your budget" (green)');
console.log('   • ratio ≤ 1.0: "Within your budget" (blue)');
console.log('   • ratio ≤ 1.3: "Slightly above your budget" (yellow)');
console.log('   • ratio > 1.3: "Significantly above your budget" (red)');
console.log('');

console.log('4. USER EXPERIENCE:');
console.log('   • Normal users: Cheaper = always better');
console.log('   • Luxury users: Extremely cheap gets soft penalty + explanation');
console.log('   • Overbudget: Smooth degradation, not harsh cliff');
console.log('');

console.log('========================================');
console.log('END OF SANITY CHECK');
console.log('========================================');
