// Enhanced Matching Algorithm that fully utilizes new town data fields
// Maps directly to the 6 onboarding sections: Region, Climate, Culture, Hobbies, Admin, Budget

import supabase from './supabaseClient.js'

// Score weights for each category (total = 100)
const CATEGORY_WEIGHTS = {
  region: 15,      // Geographic match
  climate: 20,     // Climate preferences 
  culture: 20,     // Cultural fit
  hobbies: 20,     // Activities & interests
  admin: 15,       // Healthcare, safety, visa
  budget: 10       // Financial fit
}

// Helper function to calculate array overlap score
function calculateArrayOverlap(userArray, townArray, maxScore = 100) {
  if (!userArray?.length || !townArray?.length) return 0
  
  const userSet = new Set(userArray.map(item => item.toLowerCase()))
  const townSet = new Set(townArray.map(item => item.toLowerCase()))
  
  let matches = 0
  for (const item of userSet) {
    if (townSet.has(item)) matches++
  }
  
  return (matches / userSet.size) * maxScore
}

// Helper to normalize scores to 0-100 range
function normalizeScore(value, min, max) {
  if (value <= min) return 0
  if (value >= max) return 100
  return ((value - min) / (max - min)) * 100
}

// 1. REGION MATCHING (15% of total)
export function calculateRegionScore(preferences, town) {
  let score = 0
  let factors = []
  
  // Direct country match (40 points)
  if (preferences.countries?.includes(town.country)) {
    score += 40
    factors.push({ factor: 'Exact country match', score: 40 })
  }
  // Region match (30 points)
  else if (preferences.regions?.some(region => 
    town.regions?.includes(region))) {
    score += 30
    factors.push({ factor: 'Region match', score: 30 })
  }
  
  // Geographic features match (30 points)
  if (preferences.geographic_features?.length && town.geographic_features_actual?.length) {
    const geoScore = calculateArrayOverlap(
      preferences.geographic_features,
      town.geographic_features_actual,
      30
    )
    score += geoScore
    if (geoScore > 0) {
      factors.push({ factor: 'Geographic features match', score: geoScore })
    }
  }
  
  // Vegetation type match (20 points)
  if (preferences.vegetation_types?.length && town.vegetation_type_actual?.length) {
    const vegScore = calculateArrayOverlap(
      preferences.vegetation_types,
      town.vegetation_type_actual,
      20
    )
    score += vegScore
    if (vegScore > 0) {
      factors.push({ factor: 'Vegetation type match', score: vegScore })
    }
  }
  
  // Water body preferences (10 points)
  if (preferences.geographic_features?.includes('Coastal') && town.beaches_nearby) {
    score += 10
    factors.push({ factor: 'Coastal preference matched', score: 10 })
  }
  
  return {
    score: Math.min(score, 100),
    factors,
    category: 'Region'
  }
}

// 2. CLIMATE MATCHING (20% of total)
export function calculateClimateScore(preferences, town) {
  let score = 0
  let factors = []
  
  // Summer climate match (25 points)
  if (preferences.summer_climate_preference === town.summer_climate_actual) {
    score += 25
    factors.push({ factor: 'Perfect summer climate match', score: 25 })
  } else if (
    (preferences.summer_climate_preference === 'warm' && town.summer_climate_actual === 'hot') ||
    (preferences.summer_climate_preference === 'warm' && town.summer_climate_actual === 'mild')
  ) {
    score += 15
    factors.push({ factor: 'Acceptable summer climate', score: 15 })
  }
  
  // Winter climate match (25 points)
  if (preferences.winter_climate_preference === town.winter_climate_actual) {
    score += 25
    factors.push({ factor: 'Perfect winter climate match', score: 25 })
  } else if (
    (preferences.winter_climate_preference === 'mild' && town.winter_climate_actual === 'cool') ||
    (preferences.winter_climate_preference === 'cool' && town.winter_climate_actual === 'mild')
  ) {
    score += 15
    factors.push({ factor: 'Acceptable winter climate', score: 15 })
  }
  
  // Humidity match (20 points)
  if (preferences.humidity_level === town.humidity_level_actual) {
    score += 20
    factors.push({ factor: 'Humidity preference matched', score: 20 })
  }
  
  // Sunshine match (20 points)
  if (preferences.sunshine === town.sunshine_level_actual) {
    score += 20
    factors.push({ factor: 'Sunshine preference matched', score: 20 })
  }
  
  // Precipitation match (10 points)
  if (preferences.precipitation === town.precipitation_level_actual) {
    score += 10
    factors.push({ factor: 'Precipitation preference matched', score: 10 })
  }
  
  return {
    score: Math.min(score, 100),
    factors,
    category: 'Climate'
  }
}

