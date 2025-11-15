/**
 * AI Suggestion Validation Layer
 *
 * Validates AI-suggested field values against:
 * - Enum constraints from categoricalValues.js
 * - Numeric range constraints
 * - Array format requirements
 *
 * Purpose: Prevent AI suggestions from breaking scoring system
 * Created: November 13, 2025
 */

import { VALID_CATEGORICAL_VALUES } from './categoricalValues.js';

/**
 * Field validation rules
 * Maps fieldName -> { type, enumKey?, min?, max?, arrayFormat?, ... }
 */
export const FIELD_VALIDATION_RULES = {
  // ============================================================================
  // REGION TAB
  // ============================================================================

  geographic_features_actual: {
    type: 'stringArray',
    enumKey: 'geographic_features_actual',
    arrayFormat: true,
    description: 'Geographic features (coastal, mountain, island, etc.)',
  },

  vegetation_type_actual: {
    type: 'stringArray',
    enumKey: 'vegetation_type_actual',
    arrayFormat: true,
    description: 'Vegetation types (tropical, subtropical, mediterranean, etc.)',
  },

  latitude: {
    type: 'number',
    min: -90,
    max: 90,
    description: 'Latitude coordinate',
  },

  longitude: {
    type: 'number',
    min: -180,
    max: 180,
    description: 'Longitude coordinate',
  },

  elevation_meters: {
    type: 'number',
    min: -400,
    max: 9000,
    description: 'Elevation in meters above sea level',
  },

  altitude_meters: {
    type: 'number',
    min: -400,
    max: 9000,
    description: 'Altitude in meters above sea level (alias for elevation)',
  },

  population: {
    type: 'number',
    min: 0,
    max: 50000000,
    description: 'Town population',
  },

  // ============================================================================
  // CLIMATE TAB (for future expansion)
  // ============================================================================

  summer_climate_actual: {
    type: 'enum',
    enumKey: 'summer_climate_actual',
    description: 'Summer climate (mild, warm, hot)',
  },

  winter_climate_actual: {
    type: 'enum',
    enumKey: 'winter_climate_actual',
    description: 'Winter climate (cold, cool, mild)',
  },

  humidity_level_actual: {
    type: 'enum',
    enumKey: 'humidity_level_actual',
    description: 'Humidity level (dry, balanced, humid)',
  },

  sunshine_level_actual: {
    type: 'enum',
    enumKey: 'sunshine_level_actual',
    description: 'Sunshine level (often_sunny, balanced, less_sunny)',
  },

  precipitation_level_actual: {
    type: 'enum',
    enumKey: 'precipitation_level_actual',
    description: 'Precipitation level (mostly_dry, balanced, less_dry)',
  },

  seasonal_variation_actual: {
    type: 'enum',
    enumKey: 'seasonal_variation_actual',
    description: 'Seasonal preference (all_seasons, summer_focused, winter_focused)',
  },

  avg_temp_summer: {
    type: 'number',
    min: -10,
    max: 50,
    description: 'Average summer temperature in Celsius',
  },

  avg_temp_winter: {
    type: 'number',
    min: -40,
    max: 35,
    description: 'Average winter temperature in Celsius',
  },

  // ============================================================================
  // CULTURE TAB (for future expansion)
  // ============================================================================

  pace_of_life_actual: {
    type: 'enum',
    enumKey: 'pace_of_life_actual',
    description: 'Pace of life (relaxed, moderate, fast)',
  },

  urban_rural_character: {
    type: 'enum',
    enumKey: 'urban_rural_character',
    description: 'Urban/rural character (rural, suburban, urban)',
  },

  expat_community_size: {
    type: 'enum',
    enumKey: 'expat_community_size',
    description: 'Expat community size (small, moderate, large)',
  },

  cultural_events_frequency: {
    type: 'enum',
    enumKey: 'cultural_events_frequency',
    description: 'Cultural events frequency (occasional, regular, frequent)',
  },

  traditional_progressive_lean: {
    type: 'enum',
    enumKey: 'traditional_progressive_lean',
    description: 'Traditional vs progressive (traditional, balanced, progressive)',
  },

  social_atmosphere: {
    type: 'enum',
    enumKey: 'social_atmosphere',
    description: 'Social atmosphere (quiet, friendly, vibrant)',
  },

  english_proficiency_level: {
    type: 'enum',
    enumKey: 'english_proficiency_level',
    description: 'English proficiency (low, moderate, high, native)',
  },

  // ============================================================================
  // HEALTHCARE TAB (for future expansion)
  // ============================================================================

  healthcare_score: {
    type: 'number',
    min: 0,
    max: 10,
    description: 'Healthcare quality score (0-10)',
  },

  emergency_services_quality: {
    type: 'enum',
    enumKey: 'emergency_services_quality',
    description: 'Emergency services quality',
  },

  english_speaking_doctors: {
    type: 'enum',
    enumKey: 'english_speaking_doctors',
    description: 'English-speaking doctors availability',
  },

  // ============================================================================
  // SAFETY TAB (for future expansion)
  // ============================================================================

  safety_score: {
    type: 'number',
    min: 0,
    max: 10,
    description: 'Safety score (0-10)',
  },

  crime_rate: {
    type: 'number',
    min: 0,
    max: 100,
    description: 'Crime rate index (0-100, higher = more crime)',
  },

  crime_rate_category: {
    type: 'enum',
    enumKey: 'crime_rate',
    description: 'Crime rate category (derived from crime_rate)',
  },

  // ============================================================================
  // COSTS TAB (for future expansion)
  // ============================================================================

  cost_of_living_usd: {
    type: 'number',
    min: 300,
    max: 8000,
    description: 'Monthly cost of living in USD (single person)',
  },

  typical_monthly_living_cost: {
    type: 'number',
    min: 300,
    max: 8000,
    description: 'Typical monthly living cost in USD',
  },
};

