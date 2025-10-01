/**
 * Preference Parser - Centralized preference extraction and normalization
 *
 * Purpose: Eliminate 160+ duplicate preference access points
 * Created: October 1, 2025
 * Part of: Scoring Consolidation - Phase 1
 *
 * CRITICAL: The codebase has 15+ instances of duplicate array normalization.
 * This parser eliminates all duplication and standardizes empty value handling.
 */

/**
 * Parse and normalize user preferences for scoring algorithm
 *
 * @param {Object} rawPreferences - Raw preferences from database
 * @returns {Object} Normalized preferences with consistent types and helpers
 */
export function parsePreferences(rawPreferences) {
  if (!rawPreferences) {
    return createEmptyPreferences();
  }

  return {
    region: parseRegionPreferences(rawPreferences),
    climate: parseClimatePreferences(rawPreferences),
    culture: parseCulturePreferences(rawPreferences),
    hobbies: parseHobbiesPreferences(rawPreferences),
    admin: parseAdminPreferences(rawPreferences),
    cost: parseCostPreferences(rawPreferences),
    citizenship: rawPreferences.citizenship || rawPreferences.current_status?.citizenship || '',

    // Helper to check if user has ANY preferences
    hasAnyPreferences: hasAnyPreferences(rawPreferences)
  };
}

/**
 * Parse region-related preferences
 */
function parseRegionPreferences(prefs) {
  return {
    countries: normalizeArray(prefs.countries),
    regions: normalizeArray(prefs.regions),
    provinces: normalizeArray(prefs.provinces),
    geographic_features: normalizeArray(prefs.geographic_features),
    vegetation_types: normalizeArray(prefs.vegetation_types),

    // Helpers
    hasAnyPreferences: Boolean(
      prefs.countries?.length ||
      prefs.regions?.length ||
      prefs.geographic_features?.length ||
      prefs.vegetation_types?.length
    )
  };
}

/**
 * Parse climate-related preferences
 */
function parseClimatePreferences(prefs) {
  // Handle the complex array/string pattern for climate preferences
  const summer = normalizeClimatePreference(prefs.summer_climate_preference);
  const winter = normalizeClimatePreference(prefs.winter_climate_preference);
  const seasonal = normalizeSeasonalPreference(prefs.seasonal_preference);

  return {
    summer: summer,
    winter: winter,
    humidity: normalizeArray(prefs.humidity_level),
    sunshine: normalizeArray(prefs.sunshine),
    precipitation: normalizeArray(prefs.precipitation),
    seasonal: seasonal,

    // Helpers
    hasAnyPreferences: Boolean(
      summer.length ||
      winter.length ||
      prefs.humidity_level?.length ||
      prefs.sunshine?.length ||
      prefs.precipitation?.length ||
      seasonal
    ),

    isSeasonalFlexible: isSeasonalFlexible(prefs.seasonal_preference)
  };
}

/**
 * Parse culture-related preferences
 */
function parseCulturePreferences(prefs) {
  const lifestyle = prefs.lifestyle_preferences || {};
  const language = prefs.language_comfort || {};
  const cultural = prefs.cultural_importance || {};

  return {
    urbanRural: normalizeArray(lifestyle.urban_rural_preference),
    paceOfLife: normalizeArray(lifestyle.pace_of_life_preference),
    expatCommunity: normalizeClimatePreference(prefs.expat_community_preference), // Uses same pattern
    languagePreferences: normalizeArray(language.preferences),
    languagesSpoken: normalizeArray(language.already_speak),

    // Cultural importance ratings (1-5 scale)
    diningImportance: cultural.dining_nightlife || 0,
    culturalEventsImportance: cultural.cultural_events || 0,
    museumsImportance: cultural.museums || 0,

    // Helpers
    hasAnyPreferences: Boolean(
      lifestyle.urban_rural_preference?.length ||
      lifestyle.pace_of_life_preference?.length ||
      prefs.expat_community_preference ||
      language.preferences?.length ||
      cultural.dining_nightlife > 1 ||
      cultural.cultural_events > 1 ||
      cultural.museums > 1
    )
  };
}

/**
 * Parse hobbies/activities preferences
 */
function parseHobbiesPreferences(prefs) {
  return {
    activities: normalizeArray(prefs.activities),
    interests: normalizeArray(prefs.interests),

    // Helpers
    hasAnyPreferences: Boolean(
      prefs.activities?.length ||
      prefs.interests?.length
    )
  };
}

/**
 * Parse administration-related preferences
 */
function parseAdminPreferences(prefs) {
  const health = prefs.health_considerations || {};

  return {
    healthcare: extractFirstOrArray(prefs.healthcare_quality),
    safety: extractFirstOrArray(prefs.safety_importance),
    governmentEfficiency: normalizeArray(prefs.government_efficiency),
    politicalStability: normalizeArray(prefs.political_stability),
    visaPreference: normalizeArray(prefs.visa_preference),
    stayDuration: prefs.stay_duration || '',
    environmentalHealthSensitive: health.environmental_health === 'important',

    // Helpers
    hasAnyPreferences: Boolean(
      prefs.healthcare_quality?.length ||
      prefs.safety_importance?.length ||
      prefs.government_efficiency?.length ||
      prefs.visa_preference?.length
    )
  };
}

