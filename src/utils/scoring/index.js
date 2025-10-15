/**
 * Main entry point for all scoring operations
 * Other files should import from here, not from individual files
 *
 * REFACTORED: 2025-10-15
 * - Split enhancedMatchingAlgorithm.js (1,980 lines) into category-specific files
 * - New structure: core/ and categories/ directories
 * - Zero logic changes - pure code organization
 */

// Re-export main functions that other parts of the app use
export { getPersonalizedTowns, clearPersonalizedCache } from './matchingAlgorithm.js';
export { scoreTown, scoreTownsBatch, convertPreferencesToAlgorithmFormat } from './unifiedScoring.js';
export { calculateEnhancedMatch } from './core/calculateMatch.js';

// Export config for components that need to display weights
export { CATEGORY_WEIGHTS, MATCH_QUALITY } from './config.js';

// Export individual category scoring functions (for testing/debugging)
export { calculateRegionScore } from './categories/regionScoring.js';
export { calculateClimateScore } from './categories/climateScoring.js';
export { calculateCultureScore } from './categories/cultureScoring.js';
export { calculateHobbiesScore } from './categories/hobbiesScoring.js';
export { calculateAdminScore } from './categories/adminScoring.js';
export { calculateCostScore } from './categories/costScoring.js';