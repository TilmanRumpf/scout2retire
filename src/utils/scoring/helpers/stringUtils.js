/**
 * String Utilities - Centralized case-insensitive string operations
 *
 * Purpose: Eliminate duplicate .toLowerCase() calls and prevent case-sensitivity bugs
 * Created: October 1, 2025
 * Part of: Scoring Consolidation - Phase 1
 *
 * CRITICAL: The 40-hour case-sensitivity bug (August 24, 2025) was caused by
 * inconsistent .toLowerCase() usage. These utilities prevent that disaster.
 */

/**
 * Compare two strings (case-insensitive, null-safe)
 *
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {boolean}
 *
 * @example
 * compareIgnoreCase('Coastal', 'coastal') // true
 * compareIgnoreCase(null, 'test') // false
 */
export function compareIgnoreCase(str1, str2) {
  if (str1 === null || str1 === undefined || str2 === null || str2 === undefined) {
    return false;
  }

  return str1.toString().toLowerCase().trim() === str2.toString().toLowerCase().trim();
}

/**
 * Check if haystack includes needle (case-insensitive)
 *
 * @param {string} haystack - String to search in
 * @param {string} needle - String to find
 * @returns {boolean}
 */
export function includesIgnoreCase(haystack, needle) {
  if (!haystack || !needle) return false;

  return haystack.toString().toLowerCase().trim()
    .includes(needle.toString().toLowerCase().trim());
}

/**
 * Check if string starts with prefix (case-insensitive)
 *
 * @param {string} str - String to check
 * @param {string} prefix - Prefix to match
 * @returns {boolean}
 */
export function startsWithIgnoreCase(str, prefix) {
  if (!str || !prefix) return false;

  return str.toString().toLowerCase().trim()
    .startsWith(prefix.toString().toLowerCase().trim());
}

/**
 * Check if string ends with suffix (case-insensitive)
 *
 * @param {string} str - String to check
 * @param {string} suffix - Suffix to match
 * @returns {boolean}
 */
export function endsWithIgnoreCase(str, suffix) {
  if (!str || !suffix) return false;

  return str.toString().toLowerCase().trim()
    .endsWith(suffix.toString().toLowerCase().trim());
}

/**
 * Normalize string for comparison (lowercase + trim)
 *
 * @param {string} str - String to normalize
 * @returns {string} Normalized string
 */
export function normalize(str) {
  if (str === null || str === undefined) return '';
  return str.toString().toLowerCase().trim();
}

/**
 * Check if value is in array (case-insensitive)
 *
 * @param {Array} array - Array to search
 * @param {string} value - Value to find
 * @returns {boolean}
 */
export function arrayIncludesIgnoreCase(array, value) {
  if (!Array.isArray(array) || !value) return false;

  const normalized = normalize(value);
  return array.some(item => normalize(item) === normalized);
}

/**
 * Filter array to only include unique values (case-insensitive)
 *
 * @param {Array} array - Array to filter
 * @returns {Array} Unique values (preserving original case of first occurrence)
 */
export function uniqueIgnoreCase(array) {
  if (!Array.isArray(array)) return [];

  const seen = new Set();
  return array.filter(item => {
    const normalized = normalize(item);
    if (seen.has(normalized)) {
      return false;
    }
    seen.add(normalized);
    return true;
  });
}

/**
 * Find index of value in array (case-insensitive)
 *
 * @param {Array} array - Array to search
 * @param {string} value - Value to find
 * @returns {number} Index or -1 if not found
 */
export function indexOfIgnoreCase(array, value) {
  if (!Array.isArray(array) || !value) return -1;

  const normalized = normalize(value);
  return array.findIndex(item => normalize(item) === normalized);
}
