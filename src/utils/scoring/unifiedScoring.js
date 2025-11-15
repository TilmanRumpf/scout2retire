/**
 * Unified scoring module to eliminate duplication between matchingAlgorithm.js and townUtils.jsx
 * Single source of truth for scoring towns against user preferences
 */

import { calculateEnhancedMatch } from './core/calculateMatch.js';
import { parsePreferences } from './helpers/preferenceParser.js';

/**
 * Returns an optional personalization note based on score and coverage.
 *
 * @param {number} score - Total match score (0–100)
 * @param {number} coverage - Preference coverage (0.0–1.0)
 * @returns {string|null}
 */
function getPersonalizationNote(score, coverage) {
  if (coverage < 0.4 && score >= 80) {
    return 'Limited personalization — you provided very few preferences. Complete your profile for sharper matches.';
  }
  return null;
}

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
  if (scores.cost >= 80) insights.push(`Very affordable for your cost`);
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
      if (userPreferences.total_monthly_cost !== undefined && userPreferences.total_monthly_cost !== null) {
        costPrefs.total_monthly_cost = userPreferences.total_monthly_cost;
      }
      if (userPreferences.max_monthly_rent !== undefined && userPreferences.max_monthly_rent !== null) {
        costPrefs.max_monthly_rent = userPreferences.max_monthly_rent;
      }
      if (userPreferences.max_home_price !== undefined && userPreferences.max_home_price !== null) {
        costPrefs.max_home_price = userPreferences.max_home_price;
      }
      if (userPreferences.monthly_healthcare_cost !== undefined && userPreferences.monthly_healthcare_cost !== null) {
        costPrefs.monthly_healthcare_cost = userPreferences.monthly_healthcare_cost;
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
  try {
    // DEBUG: Log when scoring Gainesville
    if (town.town_name?.toLowerCase().includes('gainesville')) {
      console.log('[scoreTown] Starting to score Gainesville');
      console.log('[scoreTown] User preferences passed in:', JSON.stringify(userPreferences, null, 2));
    }

    // Convert preferences to algorithm format
    const convertedPreferences = convertPreferencesToAlgorithmFormat(userPreferences);

    // Calculate match using enhanced algorithm
    const enhancedResult = await calculateEnhancedMatch(convertedPreferences, town);

    // DEBUG: Log Gainesville scoring details
    if (town.town_name?.toLowerCase().includes('gainesville')) {
      console.log('[scoreTown] Scoring Gainesville...');
      console.log('[scoreTown] Enhanced result match_score:', enhancedResult.match_score);
      console.log('[scoreTown] Category scores:', enhancedResult.category_scores);
    }

    // Generate additional insights
    const insights = generateEnhancedInsights(town, convertedPreferences, enhancedResult.category_scores);
    const warnings = generateEnhancedWarnings(town, convertedPreferences);
    const highlights = generateEnhancedHighlights(town, enhancedResult.category_scores);

    // Convert match factors to match reasons (DEFENSIVE: check top_factors exists)
    const matchReasons = (enhancedResult.top_factors || [])
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

    // Generate appealStatement based on best category match (fixes "Analyzing..." stuck overlay)
    const categories = [
      { name: "Region", score: mappedCategoryScores.region || 0 },
      { name: "Climate", score: mappedCategoryScores.climate || 0 },
      { name: "Culture", score: mappedCategoryScores.culture || 0 },
      { name: "Hobbies", score: mappedCategoryScores.hobbies || 0 },
      { name: "Admin", score: mappedCategoryScores.administration || 0 },
      { name: "Costs", score: mappedCategoryScores.cost || 0 }
    ];
    const bestCategory = categories.reduce((max, cat) => cat.score > max.score ? cat : max);
    const appealStatement = `${bestCategory.name} Match: ${Math.round(bestCategory.score)}%`;

    // Calculate preference coverage (what proportion of categories have user preferences)
    const parsed = parsePreferences(userPreferences);
    const totalCategories = 6;
    const categoriesWithPrefs = [
      parsed.region.hasAnyPreferences,
      parsed.climate.hasAnyPreferences,
      parsed.culture.hasAnyPreferences,
      parsed.hobbies.hasAnyPreferences,
      parsed.admin.hasAnyPreferences,
      parsed.cost.hasAnyPreferences
    ].filter(Boolean).length;
    const preferenceCoverage = categoriesWithPrefs / totalCategories;

    // Generate personalization note if needed
    const personalizationNote = getPersonalizationNote(enhancedResult.match_score, preferenceCoverage);

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
      match_quality: enhancedResult.match_quality,
      appealStatement: appealStatement,
      preferenceCoverage: preferenceCoverage,
      personalizationNote: personalizationNote
    };
  } catch (error) {
    // ERROR HANDLING: If scoring fails, return safe defaults so UI doesn't hang
    console.error(`❌ Error scoring town ${town.town_name}:`, error);

    // Return town with safe default scores to prevent "Analyzing..." hang
    return {
      ...town,
      matchScore: 50, // Neutral score
      matchReasons: ['Error calculating match'],
      categoryScores: {
        region: 50,
        climate: 50,
        culture: 50,
        hobbies: 50,
        administration: 50,
        cost: 50
      },
      warnings: ['Unable to calculate complete match score'],
      insights: [],
      highlights: [],
      confidence: 'Low',
      valueRating: 3,
      match_factors: [],
      match_quality: 'Error',
      appealStatement: 'Error: Unable to score',
      preferenceCoverage: 0,  // Unknown due to error
      personalizationNote: null  // Cannot determine due to error
    };
  }
};

/**
 * Score multiple towns in parallel for better performance
 */
export const scoreTownsBatch = async (towns, userPreferences) => {
  return Promise.all(towns.map(town => scoreTown(town, userPreferences)));
};