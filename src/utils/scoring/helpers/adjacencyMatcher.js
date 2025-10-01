/**
 * Adjacency Matcher - Centralized logic for matching preferences with adjacency support
 *
 * Purpose: Eliminate duplicate adjacency matching code across scoring functions
 * Created: October 1, 2025
 * Part of: Scoring Consolidation - Phase 1
 */

/**
 * Find adjacent matches between user preference and town value
 *
 * @param {string} userPreference - User's preference value
 * @param {string} townValue - Town's actual value
 * @param {Object} adjacencyMap - Map of preference → adjacent acceptable values
 * @returns {Object} { match: boolean, strength: number }
 *
 * @example
 * const result = findAdjacentMatches('warm', 'hot', { warm: ['hot', 'temperate'] });
 * // Returns: { match: true, strength: 0.7 }
 */
export function findAdjacentMatches(userPreference, townValue, adjacencyMap) {
  // Handle null/undefined
  if (!userPreference || !townValue) {
    return { match: false, strength: 0 };
  }

  const userLower = userPreference.toString().toLowerCase().trim();
  const townLower = townValue.toString().toLowerCase().trim();

  // Exact match - highest strength
  if (userLower === townLower) {
    return { match: true, strength: 1.0 };
  }

  // Check adjacency map
  if (adjacencyMap && adjacencyMap[userLower]) {
    const adjacentValues = adjacencyMap[userLower];
    const isAdjacent = adjacentValues.some(adj =>
      adj.toLowerCase().trim() === townLower
    );

    if (isAdjacent) {
      return { match: true, strength: 0.7 }; // Partial match
    }
  }

  // No match
  return { match: false, strength: 0 };
}

/**
 * Check if a value exists in an array with case-insensitive matching
 *
 * @param {Array} array - Array to search in
 * @param {string} value - Value to find
 * @returns {boolean}
 */
export function includesIgnoreCase(array, value) {
  if (!Array.isArray(array) || !value) return false;

  const valueLower = value.toString().toLowerCase().trim();
  return array.some(item =>
    item?.toString().toLowerCase().trim() === valueLower
  );
}

/**
 * Get all matching values from an array (case-insensitive)
 *
 * @param {Array} userPreferences - User's preference values
 * @param {Array} townValues - Town's actual values
 * @returns {Array} Matched values
 */
export function getMatchingValues(userPreferences, townValues) {
  if (!Array.isArray(userPreferences) || !Array.isArray(townValues)) {
    return [];
  }

  const townLower = townValues.map(v => v?.toString().toLowerCase().trim());

  return userPreferences.filter(pref => {
    const prefLower = pref?.toString().toLowerCase().trim();
    return townLower.includes(prefLower);
  });
}

/**
 * Calculate match percentage between two arrays
 *
 * @param {Array} userPreferences - User's preferences
 * @param {Array} townValues - Town's values
 * @returns {number} Percentage (0-100)
 */
export function calculateArrayMatchPercentage(userPreferences, townValues) {
  if (!Array.isArray(userPreferences) || userPreferences.length === 0) {
    return 100; // No preferences = perfect match
  }

  const matches = getMatchingValues(userPreferences, townValues || []);
  return Math.round((matches.length / userPreferences.length) * 100);
}
