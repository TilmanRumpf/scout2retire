// src/utils/matchingAlgorithm.js
import supabase from './supabaseClient';
import { getOnboardingProgress } from './onboardingUtils';
import { calculatePremiumMatch } from './premiumMatchingAlgorithm';

/**
 * Get personalized town recommendations based on user's onboarding preferences
 */
export const getPersonalizedTowns = async (userId, options = {}) => {
  try {
    const { limit = 20, offset = 0 } = options;

    // 1. Get user's onboarding preferences
    const { success: onboardingSuccess, data: userPreferences } = await getOnboardingProgress(userId);
    
    if (!onboardingSuccess || !userPreferences) {
      console.log('No onboarding data found, falling back to general recommendations');
      return await getFallbackTowns(limit, offset);
    }

    console.log('User preferences loaded:', userPreferences);

    // 2. Get all towns with their data
    const { data: allTowns, error: townsError } = await supabase
      .from('towns')
      .select('*')
      .limit(200); // Get more towns to score and rank

    if (townsError) {
      console.error('Error fetching towns:', townsError);
      return { success: false, error: townsError };
    }

    // 3. Score each town based on user preferences using premium algorithm
    const scoredTowns = allTowns.map(town => {
      const premiumResult = calculatePremiumMatch(town, userPreferences);
      return {
        ...town,
        matchScore: premiumResult.score,
        matchReasons: premiumResult.matchReasons,
        categoryScores: premiumResult.breakdown,
        warnings: premiumResult.warnings,
        insights: premiumResult.insights,
        highlights: premiumResult.highlights,
        confidence: premiumResult.confidence,
        valueRating: premiumResult.value_rating
      };
    });

    // 4. Sort by match score (highest first) and paginate
    const sortedTowns = scoredTowns
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(offset, offset + limit);

    console.log(`Personalized recommendations for user ${userId}:`, {
      totalScored: scoredTowns.length,
      returned: sortedTowns.length,
      topScores: sortedTowns.slice(0, 3).map(t => ({ 
        name: t.name, 
        score: t.matchScore,
        categories: t.categoryScores 
      }))
    });

    return {
      success: true,
      towns: sortedTowns,
      isPersonalized: true,
      userPreferences: userPreferences
    };

  } catch (error) {
    console.error('Error getting personalized towns:', error);
    return { success: false, error };
  }
};

/**
 * Calculate detailed match score with all onboarding data
 */