/**
 * Parse cost/budget preferences
 */
function parseCostPreferences(prefs) {
  return {
    // Use Math.max for budget arrays (semantic: maximum user can afford)
    monthlyBudget: extractMaxFromArrayOrValue(prefs.total_monthly_budget),
    rentBudget: extractMaxFromArrayOrValue(prefs.max_monthly_rent),
    healthcareBudget: extractMaxFromArrayOrValue(prefs.monthly_healthcare_budget),

    // Tax sensitivities
    incomeTaxSensitive: Boolean(prefs.income_tax_sensitive),
    propertyTaxSensitive: Boolean(prefs.property_tax_sensitive),
    salesTaxSensitive: Boolean(prefs.sales_tax_sensitive),

    // Helpers
    hasAnyPreferences: Boolean(
      prefs.total_monthly_budget ||
      prefs.max_monthly_rent ||
      prefs.monthly_healthcare_budget
    )
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Normalize value to array, handling null/undefined/string/array
 * This eliminates the 15+ duplicate instances of this pattern
 */
function normalizeArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return [value].filter(Boolean);
}

/**
 * Special handling for climate preferences (array or string)
 * Converts to array and filters out empty values
 */
function normalizeClimatePreference(value) {
  if (!value) return [];

  const arr = Array.isArray(value) ? value : [value];

  // Filter out empty/invalid values
  return arr.filter(v =>
    v &&
    v !== '' &&
    v !== 'Optional' &&
    v !== 'Select Preference'
  );
}

/**
 * Normalize seasonal preference, handling all empty value conventions
 * Addresses the inconsistency found in line 821 of enhancedMatchingAlgorithm.js
 */
function normalizeSeasonalPreference(value) {
  if (!value) return '';

  // Normalize empty/default values to empty string
  const emptyValues = [
    '',
    'Optional',
    'no_specific_preference',
    'Select Preference',
    'select_preference'
  ];

  if (emptyValues.includes(value)) {
    return '';
  }

  return value;
}

/**
 * Check if seasonal preference indicates user is flexible (no strong preference)
 */
function isSeasonalFlexible(value) {
  const normalized = normalizeSeasonalPreference(value);
  return !normalized || normalized === '';
}

/**
 * Extract first element from array or return value directly
 * Used for healthcare, safety preferences where we take first choice
 */
function extractFirstOrArray(value) {
  if (!value) return '';
  if (Array.isArray(value)) return value[0] || '';
  return value;
}

/**
 * Extract maximum value from array or return value directly
 * Used for budget fields where maximum = what user can afford
 */
function extractMaxFromArrayOrValue(value) {
  if (!value) return 0;
  if (Array.isArray(value)) {
    const numbers = value.filter(v => typeof v === 'number' && !isNaN(v));
    return numbers.length > 0 ? Math.max(...numbers) : 0;
  }
  return typeof value === 'number' ? value : 0;
}

/**
 * Check if user has any preferences at all
 */
function hasAnyPreferences(prefs) {
  if (!prefs) return false;

  return Boolean(
    prefs.countries?.length ||
    prefs.regions?.length ||
    prefs.summer_climate_preference ||
    prefs.winter_climate_preference ||
    prefs.lifestyle_preferences?.urban_rural_preference?.length ||
    prefs.activities?.length ||
    prefs.healthcare_quality?.length ||
    prefs.total_monthly_budget
  );
}

/**
 * Create empty preferences object with all fields
 * Used when no preferences provided
 */
function createEmptyPreferences() {
  return {
    region: {
      countries: [],
      regions: [],
      provinces: [],
      geographic_features: [],
      vegetation_types: [],
      hasAnyPreferences: false
    },
    climate: {
      summer: [],
      winter: [],
      humidity: [],
      sunshine: [],
      precipitation: [],
      seasonal: '',
      hasAnyPreferences: false,
      isSeasonalFlexible: true
    },
    culture: {
      urbanRural: [],
      paceOfLife: [],
      expatCommunity: [],
      languagePreferences: [],
      languagesSpoken: [],
      diningImportance: 0,
      culturalEventsImportance: 0,
      museumsImportance: 0,
      hasAnyPreferences: false
    },
    hobbies: {
      activities: [],
      interests: [],
      hasAnyPreferences: false
    },
    admin: {
      healthcare: '',
      safety: '',
      governmentEfficiency: [],
      politicalStability: [],
      visaPreference: [],
      stayDuration: '',
      environmentalHealthSensitive: false,
      hasAnyPreferences: false
    },
    cost: {
      monthlyBudget: 0,
      rentBudget: 0,
      healthcareBudget: 0,
      incomeTaxSensitive: false,
      propertyTaxSensitive: false,
      salesTaxSensitive: false,
      hasAnyPreferences: false
    },
    citizenship: '',
    hasAnyPreferences: false
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default parsePreferences;
