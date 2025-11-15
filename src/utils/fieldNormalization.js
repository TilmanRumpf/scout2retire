/**
 * Field Normalization Utilities
 * Consolidated normalization logic for all field types
 *
 * Replaces 4 scattered normalization functions:
 * - normalizeFieldValueForDb() (bulkUpdateTown.js)
 * - toEditableString() (UpdateTownModal.jsx)
 * - normalizeForAuditComparison() (UpdateTownModal.jsx)
 * - normalizeCategoricalValue() (categoricalValues.js)
 *
 * Created: November 14, 2025 - Normalization consolidation refactor
 */

import { ARRAY_FIELDS } from './config/arrayFields.js';

/**
 * Normalize field value based on mode
 *
 * @param {string|null} fieldName - Database field name (or null for non-field-specific modes)
 * @param {any} value - Raw value (could be string, array, null, etc.)
 * @param {'db'|'display'|'compare'|'categorical'} mode - Normalization mode
 * @returns {any} Normalized value
 */
export function normalizeFieldValue(fieldName, value, mode = 'db') {
  switch (mode) {
    case 'db':
      return normalizeForDb(fieldName, value);
    case 'display':
      return normalizeForDisplay(value);
    case 'compare':
      return normalizeForComparison(fieldName, value);
    case 'categorical':
      return normalizeForCategorical(value);
    default:
      throw new Error(
        `Invalid normalization mode: ${mode}. Use 'db', 'display', 'compare', or 'categorical'.`
      );
  }
}

/**
 * MODE: 'db' - Normalize for database storage
 * Converts comma-separated strings to arrays for text[] columns
 *
 * @param {string} fieldName - Field name
 * @param {any} rawValue - Raw value from UI
 * @returns {any} Value ready for DB (array for array fields, original for others)
 */
function normalizeForDb(fieldName, rawValue) {
  // Non-array fields: return as-is
  if (!ARRAY_FIELDS.has(fieldName)) {
    return rawValue;
  }

  // Array field normalization

  // 1. Already an array: clean and lowercase each element
  if (Array.isArray(rawValue)) {
    return rawValue
      .map(v => String(v).trim().toLowerCase())
      .filter(v => v.length > 0);
  }

  // 2. String value
  if (typeof rawValue === 'string') {
    const trimmed = rawValue.trim();

    // Empty string → empty array
    if (trimmed === '') {
      return [];
    }

    // Postgres array literal: {"coastal","mountainous"}
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      return trimmed
        .slice(1, -1)
        .split(',')
        .map(v => v.replace(/"/g, '').trim().toLowerCase())
        .filter(v => v.length > 0);
    }

    // Comma-separated string: "coastal, mountainous, rivers"
    return trimmed
      .split(',')
      .map(v => v.trim().toLowerCase())
      .filter(v => v.length > 0);
  }

  // 3. Null/undefined → empty array
  if (rawValue === null || rawValue === undefined) {
    return [];
  }

  // 4. Fallback
  return [];
}

/**
 * MODE: 'display' - Normalize for UI editing
 * Converts arrays to comma-separated strings for textarea editing
 *
 * @param {any} value - Value to display
 * @returns {string} Editable string
 */
function normalizeForDisplay(value) {
  // Null/undefined → empty string
  if (!value && value !== 0) {
    return '';
  }

  // JavaScript array: ["coastal", "mountain"] → "coastal, mountain"
  if (Array.isArray(value)) {
    return value.join(', ');
  }

  // Postgres array literal: {"coastal","mountain"} → "coastal, mountain"
  if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
    return value
      .slice(1, -1)
      .split(',')
      .map(v => v.replace(/"/g, '').trim())
      .join(', ');
  }

  // Already a string (or other type) - return as-is
  return String(value);
}

/**
 * MODE: 'compare' - Normalize for equality checks
 * Ensures consistent comparison (lowercase, sorted, joined)
 *
 * @param {string} fieldName - Field name
 * @param {any} value - Value to normalize
 * @returns {string} Normalized string for comparison
 */
function normalizeForComparison(fieldName, value) {
  // Array fields need special handling
  if (ARRAY_FIELDS.has(fieldName)) {
    // 1. Already an array
    if (Array.isArray(value)) {
      return value
        .map(v => String(v).trim().toLowerCase())
        .filter(Boolean)
        .sort()
        .join(', ');
    }

    // 2. Postgres array literal: {"coastal","mountainous"}
    if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
      return value
        .slice(1, -1)
        .split(',')
        .map(v => v.replace(/"/g, '').trim().toLowerCase())
        .filter(Boolean)
        .sort()
        .join(', ');
    }

    // 3. Comma-separated string: "coastal, mountainous"
    if (typeof value === 'string') {
      return value
        .split(',')
        .map(v => v.trim().toLowerCase())
        .filter(Boolean)
        .sort()
        .join(', ');
    }

    // 4. Fallback
    if (value == null) return '';
    return String(value).trim().toLowerCase();
  }

  // Non-array fields: just trim (preserve case for some fields)
  if (value == null) return '';
  return String(value).trim();
}

/**
 * MODE: 'categorical' - Normalize for validation
 * Simple lowercase + trim for categorical field validation
 *
 * @param {any} value - Value to normalize
 * @returns {string} Normalized string
 */
function normalizeForCategorical(value) {
  if (value == null) return '';
  return String(value).trim().toLowerCase();
}

/**
 * Legacy function names for backward compatibility
 * Use normalizeFieldValue() with modes instead
 */

export function normalizeFieldValueForDb(fieldName, rawValue) {
  console.warn('DEPRECATED: Use normalizeFieldValue(fieldName, value, "db") instead');
  return normalizeFieldValue(fieldName, rawValue, 'db');
}

export function toEditableString(value) {
  console.warn('DEPRECATED: Use normalizeFieldValue(null, value, "display") instead');
  return normalizeFieldValue(null, value, 'display');
}

export function normalizeForAuditComparison(fieldName, value) {
  console.warn('DEPRECATED: Use normalizeFieldValue(fieldName, value, "compare") instead');
  return normalizeFieldValue(fieldName, value, 'compare');
}

export function normalizeCategoricalValue(value) {
  console.warn('DEPRECATED: Use normalizeFieldValue(null, value, "categorical") instead');
  return normalizeFieldValue(null, value, 'categorical');
}