// 3. CULTURE MATCHING (20% of total)
export function calculateCultureScore(preferences, town) {
  let score = 0
  let factors = []
  
  // Language compatibility (25 points)
  if (preferences.language_comfort?.preferences === 'english_only') {
    if (town.english_proficiency_level === 'native' || town.english_proficiency_level === 'very_high') {
      score += 25
      factors.push({ factor: 'English widely spoken', score: 25 })
    } else if (town.english_proficiency_level === 'high') {
      score += 15
      factors.push({ factor: 'Good English proficiency', score: 15 })
    }
  } else if (preferences.language_comfort?.already_speak?.length) {
    // Check if user speaks local language
    const speaksLocal = preferences.language_comfort.already_speak.some(lang =>
      town.primary_language?.toLowerCase().includes(lang.toLowerCase()) ||
      town.languages_spoken?.some(l => l.toLowerCase().includes(lang.toLowerCase()))
    )
    if (speaksLocal) {
      score += 25
      factors.push({ factor: 'Speaks local language', score: 25 })
    }
  } else {
    // User willing to learn - give partial credit
    score += 15
    factors.push({ factor: 'Language learning opportunity', score: 15 })
  }
  
  // Expat community match (20 points)
  if (preferences.expat_community_preference === town.expat_community_size) {
    score += 20
    factors.push({ factor: 'Expat community size matched', score: 20 })
  }
  
  // Pace of life match (20 points)
  if (preferences.lifestyle_preferences?.pace_of_life === town.pace_of_life_actual) {
    score += 20
    factors.push({ factor: 'Pace of life matched', score: 20 })
  }
  
  // Urban/rural match (15 points)
  if (preferences.lifestyle_preferences?.urban_rural === town.urban_rural_character) {
    score += 15
    factors.push({ factor: 'Urban/rural preference matched', score: 15 })
  }
  
  // Cultural amenities match (20 points)
  const culturalImportance = preferences.cultural_importance || {}
  let culturalScore = 0
  let culturalMatches = 0
  
  if (culturalImportance.dining_nightlife && town.dining_nightlife_level) {
    const match = Math.abs(culturalImportance.dining_nightlife - town.dining_nightlife_level) <= 1
    if (match) {
      culturalScore += 7
      culturalMatches++
    }
  }
  
  if (culturalImportance.museums && town.museums_level) {
    const match = Math.abs(culturalImportance.museums - town.museums_level) <= 1
    if (match) {
      culturalScore += 7
      culturalMatches++
    }
  }
  
  if (culturalImportance.cultural_events && town.cultural_events_level) {
    const match = Math.abs(culturalImportance.cultural_events - town.cultural_events_level) <= 1
    if (match) {
      culturalScore += 6
      culturalMatches++
    }
  }
  
  if (culturalMatches > 0) {
    score += culturalScore
    factors.push({ factor: 'Cultural amenities match', score: culturalScore })
  }
  
  return {
    score: Math.min(score, 100),
    factors,
    category: 'Culture'
  }
}

// 4. HOBBIES MATCHING (20% of total)
export function calculateHobbiesScore(preferences, town) {
  let score = 0
  let factors = []
  
  // Activity matching (40 points)
  if (preferences.activities?.length && town.activities_available?.length) {
    const activityScore = calculateArrayOverlap(
      preferences.activities,
      town.activities_available,
      40
    )
    score += activityScore
    if (activityScore > 0) {
      factors.push({ factor: 'Activities available', score: activityScore })
    }
  }
  
  // Interest matching (30 points)
  if (preferences.interests?.length && town.interests_supported?.length) {
    const interestScore = calculateArrayOverlap(
      preferences.interests,
      town.interests_supported,
      30
    )
    score += interestScore
    if (interestScore > 0) {
      factors.push({ factor: 'Interests supported', score: interestScore })
    }
  }
  
  // Lifestyle importance ratings (30 points)
  const lifestyleImportance = preferences.lifestyle_importance || {}
  let lifestyleScore = 0
  let lifestyleMatches = 0
  
  if (lifestyleImportance.outdoor_activities && town.outdoor_activities_rating) {
    const match = lifestyleImportance.outdoor_activities >= 3 && town.outdoor_activities_rating >= 3
    if (match) {
      lifestyleScore += 8
      lifestyleMatches++
    }
  }
  
  if (lifestyleImportance.cultural_events && town.cultural_events_rating) {
    const match = lifestyleImportance.cultural_events >= 3 && town.cultural_events_rating >= 3
    if (match) {
      lifestyleScore += 8
      lifestyleMatches++
    }
  }
  
  if (lifestyleImportance.shopping && town.shopping_rating) {
    const match = lifestyleImportance.shopping >= 3 && town.shopping_rating >= 3
    if (match) {
      lifestyleScore += 7
      lifestyleMatches++
    }
  }
  
  if (lifestyleImportance.wellness && town.wellness_rating) {
    const match = lifestyleImportance.wellness >= 3 && town.wellness_rating >= 3
    if (match) {
      lifestyleScore += 7
      lifestyleMatches++
    }
  }
  
  if (lifestyleMatches > 0) {
    score += lifestyleScore
    factors.push({ factor: 'Lifestyle priorities matched', score: lifestyleScore })
  }
  
  // Travel connectivity bonus for frequent travelers
  if (preferences.travel_frequency === 'frequent' && town.travel_connectivity_rating >= 4) {
    score += 10
    factors.push({ factor: 'Excellent travel connectivity', score: 10 })
  }
  
  return {
    score: Math.min(score, 100),
    factors,
    category: 'Hobbies'
  }
}