function calculateDetailedMatchScore(town, userPrefs) {
  const scoreBreakdown = {
    totalScore: 0,
    categoryScores: {},
    reasons: [],
    warnings: []
  };

  // Weight configuration for each category
  const weights = {
    budget: 20,
    healthcare: 15,
    safety: 15,
    administration: 15,
    climate: 10,
    region: 10,
    culture: 10,
    hobbies: 5
  };

  // 1. BUDGET MATCHING (from costs)
  if (userPrefs.costs) {
    const budgetScore = calculateBudgetScore(town, userPrefs.costs);
    scoreBreakdown.categoryScores.budget = budgetScore;
    scoreBreakdown.totalScore += (budgetScore * weights.budget) / 100;
    
    if (budgetScore >= 80) {
      scoreBreakdown.reasons.push(`Perfect budget match: $${town.cost_index}/mo`);
    } else if (budgetScore >= 60) {
      scoreBreakdown.reasons.push(`Within budget: $${town.cost_index}/mo`);
    } else if (budgetScore < 40) {
      scoreBreakdown.warnings.push(`Outside budget range: $${town.cost_index}/mo`);
    }
  }

  // 2. HEALTHCARE MATCHING (from administration)
  if (userPrefs.administration) {
    const healthScore = calculateHealthcareScore(town, userPrefs.administration);
    scoreBreakdown.categoryScores.healthcare = healthScore;
    scoreBreakdown.totalScore += (healthScore * weights.healthcare) / 100;
    
    if (healthScore >= 80) {
      scoreBreakdown.reasons.push(`Healthcare matches your "${userPrefs.administration.healthcare_quality?.join(', ')}" preference`);
    } else if (healthScore < 50 && userPrefs.administration.special_medical_needs) {
      scoreBreakdown.warnings.push(`Healthcare may not meet your special medical needs`);
    }
  }

  // 3. SAFETY & SECURITY MATCHING (from administration)
  if (userPrefs.administration) {
    const safetyScore = calculateSafetyScore(town, userPrefs.administration);
    scoreBreakdown.categoryScores.safety = safetyScore;
    scoreBreakdown.totalScore += (safetyScore * weights.safety) / 100;
    
    if (safetyScore >= 80) {
      scoreBreakdown.reasons.push(`Safety level matches your preferences`);
    } else if (safetyScore < 50) {
      scoreBreakdown.warnings.push(`Safety level below your preferences`);
    }
  }

  // 4. ADMINISTRATIVE MATCHING (visa, tax, government)
  if (userPrefs.administration) {
    const adminScore = calculateAdministrativeScore(town, userPrefs.administration);
    scoreBreakdown.categoryScores.administration = adminScore;
    scoreBreakdown.totalScore += (adminScore * weights.administration) / 100;
    
    if (adminScore >= 80) {
      scoreBreakdown.reasons.push(`Excellent visa & administrative match`);
    }
    
    // Special handling for stay duration
    if (userPrefs.administration.stay_duration?.includes('long') && town.residency_info) {
      scoreBreakdown.reasons.push(`Good for long-term residence`);
    }
  }

  // 5. CLIMATE MATCHING
  if (userPrefs.climate_preferences) {
    const climateScore = calculateEnhancedClimateScore(town, userPrefs.climate_preferences);
    scoreBreakdown.categoryScores.climate = climateScore;
    scoreBreakdown.totalScore += (climateScore * weights.climate) / 100;
    
    if (climateScore >= 80) {
      scoreBreakdown.reasons.push(`Perfect climate match`);
    }
  }

  // 6. REGION MATCHING
  if (userPrefs.region_preferences) {
    const regionScore = calculateEnhancedRegionScore(town, userPrefs.region_preferences);
    scoreBreakdown.categoryScores.region = regionScore;
    scoreBreakdown.totalScore += (regionScore * weights.region) / 100;
    
    if (regionScore === 100) {
      scoreBreakdown.reasons.push(`In your preferred region`);
    }
  }

  // 7. CULTURE MATCHING
  if (userPrefs.culture_preferences) {
    const cultureScore = calculateEnhancedCultureScore(town, userPrefs.culture_preferences);
    scoreBreakdown.categoryScores.culture = cultureScore;
    scoreBreakdown.totalScore += (cultureScore * weights.culture) / 100;
    
    if (cultureScore >= 80) {
      scoreBreakdown.reasons.push(`Culture & lifestyle match`);
    }
  }

  // 8. HOBBIES MATCHING
  if (userPrefs.hobbies) {
    const hobbiesScore = calculateEnhancedHobbiesScore(town, userPrefs.hobbies);
    scoreBreakdown.categoryScores.hobbies = hobbiesScore;
    scoreBreakdown.totalScore += (hobbiesScore * weights.hobbies) / 100;
    
    if (hobbiesScore >= 80) {
      scoreBreakdown.reasons.push(`Great for your hobbies & interests`);
    }
  }

  // Calculate final score
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  scoreBreakdown.totalScore = Math.round((scoreBreakdown.totalScore / totalWeight) * 100);

  // Limit reasons and warnings
  scoreBreakdown.reasons = scoreBreakdown.reasons.slice(0, 4);
  scoreBreakdown.warnings = scoreBreakdown.warnings.slice(0, 2);

  return scoreBreakdown;
}

/**
 * Enhanced Budget Score Calculation
 */