/**
 * Validate a suggested value against field rules
 *
 * @param {string} fieldName - Field being validated
 * @param {any} suggestedValue - Value suggested by AI
 * @returns {{ ok: boolean, reason?: string }} - Validation result
 */
export function validateSuggestedValue(fieldName, suggestedValue) {
  const rule = FIELD_VALIDATION_RULES[fieldName];

  // No special rules = allow any value
  if (!rule) {
    return { ok: true };
  }

  // Null/undefined values - check if field is required
  if (suggestedValue === null || suggestedValue === undefined || suggestedValue === '') {
    // For now, allow empty values (fields are optional)
    return { ok: true };
  }

  // ============================================================================
  // ENUM VALIDATION (single string value)
  // ============================================================================
  if (rule.type === 'enum') {
    const validValues = VALID_CATEGORICAL_VALUES[rule.enumKey || fieldName] || [];
    const normalizedValue = String(suggestedValue).toLowerCase().trim();

    const isValid = validValues.some(v =>
      String(v).toLowerCase() === normalizedValue
    );

    if (!isValid) {
      return {
        ok: false,
        reason: `Invalid enum value "${suggestedValue}" for ${fieldName}. Must be one of: ${validValues.join(', ')}`,
        suggestion: `Valid options: ${validValues.join(', ')}`,
      };
    }
  }

  // ============================================================================
  // STRING ARRAY VALIDATION (multiselect enum fields)
  // ============================================================================
  if (rule.type === 'stringArray') {
    // Handle comma-separated string input (convert to array)
    let arrayValue = suggestedValue;

    if (typeof suggestedValue === 'string') {
      // AI returned comma-separated string - split it
      arrayValue = suggestedValue
        .split(',')
        .map(v => v.trim().toLowerCase())
        .filter(v => v.length > 0);
    }

    if (!Array.isArray(arrayValue)) {
      return {
        ok: false,
        reason: `Expected an array for ${fieldName}, got ${typeof suggestedValue}`,
        suggestion: 'Value should be an array like ["coastal", "mountain"]',
      };
    }

    const validValues = VALID_CATEGORICAL_VALUES[rule.enumKey || fieldName] || [];

    // Check each array item against valid values
    const invalidItems = arrayValue.filter(item => {
      const normalized = String(item).toLowerCase().trim();
      return !validValues.some(v => String(v).toLowerCase() === normalized);
    });

    if (invalidItems.length > 0) {
      return {
        ok: false,
        reason: `Invalid values for ${fieldName}: ${invalidItems.join(', ')}. Valid options: ${validValues.join(', ')}`,
        suggestion: `Valid values: ${validValues.join(', ')}`,
      };
    }

    // Check for duplicates
    const normalized = arrayValue.map(v => String(v).toLowerCase());
    const uniqueValues = [...new Set(normalized)];

    if (normalized.length !== uniqueValues.length) {
      return {
        ok: false,
        reason: `Duplicate values found in ${fieldName}. Each value should appear only once.`,
      };
    }
  }

  // ============================================================================
  // NUMERIC RANGE VALIDATION
  // ============================================================================
  if (rule.type === 'number') {
    const numValue = Number(suggestedValue);

    if (Number.isNaN(numValue)) {
      return {
        ok: false,
        reason: `Expected numeric value for ${fieldName}, got "${suggestedValue}"`,
      };
    }

    if (rule.min != null && numValue < rule.min) {
      return {
        ok: false,
        reason: `${fieldName} value ${numValue} is below minimum ${rule.min}`,
        suggestion: `Valid range: ${rule.min} to ${rule.max || 'unlimited'}`,
      };
    }

    if (rule.max != null && numValue > rule.max) {
      return {
        ok: false,
        reason: `${fieldName} value ${numValue} is above maximum ${rule.max}`,
        suggestion: `Valid range: ${rule.min || 'unlimited'} to ${rule.max}`,
      };
    }
  }

  // All validation passed
  return { ok: true };
}

