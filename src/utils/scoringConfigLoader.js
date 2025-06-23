// Scoring Configuration Loader
// This utility loads the scoring configuration and provides it to the matching algorithms

import scoringConfig from '../config/scoringConfig.json';

/**
 * Get the current scoring configuration
 */
export const getScoringConfig = () => {
  return scoringConfig.scoringConfiguration;
};

/**
 * Get category weights with adaptive adjustments
 */
export const getCategoryWeights = (userPreferences) => {
  const config = getScoringConfig();
  const baseWeights = { ...config.categoryWeights.weights };
  
  // Apply adaptive weight rules
  config.adaptiveWeightRules.rules.forEach(rule => {
    if (shouldApplyRule(rule, userPreferences)) {
      Object.entries(rule.adjustments).forEach(([category, adjustment]) => {
        const value = parseFloat(adjustment);
        if (baseWeights[category]) {
          baseWeights[category] += value;
          // Ensure weights stay positive
          baseWeights[category] = Math.max(0.05, baseWeights[category]);
        }
      });
    }
  });
  
  // Normalize weights to sum to 1.0
  const sum = Object.values(baseWeights).reduce((a, b) => a + b, 0);
  Object.keys(baseWeights).forEach(key => {
    baseWeights[key] = baseWeights[key] / sum;
  });
  
  return baseWeights;
};

/**
 * Check if an adaptive weight rule should be applied
 */
const shouldApplyRule = (rule, preferences) => {
  switch (rule.name) {
    case 'Healthcare Priority':
      return preferences.administration?.health_considerations?.healthcare_access === 'full_access' ||
             preferences.administration?.health_considerations?.healthcare_access === 'hospital_specialists';
    
    case 'Budget Conscious':
      return preferences.costs?.property_tax_sensitive || 
             preferences.costs?.income_tax_sensitive || 
             preferences.costs?.sales_tax_sensitive;
    
    case 'Active Lifestyle':
      return (preferences.hobbies?.activities?.length || 0) > 5 || 
             (preferences.hobbies?.interests?.length || 0) > 5;
    
    case 'Climate Sensitive':
      return preferences.climate_preferences?.seasonal_preference && 
             preferences.climate_preferences.seasonal_preference !== 'Optional';
    
    default:
      return false;
  }
};

/**
 * Get budget scoring configuration
 */
export const getBudgetScoringRanges = () => {
  const config = getScoringConfig();
  return config.budgetScoring.ranges;
};

/**
 * Get administration component weights
 */
export const getAdministrationWeights = () => {
  const config = getScoringConfig();
  return config.administrationScoring.components;
};

/**
 * Get hobbies scoring bonuses
 */
export const getHobbiesScoringBonuses = () => {
  const config = getScoringConfig();
  return {
    activities: config.hobbiesScoring.activityBonus,
    interests: config.hobbiesScoring.interestBonus
  };
};

/**
 * Get region scoring values
 */
export const getRegionScoringValues = () => {
  const config = getScoringConfig();
  return config.regionScoring.matchTypes;
};

/**
 * Get score threshold labels and colors
 */
export const getScoreThresholds = () => {
  const config = getScoringConfig();
  return config.scoringThresholds;
};

/**
 * Get confidence level based on data completeness
 */
export const getConfidenceLevel = (dataCompleteness) => {
  const config = getScoringConfig();
  if (dataCompleteness >= 90) return 'High';
  if (dataCompleteness >= 70) return 'Medium';
  return 'Low';
};

/**
 * Admin function to update configuration
 * This would typically save to a database or API in production
 */
export const updateScoringConfig = async (newConfig) => {
  // In production, this would save to a backend
  console.log('Updating scoring configuration:', newConfig);
  
  // For now, just log the change
  console.warn('Configuration updates require backend implementation');
  
  return {
    success: false,
    message: 'Configuration updates require backend implementation'
  };
};

export default {
  getScoringConfig,
  getCategoryWeights,
  getBudgetScoringRanges,
  getAdministrationWeights,
  getHobbiesScoringBonuses,
  getRegionScoringValues,
  getScoreThresholds,
  getConfidenceLevel,
  updateScoringConfig
};