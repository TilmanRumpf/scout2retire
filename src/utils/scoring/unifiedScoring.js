/**
 * Unified scoring module to eliminate duplication between matchingAlgorithm.js and townUtils.jsx
 * Single source of truth for scoring towns against user preferences
 */

import { calculateEnhancedMatch } from './enhancedMatchingAlgorithm.js';

/**
 * Simple implementations of insight generation functions
 * (Previously in enhancedMatchingHelpers.js, now simplified inline)
 */
const generateEnhancedInsights = (town, _preferences, scores) => {
  const insights = [];
  
  // Add insights based on high-scoring categories
  if (scores.region >= 80) insights.push(`Excellent location match in ${town.country}`);
  if (scores.climate >= 80) insights.push(`Climate aligns well with your preferences`);
  if (scores.culture >= 80) insights.push(`Cultural fit matches your lifestyle`);
  if (scores.cost >= 80) insights.push(`Very affordable for your budget`);
  if (scores.admin >= 80) insights.push(`Healthcare and safety meet your standards`);
  if (scores.hobbies >= 80) insights.push(`Many activities you enjoy are available`);
  
  return insights;
};

const generateEnhancedWarnings = (town, _preferences) => {
  const warnings = [];
  
  // Add basic warnings
  if (!town.image_url_1) warnings.push('No photos available yet');
  if (town.safety_score && town.safety_score < 5) warnings.push('Safety concerns may need investigation');
  if (town.healthcare_score && town.healthcare_score < 5) warnings.push('Healthcare may be limited');
  
  return warnings;
};

const generateEnhancedHighlights = (_town, scores) => {
  const highlights = [];
  
  // Find the highest scoring categories
  const sortedScores = Object.entries(scores).sort(([,a], [,b]) => b - a);
  sortedScores.slice(0, 3).forEach(([category, score]) => {
    if (score >= 70) {
      highlights.push(`Strong ${category} match (${Math.round(score)}%)`);
    }
  });
  
  return highlights;
};

/**
 * Convert user preferences from database format to enhanced algorithm format
 * Handles both nested (old format) and flat (current database) structures
 */
