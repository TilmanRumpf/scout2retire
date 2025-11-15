/**
 * Array Fields Configuration
 * Defines which database columns are text[] (PostgreSQL array type)
 *
 * CRITICAL: This is the SINGLE SOURCE OF TRUTH for array field definitions
 * Import from this file - NEVER redefine ARRAY_FIELDS elsewhere
 *
 * Created: November 14, 2025 - Consolidation refactor
 */

/**
 * Fields that are stored as text[] (array) in PostgreSQL
 * These fields require special normalization:
 * - UI: Display as comma-separated strings for editing
 * - DB: Store as JavaScript arrays (Supabase converts to Postgres arrays)
 * - Comparison: Lowercase, sort, then compare
 */
export const ARRAY_FIELDS = new Set([
  'geographic_features_actual',  // Geographic features (coastal, mountainous, etc.)
  'vegetation_type_actual',      // Vegetation types (forest, grassland, etc.)
  'water_bodies',                // Nearby water bodies (ocean, lake, river)
  'regions',                     // Multi-region classification
  'geo_region'                   // Geographic region codes
]);

/**
 * Check if a field is an array field
 * @param {string} fieldName - Database field name
 * @returns {boolean} True if field is array type
 */
export function isArrayField(fieldName) {
  return ARRAY_FIELDS.has(fieldName);
}

/**
 * Get all array field names
 * @returns {string[]} Array of field names
 */
export function getArrayFields() {
  return Array.from(ARRAY_FIELDS);
}

/**
 * Validate that a field name is in the array fields list
 * Useful for defensive programming
 * @param {string} fieldName - Field to check
 * @throws {Error} If field is not in ARRAY_FIELDS
 */
export function assertArrayField(fieldName) {
  if (!ARRAY_FIELDS.has(fieldName)) {
    throw new Error(
      `Field "${fieldName}" is not an array field. ` +
      `Known array fields: ${getArrayFields().join(', ')}`
    );
  }
}
