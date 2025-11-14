/**
 * SCORING CONFIGURATION - Your Control Panel
 * ==========================================
 * Edit all matching algorithm settings here.
 * Changes here will affect how towns are scored.
 */

// ============================================
// CATEGORY WEIGHTS (must add up to 100)
// ============================================
// UPDATED 2025-10-15: Increased region weight to make country selection more impactful
// Old: region: 20%, climate: 15%, culture: 15%, hobbies: 10%, admin: 20%, cost: 20%
// New: region: 30% (increased), others proportionally adjusted
export const CATEGORY_WEIGHTS = {
  region: 30,         // Geographic location match (INCREASED from 20%)
  climate: 13,        // Weather preferences (reduced from 15%)
  culture: 12,        // Language, pace of life, expat community (reduced from 15%)
  hobbies: 8,         // Activities & interests (reduced from 10%)
  administration: 18, // Healthcare, safety, visa (reduced from 20%)
  cost: 19            // Cost of living match (reduced from 20%)
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
// MATH CORRECTED 2025-10-15: Total must equal 90 points (country + geo + veg)
export const REGION_SETTINGS = {
  // Points for different match levels
  EXACT_COUNTRY_MATCH: 40,  // Country match alone = 44%, all three = 100%
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

// Cost Scoring Settings
export const COST_SETTINGS = {
  // Points for each cost aspect
  OVERALL_COST_POINTS: 40,
  RENT_COST_POINTS: 30,
  HEALTHCARE_COST_POINTS: 20,
  TAX_POINTS: 15,
  // Cost comfort zones
  EXCELLENT_VALUE_RATIO: 2.0,    // Cost is 2x the cost
  COMFORTABLE_MARGIN_RATIO: 1.5, // Cost is 1.5x the cost
  GOOD_FIT_RATIO: 1.2,           // Cost is 1.2x the cost
  ADEQUATE_RATIO: 1.0,           // Cost equals cost
  TIGHT_RATIO: 0.9,              // Cost is 90% of cost
  CHALLENGING_RATIO: 0.8         // Cost is 80% of cost
};

// Hobbies Scoring Settings
export const HOBBIES_SETTINGS = {
  // Base scoring
  ACTIVITY_MATCH_WEIGHT: 0.85,  // 85% of score from activity matches
  TRAVEL_BONUS_POINTS: 15,      // Bonus for good airport access
  TRAVEL_PENALTY_POINTS: -10    // Penalty for poor airport access
};

// ============================================
// FEATURE FLAGS
// ============================================
// Enable/disable experimental features for gradual rollout
export const FEATURE_FLAGS = {
  ENABLE_CULTURE_V2_SCORING: false  // V2: Adds traditional_progressive_lean + social_atmosphere scoring
};

// ============================================
// DEBUG SETTINGS
// ============================================
export const DEBUG = {
  SHOW_SCORING_DETAILS: false,  // Set to true to see detailed scoring logs
  SHOW_MISSING_DATA: false,     // Set to true to see what data is missing
  SHOW_CALCULATION_TIME: false  // Set to true to measure performance
};
