// Enhanced Matching Algorithm for Scout2Retire
// This algorithm provides more sophisticated scoring with adaptive weights,
// fuzzy matching, and lifestyle compatibility scoring

// Helper functions - defined before use
function calculateSafetyScore(townSafety, userPrefs) {
  if (!userPrefs.safety_importance || userPrefs.safety_importance === 'not_important') return 100;
  
  const safetyMap = {
    'very_safe': 100,
    'safe': 85,
    'moderate': 70,
    'unsafe': 40
  };
  
  return safetyMap[townSafety] || 70;
}

function calculateAdminScore(town, userPrefs) {
  let score = 0;
  let count = 0;
  
  // Healthcare
  if (userPrefs.healthcare_importance !== 'not_important') {
    const healthMap = { 'excellent': 100, 'good': 85, 'functional': 70, 'basic': 50 };
    score += healthMap[town.healthcare_quality] || 70;
    count++;
  }
  
  // Visa requirements
  if (userPrefs.visa_importance !== 'not_important' && town.visa_requirements) {
    score += town.visa_requirements === 'easy' ? 100 : 70;
    count++;
  }
  
  return count > 0 ? score / count : 100;
}

function calculateHumidityMatch(townHumidity, userPref) {
  if (!userPref || userPref === 'any') return 100;
  
  const humidityRanges = {
    'low': [0, 40],
    'moderate': [30, 70],
    'high': [60, 100]
  };
  
  const range = humidityRanges[userPref];
  if (!range) return 100;
  
  if (townHumidity >= range[0] && townHumidity <= range[1]) return 100;
  
  const distance = Math.min(
    Math.abs(townHumidity - range[0]),
    Math.abs(townHumidity - range[1])
  );
  
  return Math.max(0, 100 - (distance * 2));
}

function calculateSunshineMatch(townSunDays, userPref) {
  if (!userPref || userPref === 'any') return 100;
  
  const sunRanges = {
    'mostly_sunny': [250, 365],
    'balanced': [150, 250],
    'often_cloudy': [0, 150]
  };
  
  const range = sunRanges[userPref];
  if (!range) return 100;
  
  if (townSunDays >= range[0] && townSunDays <= range[1]) return 100;
  
  const distance = Math.min(
    Math.abs(townSunDays - range[0]),
    Math.abs(townSunDays - range[1])
  );
  
  return Math.max(0, 100 - (distance / 2));
}

function calculateExpatCommunityMatch(townExpats, userPref) {
  if (!userPref || userPref === 'any') return 100;
  
  const expatMap = {
    'large': ['large'],
    'moderate': ['moderate', 'large'],
    'small': ['small', 'moderate'],
    'none': ['none', 'small']
  };
  
  const acceptable = expatMap[userPref] || [];
  return acceptable.includes(townExpats) ? 100 : 60;
}

function calculatePaceMatch(townPace, userPref) {
  if (!userPref || userPref === 'any') return 100;
  
  const paceMap = {
    'slow': ['slow', 'moderate'],
    'moderate': ['moderate', 'slow', 'fast'],
    'fast': ['fast', 'moderate']
  };
  
  const acceptable = paceMap[userPref] || [];
  return acceptable.includes(townPace) ? 100 : 60;
}

function calculateUrbanRuralMatch(townEnvironments, userPrefs) {
  if (!userPrefs || userPrefs.length === 0) return 100;
  if (!townEnvironments || townEnvironments.length === 0) return 60;
  
  const matches = townEnvironments.filter(env => userPrefs.includes(env));
  return matches.length > 0 ? 100 : 60;
}

function calculateMobilityMatch(townMobility, userNeeds) {
  if (!userNeeds || userNeeds === 'none') return 100;
  
  const mobilityScores = {
    'excellent': 100,
    'good': 85,
    'moderate': 70,
    'limited': 50
  };
  
  return mobilityScores[townMobility] || 70;
}

export const calculateEnhancedMatch = (town, userPreferences) => {
  // Adaptive weights based on what user emphasized in onboarding
  const weights = calculateAdaptiveWeights(userPreferences);
  
  // Calculate individual category scores with fuzzy logic
  const scores = {
    budget: calculateBudgetScore(town, userPreferences),
    healthcare: calculateHealthcareScore(town, userPreferences),
    climate: calculateClimateScore(town, userPreferences),
    culture: calculateCultureScore(town, userPreferences),
    lifestyle: calculateLifestyleScore(town, userPreferences),
    connectivity: calculateConnectivityScore(town, userPreferences),
    safety: calculateSafetyScore(town, userPreferences),
    administration: calculateAdminScore(town, userPreferences)
  };
  
  // Calculate weighted total
  let totalScore = 0;
  let totalWeight = 0;
  
  Object.entries(scores).forEach(([category, score]) => {
    if (weights[category] > 0) {
      totalScore += score * weights[category];
      totalWeight += weights[category];
    }
  });
  
  const finalScore = totalWeight > 0 ? totalScore / totalWeight : 0;
  
  // Apply deal breakers (hard constraints)
  const dealBreakerPenalty = applyDealBreakers(town, userPreferences);
  
  // Generate detailed insights
  const insights = generateMatchInsights(town, userPreferences, scores);
  
  return {
    score: Math.max(0, finalScore - dealBreakerPenalty),
    categoryScores: scores,
    insights,
    warnings: identifyWarnings(town, userPreferences),
    highlights: identifyHighlights(town, userPreferences, scores)
  };
};

