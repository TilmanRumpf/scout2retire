/**
 * Cost Utility Helpers
 *
 * Provides user-friendly cost status classification and luxury mismatch notes
 * for displaying in the UI alongside Cost V2 scoring.
 */

/**
 * Classifies cost status based on townCost vs userBudget.
 *
 * @param {number} userBudget - User's target monthly budget in USD
 * @param {number} townCost - Town's estimated monthly cost in USD
 * @returns {{ label: string, level: 'low'|'medium'|'high'|'critical' }}
 */
export function getCostStatus(userBudget, townCost) {
  // Validate inputs
  if (!userBudget || userBudget <= 0 || !townCost || townCost <= 0) {
    return {
      label: 'Cost data unavailable',
      level: 'medium',
    };
  }

  const ratio = townCost / userBudget;

  // Classify based on ratio
  if (ratio <= 0.6) {
    // Town costs 60% or less of budget - excellent value
    return {
      label: 'Well below your budget',
      level: 'low', // positive/green
    };
  } else if (ratio <= 1.0) {
    // Town costs 60-100% of budget - within budget
    return {
      label: 'Within your budget',
      level: 'medium', // neutral
    };
  } else if (ratio <= 1.3) {
    // Town costs 100-130% of budget - slightly over
    return {
      label: 'Slightly above your budget',
      level: 'high', // warning/yellow
    };
  } else {
    // Town costs 130%+ of budget - significantly over
    return {
      label: 'Significantly above your budget',
      level: 'critical', // strong warning/red
    };
  }
}

/**
 * Returns an optional note when a high-budget user is matched with a very cheap town.
 * This mirrors the luxury under-budget adjustment logic in Cost V2 scoring.
 *
 * @param {number} userBudget - User's monthly budget in USD
 * @param {number} townCost - Town's monthly cost in USD
 * @returns {string|null} Warning message or null if not applicable
 */
export function getLuxuryCostNote(userBudget, townCost) {
  // Only applies to high-budget users (>= $4000/month)
  const LUXURY_THRESHOLD = 4000;

  if (!userBudget || userBudget < LUXURY_THRESHOLD || !townCost || townCost <= 0) {
    return null;
  }

  // Only show note if town is extremely cheap (< 50% of budget)
  const EXTREME_CHEAP_THRESHOLD = 0.5;
  const ratio = townCost / userBudget;

  if (ratio >= EXTREME_CHEAP_THRESHOLD) {
    return null;
  }

  // Return user-friendly explanation
  return 'Local cost of living is far below your stated budget. This may feel less premium than the lifestyle you indicated.';
}
