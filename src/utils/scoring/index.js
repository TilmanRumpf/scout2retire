/**
 * Main entry point for all scoring operations
 * Other files should import from here, not from individual files
 */

// Re-export main functions that other parts of the app use
export { getPersonalizedTowns, clearPersonalizedCache } from './matchingAlgorithm';
export { scoreTown, scoreTownsBatch, convertPreferencesToAlgorithmFormat } from './unifiedScoring';
export { calculateEnhancedMatch } from './enhancedMatchingAlgorithm';

// Export config for components that need to display weights
export { CATEGORY_WEIGHTS, MATCH_QUALITY } from './config';