/**
 * Get validation rule for a field
 *
 * @param {string} fieldName - Field name
 * @returns {Object|null} - Validation rule or null if no rules
 */
export function getValidationRule(fieldName) {
  return FIELD_VALIDATION_RULES[fieldName] || null;
}

/**
 * Get valid values for an enum field
 *
 * @param {string} fieldName - Field name
 * @returns {string[]|null} - Array of valid values or null
 */
export function getValidEnumValues(fieldName) {
  const rule = FIELD_VALIDATION_RULES[fieldName];

  if (!rule || (rule.type !== 'enum' && rule.type !== 'stringArray')) {
    return null;
  }

  return VALID_CATEGORICAL_VALUES[rule.enumKey || fieldName] || null;
}

/**
 * Check if a field has validation rules
 *
 * @param {string} fieldName - Field name
 * @returns {boolean} - True if field has validation rules
 */
export function hasValidationRules(fieldName) {
  return !!FIELD_VALIDATION_RULES[fieldName];
}

/**
 * Normalize a suggested value to proper format
 * (useful for converting comma-separated strings to arrays, etc.)
 *
 * @param {string} fieldName - Field name
 * @param {any} suggestedValue - Raw suggested value
 * @returns {any} - Normalized value
 */
export function normalizeSuggestedValue(fieldName, suggestedValue) {
  const rule = FIELD_VALIDATION_RULES[fieldName];

  if (!rule) {
    return suggestedValue;
  }

  // Convert comma-separated string to array for stringArray fields
  if (rule.type === 'stringArray' && typeof suggestedValue === 'string') {
    return suggestedValue
      .split(',')
      .map(v => v.trim().toLowerCase())
      .filter(v => v.length > 0);
  }

  // Convert to number for numeric fields
  if (rule.type === 'number' && typeof suggestedValue === 'string') {
    return Number(suggestedValue);
  }

  // Lowercase and trim enum values
  if (rule.type === 'enum' && typeof suggestedValue === 'string') {
    return suggestedValue.toLowerCase().trim();
  }

  return suggestedValue;
}
