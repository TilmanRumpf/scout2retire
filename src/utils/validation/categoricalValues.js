/**
 * CATEGORICAL FIELD VALID VALUES
 *
 * Centralized source of truth for all categorical/enum fields in the database.
 *
 * Updated: 2025-09-30
 * Reason: Data audit revealed database uses richer, more descriptive values
 *         than original schema expected. These expanded value sets reflect
 *         actual data usage and provide better user experience.
 *
 * DO NOT change these values to match old restrictive schema.
 * DO update code/validation to accept these values.
 */

export const VALID_CATEGORICAL_VALUES = {

  // Retirement community presence
  // Original: ['low', 'moderate', 'high']
  // Actual usage: More nuanced descriptors provide better matching
  retirement_community_presence: [
    'none',           // No retirement communities
    'minimal',        // Very few options
    'limited',        // Some options but not prominent
    'moderate',       // Decent selection
    'strong',         // Good retirement community presence
    'extensive',      // Many retirement communities
    'very_strong'     // Exceptional retirement community presence
  ],

  // Sunshine level
  // Original: ['low', 'balanced', 'high']
  // Actual usage: Descriptive terms more intuitive for users
  sunshine_level_actual: [
    'low',           // Limited sunshine
    'less_sunny',    // Below average sunshine
    'balanced',      // Moderate sunshine
    'high',          // Above average sunshine
    'often_sunny'    // Very sunny most of the time
  ],

  // Precipitation level
  // Original: ['low', 'balanced', 'high']
  // Actual usage: Clearer descriptors for rain levels
  precipitation_level_actual: [
    'low',           // Very little rainfall
    'mostly_dry',    // Below average rainfall
    'balanced',      // Moderate rainfall
    'high',          // Above average rainfall
    'less_dry'       // Higher rainfall (opposite of mostly_dry)
  ],

  // Pace of life - ⭐ HIGH IMPACT FIELD
  // Original: ['slow', 'moderate', 'fast']
  // Actual usage: "relaxed" captures nuance between slow and moderate
  //               Used by 164 towns (48% of database)
  pace_of_life_actual: [
    'slow',          // Very laid-back, minimal hustle
    'relaxed',       // ⭐ Comfortable pace, not rushed but not sluggish
    'moderate',      // Balanced pace
    'fast'           // Bustling, energetic, fast-paced
  ],

  // Seasonal variation
  // Original: ['low', 'moderate', 'high']
  // Actual usage: More descriptive terms for seasonal changes
  seasonal_variation_actual: [
    'low',              // Minimal seasonal change
    'minimal',          // Very little variation year-round
    'moderate',         // Noticeable but not extreme
    'distinct_seasons', // Clear four-season experience
    'high',             // Significant seasonal differences
    'extreme'           // Dramatic seasonal variation
  ],

  // Cultural events frequency
  // Original: ['rare', 'occasional', 'frequent', 'constant']
  // Actual usage: Specific frequencies more useful
  cultural_events_frequency: [
    'rare',        // Few events per year
    'occasional',  // A few times per month
    'monthly',     // Events every month
    'frequent',    // Multiple events per month
    'weekly',      // Events every week
    'constant',    // Events very frequently
    'daily'        // Daily cultural activities
  ],

  // Social atmosphere
  // Original: ['reserved', 'moderate', 'friendly', 'very friendly']
  // Actual usage: Additional descriptors for ambiance
  social_atmosphere: [
    'reserved',      // Formal, less outgoing
    'quiet',         // Peaceful, low-key social scene
    'moderate',      // Balanced social energy
    'friendly',      // Welcoming, approachable
    'vibrant',       // Lively, energetic social scene
    'very friendly'  // Exceptionally warm and welcoming
  ],

  // Traditional vs progressive lean
  // Original: ['traditional', 'moderate', 'progressive']
  // Actual usage: "balanced" is distinct from "moderate"
  traditional_progressive_lean: [
    'traditional',   // Conservative, traditional values
    'moderate',      // Leans slightly traditional
    'balanced',      // Equal mix of traditional and progressive
    'progressive'    // Forward-thinking, liberal values
  ],

  // Expat community size
  expat_community_size: [
    'small',
    'moderate',
    'large'
  ],

  // English proficiency level (4 simplified levels based on EF Index)
  // Native (90+), High (60-89), Moderate (30-59), Low (0-29)
  english_proficiency_level: [
    'low',
    'moderate',
    'high',
    'native'
  ],

  // Urban/rural character
  urban_rural_character: [
    'urban',
    'suburban',
    'rural',
    'remote'
  ],

  // Summer climate descriptors
  summer_climate_actual: [
    'cold',
    'cool',
    'mild',
    'warm',
    'hot'
  ],

  // Winter climate descriptors
  winter_climate_actual: [
    'cold',
    'cool',
    'mild',
    'warm',
    'hot'
  ],

  // Humidity level
  humidity_level_actual: [
    'dry',
    'balanced',
    'humid'
  ],

  // General climate types
  climate: [
    'tropical',
    'subtropical',
    'temperate',
    'continental',
    'mediterranean',
    'desert',
    'arid',
    'oceanic',
    'polar'
  ],

  // Crime rate levels
  crime_rate: [
    'very_low',
    'low',
    'moderate',
    'high',
    'very_high'
  ],

  // Natural disaster risk levels (for SafetyPanel select dropdown)
  natural_disaster_risk_level: [
    'minimal',
    'low',
    'moderate',
    'high',
    'very_high'
  ],

  // Emergency services quality
  emergency_services_quality: [
    'poor',
    'fair',
    'good',
    'very_good',
    'excellent'
  ],

  // English speaking doctors availability
  english_speaking_doctors: [
    'rare',
    'limited',
    'moderate',
    'common',
    'widespread'
  ],

  // Healthcare cost levels
  healthcare_cost: [
    'very_low',
    'low',
    'moderate',
    'high',
    'very_high'
  ]
};

/**
 * Validate if a value is valid for a categorical field
 * @param {string} field - Field name
 * @param {string|null} value - Value to validate
 * @returns {boolean} - True if valid or null, false otherwise
 */
export function isValidCategoricalValue(field, value) {
  // NULL/undefined is always valid (optional field)
  if (!value) return true;

  // Unknown field - accept any value (no validation defined)
  const validValues = VALID_CATEGORICAL_VALUES[field];
  if (!validValues) return true;

  // Case-insensitive comparison
  const valueLower = String(value).toLowerCase().trim();
  return validValues.some(v => v.toLowerCase() === valueLower);
}

/**
 * Get valid values for a field
 * @param {string} field - Field name
 * @returns {string[]|null} - Array of valid values or null if unknown field
 */
export function getValidValues(field) {
  return VALID_CATEGORICAL_VALUES[field] || null;
}

/**
 * Get all categorical fields
 * @returns {string[]} - Array of field names
 */
export function getCategoricalFields() {
  return Object.keys(VALID_CATEGORICAL_VALUES);
}

/**
 * Normalize a categorical value (lowercase, trim)
 * @param {string} value - Value to normalize
 * @returns {string} - Normalized value
 */
export function normalizeCategoricalValue(value) {
  if (!value) return null;
  return String(value).toLowerCase().trim();
}
