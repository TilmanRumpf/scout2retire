/**
 * GRADUAL SCORING HELPER
 *
 * Provides gradual scoring logic for preference matching using adjacency maps.
 * Used across multiple scoring categories (Climate, Culture, etc.)
 *
 * Created: 2025-10-17
 * Purpose: Eliminate duplication of `calculateGradualClimateScore` logic
 */

/**
 * Calculate gradual score based on preference match using adjacency mapping
 *
 * @param {string} userPref - User's preference value
 * @param {string} townActual - Town's actual value
 * @param {number} maxPoints - Maximum points for perfect match
 * @param {Object} adjacencyMap - Map defining adjacent/compatible preferences
 * @returns {Object} Score and description
 *
 * @example
 * const HUMIDITY_ADJACENCY = {
 *   'dry': ['balanced'],
 *   'balanced': ['dry', 'humid'],
 *   'humid': ['balanced']
 * };
 *
 * calculateGradualMatch('dry', 'dry', 20, HUMIDITY_ADJACENCY);
 * // Returns: { score: 20, description: 'Perfect' }
 *
 * calculateGradualMatch('dry', 'balanced', 20, HUMIDITY_ADJACENCY);
 * // Returns: { score: 14, description: 'Good compatibility' }
 *
 * calculateGradualMatch('dry', 'humid', 20, HUMIDITY_ADJACENCY);
 * // Returns: { score: 0, description: 'Preference mismatch' }
 */
export function calculateGradualMatch(userPref, townActual, maxPoints, adjacencyMap) {
  if (!userPref || !townActual) {
    return { score: 0, description: null };
  }

  // Normalize both values for comparison
  const normalizedUserPref = String(userPref).toLowerCase().trim();
  const normalizedTownActual = String(townActual).toLowerCase().trim();

  // Exact match - perfect score
  if (normalizedUserPref === normalizedTownActual) {
    return {
      score: maxPoints,
      description: 'Perfect'
    };
  }

  // Check if preferences are adjacent (compatible)
  const adjacentValues = adjacencyMap[normalizedUserPref];
  if (adjacentValues && adjacentValues.includes(normalizedTownActual)) {
    return {
      score: Math.round(maxPoints * 0.7), // 70% of max points for adjacent match
      description: 'Good compatibility'
    };
  }

  // Opposite or incompatible - no points
  return {
    score: 0,
    description: 'Preference mismatch'
  };
}

/**
 * Calculate best gradual score from array of user preferences
 *
 * Useful when user can select multiple acceptable options
 * (e.g., "I like both dry AND balanced climates")
 *
 * @param {Array<string>} userPrefs - Array of user preference values
 * @param {string} townActual - Town's actual value
 * @param {number} maxPoints - Maximum points for perfect match
 * @param {Object} adjacencyMap - Map defining adjacent/compatible preferences
 * @returns {Object} Best score, description, and matched preference
 *
 * @example
 * calculateGradualMatchForArray(['dry', 'balanced'], 'balanced', 20, HUMIDITY_ADJACENCY);
 * // Returns: { score: 20, description: 'Perfect', matchedPref: 'balanced' }
 */
export function calculateGradualMatchForArray(userPrefs, townActual, maxPoints, adjacencyMap) {
  if (!userPrefs?.length || !townActual) {
    return { score: 0, description: null, matchedPref: null };
  }

  let bestScore = 0;
  let bestDescription = null;
  let matchedPref = null;

  // Try each user preference and keep the best match
  for (const pref of userPrefs) {
    const result = calculateGradualMatch(pref, townActual, maxPoints, adjacencyMap);
    if (result.score > bestScore) {
      bestScore = result.score;
      bestDescription = result.description;
      matchedPref = pref;
    }
  }

  return {
    score: bestScore,
    description: bestDescription,
    matchedPref: matchedPref
  };
}

/**
 * Common adjacency maps used across scoring categories
 */
export const ADJACENCY_MAPS = {
  // Humidity preferences
  humidity: {
    'dry': ['balanced'],
    'balanced': ['dry', 'humid'],
    'humid': ['balanced']
  },

  // Sunshine preferences
  sunshine: {
    'often_sunny': ['balanced'],
    'balanced': ['often_sunny', 'less_sunny'],
    'less_sunny': ['balanced']
  },

  // Precipitation preferences
  precipitation: {
    'mostly_dry': ['balanced'],
    'balanced': ['mostly_dry', 'less_dry'],
    'less_dry': ['balanced']
  },

  // Pace of life preferences
  pace: {
    'slow': ['relaxed'],
    'relaxed': ['slow', 'moderate'],
    'moderate': ['relaxed', 'fast'],
    'fast': ['moderate']
  },

  // Social atmosphere preferences
  social: {
    'reserved': ['quiet'],
    'quiet': ['reserved', 'moderate'],
    'moderate': ['quiet', 'friendly'],
    'friendly': ['moderate', 'vibrant'],
    'vibrant': ['friendly', 'very friendly'],
    'very friendly': ['vibrant']
  },

  // Traditional vs progressive preferences
  traditional: {
    'traditional': ['moderate'],
    'moderate': ['traditional', 'balanced'],
    'balanced': ['moderate', 'progressive'],
    'progressive': ['balanced']
  }
};
