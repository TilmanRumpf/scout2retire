/**
 * SCORING CONFIGURATION - Your Control Panel
 * ==========================================
 * Edit all matching algorithm settings here.
 * Changes here will affect how towns are scored.
 */

// ============================================
// CATEGORY WEIGHTS (must add up to 100)
// ============================================
export const CATEGORY_WEIGHTS = {
  region: 20,         // Geographic location match
  climate: 15,        // Weather preferences
  culture: 15,        // Language, pace of life, expat community
  hobbies: 10,        // Activities & interests
  administration: 20, // Healthcare, safety, visa
  cost: 20            // Cost of living match
};

// Verify weights add up to 100 (safety check)
const totalWeight = Object.values(CATEGORY_WEIGHTS).reduce((a, b) => a + b, 0);
if (totalWeight !== 100) {
  console.error(`⚠️ WARNING: Category weights add up to ${totalWeight}, not 100!`);
}

// ============================================
// SCORING THRESHOLDS
// ============================================
export const MATCH_QUALITY = {
  EXCELLENT: 85,   // 85-100 = Excellent match
  VERY_GOOD: 70,   // 70-84 = Very good match
  GOOD: 55,        // 55-69 = Good match
  FAIR: 40,        // 40-54 = Fair match
  POOR: 0          // 0-39 = Poor match
};

// ============================================
// INDIVIDUAL CATEGORY SETTINGS
// ============================================

// Region Scoring Settings
export const REGION_SETTINGS = {
  // Points for different match levels
  EXACT_COUNTRY_MATCH: 40,
  REGION_MATCH: 30,
  GEOGRAPHIC_FEATURE_MATCH: 30,
  VEGETATION_MATCH: 20,
  // Partial credit
  RELATED_FEATURES_CREDIT: 0.5,  // 50% credit for similar features
  RELATED_VEGETATION_CREDIT: 0.5  // 50% credit for similar vegetation
};

// Climate Scoring Settings
export const CLIMATE_SETTINGS = {
  // Points for each climate aspect
  SUMMER_TEMP_POINTS: 25,
  WINTER_TEMP_POINTS: 25,
  HUMIDITY_POINTS: 20,
  SUNSHINE_POINTS: 20,
  PRECIPITATION_POINTS: 10,
  SEASONAL_PREFERENCE_POINTS: 15,
  // Temperature tolerance (degrees Celsius)
  PERFECT_TEMP_RANGE: 0,    // Within exact preference
  GOOD_TEMP_RANGE: 2,        // Within 2°C
  ACCEPTABLE_TEMP_RANGE: 5,  // Within 5°C
  POOR_TEMP_RANGE: 10        // Within 10°C
};

// Culture Scoring Settings
export const CULTURE_SETTINGS = {
  // Points for each culture aspect
  LIVING_ENVIRONMENT_POINTS: 20,
  PACE_OF_LIFE_POINTS: 20,
  LANGUAGE_POINTS: 20,
  EXPAT_COMMUNITY_POINTS: 10,
  DINING_NIGHTLIFE_POINTS: 10,
  CULTURAL_EVENTS_POINTS: 10,
  MUSEUMS_ARTS_POINTS: 10
};

// Admin Scoring Settings
export const ADMIN_SETTINGS = {
  // Points for each admin aspect
  HEALTHCARE_POINTS: 30,
  SAFETY_POINTS: 25,
  GOVERNMENT_EFFICIENCY_POINTS: 15,
  VISA_POINTS: 10,
  ENVIRONMENTAL_HEALTH_POINTS: 15,
  POLITICAL_STABILITY_POINTS: 10
};

// Budget Scoring Settings
export const BUDGET_SETTINGS = {
  // Points for each budget aspect
  OVERALL_BUDGET_POINTS: 40,
  RENT_BUDGET_POINTS: 30,
  HEALTHCARE_BUDGET_POINTS: 20,
  TAX_POINTS: 15,
  // Budget comfort zones
  EXCELLENT_VALUE_RATIO: 2.0,    // Budget is 2x the cost
  COMFORTABLE_MARGIN_RATIO: 1.5, // Budget is 1.5x the cost
  GOOD_FIT_RATIO: 1.2,           // Budget is 1.2x the cost
  ADEQUATE_RATIO: 1.0,           // Budget equals cost
  TIGHT_RATIO: 0.9,              // Budget is 90% of cost
  CHALLENGING_RATIO: 0.8         // Budget is 80% of cost
};

// Hobbies Scoring Settings
export const HOBBIES_SETTINGS = {
  // Base scoring
  ACTIVITY_MATCH_WEIGHT: 0.85,  // 85% of score from activity matches
  TRAVEL_BONUS_POINTS: 15,      // Bonus for good airport access
  TRAVEL_PENALTY_POINTS: -10    // Penalty for poor airport access
};

// ============================================
// DEBUG SETTINGS
// ============================================
export const DEBUG = {
  SHOW_SCORING_DETAILS: false,  // Set to true to see detailed scoring logs
  SHOW_MISSING_DATA: false,     // Set to true to see what data is missing
  SHOW_CALCULATION_TIME: false  // Set to true to measure performance
};