function calculateBudgetScore(town, userCosts) {
  if (!town.cost_index || !userCosts?.total_monthly_budget) return 50;

  const townCost = parseInt(town.cost_index);
  const userBudget = parseInt(userCosts.total_monthly_budget);

  if (!townCost || !userBudget) return 50;

  // If town cost is within budget, score based on how much under budget
  if (townCost <= userBudget) {
    const savingsPercent = ((userBudget - townCost) / userBudget) * 100;
    
    // Perfect score if 20-40% under budget (good value)
    if (savingsPercent >= 20 && savingsPercent <= 40) return 100;
    
    // Still good if under budget but not too much
    if (savingsPercent < 20) return 90;
    
    // Too cheap might mean lower quality
    if (savingsPercent > 60) return 70;
    
    return 85;
  } else {
    // Over budget - penalize based on how much over
    const overPercent = ((townCost - userBudget) / userBudget) * 100;
    
    if (overPercent <= 10) return 70;  // Slightly over
    if (overPercent <= 20) return 50;  // Moderately over
    if (overPercent <= 30) return 30;  // Significantly over
    return 10; // Way over budget
  }
}

/**
 * Healthcare Score based on quality preferences
 */
function calculateHealthcareScore(town, adminPrefs) {
  if (!town.healthcare_score || !adminPrefs.healthcare_quality) return 50;

  const townHealthScore = parseInt(town.healthcare_score);
  const userPrefs = adminPrefs.healthcare_quality;
  
  // Map user preferences to score ranges
  const scoreRanges = {
    'good': { min: 8, ideal: 9 },
    'functional': { min: 6, ideal: 7 },
    'basic': { min: 4, ideal: 5 }
  };

  let bestScore = 0;

  userPrefs.forEach(pref => {
    const range = scoreRanges[pref];
    if (!range) return;

    if (townHealthScore >= range.ideal) {
      bestScore = Math.max(bestScore, 100);
    } else if (townHealthScore >= range.min) {
      bestScore = Math.max(bestScore, 80);
    } else if (townHealthScore >= range.min - 1) {
      bestScore = Math.max(bestScore, 60);
    }
  });

  // Special handling for special medical needs
  if (adminPrefs.special_medical_needs && townHealthScore < 8) {
    bestScore = Math.min(bestScore, 40); // Penalize low healthcare for special needs
  }

  return bestScore || 30;
}

/**
 * Safety Score based on preferences
 */
function calculateSafetyScore(town, adminPrefs) {
  if (!town.safety_score || !adminPrefs.safety_importance) return 50;

  const townSafetyScore = parseInt(town.safety_score);
  const userPrefs = adminPrefs.safety_importance;
  
  const scoreRanges = {
    'good': { min: 8, ideal: 9 },
    'functional': { min: 6, ideal: 7 },
    'basic': { min: 4, ideal: 5 }
  };

  let bestScore = 0;

  userPrefs.forEach(pref => {
    const range = scoreRanges[pref];
    if (!range) return;

    if (townSafetyScore >= range.ideal) {
      bestScore = Math.max(bestScore, 100);
    } else if (townSafetyScore >= range.min) {
      bestScore = Math.max(bestScore, 80);
    } else if (townSafetyScore >= range.min - 1) {
      bestScore = Math.max(bestScore, 60);
    }
  });

  // Also check political stability preference
  if (adminPrefs.political_stability?.includes('good') && townSafetyScore < 7) {
    bestScore = Math.min(bestScore, 50);
  }

  return bestScore || 30;
}

/**
 * Administrative Score (visa, tax, government efficiency)
 */
