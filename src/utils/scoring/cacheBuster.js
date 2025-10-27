/**
 * Cache Buster for Scoring System
 *
 * This utility helps manage cache versioning to ensure users get fresh scores
 * when the scoring algorithm changes.
 */

// Increment this version whenever scoring logic changes
export const SCORING_CACHE_VERSION = 'v2.0.0_2025-10-27';

/**
 * Clear all cached scoring results if they're from an older version
 */
export const clearOutdatedScoringCache = () => {
  const currentVersion = sessionStorage.getItem('scoring_cache_version');

  if (currentVersion !== SCORING_CACHE_VERSION) {
    console.log('[CacheBuster] Clearing outdated scoring cache. Old version:', currentVersion, 'New version:', SCORING_CACHE_VERSION);

    // Clear all personalized scoring results
    const keysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('personalized_')) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => {
      sessionStorage.removeItem(key);
      console.log('[CacheBuster] Removed:', key);
    });

    // Set new version
    sessionStorage.setItem('scoring_cache_version', SCORING_CACHE_VERSION);
    console.log('[CacheBuster] Updated cache version to:', SCORING_CACHE_VERSION);

    return true; // Cache was cleared
  }

  return false; // Cache was already up to date
};