export const convertPreferencesToAlgorithmFormat = (userPreferences) => {
  // DEBUG: Enable to see what's being loaded
  
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
  
  // Build climate preferences - FIXED: Only use fields that actually exist
  const climatePrefs = userPreferences.climate || userPreferences.climate_preferences || {};
  
  // Only add fields from root level if they actually have values
  if (userPreferences.summer_climate_preference !== undefined && userPreferences.summer_climate_preference !== null) {
    climatePrefs.summer_climate_preference = userPreferences.summer_climate_preference;
  }
  if (userPreferences.winter_climate_preference !== undefined && userPreferences.winter_climate_preference !== null) {
    climatePrefs.winter_climate_preference = userPreferences.winter_climate_preference;
  }
  if (userPreferences.humidity_level !== undefined && userPreferences.humidity_level !== null) {
    climatePrefs.humidity_level = userPreferences.humidity_level;
  }
  if (userPreferences.sunshine !== undefined && userPreferences.sunshine !== null) {
    climatePrefs.sunshine = userPreferences.sunshine;
  }
  if (userPreferences.precipitation !== undefined && userPreferences.precipitation !== null) {
    climatePrefs.precipitation = userPreferences.precipitation;
  }
  if (userPreferences.seasonal_preference !== undefined && userPreferences.seasonal_preference !== null) {
    climatePrefs.seasonal_preference = userPreferences.seasonal_preference;
  }
  
  // Build culture preferences - FIXED: Only use fields that actually exist
  const culturePrefs = userPreferences.culture || userPreferences.culture_preferences || {};
  
  if (userPreferences.expat_community_preference !== undefined && userPreferences.expat_community_preference !== null) {
    culturePrefs.expat_community_preference = userPreferences.expat_community_preference;
  }
  if (userPreferences.language_comfort !== undefined && userPreferences.language_comfort !== null) {
    culturePrefs.language_comfort = userPreferences.language_comfort;
  }
  if (userPreferences.cultural_importance !== undefined && userPreferences.cultural_importance !== null) {
    culturePrefs.cultural_importance = userPreferences.cultural_importance;
  }
  if (userPreferences.lifestyle_preferences !== undefined && userPreferences.lifestyle_preferences !== null) {
    culturePrefs.lifestyle_preferences = userPreferences.lifestyle_preferences;
  }
  
  // Build hobbies preferences - FIXED: Only use fields that actually exist
  const hobbiesPrefs = userPreferences.hobbies || userPreferences.hobbies_preferences || {};
  
  if (userPreferences.activities !== undefined && userPreferences.activities !== null) {
    hobbiesPrefs.activities = userPreferences.activities;
  }
  if (userPreferences.interests !== undefined && userPreferences.interests !== null) {
    hobbiesPrefs.interests = userPreferences.interests;
  }
  if (userPreferences.travel_frequency !== undefined && userPreferences.travel_frequency !== null) {
    hobbiesPrefs.travel_frequency = userPreferences.travel_frequency;
  }
  if (userPreferences.lifestyle_importance !== undefined && userPreferences.lifestyle_importance !== null) {
    hobbiesPrefs.lifestyle_importance = userPreferences.lifestyle_importance;
  }
  if (userPreferences.custom_activities !== undefined && userPreferences.custom_activities !== null) {
    hobbiesPrefs.custom_activities = userPreferences.custom_activities;
  }
  if (userPreferences.custom_physical !== undefined && userPreferences.custom_physical !== null) {
    hobbiesPrefs.custom_physical = userPreferences.custom_physical;
  }
  
  // Preferences converted successfully
  
  return {
    region_preferences: regionPreferences,
    climate_preferences: climatePrefs,
    culture_preferences: culturePrefs,
    hobbies_preferences: hobbiesPrefs,
    admin_preferences: (() => {
      const adminPrefs = userPreferences.administration || userPreferences.admin_preferences || {};
      
      // Only add fields from root level if they actually have values
      if (userPreferences.healthcare_quality !== undefined && userPreferences.healthcare_quality !== null) {
        adminPrefs.healthcare_quality = userPreferences.healthcare_quality;
      }
      if (userPreferences.safety_importance !== undefined && userPreferences.safety_importance !== null) {
        adminPrefs.safety_importance = userPreferences.safety_importance;
      }
      if (userPreferences.government_efficiency !== undefined && userPreferences.government_efficiency !== null) {
        adminPrefs.government_efficiency = userPreferences.government_efficiency;
      }
      if (userPreferences.political_stability !== undefined && userPreferences.political_stability !== null) {
        adminPrefs.political_stability = userPreferences.political_stability;
      }
      if (userPreferences.visa_preference !== undefined && userPreferences.visa_preference !== null) {
        adminPrefs.visa_preference = userPreferences.visa_preference;
      }
      if (userPreferences.health_considerations !== undefined && userPreferences.health_considerations !== null) {
        adminPrefs.health_considerations = userPreferences.health_considerations;
      }
      if (userPreferences.insurance_importance !== undefined && userPreferences.insurance_importance !== null) {
        adminPrefs.insurance_importance = userPreferences.insurance_importance;
      }
      if (userPreferences.emergency_services !== undefined && userPreferences.emergency_services !== null) {
        adminPrefs.emergency_services = userPreferences.emergency_services;
      }
      if (userPreferences.tax_preference !== undefined && userPreferences.tax_preference !== null) {
        adminPrefs.tax_preference = userPreferences.tax_preference;
      }
      if (userPreferences.stay_duration !== undefined && userPreferences.stay_duration !== null) {
        adminPrefs.stay_duration = userPreferences.stay_duration;
      }
      if (userPreferences.residency_path !== undefined && userPreferences.residency_path !== null) {
        adminPrefs.residency_path = userPreferences.residency_path;
      }
      
      return adminPrefs;
    })(),
    cost_preferences: (() => {
      const costPrefs = userPreferences.costs || userPreferences.cost_preferences || {};
      
      // Only add fields from root level if they actually have values
      if (userPreferences.total_monthly_budget !== undefined && userPreferences.total_monthly_budget !== null) {
        costPrefs.total_monthly_budget = userPreferences.total_monthly_budget;
      }
      if (userPreferences.max_monthly_rent !== undefined && userPreferences.max_monthly_rent !== null) {
        costPrefs.max_monthly_rent = userPreferences.max_monthly_rent;
      }
      if (userPreferences.max_home_price !== undefined && userPreferences.max_home_price !== null) {
        costPrefs.max_home_price = userPreferences.max_home_price;
      }
      if (userPreferences.monthly_healthcare_budget !== undefined && userPreferences.monthly_healthcare_budget !== null) {
        costPrefs.monthly_healthcare_budget = userPreferences.monthly_healthcare_budget;
      }
      if (userPreferences.mobility !== undefined && userPreferences.mobility !== null) {
        costPrefs.mobility = userPreferences.mobility;
      }
      if (userPreferences.property_tax_sensitive !== undefined && userPreferences.property_tax_sensitive !== null) {
        costPrefs.property_tax_sensitive = userPreferences.property_tax_sensitive;
      }
      if (userPreferences.sales_tax_sensitive !== undefined && userPreferences.sales_tax_sensitive !== null) {
        costPrefs.sales_tax_sensitive = userPreferences.sales_tax_sensitive;
      }
      if (userPreferences.income_tax_sensitive !== undefined && userPreferences.income_tax_sensitive !== null) {
        costPrefs.income_tax_sensitive = userPreferences.income_tax_sensitive;
      }
      
      return costPrefs;
    })(),
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
  // DEBUG: What are we receiving?
  if (town.name === 'Granada' || town.name === 'Puerto de la Cruz' || town.name === 'Castro Urdiales' || town.name === 'Baiona') {
    console.log(`🔍 UNIFIED SCORING DEBUG for ${town.name}:`);
    console.log('Town climate fields:', {
      summer: town.summer_climate_actual,
      winter: town.winter_climate_actual,
      humidity: town.humidity_level_actual
    });
    console.log('User preferences received:', {
      summer: userPreferences?.summer_climate_preference,
      winter: userPreferences?.winter_climate_preference,
      humidity: userPreferences?.humidity_level
    });
  }

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
  const valueRating = enhancedResult.category_scores.cost >= 80 ? 5 : 
                     enhancedResult.category_scores.cost >= 60 ? 4 :
                     enhancedResult.category_scores.cost >= 40 ? 3 : 2;
  
  // Use category scores directly (no mapping needed anymore)
  const mappedCategoryScores = enhancedResult.category_scores;
  
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