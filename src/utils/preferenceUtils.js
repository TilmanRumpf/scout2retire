/**
 * Preference Versioning Utilities
 *
 * Provides deterministic hashing of user preferences for cache invalidation.
 * When preferences change, hash changes → cache keys change → stale data purged.
 *
 * Critical for ensuring Algorithm Manager and User UI see identical match scores.
 *
 * @module preferenceUtils
 */

import supabase from './supabaseClient';

/**
 * Generate a deterministic hash of user preferences
 *
 * Uses SHA-256 to create stable fingerprint of preference data.
 * Same preferences always produce same hash (order-independent).
 *
 * @param {Object} preferences - User preference object from user_preferences table
 * @returns {Promise<string>} - 8-character hash (first 8 chars of SHA-256)
 *
 * @example
 * const hash = await hashPreferences(userPrefs);
 * // Returns: "a3b2c1d4"
 */
export const hashPreferences = async (preferences) => {
  if (!preferences || typeof preferences !== 'object') {
    // Default hash for null/empty preferences
    return '00000000';
  }

  try {
    // Normalize preferences for consistent hashing
    const normalized = normalizePreferences(preferences);

    // Convert to stable JSON string (sorted keys)
    const jsonString = JSON.stringify(normalized);

    // Generate SHA-256 hash
    const encoder = new TextEncoder();
    const data = encoder.encode(jsonString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    // Convert to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Return first 8 characters (sufficient for uniqueness)
    return hashHex.substring(0, 8);
  } catch (error) {
    console.error('[hashPreferences] Error generating hash:', error);
    // Fallback: timestamp-based pseudo-hash
    return Date.now().toString(36).substring(0, 8);
  }
};

/**
 * Normalize preferences object for consistent hashing
 *
 * Ensures identical preferences produce identical JSON:
 * - Removes metadata fields (id, user_id, created_at, updated_at)
 * - Sorts object keys alphabetically
 * - Normalizes null/undefined to consistent representation
 * - Handles nested objects recursively
 *
 * @param {Object} prefs - Raw preference object
 * @returns {Object} - Normalized preference object
 * @private
 */
const normalizePreferences = (prefs) => {
  // Fields to exclude from hashing (metadata, not preferences)
  const excludeFields = [
    'id',
    'user_id',
    'created_at',
    'updated_at',
    'preferences_hash',
    'preferences_updated_at',
    'onboarding_completed',
    'notifications', // UI-only settings
    'privacy' // UI-only settings
  ];

  // Recursively normalize object
  const normalize = (obj) => {
    if (obj === null || obj === undefined) {
      return null;
    }

    if (Array.isArray(obj)) {
      // Sort arrays for consistent ordering
      return obj
        .map(item => normalize(item))
        .sort((a, b) => {
          // Handle different types
          if (typeof a === 'string' && typeof b === 'string') {
            return a.localeCompare(b);
          }
          return 0;
        });
    }

    if (typeof obj === 'object') {
      // Sort object keys and normalize values
      const sorted = {};
      Object.keys(obj)
        .filter(key => !excludeFields.includes(key))
        .sort()
        .forEach(key => {
          sorted[key] = normalize(obj[key]);
        });
      return sorted;
    }

    return obj;
  };

  return normalize(prefs);
};

/**
 * Update preference hash and timestamp in database
 *
 * Call this after ANY preference update to invalidate cached scores.
 * Updates both hash and timestamp in user_preferences table.
 *
 * @param {string} userId - User UUID
 * @param {Object} preferences - Current user preferences (after update)
 * @returns {Promise<Object>} - { success: boolean, hash?: string, error?: Object }
 *
 * @example
 * // After saving preferences
 * await saveUserPreferences(userId, newPrefs);
 * await updatePreferenceHash(userId, newPrefs);
 */
export const updatePreferenceHash = async (userId, preferences) => {
  try {
    if (!userId) {
      console.error('[updatePreferenceHash] Missing userId');
      return { success: false, error: 'Missing userId' };
    }

    // Generate new hash
    const hash = await hashPreferences(preferences);
    const timestamp = new Date().toISOString();

    console.log(`[updatePreferenceHash] Updating hash for user ${userId}: ${hash}`);

    // Update user_preferences table
    const { error: prefError } = await supabase
      .from('user_preferences')
      .update({
        preferences_hash: hash,
        preferences_updated_at: timestamp
      })
      .eq('user_id', userId);

    if (prefError) {
      console.error('[updatePreferenceHash] Error updating user_preferences:', prefError);
      return { success: false, error: prefError };
    }

    // Also update users table for quick access
    const { error: userError } = await supabase
      .from('users')
      .update({
        preferences_updated_at: timestamp
      })
      .eq('id', userId);

    if (userError) {
      console.warn('[updatePreferenceHash] Could not update users table:', userError);
      // Not critical - user_preferences update succeeded
    }

    console.log(`✅ [updatePreferenceHash] Hash updated successfully: ${hash}`);

    return { success: true, hash, timestamp };
  } catch (error) {
    console.error('[updatePreferenceHash] Unexpected error:', error);
    return { success: false, error };
  }
};

/**
 * Get current preference hash for a user
 *
 * Retrieves the stored hash without recalculating.
 * Useful for cache key generation and staleness detection.
 *
 * @param {string} userId - User UUID
 * @returns {Promise<Object>} - { success: boolean, hash?: string, timestamp?: string, error?: Object }
 *
 * @example
 * const { hash } = await getPreferenceHash(userId);
 * const cacheKey = `personalized_${userId}_${hash}_${townIds}`;
 */
export const getPreferenceHash = async (userId) => {
  try {
    if (!userId) {
      return { success: false, error: 'Missing userId' };
    }

    const { data, error } = await supabase
      .from('user_preferences')
      .select('preferences_hash, preferences_updated_at')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('[getPreferenceHash] Database error:', error);
      return { success: false, error };
    }

    if (!data) {
      // No preferences yet - return default hash
      return { success: true, hash: '00000000', timestamp: null };
    }

    return {
      success: true,
      hash: data.preferences_hash || '00000000',
      timestamp: data.preferences_updated_at
    };
  } catch (error) {
    console.error('[getPreferenceHash] Unexpected error:', error);
    return { success: false, error };
  }
};

