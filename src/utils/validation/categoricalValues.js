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

  // Sunshine level - MATCHES USER ONBOARDING OPTIONS
  // Only 3 values match onboarding UI: often_sunny, balanced, less_sunny
  sunshine_level_actual: [
    'often_sunny',   // Very sunny most of the time
    'balanced',      // Moderate sunshine
    'less_sunny'     // Below average sunshine
  ],

  // Precipitation level - MATCHES USER ONBOARDING OPTIONS
  // Only 3 values match onboarding UI: mostly_dry, balanced, less_dry
  precipitation_level_actual: [
    'mostly_dry',    // Below average rainfall
    'balanced',      // Moderate rainfall
    'less_dry'       // Higher rainfall
  ],

  // Pace of life - MATCHES USER ONBOARDING OPTIONS
  // Only 3 values match onboarding UI: relaxed, moderate, fast
  // Note: "relaxed" used by 164 towns (48% of database)
  pace_of_life_actual: [
    'relaxed',       // Comfortable pace, not rushed
    'moderate',      // Balanced pace
    'fast'           // Bustling, energetic, fast-paced
  ],

  // Seasonal preference - MATCHES USER ONBOARDING OPTIONS
  // Updated: 2025-11-13 - Migrated all 352 towns to match user preference format
  // Previous values (minimal, moderate, high, extreme, distinct_seasons) described
  // "how much seasons vary" but user preference asks "which seasons do you prefer"
  // Smart classification based on winter_climate_actual completed
  seasonal_variation_actual: [
    'all_seasons',      // Experiences distinct seasons (218 towns)
    'summer_focused',   // Warm/mild year-round (134 towns)
    'winter_focused'    // Cool/cold year-round (0 towns currently)
  ],

  // Cultural events frequency - MATCHES USER ONBOARDING & TOWN DATA
  // Updated: 2025-11-13 - Consolidated from 7 values to 3 for 1:1 matching
  // User preference matches town data for accurate algorithm scoring
  cultural_events_frequency: [
    'occasional',  // Monthly events (30 towns)
    'regular',     // Weekly events (28 towns)
    'frequent'     // Daily events (1 town)
  ],

  // Social atmosphere - CONSOLIDATED TO 3 VALUES
  // Updated: 2025-11-13 - Reduced from 6 to 3 for clarity
  // Migrated 22 towns: moderate → friendly
  social_atmosphere: [
    'quiet',         // Peaceful, low-key social scene (4 towns)
    'friendly',      // Welcoming, comfortable social energy (68 towns)
    'vibrant'        // Lively, energetic social scene (8 towns)
  ],

  // Traditional vs progressive lean - CONSOLIDATED TO 3 VALUES
  // Updated: 2025-11-13 - Reduced from 4 to 3 for clarity
  // Migrated 11 towns: moderate → balanced
  traditional_progressive_lean: [
    'traditional',   // Conservative, traditional values (35 towns)
    'balanced',      // Equal mix of traditional and progressive (39 towns)
    'progressive'    // Forward-thinking, liberal values (6 towns)
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

  // Urban/rural character - MATCHES USER ONBOARDING OPTIONS
  // Only 3 values match onboarding UI: rural, suburban, urban (in that order)
  urban_rural_character: [
    'rural',
    'suburban',
    'urban'
  ],

  // Summer climate descriptors
  // Only 3 values used: mild (71 towns), warm (146 towns), hot (135 towns)
  // Verified Nov 12, 2025 - no towns use 'cold' or 'cool'
  summer_climate_actual: [
    'mild',
    'warm',
    'hot'
  ],

  // Winter climate descriptors
  // Only 3 values: cold, cool, mild
  // For warm year-round climates, use 'mild'
  winter_climate_actual: [
    'cold',
    'cool',
    'mild'
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
  ],

  // Geographic features - used in region preferences and scoring
  // Updated: 2025-11-13 - Centralized from regionScoring.js (RULE #2: NO HARDCODING)
  geographic_features_actual: [
    'coastal',
    'mountain',
    'island',
    'lake',
    'river',
    'valley',
    'desert',
    'forest',
    'plains'
  ],

  // Vegetation types - used in region preferences and scoring
  // Updated: 2025-11-13 - Centralized from regionScoring.js (RULE #2: NO HARDCODING)
  vegetation_type_actual: [
    'tropical',
    'subtropical',
    'mediterranean',
    'forest',
    'grassland',
    'desert'
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
