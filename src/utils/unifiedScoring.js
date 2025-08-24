/**
 * Unified scoring module to eliminate duplication between matchingAlgorithm.js and townUtils.jsx
 * Single source of truth for scoring towns against user preferences
 */

import { calculateEnhancedMatch } from './enhancedMatchingAlgorithm';
import { 
  generateEnhancedInsights, 
  generateEnhancedWarnings, 
  generateEnhancedHighlights 
} from './enhancedMatchingHelpers';

/**
 * Convert user preferences from database format to enhanced algorithm format
 * Handles both nested (old format) and flat (current database) structures
 */
export const convertPreferencesToAlgorithmFormat = (userPreferences) => {
  // DEBUG: Fixed - was case sensitivity issue
  // console.log('🔍 DEBUG: Raw user preferences from DB:', userPreferences);
  
  // Handle region preferences - combine countries and regions from top-level fields
  const regionPreferences = userPreferences.region || userPreferences.region_preferences || {};
  
  // If top-level countries/regions exist, ensure they're in the region_preferences object
  if (userPreferences.countries || userPreferences.regions) {
    regionPreferences.countries = userPreferences.countries || regionPreferences.countries || [];
    regionPreferences.regions = userPreferences.regions || regionPreferences.regions || [];
  }
  
  // Add geographic_features and vegetation_types if present at top level
  if (userPreferences.geographic_features) {
    regionPreferences.geographic_features = userPreferences.geographic_features;
  }
  if (userPreferences.vegetation_types) {
    regionPreferences.vegetation_types = userPreferences.vegetation_types;
  }
  if (userPreferences.provinces) {
    regionPreferences.provinces = userPreferences.provinces;
  }
  
  // console.log('🔍 DEBUG: Converted region preferences:', regionPreferences);
  
  return {
    region_preferences: regionPreferences,
    climate_preferences: userPreferences.climate || userPreferences.climate_preferences || {
      // Extract climate fields from root level
      summer_climate_preference: userPreferences.summer_climate_preference,
      winter_climate_preference: userPreferences.winter_climate_preference,
      humidity_level: userPreferences.humidity_level,
      sunshine: userPreferences.sunshine,
      precipitation: userPreferences.precipitation,
      seasonal_preference: userPreferences.seasonal_preference
    },
    culture_preferences: userPreferences.culture || userPreferences.culture_preferences || {
      // Extract culture fields from root level
      expat_community_preference: userPreferences.expat_community_preference,
      language_comfort: userPreferences.language_comfort,
      cultural_importance: userPreferences.cultural_importance,
      lifestyle_preferences: userPreferences.lifestyle_preferences
    },
    hobbies_preferences: userPreferences.hobbies || userPreferences.hobbies_preferences || {
      // Extract hobbies fields from root level
      activities: userPreferences.activities,
      interests: userPreferences.interests,
      travel_frequency: userPreferences.travel_frequency,
      lifestyle_importance: userPreferences.lifestyle_importance,
      custom_activities: userPreferences.custom_activities
    },
    admin_preferences: userPreferences.administration || userPreferences.admin_preferences || {
      // Extract admin fields from root level (where they're stored in user_preferences table)
      healthcare_quality: userPreferences.healthcare_quality,
      safety_importance: userPreferences.safety_importance,
      government_efficiency: userPreferences.government_efficiency,
      political_stability: userPreferences.political_stability,
      visa_preference: userPreferences.visa_preference,
      health_considerations: userPreferences.health_considerations,
      insurance_importance: userPreferences.insurance_importance,
      emergency_services: userPreferences.emergency_services,
      tax_preference: userPreferences.tax_preference,
      stay_duration: userPreferences.stay_duration,
      residency_path: userPreferences.residency_path
    },
    budget_preferences: userPreferences.costs || userPreferences.budget_preferences || {
      // Extract budget fields from root level
      total_monthly_budget: userPreferences.total_monthly_budget,
      max_monthly_rent: userPreferences.max_monthly_rent,
      max_home_price: userPreferences.max_home_price,
      monthly_healthcare_budget: userPreferences.monthly_healthcare_budget,
      mobility: userPreferences.mobility,
      property_tax_sensitive: userPreferences.property_tax_sensitive,
      sales_tax_sensitive: userPreferences.sales_tax_sensitive,
      income_tax_sensitive: userPreferences.income_tax_sensitive
    },
    current_status: userPreferences.current_status || {
      citizenship: userPreferences.primary_citizenship || userPreferences.citizenship
    }
  };
};

/**
 * Score a single town against user preferences
 * Returns complete scoring result with insights, warnings, and category breakdowns
 */
export const scoreTown = async (town, userPreferences) => {
  // Convert preferences to algorithm format
  const convertedPreferences = convertPreferencesToAlgorithmFormat(userPreferences);
  
  // Calculate match using enhanced algorithm
  const enhancedResult = await calculateEnhancedMatch(convertedPreferences, town);
  
  // DEBUG: Fixed - was case sensitivity issue
  // if (town.country === 'Spain') {
  //   console.log(`🎯 DEBUG: Scoring for ${town.name}, Spain:`, {
  //     totalScore: enhancedResult.match_score,
  //     categoryScores: enhancedResult.category_scores,
  //     topFactors: enhancedResult.top_factors?.slice(0, 3)
  //   });
  // }
  
  // Generate additional insights
  const insights = generateEnhancedInsights(town, convertedPreferences, enhancedResult.category_scores);
  const warnings = generateEnhancedWarnings(town, convertedPreferences);
  const highlights = generateEnhancedHighlights(town, enhancedResult.category_scores);
  
  // Convert match factors to match reasons
  const matchReasons = enhancedResult.top_factors
    .filter(f => f.score > 0)
    .map(f => f.factor);
  
  // Calculate confidence based on category scores
  const avgScore = Object.values(enhancedResult.category_scores).reduce((a, b) => a + b, 0) / 
                   Object.values(enhancedResult.category_scores).length;
  const confidence = avgScore >= 80 ? 'High' : avgScore >= 60 ? 'Medium' : 'Low';
  
  // Calculate value rating
  const valueRating = enhancedResult.category_scores.budget >= 80 ? 5 : 
                     enhancedResult.category_scores.budget >= 60 ? 4 :
                     enhancedResult.category_scores.budget >= 40 ? 3 : 2;
  
  // Map category scores with correct naming (admin -> administration) for UI compatibility
  const mappedCategoryScores = {
    ...enhancedResult.category_scores,
    administration: enhancedResult.category_scores.admin // Map admin to administration for UI
  };
  
  return {
    ...town,
    matchScore: enhancedResult.match_score,
    matchReasons: matchReasons,
    categoryScores: mappedCategoryScores,
    warnings: warnings,
    insights: insights,
    highlights: highlights,
    confidence: confidence,
    valueRating: valueRating,
    match_factors: enhancedResult.match_factors,
    match_quality: enhancedResult.match_quality
  };
};

/**
 * Score multiple towns in parallel for better performance
 */
export const scoreTownsBatch = async (towns, userPreferences) => {
  return Promise.all(towns.map(town => scoreTown(town, userPreferences)));
};