function calculateAdministrativeScore(town, adminPrefs) {
  let scores = [];
  
  // Visa ease scoring
  if (adminPrefs.visa_preference && town.visa_info) {
    const visaScore = calculateVisaScore(town.visa_info, adminPrefs.visa_preference);
    scores.push(visaScore);
  }
  
  // Tax system scoring
  if (adminPrefs.tax_preference && town.tax_info) {
    const taxScore = calculateTaxScore(town.tax_info, adminPrefs.tax_preference);
    scores.push(taxScore);
  }
  
  // Government efficiency
  if (adminPrefs.government_efficiency && town.government_rating) {
    const govScore = calculateGovernmentScore(town.government_rating, adminPrefs.government_efficiency);
    scores.push(govScore);
  }
  
  // Residency path matching
  if (adminPrefs.residency_path && town.residency_info) {
    const residencyScore = calculateResidencyScore(town.residency_info, adminPrefs.residency_path);
    scores.push(residencyScore);
  }

  if (scores.length === 0) return 70; // Default decent score
  
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

/**
 * Helper functions for administrative scoring
 */
function calculateVisaScore(townVisaInfo, userVisaPrefs) {
  const visaText = townVisaInfo.toLowerCase();
  
  if (userVisaPrefs.includes('good')) {
    if (visaText.includes('easy') || visaText.includes('simple') || visaText.includes('visa-free')) return 100;
    if (visaText.includes('straightforward') || visaText.includes('friendly')) return 80;
  } else if (userVisaPrefs.includes('functional')) {
    if (visaText.includes('moderate') || visaText.includes('standard')) return 90;
  }
  
  return 60;
}

function calculateTaxScore(townTaxInfo, userTaxPrefs) {
  const taxText = townTaxInfo.toLowerCase();
  
  if (userTaxPrefs.includes('good')) {
    if (taxText.includes('low tax') || taxText.includes('tax haven') || taxText.includes('favorable')) return 100;
    if (taxText.includes('moderate tax')) return 70;
  }
  
  return 60;
}

function calculateGovernmentScore(townGovRating, userGovPrefs) {
  // Similar logic to healthcare/safety scoring
  return 70; // Placeholder
}

function calculateResidencyScore(townResidencyInfo, userResidencyPath) {
  const residencyText = townResidencyInfo.toLowerCase();
  
  if (userResidencyPath.includes('citizenship')) {
    if (residencyText.includes('citizenship') || residencyText.includes('naturalization')) return 100;
  }
  if (userResidencyPath.includes('residence')) {
    if (residencyText.includes('permanent residence') || residencyText.includes('residency')) return 90;
  }
  if (userResidencyPath.includes('seasonal')) {
    if (residencyText.includes('seasonal') || residencyText.includes('temporary')) return 85;
  }
  
  return 60;
}

/**
 * Enhanced Climate Score with detailed preferences
 */
function calculateEnhancedClimateScore(town, climatePrefs) {
  if (!town.climate || !climatePrefs) return 50;

  const townClimate = town.climate.toLowerCase();
  let score = 50;

  // Summer preferences
  if (climatePrefs.summer_climate_preference) {
    const summerPrefs = climatePrefs.summer_climate_preference.join(' ').toLowerCase();
    if (summerPrefs.includes('warm') && townClimate.includes('warm')) score += 20;
    if (summerPrefs.includes('hot') && townClimate.includes('hot')) score += 20;
    if (summerPrefs.includes('mild') && townClimate.includes('mild')) score += 20;
  }

  // Winter preferences
  if (climatePrefs.winter_climate_preference) {
    const winterPrefs = climatePrefs.winter_climate_preference.join(' ').toLowerCase();
    if (winterPrefs.includes('warm') && !townClimate.includes('cold')) score += 20;
    if (winterPrefs.includes('cool') && townClimate.includes('cool')) score += 20;
  }

  // Humidity preferences
  if (climatePrefs.humidity_level) {
    const humidityPrefs = climatePrefs.humidity_level.join(' ').toLowerCase();
    if (humidityPrefs.includes('balanced') && townClimate.includes('moderate')) score += 10;
    if (humidityPrefs.includes('dry') && townClimate.includes('dry')) score += 10;
  }

  // Sunshine preferences
  if (climatePrefs.sunshine) {
    const sunshinePrefs = climatePrefs.sunshine.join(' ').toLowerCase();
    if (sunshinePrefs.includes('mostly_sunny') && townClimate.includes('sunny')) score += 10;
  }

  return Math.min(score, 100);
}

/**
 * Enhanced Region Score with detailed country/continent preferences
 */
function calculateEnhancedRegionScore(town, regionPrefs) {
  if (!town.country || !regionPrefs) return 50;

  const townCountry = town.country.toLowerCase();

  // Direct country match
  if (regionPrefs.countries) {
    const userCountries = regionPrefs.countries.map(c => c.toLowerCase());
    if (userCountries.includes(townCountry)) return 100;
  }

  // Continent/region match
  if (regionPrefs.regions || regionPrefs.continents) {
    const userRegions = [...(regionPrefs.regions || []), ...(regionPrefs.continents || [])]
      .map(r => r.toLowerCase());
    
    const regionMappings = {
      'mediterranean': ['spain', 'portugal', 'italy', 'greece', 'cyprus', 'malta'],
      'north america': ['mexico', 'canada', 'united states'],
      'central america': ['costa rica', 'panama', 'nicaragua', 'guatemala', 'belize'],
      'south america': ['ecuador', 'colombia', 'peru', 'chile', 'argentina', 'uruguay'],
      'southeast asia': ['thailand', 'malaysia', 'philippines', 'vietnam', 'cambodia'],
      'europe': ['portugal', 'spain', 'italy', 'france', 'greece', 'cyprus'],
      'caribbean': ['barbados', 'dominican republic', 'jamaica', 'bahamas'],
      'island': ['malta', 'cyprus', 'barbados', 'jamaica', 'philippines']
    };

    for (const [region, countries] of Object.entries(regionMappings)) {
      if (userRegions.some(r => r.includes(region)) && 
          countries.some(c => townCountry.includes(c))) {
        return 85;
      }
    }
  }

  // Geographic features match
  if (regionPrefs.geographic_features && town.geographic_features) {
    const userFeatures = regionPrefs.geographic_features.join(' ').toLowerCase();
    const townFeatures = town.geographic_features.toLowerCase();
    
    if (userFeatures.includes('coastal') && townFeatures.includes('coast')) return 80;
    if (userFeatures.includes('mountains') && townFeatures.includes('mountain')) return 80;
    if (userFeatures.includes('island') && townFeatures.includes('island')) return 80;
  }

  return 40;
}

/**
 * Enhanced Culture Score with lifestyle preferences
 */
function calculateEnhancedCultureScore(town, culturePrefs) {
  if (!culturePrefs) return 50;

  let score = 50;
  const townDesc = (town.description || '').toLowerCase();
  const expatInfo = (town.expat_population || '').toLowerCase();

  // Expat community preferences
  if (culturePrefs.expat_community_preference) {
    const expatPrefs = culturePrefs.expat_community_preference.join(' ').toLowerCase();
    
    if (expatPrefs.includes('large') && 
        (expatInfo.includes('large') || expatInfo.includes('thriving') || expatInfo.includes('significant'))) {
      score += 25;
    } else if (expatPrefs.includes('moderate') && 
               (expatInfo.includes('moderate') || expatInfo.includes('growing'))) {
      score += 20;
    } else if (expatPrefs.includes('small') && 
               (expatInfo.includes('small') || expatInfo.includes('emerging'))) {
      score += 20;
    }
  }

  // Lifestyle preferences (pace of life, urban/rural)
  if (culturePrefs.lifestyle_preferences) {
    const lifestyle = culturePrefs.lifestyle_preferences;
    
    // Pace of life
    if (lifestyle.pace_of_life) {
      const pacePrefs = lifestyle.pace_of_life.join(' ').toLowerCase();
      if (pacePrefs.includes('slow') && townDesc.includes('relaxed')) score += 15;
      if (pacePrefs.includes('moderate') && townDesc.includes('balanced')) score += 15;
      if (pacePrefs.includes('fast') && townDesc.includes('vibrant')) score += 15;
    }
    
    // Urban/rural
    if (lifestyle.urban_rural) {
      const urbanPrefs = lifestyle.urban_rural.join(' ').toLowerCase();
      if (urbanPrefs.includes('urban') && townDesc.includes('city')) score += 10;
      if (urbanPrefs.includes('suburban') && townDesc.includes('suburban')) score += 10;
      if (urbanPrefs.includes('rural') && townDesc.includes('rural')) score += 10;
    }
  }

  // Language comfort
  if (culturePrefs.language_comfort && town.primary_language) {
    const languages = culturePrefs.language_comfort.already_speak || [];
    const townLang = town.primary_language.toLowerCase();
    
    if (languages.some(lang => townLang.includes(lang.toLowerCase()))) {
      score += 15;
    }
  }

  return Math.min(score, 100);
}

/**
 * Enhanced Hobbies Score with detailed activities
 */
function calculateEnhancedHobbiesScore(town, hobbiesPrefs) {
  if (!hobbiesPrefs || !town.description) return 50;

  const townText = town.description.toLowerCase();
  let score = 50;
  let matchCount = 0;

  // Activities matching
  if (hobbiesPrefs.activities) {
    const activities = hobbiesPrefs.activities;
    
    const activityKeywords = {
      'water_sports': ['beach', 'diving', 'snorkeling', 'surfing', 'swimming', 'water sports'],
      'golf': ['golf', 'golf course', 'golfing'],
      'hiking': ['hiking', 'trails', 'mountains', 'trekking', 'nature walks'],
      'cycling': ['cycling', 'biking', 'bicycle'],
      'fishing': ['fishing', 'angling'],
      'photography': ['scenic', 'beautiful', 'picturesque', 'photo'],
      'gardening': ['garden', 'botanical', 'farming'],
      'cooking': ['culinary', 'cuisine', 'food', 'restaurants']
    };

    activities.forEach(activity => {
      const keywords = activityKeywords[activity];
      if (keywords && keywords.some(keyword => townText.includes(keyword))) {
        score += 10;
        matchCount++;
      }
    });
  }

  // Interests matching
  if (hobbiesPrefs.interests) {
    const interests = hobbiesPrefs.interests;
    
    const interestKeywords = {
      'history': ['historic', 'history', 'heritage', 'ancient', 'colonial'],
      'nature': ['nature', 'natural', 'wildlife', 'parks', 'reserves'],
      'arts': ['art', 'gallery', 'museum', 'cultural', 'artistic'],
      'music': ['music', 'concerts', 'festivals', 'live music'],
      'wellness': ['spa', 'wellness', 'yoga', 'meditation', 'health'],
      'wine': ['wine', 'vineyard', 'winery'],
      'volunteering': ['volunteer', 'community', 'charity', 'help']
    };

    interests.forEach(interest => {
      const keywords = interestKeywords[interest];
      if (keywords && keywords.some(keyword => townText.includes(keyword))) {
        score += 8;
        matchCount++;
      }
    });
  }

  // Social preferences
  if (hobbiesPrefs.social_preference) {
    const socialPref = hobbiesPrefs.social_preference;
    if (socialPref === 'social' && (townText.includes('community') || townText.includes('social'))) {
      score += 5;
    }
  }

  // Travel frequency consideration
  if (hobbiesPrefs.travel_frequency && town.transport_links) {
    const travelFreq = hobbiesPrefs.travel_frequency;
    if (travelFreq === 'frequent' && town.transport_links.includes('airport')) {
      score += 5;
    }
  }

  return Math.min(score, 100);
}

/**
 * Fallback function when no onboarding data is available
 */
async function getFallbackTowns(limit, offset) {
  try {
    const { data: towns, error } = await supabase
      .from('towns')
      .select('*')
      .order('healthcare_score', { ascending: false })
      .order('safety_score', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1);

    if (error) {
      return { success: false, error };
    }

    return {
      success: true,
      towns: towns || [],
      isPersonalized: false
    };
  } catch (error) {
    return { success: false, error };
  }
}