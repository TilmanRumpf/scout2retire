/**
 * ARRAY MATCHING HELPER
 *
 * Provides array overlap calculation for preference matching.
 * Used when comparing user preference arrays with town characteristic arrays.
 *
 * Created: 2025-10-17
 * Purpose: Eliminate duplication and provide reusable array matching logic
 */

import { arrayIncludesIgnoreCase } from './stringUtils.js';

/**
 * Calculate overlap percentage between user preferences and town characteristics
 *
 * @param {Array<string>} userArray - User's preferred values
 * @param {Array<string>} townArray - Town's actual values
 * @param {number} maxScore - Maximum score for 100% match
 * @returns {number} Score based on percentage of user preferences matched
 *
 * @example
 * // User wants coastal + mountains
 * // Town has coastal + mountains + lakes
 * calculateArrayOverlap(['coastal', 'mountains'], ['coastal', 'mountains', 'lakes'], 20);
 * // Returns: 20 (100% of user preferences matched)
 *
 * // User wants coastal + mountains
 * // Town has only coastal
 * calculateArrayOverlap(['coastal', 'mountains'], ['coastal'], 20);
 * // Returns: 10 (50% of user preferences matched)
 *
 * // User has no preferences
 * calculateArrayOverlap([], ['coastal', 'mountains'], 20);
 * // Returns: 20 (no preferences = perfect score)
 */
export function calculateArrayOverlap(userArray, townArray, maxScore = 100) {
  // No user preferences = they're flexible = perfect score
  if (!userArray || userArray.length === 0) {
    return maxScore;
  }

  // Town has no characteristics = zero score
  if (!townArray || townArray.length === 0) {
    return 0;
  }

  // Count how many user preferences are matched by town
  const matchCount = userArray.filter(userItem =>
    arrayIncludesIgnoreCase(townArray, userItem)
  ).length;

  // Calculate percentage of user preferences that are satisfied
  const matchPercentage = matchCount / userArray.length;

  return Math.round(matchPercentage * maxScore);
}

/**
 * Get detailed breakdown of array matching
 *
 * Useful for showing users which preferences were matched vs unmatched
 *
 * @param {Array<string>} userArray - User's preferred values
 * @param {Array<string>} townArray - Town's actual values
 * @returns {Object} Matched and unmatched items with counts
 *
 * @example
 * getArrayMatchBreakdown(
 *   ['coastal', 'mountains', 'lakes'],
 *   ['coastal', 'mountains']
 * );
 * // Returns: {
 * //   matched: ['coastal', 'mountains'],
 * //   unmatched: ['lakes'],
 * //   matchCount: 2,
 * //   totalCount: 3,
 * //   percentage: 66.67
 * // }
 */
export function getArrayMatchBreakdown(userArray, townArray) {
  if (!userArray || userArray.length === 0) {
    return {
      matched: [],
      unmatched: [],
      matchCount: 0,
      totalCount: 0,
      percentage: 100 // No preferences = 100% satisfied
    };
  }

  if (!townArray || townArray.length === 0) {
    return {
      matched: [],
      unmatched: userArray,
      matchCount: 0,
      totalCount: userArray.length,
      percentage: 0
    };
  }

  const matched = [];
  const unmatched = [];

  userArray.forEach(userItem => {
    if (arrayIncludesIgnoreCase(townArray, userItem)) {
      matched.push(userItem);
    } else {
      unmatched.push(userItem);
    }
  });

  return {
    matched,
    unmatched,
    matchCount: matched.length,
    totalCount: userArray.length,
    percentage: Math.round((matched.length / userArray.length) * 100 * 100) / 100
  };
}

/**
 * Calculate weighted array overlap
 *
 * Useful when some preferences are more important than others
 *
 * @param {Array<{value: string, weight: number}>} weightedUserArray - User preferences with weights
 * @param {Array<string>} townArray - Town's actual values
 * @param {number} maxScore - Maximum score for 100% match
 * @returns {number} Weighted score
 *
 * @example
 * calculateWeightedArrayOverlap(
 *   [
 *     { value: 'coastal', weight: 2 },    // Very important
 *     { value: 'mountains', weight: 1 }   // Nice to have
 *   ],
 *   ['coastal', 'lakes'],
 *   20
 * );
 * // Returns: 13.3 (coastal matched with weight 2, mountains didn't match)
 * // Calculation: (2 / (2+1)) * 20 = 13.3
 */
export function calculateWeightedArrayOverlap(weightedUserArray, townArray, maxScore = 100) {
  if (!weightedUserArray || weightedUserArray.length === 0) {
    return maxScore;
  }

  if (!townArray || townArray.length === 0) {
    return 0;
  }

  // Calculate total weight of all preferences
  const totalWeight = weightedUserArray.reduce((sum, item) => sum + (item.weight || 1), 0);

  // Calculate matched weight
  const matchedWeight = weightedUserArray.reduce((sum, item) => {
    const isMatched = arrayIncludesIgnoreCase(townArray, item.value);
    return sum + (isMatched ? (item.weight || 1) : 0);
  }, 0);

  const matchPercentage = matchedWeight / totalWeight;

  return Math.round(matchPercentage * maxScore);
}
