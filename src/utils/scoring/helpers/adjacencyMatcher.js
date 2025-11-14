/**
 * ADJACENCY MATCHING HELPER
 *
 * Generic helper for scoring fields using exact and adjacent matches.
 * Centralizes the adjacency matching logic used across all scoring categories.
 *
 * Created: November 14, 2025 (Phase 1 - Step 3)
 * Purpose: Extract common adjacency scoring pattern to eliminate duplication
 * Replaces: October 2025 version that was never adopted
 */

/**
 * Score a field using exact or adjacent matching logic
 *
 * This helper implements the core matching pattern used across climate, culture,
 * and region scorers:
 * 1. If user has no preferences (and treatEmptyAsOpen=true): award full points
 * 2. If user preference exactly matches town value: award full points
 * 3. If user preference is adjacent to town value per adjacency map: award partial points
 * 4. Otherwise: award 0 points
 *
 * All string comparisons are case-insensitive and trimmed.
 *
 * @param {Object} params - Scoring parameters
 * @param {string|string[]} params.userValues - User preference(s) (can be array or single value)
 * @param {string} params.townValue - Town field value to match against
 * @param {number} params.maxPoints - Maximum points for an exact match
 * @param {Object} params.adjacencyMap - Adjacency rules object (e.g., HUMIDITY_ADJACENCY)
 * @param {number} [params.adjacentFactor=0.5] - Fraction of points for adjacent match (0.5 = 50%, 0.7 = 70%)
 * @param {boolean} [params.treatEmptyAsOpen=true] - If true, no user preferences = full points
 *
 * @returns {number} Points earned (0 to maxPoints)
 *
 * @example
 * // Climate humidity scoring (70% for adjacent)
 * const points = scoreWithAdjacency({
 *   userValues: 'dry',
 *   townValue: 'Balanced',
 *   maxPoints: 20,
 *   adjacencyMap: HUMIDITY_ADJACENCY,
 *   adjacentFactor: 0.70
 * });
 * // Returns: 14 (70% of 20) because 'balanced' is adjacent to 'dry'
 *
 * @example
 * // Culture urban/rural scoring (50% for adjacent)
 * const points = scoreWithAdjacency({
 *   userValues: ['urban', 'suburban'],
 *   townValue: 'Rural',
 *   maxPoints: 20,
 *   adjacencyMap: URBAN_RURAL_ADJACENCY,
 *   adjacentFactor: 0.50
 * });
 * // Returns: 10 (50% of 20) because 'rural' is adjacent to 'suburban'
 *
 * @example
 * // User has no preference
 * const points = scoreWithAdjacency({
 *   userValues: null,
 *   townValue: 'Coastal',
 *   maxPoints: 30,
 *   adjacencyMap: GEOGRAPHIC_FEATURES_ADJACENCY,
 *   treatEmptyAsOpen: true
 * });
 * // Returns: 30 (full points when user is flexible)
 */
export function scoreWithAdjacency({
  userValues,
  townValue,
  maxPoints,
  adjacencyMap,
  adjacentFactor = 0.5,
  treatEmptyAsOpen = true
}) {
  // Helper to normalize strings (lowercase, trim)
  const normalize = (str) => String(str || '').toLowerCase().trim()

  // Convert userValues to array if needed
  const userPrefs = Array.isArray(userValues) ? userValues : [userValues]

  // Filter out empty/null/undefined values and normalize
  const validUserPrefs = userPrefs
    .filter(v => v !== null && v !== undefined && v !== '')
    .map(normalize)

  // If user has no preferences and treatEmptyAsOpen is true: return maxPoints
  if (validUserPrefs.length === 0 && treatEmptyAsOpen) {
    return maxPoints
  }

  // If user has no preferences and treatEmptyAsOpen is false: return 0
  if (validUserPrefs.length === 0) {
    return 0
  }

  // If town has no value: return 0
  if (!townValue) {
    return 0
  }

  // Normalize town value
  const normalizedTownValue = normalize(townValue)

  // Check for exact match: return maxPoints
  if (validUserPrefs.includes(normalizedTownValue)) {
    return maxPoints
  }

  // Check for adjacent match: return maxPoints * adjacentFactor
  for (const userPref of validUserPrefs) {
    const adjacentValues = adjacencyMap[userPref] || []
    if (adjacentValues.includes(normalizedTownValue)) {
      return Math.round(maxPoints * adjacentFactor)
    }
  }

  // No match: return 0
  return 0
}