// Calculate adaptive weights based on user's onboarding emphasis
const calculateAdaptiveWeights = (preferences) => {
  const baseWeights = {
    budget: 0.20,
    healthcare: 0.15,
    climate: 0.10,
    culture: 0.10,
    lifestyle: 0.15,
    connectivity: 0.10,
    safety: 0.10,
    administration: 0.10
  };
  
  // Adjust weights based on user's specific needs
  const weights = { ...baseWeights };
  
  // If user has health conditions, increase healthcare weight
  if (preferences.health_considerations?.healthcare_access !== 'pharmacy_only') {
    weights.healthcare = 0.25;
    weights.budget -= 0.05;
    weights.culture -= 0.05;
  }
  
  // If user selected many activities, increase lifestyle weight
  if (preferences.activities?.length > 5) {
    weights.lifestyle = 0.20;
    weights.administration -= 0.05;
  }
  
  // If user is budget conscious (selected tax sensitivities)
  if (preferences.property_tax_sensitive || preferences.income_tax_sensitive) {
    weights.budget = 0.25;
    weights.connectivity -= 0.05;
  }
  
  // Normalize weights to sum to 1
  const sum = Object.values(weights).reduce((a, b) => a + b, 0);
  Object.keys(weights).forEach(key => {
    weights[key] = weights[key] / sum;
  });
  
  return weights;
};

// Fuzzy budget scoring with tolerance
const calculateBudgetScore = (town, preferences) => {
  const userBudget = preferences.total_monthly_budget;
  const townCost = town.cost_index;
  
  if (!userBudget || !townCost) return 50;
  
  // Allow 15% tolerance for "close enough" matches
  const tolerance = 0.15;
  const ratio = townCost / userBudget;
  
  if (ratio <= 0.7) return 100; // Significantly under budget
  if (ratio <= 0.85) return 95; // Comfortably under budget
  if (ratio <= 1.0) return 90; // At or under budget
  if (ratio <= 1.0 + tolerance) return 75; // Slightly over but acceptable
  if (ratio <= 1.3) return 50; // Stretch but possible
  if (ratio <= 1.5) return 25; // Difficult
  return 0; // Way over budget
};

// Climate compatibility with seasonal preferences
const calculateClimateScore = (town, preferences) => {
  let score = 0;
  let factors = 0;
  
  // Summer climate matching
  if (preferences.summer_climate_preference?.length > 0 && town.summer_temp_avg) {
    const summerScore = calculateTemperatureMatch(
      town.summer_temp_avg,
      preferences.summer_climate_preference
    );
    score += summerScore;
    factors++;
  }
  
  // Winter climate matching
  if (preferences.winter_climate_preference?.length > 0 && town.winter_temp_avg) {
    const winterScore = calculateTemperatureMatch(
      town.winter_temp_avg,
      preferences.winter_climate_preference
    );
    score += winterScore;
    factors++;
  }
  
  // Humidity preferences
  if (preferences.humidity_level?.length > 0 && town.humidity_avg) {
    const humidityScore = calculateHumidityMatch(
      town.humidity_avg,
      preferences.humidity_level
    );
    score += humidityScore;
    factors++;
  }
  
  // Sunshine preferences
  if (preferences.sunshine?.length > 0 && town.sunny_days_per_year) {
    const sunshineScore = calculateSunshineMatch(
      town.sunny_days_per_year,
      preferences.sunshine
    );
    score += sunshineScore;
    factors++;
  }
  
  return factors > 0 ? score / factors : 70; // Default to decent score if no data
};