// 5. ADMINISTRATION MATCHING (15% of total)
export function calculateAdminScore(preferences, town) {
  let score = 0
  let factors = []
  
  // Healthcare quality match (30 points)
  const healthcareMap = { basic: 5, functional: 7, good: 9 }
  const requiredScore = healthcareMap[preferences.healthcare_quality] || 7
  
  if (town.healthcare_score >= requiredScore) {
    score += 30
    factors.push({ factor: 'Healthcare meets requirements', score: 30 })
  } else if (town.healthcare_score >= requiredScore - 1) {
    score += 20
    factors.push({ factor: 'Healthcare acceptable', score: 20 })
  }
  
  // Safety match (25 points)
  const safetyMap = { basic: 6, functional: 7, good: 8 }
  const requiredSafety = safetyMap[preferences.safety_importance] || 7
  
  if (town.safety_score >= requiredSafety) {
    score += 25
    factors.push({ factor: 'Safety meets requirements', score: 25 })
  }
  
  // Visa/residency match (20 points)
  if (preferences.visa_preference === 'good' && preferences.stay_duration) {
    // Check visa requirements based on user citizenship
    if (town.visa_on_arrival_countries?.includes(preferences.citizenship) ||
        town.easy_residency_countries?.includes(preferences.citizenship)) {
      score += 20
      factors.push({ factor: 'Easy visa/residency access', score: 20 })
    } else if (town.retirement_visa_available) {
      score += 15
      factors.push({ factor: 'Retirement visa available', score: 15 })
    }
  } else {
    score += 10 // Basic visa access
  }
  
  // Environmental health for sensitive users (15 points)
  if (preferences.health_considerations?.environmental_health === 'sensitive' &&
      town.environmental_health_rating >= 4) {
    score += 15
    factors.push({ factor: 'Good environmental health', score: 15 })
  }
  
  // Political stability bonus (10 points)
  if (preferences.political_stability >= 3 && town.political_stability_rating >= 80) {
    score += 10
    factors.push({ factor: 'Politically stable', score: 10 })
  }
  
  return {
    score: Math.min(score, 100),
    factors,
    category: 'Administration'
  }
}

// 6. BUDGET MATCHING (10% of total)
export function calculateBudgetScore(preferences, town) {
  let score = 0
  let factors = []
  
  // Overall budget fit (40 points)
  const budgetRatio = preferences.total_monthly_budget / (town.typical_monthly_living_cost || town.cost_index)
  
  if (budgetRatio >= 1.5) {
    score += 40
    factors.push({ factor: 'Comfortable budget margin', score: 40 })
  } else if (budgetRatio >= 1.2) {
    score += 30
    factors.push({ factor: 'Good budget fit', score: 30 })
  } else if (budgetRatio >= 1.0) {
    score += 20
    factors.push({ factor: 'Budget adequate', score: 20 })
  } else if (budgetRatio >= 0.8) {
    score += 10
    factors.push({ factor: 'Budget tight but possible', score: 10 })
  }
  
  // Rent budget match (30 points)
  if (preferences.max_monthly_rent && town.typical_rent_1bed) {
    if (preferences.max_monthly_rent >= town.typical_rent_1bed) {
      score += 30
      factors.push({ factor: 'Rent within budget', score: 30 })
    } else if (preferences.max_monthly_rent >= town.typical_rent_1bed * 0.8) {
      score += 15
      factors.push({ factor: 'Rent slightly over budget', score: 15 })
    }
  }
  
  // Healthcare budget match (20 points)
  if (preferences.monthly_healthcare_budget && town.healthcare_cost_monthly) {
    if (preferences.monthly_healthcare_budget >= town.healthcare_cost_monthly) {
      score += 20
      factors.push({ factor: 'Healthcare affordable', score: 20 })
    }
  }
  
  // Tax sensitivity adjustments (10 points)
  let taxPenalty = 0
  
  if (preferences.income_tax_sensitive && town.income_tax_rate_pct > 30) {
    taxPenalty += 5
  }
  if (preferences.property_tax_sensitive && town.property_tax_rate_pct > 2) {
    taxPenalty += 3
  }
  if (preferences.sales_tax_sensitive && town.sales_tax_rate_pct > 15) {
    taxPenalty += 2
  }
  
  if (taxPenalty === 0) {
    score += 10
    factors.push({ factor: 'Tax-friendly', score: 10 })
  } else {
    score -= taxPenalty
    factors.push({ factor: 'Tax considerations', score: -taxPenalty })
  }
  
  return {
    score: Math.max(0, Math.min(score, 100)),
    factors,
    category: 'Budget'
  }
}

