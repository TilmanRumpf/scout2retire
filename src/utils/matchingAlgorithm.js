// src/utils/matchingAlgorithm.js
import supabase from './supabaseClient';
import { getOnboardingProgress } from './onboardingUtils';

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

    // 2. Get all towns with their data
    const { data: allTowns, error: townsError } = await supabase
      .from('towns')
      .select('*')
      .limit(100); // Get more towns to score and rank

    if (townsError) {
      console.error('Error fetching towns:', townsError);
      return { success: false, error: townsError };
    }

    // 3. Score each town based on user preferences
    const scoredTowns = allTowns.map(town => ({
      ...town,
      matchScore: calculateMatchScore(town, userPreferences),
      matchReasons: getMatchReasons(town, userPreferences)
    }));

    // 4. Sort by match score (highest first) and paginate
    const sortedTowns = scoredTowns
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(offset, offset + limit);

    console.log(`Personalized recommendations for user ${userId}:`, {
      totalScored: scoredTowns.length,
      returned: sortedTowns.length,
      topScores: sortedTowns.slice(0, 3).map(t => ({ name: t.name, score: t.matchScore }))
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
 * Calculate match score between town and user preferences (0-100)
 */
function calculateMatchScore(town, userPreferences) {
  let totalScore = 0;
  let totalWeight = 0;

  // Budget matching (weight: 25)
  if (userPreferences.budget && town.cost_index) {
    const budgetScore = calculateBudgetScore(town.cost_index, userPreferences.budget);
    totalScore += budgetScore * 25;
    totalWeight += 25;
  }

  // Climate matching (weight: 20)
  if (userPreferences.climate_preferences && town.climate) {
    const climateScore = calculateClimateScore(town.climate, userPreferences.climate_preferences);
    totalScore += climateScore * 20;
    totalWeight += 20;
  }

  // Region matching (weight: 15)
  if (userPreferences.region_preferences && town.country) {
    const regionScore = calculateRegionScore(town, userPreferences.region_preferences);
    totalScore += regionScore * 15;
    totalWeight += 15;
  }

  // Culture/lifestyle matching (weight: 15)
  if (userPreferences.culture_preferences && (town.description || town.expat_population)) {
    const cultureScore = calculateCultureScore(town, userPreferences.culture_preferences);
    totalScore += cultureScore * 15;
    totalWeight += 15;
  }

  // Hobbies/activities matching (weight: 10)
  if (userPreferences.hobbies && town.description) {
    const hobbiesScore = calculateHobbiesScore(town.description, userPreferences.hobbies);
    totalScore += hobbiesScore * 10;
    totalWeight += 10;
  }

  // Quality scores (weight: 15 total)
  if (town.healthcare_score || town.safety_score) {
    const qualityScore = calculateQualityScore(town);
    totalScore += qualityScore * 15;
    totalWeight += 15;
  }

  // Return weighted average, or 50 if no matching criteria
  return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 50;
}

/**
 * Calculate budget compatibility score (0-100)
 */
function calculateBudgetScore(townCost, userBudget) {
  if (!townCost || !userBudget) return 50;

  // Parse budget ranges to numbers
  const townCostNum = parseInt(townCost.toString().replace(/[^\d]/g, ''));
  let userBudgetNum;
  
  // Handle different budget formats
  if (typeof userBudget === 'string') {
    if (userBudget.includes('under')) {
      userBudgetNum = 1500; // Under $2000 -> prefer towns under $1500
    } else if (userBudget.includes('2000-3000')) {
      userBudgetNum = 2500;
    } else if (userBudget.includes('3000-5000')) {
      userBudgetNum = 4000;
    } else if (userBudget.includes('over')) {
      userBudgetNum = 6000; // Over $5000 -> prefer towns around $6000
    } else {
      userBudgetNum = parseInt(userBudget.toString().replace(/[^\d]/g, ''));
    }
  } else {
    userBudgetNum = parseInt(userBudget.toString());
  }

  if (!userBudgetNum || !townCostNum) return 50;

  // Calculate score based on how close the costs are
  const difference = Math.abs(townCostNum - userBudgetNum);
  const maxDifference = userBudgetNum * 0.5; // 50% tolerance
  
  if (difference === 0) return 100;
  if (difference >= maxDifference) return 0;
  
  return Math.round(100 - (difference / maxDifference) * 100);
}

/**
 * Calculate climate compatibility score (0-100)
 */
function calculateClimateScore(townClimate, userClimatePrefs) {
  if (!townClimate || !userClimatePrefs) return 50;

  const townClimateStr = townClimate.toLowerCase();
  const userPrefsStr = Array.isArray(userClimatePrefs) 
    ? userClimatePrefs.join(' ').toLowerCase()
    : userClimatePrefs.toLowerCase();

  // Define climate keywords
  const climateKeywords = {
    tropical: ['tropical', 'humid', 'hot', 'warm', 'rainforest'],
    temperate: ['temperate', 'mild', 'moderate', 'spring', 'fall'],
    dry: ['dry', 'desert', 'arid', 'low humidity'],
    cool: ['cool', 'cold', 'winter', 'mountain', 'alpine'],
    coastal: ['coastal', 'beach', 'ocean', 'sea', 'maritime']
  };

  let bestScore = 0;

  // Check each climate type
  Object.entries(climateKeywords).forEach(([climateType, keywords]) => {
    const townMatches = keywords.some(keyword => townClimateStr.includes(keyword));
    const userWants = keywords.some(keyword => userPrefsStr.includes(keyword));
    
    if (townMatches && userWants) {
      bestScore = Math.max(bestScore, 100);
    } else if (townMatches || userWants) {
      bestScore = Math.max(bestScore, 30);
    }
  });

  return bestScore || 50;
}

/**
 * Calculate region compatibility score (0-100)
 */
function calculateRegionScore(town, userRegionPrefs) {
  if (!town.country || !userRegionPrefs) return 50;

  const townCountry = town.country.toLowerCase();
  const userPrefsStr = Array.isArray(userRegionPrefs) 
    ? userRegionPrefs.join(' ').toLowerCase()
    : userRegionPrefs.toLowerCase();

  // Direct country match
  if (userPrefsStr.includes(townCountry)) {
    return 100;
  }

  // Regional matching
  const regions = {
    'central america': ['costa rica', 'panama', 'nicaragua', 'guatemala', 'belize'],
    'south america': ['ecuador', 'colombia', 'peru', 'chile', 'argentina', 'uruguay'],
    'southeast asia': ['thailand', 'malaysia', 'philippines', 'vietnam', 'cambodia'],
    'europe': ['portugal', 'spain', 'italy', 'france', 'greece', 'cyprus'],
    'caribbean': ['barbados', 'dominican republic', 'jamaica', 'bahamas'],
    'north america': ['mexico', 'canada', 'united states']
  };

  for (const [region, countries] of Object.entries(regions)) {
    if (userPrefsStr.includes(region) && countries.some(country => townCountry.includes(country))) {
      return 85;
    }
  }

  return 30; // Some compatibility for any international location
}

/**
 * Calculate culture/lifestyle compatibility score (0-100)
 */
function calculateCultureScore(town, userCulturePrefs) {
  if (!userCulturePrefs) return 50;

  const userPrefsStr = Array.isArray(userCulturePrefs) 
    ? userCulturePrefs.join(' ').toLowerCase()
    : userCulturePrefs.toLowerCase();

  let score = 50;
  
  // Check town description for culture keywords
  const townText = (town.description || '').toLowerCase();
  const expatInfo = (town.expat_population || '').toLowerCase();
  
  const cultureKeywords = {
    'expat community': ['expat', 'international', 'foreign', 'english', 'american'],
    'local culture': ['traditional', 'authentic', 'local', 'cultural', 'heritage'],
    'modern': ['modern', 'contemporary', 'developed', 'western'],
    'relaxed': ['relaxed', 'laid back', 'peaceful', 'quiet', 'slow pace'],
    'active': ['active', 'vibrant', 'lively', 'entertainment', 'nightlife']
  };

  Object.entries(cultureKeywords).forEach(([culturePref, keywords]) => {
    const userWants = userPrefsStr.includes(culturePref.replace(' ', ''));
    const townHas = keywords.some(keyword => townText.includes(keyword) || expatInfo.includes(keyword));
    
    if (userWants && townHas) {
      score += 15;
    }
  });

  return Math.min(score, 100);
}

/**
 * Calculate hobbies/activities compatibility score (0-100)
 */
function calculateHobbiesScore(townDescription, userHobbies) {
  if (!townDescription || !userHobbies) return 50;

  const townText = townDescription.toLowerCase();
  const userHobbiesStr = Array.isArray(userHobbies) 
    ? userHobbies.join(' ').toLowerCase()
    : userHobbies.toLowerCase();

  const hobbyKeywords = {
    'outdoor': ['hiking', 'nature', 'beach', 'outdoor', 'fishing', 'golf', 'cycling'],
    'cultural': ['museum', 'art', 'culture', 'history', 'theater', 'music'],
    'social': ['community', 'social', 'expat', 'clubs', 'groups'],
    'sports': ['golf', 'tennis', 'water sports', 'fishing', 'diving'],
    'wellness': ['spa', 'wellness', 'yoga', 'health', 'medical']
  };

  let score = 50;
  let matches = 0;

  Object.entries(hobbyKeywords).forEach(([hobby, keywords]) => {
    const userInterested = userHobbiesStr.includes(hobby);
    const townOffers = keywords.some(keyword => townText.includes(keyword));
    
    if (userInterested && townOffers) {
      score += 10;
      matches++;
    }
  });

  return Math.min(score, 100);
}

/**
 * Calculate quality scores (healthcare, safety) (0-100)
 */
function calculateQualityScore(town) {
  let totalScore = 0;
  let count = 0;

  if (town.healthcare_score) {
    totalScore += (town.healthcare_score / 10) * 100;
    count++;
  }

  if (town.safety_score) {
    totalScore += (town.safety_score / 10) * 100;
    count++;
  }

  return count > 0 ? Math.round(totalScore / count) : 70; // Default good score
}

/**
 * Get reasons why this town matches user preferences
 */
function getMatchReasons(town, userPreferences) {
  const reasons = [];

  // Budget reasons
  if (userPreferences.budget && town.cost_index) {
    const budgetScore = calculateBudgetScore(town.cost_index, userPreferences.budget);
    if (budgetScore > 80) {
      reasons.push(`Fits your budget perfectly ($${town.cost_index}/month)`);
    } else if (budgetScore > 60) {
      reasons.push(`Within your budget range ($${town.cost_index}/month)`);
    }
  }

  // Climate reasons
  if (userPreferences.climate_preferences && town.climate) {
    const climateScore = calculateClimateScore(town.climate, userPreferences.climate_preferences);
    if (climateScore > 80) {
      reasons.push(`Perfect climate match: ${town.climate}`);
    } else if (climateScore > 60) {
      reasons.push(`Good climate fit: ${town.climate}`);
    }
  }

  // Quality reasons
  if (town.healthcare_score && town.healthcare_score >= 8) {
    reasons.push(`Excellent healthcare (${town.healthcare_score}/10)`);
  }
  if (town.safety_score && town.safety_score >= 8) {
    reasons.push(`Very safe location (${town.safety_score}/10)`);
  }

  return reasons.slice(0, 3); // Return top 3 reasons
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