// Helper function for temperature matching
const calculateTemperatureMatch = (townTemp, preferences) => {
  const tempRanges = {
    'cold': { min: -10, max: 10 },
    'cool': { min: 10, max: 18 },
    'mild': { min: 18, max: 24 },
    'warm': { min: 24, max: 30 },
    'hot': { min: 30, max: 40 }
  };
  
  let bestScore = 0;
  preferences.forEach(pref => {
    const range = tempRanges[pref];
    if (range) {
      if (townTemp >= range.min && townTemp <= range.max) {
        bestScore = 100;
      } else {
        // Calculate distance from preferred range
        const distance = Math.min(
          Math.abs(townTemp - range.min),
          Math.abs(townTemp - range.max)
        );
        const score = Math.max(0, 100 - (distance * 5));
        bestScore = Math.max(bestScore, score);
      }
    }
  });
  
  return bestScore;
};

// Culture and lifestyle compatibility
const calculateCultureScore = (town, preferences) => {
  let score = 0;
  let factors = 0;
  
  // Language compatibility
  if (preferences.language_comfort?.preferences?.length > 0) {
    if (preferences.language_comfort.preferences.includes('english_only')) {
      // Strict English requirement
      score += town.english_proficiency_score || 50;
      factors++;
    } else if (preferences.language_comfort.preferences.includes('willing_to_learn')) {
      // More flexible, but still prefer some English
      score += Math.min(100, (town.english_proficiency_score || 30) + 30);
      factors++;
    } else {
      // Comfortable with any language
      score += 90;
      factors++;
    }
  }
  
  // Expat community size preference
  if (preferences.expat_community_preference?.length > 0 && town.expat_community_size) {
    const expatScore = calculateExpatCommunityMatch(
      town.expat_community_size,
      preferences.expat_community_preference
    );
    score += expatScore;
    factors++;
  }
  
  // Pace of life
  if (preferences.lifestyle_preferences?.pace_of_life?.length > 0) {
    const paceScore = calculatePaceMatch(
      town.pace_of_life,
      preferences.lifestyle_preferences.pace_of_life
    );
    score += paceScore;
    factors++;
  }
  
  return factors > 0 ? score / factors : 70;
};

// Lifestyle activity matching
const calculateLifestyleScore = (town, preferences) => {
  let score = 0;
  let factors = 0;
  
  // Match specific activities
  if (preferences.activities?.length > 0 && town.available_activities) {
    const activityMatches = preferences.activities.filter(activity => 
      town.available_activities.includes(activity)
    );
    score += (activityMatches.length / preferences.activities.length) * 100;
    factors++;
  }
  
  // Cultural importance matching
  if (preferences.cultural_importance) {
    Object.entries(preferences.cultural_importance).forEach(([key, importance]) => {
      if (importance > 3) { // User cares about this
        switch(key) {
          case 'dining_nightlife':
            if (town.restaurants_per_capita) {
              score += Math.min(100, town.restaurants_per_capita * 20);
              factors++;
            }
            break;
          case 'museums':
            if (town.cultural_venues_count) {
              score += Math.min(100, town.cultural_venues_count * 10);
              factors++;
            }
            break;
          case 'cultural_events':
            if (town.annual_events_count) {
              score += Math.min(100, town.annual_events_count * 5);
              factors++;
            }
            break;
        }
      }
    });
  }
  
  // Urban/rural preference
  if (preferences.lifestyle_preferences?.urban_rural?.length > 0) {
    const urbanScore = calculateUrbanRuralMatch(
      town.urban_rural_type,
      preferences.lifestyle_preferences.urban_rural
    );
    score += urbanScore;
    factors++;
  }
  
  return factors > 0 ? score / factors : 70;
};

// Connectivity and accessibility scoring
const calculateConnectivityScore = (town, preferences) => {
  let score = 0;
  let factors = 0;
  
  // Internet quality (increasingly important for retirees)
  if (town.internet_speed_mbps) {
    if (town.internet_speed_mbps >= 100) score += 100;
    else if (town.internet_speed_mbps >= 50) score += 85;
    else if (town.internet_speed_mbps >= 25) score += 70;
    else if (town.internet_speed_mbps >= 10) score += 50;
    else score += 25;
    factors++;
  }
  
  // International connectivity
  if (preferences.travel_frequency === 'frequent' && town.international_flights_weekly) {
    if (town.international_flights_weekly >= 50) score += 100;
    else if (town.international_flights_weekly >= 20) score += 80;
    else if (town.international_flights_weekly >= 10) score += 60;
    else score += 40;
    factors++;
  }
  
  // Local mobility
  if (preferences.mobility?.local) {
    const mobilityScore = calculateMobilityMatch(
      town,
      preferences.mobility.local
    );
    score += mobilityScore;
    factors++;
  }
  
  return factors > 0 ? score / factors : 70;
};