// Main matching function that combines all scores
export async function calculateEnhancedMatch(userPreferences, town) {
  // Calculate individual category scores
  const regionResult = calculateRegionScore(userPreferences.region_preferences || {}, town)
  const climateResult = calculateClimateScore(userPreferences.climate_preferences || {}, town)
  const cultureResult = calculateCultureScore(userPreferences.culture_preferences || {}, town)
  const hobbiesResult = calculateHobbiesScore(userPreferences.hobbies_preferences || {}, town)
  const adminResult = calculateAdminScore(userPreferences.admin_preferences || {}, town)
  const budgetResult = calculateBudgetScore(userPreferences.budget_preferences || {}, town)
  
  // Calculate weighted total score
  const totalScore = (
    (regionResult.score * CATEGORY_WEIGHTS.region / 100) +
    (climateResult.score * CATEGORY_WEIGHTS.climate / 100) +
    (cultureResult.score * CATEGORY_WEIGHTS.culture / 100) +
    (hobbiesResult.score * CATEGORY_WEIGHTS.hobbies / 100) +
    (adminResult.score * CATEGORY_WEIGHTS.admin / 100) +
    (budgetResult.score * CATEGORY_WEIGHTS.budget / 100)
  )
  
  // Compile all factors
  const allFactors = [
    ...regionResult.factors,
    ...climateResult.factors,
    ...cultureResult.factors,
    ...hobbiesResult.factors,
    ...adminResult.factors,
    ...budgetResult.factors
  ]
  
  // Determine match quality
  let matchQuality = 'Poor'
  if (totalScore >= 85) matchQuality = 'Excellent'
  else if (totalScore >= 70) matchQuality = 'Very Good'
  else if (totalScore >= 55) matchQuality = 'Good'
  else if (totalScore >= 40) matchQuality = 'Fair'
  
  return {
    town_id: town.id,
    town_name: town.name,
    town_country: town.country,
    match_score: Math.round(totalScore),
    match_quality: matchQuality,
    category_scores: {
      region: Math.round(regionResult.score),
      climate: Math.round(climateResult.score),
      culture: Math.round(cultureResult.score),
      hobbies: Math.round(hobbiesResult.score),
      admin: Math.round(adminResult.score),
      budget: Math.round(budgetResult.score)
    },
    match_factors: allFactors,
    top_factors: allFactors
      .sort((a, b) => b.score - a.score)
      .slice(0, 5),
    warnings: allFactors
      .filter(f => f.score < 0)
      .map(f => f.factor)
  }
}

// Function to get top matches for a user
export async function getTopMatches(userId, limit = 10) {
  try {
    // Get user preferences
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (userError) throw userError
    
    // Parse user preferences from onboarding data
    const userPreferences = {
      region_preferences: userData.onboarding_region || {},
      climate_preferences: userData.onboarding_climate || {},
      culture_preferences: userData.onboarding_culture || {},
      hobbies_preferences: userData.onboarding_hobbies || {},
      admin_preferences: userData.onboarding_admin || {},
      budget_preferences: userData.onboarding_budget || {},
      citizenship: userData.citizenship || 'USA'
    }
    
    // Get all towns with photos (only show towns with photos)
    const { data: towns, error: townsError } = await supabase
      .from('towns')
      .select('*')
      .not('image_url_1', 'is', null)
    
    if (townsError) throw townsError
    
    // Calculate match scores for all towns
    const matches = await Promise.all(
      towns.map(town => calculateEnhancedMatch(userPreferences, town))
    )
    
    // Sort by match score and return top matches
    return matches
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, limit)
  } catch (error) {
    console.error('Error getting top matches:', error)
    throw error
  }
}