/**
 * Clear cached scores for a user
 *
 * Removes all personalized town scoring data from sessionStorage.
 * Call this when you need to force recalculation (e.g., after preference change).
 *
 * @param {string} userId - User UUID
 * @returns {number} - Number of cache entries cleared
 *
 * @example
 * const cleared = clearPersonalizedCache(userId);
 * console.log(`Cleared ${cleared} cached score entries`);
 */
export const clearPersonalizedCache = (userId) => {
  try {
    const keysToRemove = [];

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(`personalized_${userId}_`)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => sessionStorage.removeItem(key));

    if (keysToRemove.length > 0) {
      console.log(`[clearPersonalizedCache] Cleared ${keysToRemove.length} cache entries for user ${userId}`);
    }

    return keysToRemove.length;
  } catch (error) {
    console.error('[clearPersonalizedCache] Error clearing cache:', error);
    return 0;
  }
};

/**
 * Validate preference hash freshness
 *
 * Checks if stored hash matches current preferences.
 * Returns false if preferences changed but hash not updated (data integrity issue).
 *
 * @param {string} userId - User UUID
 * @param {Object} currentPreferences - Current preference object to validate
 * @returns {Promise<Object>} - { valid: boolean, storedHash?: string, calculatedHash?: string }
 *
 * @example
 * const { valid, storedHash, calculatedHash } = await validatePreferenceHash(userId, prefs);
 * if (!valid) {
 *   console.warn(`Hash mismatch! Stored: ${storedHash}, Calculated: ${calculatedHash}`);
 * }
 */
export const validatePreferenceHash = async (userId, currentPreferences) => {
  try {
    // Get stored hash
    const { success, hash: storedHash } = await getPreferenceHash(userId);

    if (!success) {
      return { valid: false, error: 'Could not retrieve stored hash' };
    }

    // Calculate current hash
    const calculatedHash = await hashPreferences(currentPreferences);

    const valid = storedHash === calculatedHash;

    if (!valid) {
      console.warn(`[validatePreferenceHash] Hash mismatch for user ${userId}!`);
      console.warn(`  Stored: ${storedHash}`);
      console.warn(`  Calculated: ${calculatedHash}`);
    }

    return {
      valid,
      storedHash,
      calculatedHash
    };
  } catch (error) {
    console.error('[validatePreferenceHash] Error:', error);
    return { valid: false, error };
  }
};