// Healthcare scoring with specific needs
const calculateHealthcareScore = (town, preferences) => {
  const baseScore = (town.healthcare_score || 5) * 10;
  
  // Adjust based on specific healthcare needs
  if (preferences.health_considerations?.healthcare_access) {
    switch(preferences.health_considerations.healthcare_access) {
      case 'full_access':
        // Need excellent healthcare
        return town.specialist_doctors_per_capita ? 
          Math.min(100, baseScore + (town.specialist_doctors_per_capita * 10)) : 
          baseScore;
      case 'hospital_specialists':
        // Need good hospital access
        return town.hospital_beds_per_capita ? 
          Math.min(100, baseScore + (town.hospital_beds_per_capita * 5)) : 
          baseScore;
      case 'general_practitioner':
        // Basic healthcare is fine
        return Math.min(100, baseScore + 20);
      default:
        return baseScore;
    }
  }
  
  return baseScore;
};

// Apply hard constraints (deal breakers)
const applyDealBreakers = (town, preferences) => {
  let penalty = 0;
  
  // Budget is a common deal breaker
  if (preferences.total_monthly_budget && town.cost_index) {
    if (town.cost_index > preferences.total_monthly_budget * 1.5) {
      penalty += 50; // Severe penalty for way over budget
    }
  }
  
  // Visa restrictions
  if (preferences.citizenship?.primary_citizenship) {
    if (town.visa_difficulty_index?.[preferences.citizenship.primary_citizenship] > 8) {
      penalty += 30; // Hard to get visa
    }
  }
  
  // Pet restrictions
  if (preferences.pet_owner?.length > 0 && town.pet_friendly_score < 3) {
    penalty += 20;
  }
  
  // Environmental health restrictions
  if (preferences.health_considerations?.environmental_health === 'very_sensitive') {
    if (town.air_quality_index > 100 || town.pollution_index > 50) {
      penalty += 40;
    }
  }
  
  return penalty;
};

// Generate human-readable insights
const generateMatchInsights = (town, preferences, scores) => {
  const insights = [];
  
  // Find the best matching aspects
  const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  
  // Top 3 reasons for match
  sortedScores.slice(0, 3).forEach(([category, score]) => {
    if (score >= 80) {
      insights.push(generatePositiveInsight(category, score, town, preferences));
    }
  });
  
  // Any concerning aspects
  sortedScores.slice(-2).forEach(([category, score]) => {
    if (score < 50) {
      insights.push(generateConcernInsight(category, score, town, preferences));
    }
  });
  
  return insights;
};

// Helper functions for insight generation
const generatePositiveInsight = (category, score, town, preferences) => {
  switch(category) {
    case 'budget':
      return `Excellent value: ${Math.round((preferences.total_monthly_budget - town.cost_index) / preferences.total_monthly_budget * 100)}% under your budget`;
    case 'healthcare':
      return `Top-tier healthcare with ${town.specialist_doctors_per_capita || 'many'} specialists per capita`;
    case 'climate':
      return `Perfect climate match for your ${preferences.seasonal_preference || 'year-round'} preferences`;
    case 'lifestyle':
      return `Vibrant ${town.urban_rural_type} setting with excellent amenities`;
    default:
      return `Strong ${category} compatibility (${score}% match)`;
  }
};

const generateConcernInsight = (category, score, town, preferences) => {
  switch(category) {
    case 'budget':
      return `⚠️ May stretch budget by ${Math.round((town.cost_index - preferences.total_monthly_budget) / preferences.total_monthly_budget * 100)}%`;
    case 'healthcare':
      return `⚠️ Limited healthcare facilities - consider proximity to major hospitals`;
    case 'connectivity':
      return `⚠️ Limited international connections - may require connecting flights`;
    default:
      return `⚠️ Lower ${category} compatibility (${score}% match)`;
  }
};

// Identify key warnings
const identifyWarnings = (town, preferences) => {
  const warnings = [];
  
  if (town.natural_disaster_risk > 7) {
    warnings.push('High natural disaster risk area');
  }
  
  if (town.political_stability_index < 5) {
    warnings.push('Political situation requires monitoring');
  }
  
  if (preferences.pet_owner?.length > 0 && town.pet_import_difficulty > 7) {
    warnings.push('Complex pet import procedures');
  }
  
  return warnings;
};

// Identify highlights
const identifyHighlights = (town, preferences, scores) => {
  const highlights = [];
  
  if (scores.budget >= 90 && scores.lifestyle >= 80) {
    highlights.push('Hidden Gem: Great lifestyle at amazing value');
  }
  
  if (scores.healthcare >= 95) {
    highlights.push('Medical Excellence: World-class healthcare hub');
  }
  
  if (town.expat_community_size > 10000) {
    highlights.push('Thriving Expat Community');
  }
  
  if (town.unesco_sites > 0) {
    highlights.push(`UNESCO World Heritage: ${town.unesco_sites} site(s)`);
  }
  
  return highlights;
};

export default { calculateEnhancedMatch };