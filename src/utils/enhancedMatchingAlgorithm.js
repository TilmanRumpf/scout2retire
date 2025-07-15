// Enhanced Matching Algorithm that fully utilizes new town data fields
// Maps directly to the 6 onboarding sections: Region, Climate, Culture, Hobbies, Admin, Budget

import { supabase } from './supabaseClient.js'

// Weights optimized for 55+ retirees: equal emphasis on location preference, budget constraints, and healthcare/safety (60% combined), with climate and culture as secondary factors
// Score weights for each category (total = 100)
const CATEGORY_WEIGHTS = {
  region: 20,      // Geographic match
  climate: 15,     // Climate preferences 
  culture: 15,     // Cultural fit
  hobbies: 10,     // Activities & interests
  admin: 20,       // Healthcare, safety, visa
  budget: 20       // Financial fit
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
  
  // If user has NO location preferences, they're open to anywhere - give neutral score
  if (!preferences.countries?.length && !preferences.regions?.length && !preferences.geographic_features?.length) {
    score += 50
    factors.push({ factor: 'Open to any location', score: 50 })
    return { score, factors }
  }
  
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
  // No country/region preference but has other preferences
  else if (!preferences.countries?.length && !preferences.regions?.length) {
    score += 20
    factors.push({ factor: 'Open to any country', score: 20 })
  }
  
  // Geographic features match (30 points)
  if (preferences.geographic_features?.length) {
    if (town.geographic_features_actual?.length) {
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
  } else {
    // No geographic preference = open to any geography
    score += 15
    factors.push({ factor: 'Open to any geography', score: 15 })
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

// Temperature ranges for climate preferences (in Celsius)
const TEMP_RANGES = {
  summer: {
    mild: { min: 15, max: 24 },
    warm: { min: 22, max: 32 },
    hot: { min: 28, max: Infinity }
  },
  winter: {
    cold: { min: -Infinity, max: 5 },
    cool: { min: 3, max: 15 },
    mild: { min: 12, max: Infinity }
  }
}

/**
 * Calculate temperature score based on distance from preferred range
 * @param {number} actualTemp - Actual temperature in Celsius
 * @param {Object} preferredRange - { min, max } temperature range
 * @returns {number} Score from 0-100 based on temperature match
 */
function calculateTemperatureScore(actualTemp, preferredRange) {
  // Check if temperature is within the preferred range
  if (actualTemp >= preferredRange.min && actualTemp <= preferredRange.max) {
    return 100 // Perfect match
  }
  
  // Calculate distance from the nearest edge of the range
  let distance
  if (actualTemp < preferredRange.min) {
    distance = preferredRange.min - actualTemp
  } else {
    distance = actualTemp - preferredRange.max
  }
  
  // Apply gradual scoring based on distance
  if (distance <= 2) return 80      // Within 2°C
  if (distance <= 5) return 50      // Within 5°C
  if (distance <= 10) return 20     // Within 10°C
  return 0                           // More than 10°C away
}

/**
 * Calculate gradual scoring for climate preferences using adjacency mapping
 * @param {string} userPref - User's preference
 * @param {string} townActual - Town's actual value
 * @param {number} maxPoints - Maximum points for perfect match
 * @param {Object} adjacencyMap - Map defining adjacent preferences
 * @returns {Object} Score and description
 */
function calculateGradualClimateScore(userPref, townActual, maxPoints, adjacencyMap) {
  if (!userPref || !townActual) return { score: 0, description: null }
  
  // Exact match
  if (userPref === townActual) {
    return {
      score: maxPoints,
      description: 'Perfect'
    }
  }
  
  // Check if preferences are adjacent
  const adjacent = adjacencyMap[userPref]?.includes(townActual)
  if (adjacent) {
    return {
      score: Math.round(maxPoints * 0.7), // 70% of max points
      description: 'Good compatibility'
    }
  }
  
  // Opposite or no relationship
  return {
    score: 0,
    description: 'Preference mismatch'
  }
}

// 2. CLIMATE MATCHING (15% of total)
export function calculateClimateScore(preferences, town) {
  let score = 0
  let factors = []
  
  // If user has NO climate preferences at all, they're flexible - give neutral score
  if (!preferences.summer_climate_preference?.length && 
      !preferences.winter_climate_preference?.length &&
      !preferences.humidity_level?.length &&
      !preferences.sunshine?.length) {
    score += 50
    factors.push({ factor: 'Flexible on climate', score: 50 })
    return { score, factors }
  }
  
  // Note: Points adjusted to accommodate seasonal preference (was 100, now 100 with seasonal)
  // Summer climate match (21 points, was 25)
  if (town.avg_temp_summer !== null && town.avg_temp_summer !== undefined) {
    // Use numeric temperature data when available
    const summerPref = preferences.summer_climate_preference
    if (summerPref && TEMP_RANGES.summer[summerPref]) {
      const tempScore = calculateTemperatureScore(town.avg_temp_summer, TEMP_RANGES.summer[summerPref])
      const points = Math.round(tempScore * 21 / 100)
      score += points
      
      if (tempScore === 100) {
        factors.push({ factor: `Perfect summer temperature (${town.avg_temp_summer}°C)`, score: points })
      } else if (tempScore >= 80) {
        factors.push({ factor: `Good summer temperature (${town.avg_temp_summer}°C)`, score: points })
      } else if (tempScore >= 50) {
        factors.push({ factor: `Acceptable summer temperature (${town.avg_temp_summer}°C)`, score: points })
      } else if (tempScore > 0) {
        factors.push({ factor: `Summer temperature outside preference (${town.avg_temp_summer}°C)`, score: points })
      }
    }
  } else if (town.summer_climate_actual && preferences.summer_climate_preference === town.summer_climate_actual) {
    // Fall back to string matching
    score += 21
    factors.push({ factor: 'Perfect summer climate match', score: 21 })
  } else if (town.summer_climate_actual && (
    (preferences.summer_climate_preference === 'warm' && town.summer_climate_actual === 'hot') ||
    (preferences.summer_climate_preference === 'warm' && town.summer_climate_actual === 'mild')
  )) {
    score += 13
    factors.push({ factor: 'Acceptable summer climate', score: 13 })
  } else if (!town.summer_climate_actual && !town.avg_temp_summer && town.climate_description) {
    // Last fallback: parse climate description
    const climateDesc = town.climate_description.toLowerCase()
    if (preferences.summer_climate_preference === 'warm' && (climateDesc.includes('warm') || climateDesc.includes('mediterranean'))) {
      score += 13
      factors.push({ factor: 'Climate appears suitable', score: 13 })
    } else if (preferences.summer_climate_preference === 'hot' && (climateDesc.includes('hot') || climateDesc.includes('tropical'))) {
      score += 13
      factors.push({ factor: 'Climate appears suitable', score: 13 })
    }
  }
  
  // Winter climate match (21 points, was 25)
  if (town.avg_temp_winter !== null && town.avg_temp_winter !== undefined) {
    // Use numeric temperature data when available
    const winterPref = preferences.winter_climate_preference
    if (winterPref && TEMP_RANGES.winter[winterPref]) {
      const tempScore = calculateTemperatureScore(town.avg_temp_winter, TEMP_RANGES.winter[winterPref])
      const points = Math.round(tempScore * 21 / 100)
      score += points
      
      if (tempScore === 100) {
        factors.push({ factor: `Perfect winter temperature (${town.avg_temp_winter}°C)`, score: points })
      } else if (tempScore >= 80) {
        factors.push({ factor: `Good winter temperature (${town.avg_temp_winter}°C)`, score: points })
      } else if (tempScore >= 50) {
        factors.push({ factor: `Acceptable winter temperature (${town.avg_temp_winter}°C)`, score: points })
      } else if (tempScore > 0) {
        factors.push({ factor: `Winter temperature outside preference (${town.avg_temp_winter}°C)`, score: points })
      }
    }
  } else if (town.winter_climate_actual && preferences.winter_climate_preference === town.winter_climate_actual) {
    // Fall back to string matching
    score += 21
    factors.push({ factor: 'Perfect winter climate match', score: 21 })
  } else if (town.winter_climate_actual && (
    (preferences.winter_climate_preference === 'mild' && town.winter_climate_actual === 'cool') ||
    (preferences.winter_climate_preference === 'cool' && town.winter_climate_actual === 'mild')
  )) {
    score += 13
    factors.push({ factor: 'Acceptable winter climate', score: 13 })
  } else if (!town.winter_climate_actual && !town.avg_temp_winter && town.climate_description) {
    // Last fallback: parse climate description
    const climateDesc = town.climate_description.toLowerCase()
    if (preferences.winter_climate_preference === 'mild' && (climateDesc.includes('mild') || climateDesc.includes('mediterranean'))) {
      score += 13
      factors.push({ factor: 'Winter climate appears suitable', score: 13 })
    }
  }
  
  // Humidity match (17 points, was 20) - now with gradual scoring
  const humidityAdjacency = {
    'dry': ['balanced'],
    'balanced': ['dry', 'humid'],
    'humid': ['balanced']
  }
  
  if (town.humidity_level_actual && preferences.humidity_level) {
    const humidityResult = calculateGradualClimateScore(
      preferences.humidity_level, 
      town.humidity_level_actual, 
      17, 
      humidityAdjacency
    )
    
    if (humidityResult.score > 0) {
      score += humidityResult.score
      const factorText = humidityResult.description === 'Perfect' ? 
        'Perfect humidity match' : 
        `Good humidity compatibility (${preferences.humidity_level} → ${town.humidity_level_actual})`
      factors.push({ factor: factorText, score: humidityResult.score })
    }
  } else if (!town.humidity_level_actual && town.climate_description && preferences.humidity_level) {
    // Fallback: try to infer from climate description
    const climateDesc = town.climate_description.toLowerCase()
    let inferredHumidity = null
    
    if (climateDesc.includes('arid') || climateDesc.includes('desert') || climateDesc.includes('dry')) {
      inferredHumidity = 'dry'
    } else if (climateDesc.includes('humid') || climateDesc.includes('tropical') || climateDesc.includes('moist')) {
      inferredHumidity = 'humid'
    } else if (climateDesc.includes('mediterranean') || climateDesc.includes('temperate')) {
      inferredHumidity = 'balanced'
    }
    
    if (inferredHumidity) {
      const humidityResult = calculateGradualClimateScore(
        preferences.humidity_level, 
        inferredHumidity, 
        13, // Reduced points for inferred data
        humidityAdjacency
      )
      
      if (humidityResult.score > 0) {
        score += humidityResult.score
        factors.push({ 
          factor: `Humidity appears suitable (${inferredHumidity}, inferred)`, 
          score: humidityResult.score 
        })
      }
    }
  }
  
  // Sunshine match (17 points, was 20) - now with gradual scoring
  const sunshineAdjacency = {
    'often_sunny': ['balanced'],
    'mostly_sunny': ['balanced'], // Alternative spelling
    'abundant': ['balanced'],     // Alternative spelling
    'balanced': ['often_sunny', 'mostly_sunny', 'abundant', 'less_sunny'],
    'less_sunny': ['balanced']
  }
  
  if (town.sunshine_level_actual && preferences.sunshine) {
    const sunshineResult = calculateGradualClimateScore(
      preferences.sunshine, 
      town.sunshine_level_actual, 
      17, 
      sunshineAdjacency
    )
    
    if (sunshineResult.score > 0) {
      score += sunshineResult.score
      const factorText = sunshineResult.description === 'Perfect' ? 
        'Perfect sunshine match' : 
        `Good sunshine compatibility (${preferences.sunshine} → ${town.sunshine_level_actual})`
      factors.push({ factor: factorText, score: sunshineResult.score })
    }
  } else if (!town.sunshine_level_actual && town.sunshine_hours && preferences.sunshine) {
    // Fallback: use sunshine_hours data
    let inferredSunshine = null
    
    if (town.sunshine_hours > 2800) {
      inferredSunshine = 'often_sunny'
    } else if (town.sunshine_hours > 2200) {
      inferredSunshine = 'balanced'
    } else if (town.sunshine_hours > 0) {
      inferredSunshine = 'less_sunny'
    }
    
    if (inferredSunshine) {
      const sunshineResult = calculateGradualClimateScore(
        preferences.sunshine, 
        inferredSunshine, 
        13, // Reduced points for inferred data
        sunshineAdjacency
      )
      
      if (sunshineResult.score > 0) {
        score += sunshineResult.score
        factors.push({ 
          factor: `Sunshine appears suitable (${town.sunshine_hours}h/year, ${inferredSunshine})`, 
          score: sunshineResult.score 
        })
      }
    }
  } else if (!town.sunshine_level_actual && !town.sunshine_hours && town.climate_description && preferences.sunshine) {
    // Last fallback: infer from climate description
    const climateDesc = town.climate_description.toLowerCase()
    let inferredSunshine = null
    
    if (climateDesc.includes('sunny') || climateDesc.includes('desert') || climateDesc.includes('arid')) {
      inferredSunshine = 'often_sunny'
    } else if (climateDesc.includes('mediterranean') || climateDesc.includes('tropical')) {
      inferredSunshine = 'balanced'
    } else if (climateDesc.includes('cloudy') || climateDesc.includes('overcast') || climateDesc.includes('oceanic')) {
      inferredSunshine = 'less_sunny'
    }
    
    if (inferredSunshine) {
      const sunshineResult = calculateGradualClimateScore(
        preferences.sunshine, 
        inferredSunshine, 
        10, // Further reduced points for climate description inference
        sunshineAdjacency
      )
      
      if (sunshineResult.score > 0) {
        score += sunshineResult.score
        factors.push({ 
          factor: `Sunshine appears suitable (${inferredSunshine}, inferred)`, 
          score: sunshineResult.score 
        })
      }
    }
  }
  
  // Precipitation match (9 points, was 10) - now with gradual scoring
  const precipitationAdjacency = {
    'mostly_dry': ['balanced'],
    'dry': ['balanced'],           // Alternative spelling
    'balanced': ['mostly_dry', 'dry', 'often_rainy', 'wet'],
    'often_rainy': ['balanced'],
    'wet': ['balanced']            // Alternative spelling
  }
  
  if (town.precipitation_level_actual && preferences.precipitation) {
    const precipitationResult = calculateGradualClimateScore(
      preferences.precipitation, 
      town.precipitation_level_actual, 
      9, 
      precipitationAdjacency
    )
    
    if (precipitationResult.score > 0) {
      score += precipitationResult.score
      const factorText = precipitationResult.description === 'Perfect' ? 
        'Perfect precipitation match' : 
        `Good precipitation compatibility (${preferences.precipitation} → ${town.precipitation_level_actual})`
      factors.push({ factor: factorText, score: precipitationResult.score })
    }
  } else if (!town.precipitation_level_actual && town.annual_rainfall && preferences.precipitation) {
    // Fallback: use annual_rainfall data (in mm)
    let inferredPrecipitation = null
    
    if (town.annual_rainfall < 400) {
      inferredPrecipitation = 'mostly_dry'
    } else if (town.annual_rainfall < 1000) {
      inferredPrecipitation = 'balanced'
    } else {
      inferredPrecipitation = 'often_rainy'
    }
    
    const precipitationResult = calculateGradualClimateScore(
      preferences.precipitation, 
      inferredPrecipitation, 
      7, // Reduced points for inferred data
      precipitationAdjacency
    )
    
    if (precipitationResult.score > 0) {
      score += precipitationResult.score
      factors.push({ 
        factor: `Precipitation appears suitable (${town.annual_rainfall}mm/year, ${inferredPrecipitation})`, 
        score: precipitationResult.score 
      })
    }
  } else if (!town.precipitation_level_actual && !town.annual_rainfall && town.climate_description && preferences.precipitation) {
    // Last fallback: infer from climate description
    const climateDesc = town.climate_description.toLowerCase()
    let inferredPrecipitation = null
    
    if (climateDesc.includes('arid') || climateDesc.includes('desert') || climateDesc.includes('dry')) {
      inferredPrecipitation = 'mostly_dry'
    } else if (climateDesc.includes('mediterranean') || climateDesc.includes('temperate')) {
      inferredPrecipitation = 'balanced'
    } else if (climateDesc.includes('tropical') || climateDesc.includes('rainforest') || climateDesc.includes('wet')) {
      inferredPrecipitation = 'often_rainy'
    }
    
    if (inferredPrecipitation) {
      const precipitationResult = calculateGradualClimateScore(
        preferences.precipitation, 
        inferredPrecipitation, 
        5, // Further reduced points for climate description inference
        precipitationAdjacency
      )
      
      if (precipitationResult.score > 0) {
        score += precipitationResult.score
        factors.push({ 
          factor: `Precipitation appears suitable (${inferredPrecipitation}, inferred)`, 
          score: precipitationResult.score 
        })
      }
    }
  }
  
  // Seasonal preference match (15 points)
  // Only apply if we have both summer and winter temperature data
  if (preferences.seasonal_preference && 
      town.avg_temp_summer !== null && town.avg_temp_summer !== undefined &&
      town.avg_temp_winter !== null && town.avg_temp_winter !== undefined) {
    
    const seasonPref = preferences.seasonal_preference
    
    if (seasonPref === 'summer_focused') {
      // User prefers warm seasons - reward mild winters
      let seasonScore = 0
      if (town.avg_temp_winter >= 15) {
        seasonScore = 15  // Perfect - warm winters
      } else if (town.avg_temp_winter >= 10) {
        seasonScore = 12  // Good - mild winters
      } else if (town.avg_temp_winter >= 5) {
        seasonScore = 8   // Okay - cool winters
      } else {
        seasonScore = 0   // Too cold
      }
      
      if (seasonScore > 0) {
        score += seasonScore
        factors.push({ factor: 'Mild winters for year-round comfort', score: seasonScore })
      }
      
    } else if (seasonPref === 'winter_focused') {
      // User prefers cool seasons - reward moderate summers
      let seasonScore = 0
      if (town.avg_temp_summer <= 25) {
        seasonScore = 15  // Perfect - cool summers
      } else if (town.avg_temp_summer <= 28) {
        seasonScore = 12  // Good - moderate summers
      } else if (town.avg_temp_summer <= 32) {
        seasonScore = 8   // Okay - warm summers
      } else {
        seasonScore = 0   // Too hot
      }
      
      if (seasonScore > 0) {
        score += seasonScore
        factors.push({ factor: 'Moderate summers with cool seasons', score: seasonScore })
      }
      
    } else if (seasonPref === 'all_seasons') {
      // User enjoys all seasons - reward seasonal variation
      const variation = Math.abs(town.avg_temp_summer - town.avg_temp_winter)
      let seasonScore = 0
      
      if (variation >= 15) {
        seasonScore = 15  // Distinct seasons
      } else if (variation >= 10) {
        seasonScore = 12  // Moderate variation
      } else if (variation >= 5) {
        seasonScore = 8   // Some variation
      } else {
        seasonScore = 0   // Too stable
      }
      
      if (seasonScore > 0) {
        score += seasonScore
        factors.push({ factor: 'Four distinct seasons', score: seasonScore })
      }
    }
    // Note: 'Optional' or no preference = skip seasonal scoring entirely (0 points)
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
  const languagePrefs = preferences.language_comfort?.preferences
  const langPref = Array.isArray(languagePrefs) ? languagePrefs[0] : languagePrefs
  
  // Get primary language - prioritize real data over assumptions
  let primaryLanguage = town.primary_language
  let usingEstimatedLanguage = false
  
  // Only use fallback if primary_language is missing AND data completeness is low
  if (!primaryLanguage && (!town.data_completeness_score || town.data_completeness_score < 60)) {
    // Country to language mapping fallback (last resort)
    const countryLanguages = {
      'Portugal': 'Portuguese', 'Spain': 'Spanish', 'France': 'French',
      'Italy': 'Italian', 'Germany': 'German', 'Greece': 'Greek',
      'Mexico': 'Spanish', 'Costa Rica': 'Spanish', 'Panama': 'Spanish',
      'Ecuador': 'Spanish', 'Colombia': 'Spanish', 'Peru': 'Spanish',
      'Thailand': 'Thai', 'Vietnam': 'Vietnamese', 'Malaysia': 'Malay',
      'Cyprus': 'Greek',
      // Former colonies and multi-language countries  
      'Malta': 'English', 'Singapore': 'English', 'Ireland': 'English',
      'South Africa': 'English', 'New Zealand': 'English', 'Australia': 'English',
      'Canada': 'English', 'Hong Kong': 'English', 'India': 'English',
      'Philippines': 'English', 'Nigeria': 'English', 'Ghana': 'English',
      'Switzerland': 'German', 'Belgium': 'Dutch', 'Luxembourg': 'French'
    }
    primaryLanguage = countryLanguages[town.country] || 'Local'
    usingEstimatedLanguage = true
  }
  
  if (langPref === 'english_only') {
    // Check if English is the primary language
    if (primaryLanguage && primaryLanguage.toLowerCase() === 'english') {
      score += 25
      factors.push({ factor: 'English is primary language', score: 25 })
    } else if (town.english_proficiency_level) {
      // Use actual English proficiency data with updated scoring
      const proficiencyScores = {
        'excellent': 22,    // Near-native level
        'good': 18,         // Conversational level
        'moderate': 12,     // Basic communication
        'basic': 8,         // Limited communication
        'none': 0,          // No English
        // Legacy values for backward compatibility
        'native': 25,
        'very_high': 22,
        'high': 18,
        'medium': 12,
        'low': 8
      }
      
      const proficiencyScore = proficiencyScores[town.english_proficiency_level] || 0
      if (proficiencyScore > 0) {
        score += proficiencyScore
        const proficiencyText = town.english_proficiency_level === 'excellent' ? 'Excellent English proficiency' :
                              town.english_proficiency_level === 'good' ? 'Good English proficiency' :
                              town.english_proficiency_level === 'moderate' ? 'Moderate English proficiency' :
                              town.english_proficiency_level === 'basic' ? 'Basic English available' :
                              'English proficiency available'
        factors.push({ factor: proficiencyText, score: proficiencyScore })
      }
    } else if (usingEstimatedLanguage) {
      // Only use fallback for tourist areas when we're already estimating
      score += 8
      factors.push({ factor: 'Some English expected (estimated)', score: 8 })
    }
    
    // Add warning if using estimated language data
    if (usingEstimatedLanguage && !town.english_proficiency_level) {
      factors.push({ factor: 'Language data estimated from country', score: -2 })
    }
    
  } else if (preferences.language_comfort?.already_speak?.length) {
    // Check if user speaks local language
    const speaksLocal = preferences.language_comfort.already_speak.some(lang => {
      if (primaryLanguage) {
        return primaryLanguage.toLowerCase().includes(lang.toLowerCase())
      }
      // Also check languages_spoken array if available
      return town.languages_spoken?.some(l => l.toLowerCase().includes(lang.toLowerCase()))
    })
    
    if (speaksLocal) {
      score += 25
      const languageUsed = usingEstimatedLanguage ? `${primaryLanguage} (estimated)` : primaryLanguage
      factors.push({ factor: `Speaks local language (${languageUsed})`, score: 25 })
    }
    
  } else {
    // User willing to learn - give partial credit with Romance language bonus
    let learnScore = 15
    
    if (primaryLanguage) {
      const romanceLanguages = ['spanish', 'portuguese', 'italian', 'french', 'catalan', 'romanian']
      if (romanceLanguages.includes(primaryLanguage.toLowerCase())) {
        learnScore += 5  // Bonus for easier learning
        factors.push({ factor: `Language learning opportunity (${primaryLanguage} - easier for English speakers)`, score: learnScore })
      } else {
        factors.push({ factor: `Language learning opportunity (${primaryLanguage})`, score: learnScore })
      }
    } else {
      factors.push({ factor: 'Language learning opportunity', score: learnScore })
    }
    
    score += learnScore
    
    // Add warning if using estimated language data
    if (usingEstimatedLanguage) {
      factors.push({ factor: 'Language data estimated from country', score: -2 })
    }
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

/**
 * Calculate gradual healthcare/safety scoring based on user preference level
 * @param {number} actualScore - Town's actual score (0-10)
 * @param {string} userPref - User's preference level ('basic', 'functional', 'good')
 * @param {number} maxPoints - Maximum points for this category
 * @returns {Object} Score and description
 */
function calculateGradualAdminScore(actualScore, userPref, maxPoints) {
  if (!actualScore || !userPref) return { score: 0, description: null }
  
  // Define scoring tiers based on user preference
  if (userPref === 'good') {
    // User wants high quality (ideal 9+)
    if (actualScore >= 9.0) {
      return { score: maxPoints, description: 'exceeds requirements' }
    } else if (actualScore >= 8.0) {
      return { score: Math.round(maxPoints * 0.8), description: 'very good quality' }
    } else if (actualScore >= 7.0) {
      return { score: Math.round(maxPoints * 0.6), description: 'acceptable quality' }
    } else if (actualScore >= 6.0) {
      return { score: Math.round(maxPoints * 0.4), description: 'below ideal but adequate' }
    } else if (actualScore >= 5.0) {
      return { score: Math.round(maxPoints * 0.2), description: 'concerns about quality' }
    } else {
      return { score: 0, description: 'inadequate quality' }
    }
  } else if (userPref === 'functional') {
    // User wants adequate quality (ideal 7+)
    if (actualScore >= 7.0) {
      return { score: maxPoints, description: 'meets requirements' }
    } else if (actualScore >= 6.0) {
      return { score: Math.round(maxPoints * 0.8), description: 'nearly meets requirements' }
    } else if (actualScore >= 5.0) {
      return { score: Math.round(maxPoints * 0.6), description: 'basic but functional' }
    } else {
      return { score: 0, description: 'below functional level' }
    }
  } else if (userPref === 'basic') {
    // User wants minimal quality (ideal 5+)
    if (actualScore >= 5.0) {
      return { score: maxPoints, description: 'meets basic requirements' }
    } else if (actualScore >= 4.0) {
      return { score: Math.round(maxPoints * 0.67), description: 'marginal but acceptable' }
    } else {
      return { score: 0, description: 'below minimum standards' }
    }
  }
  
  // Fallback for unknown preference
  return { score: Math.round(maxPoints * 0.5), description: 'standard quality' }
}

/**
 * Calculate comprehensive tax scoring based on user's tax sensitivity
 * @param {Object} preferences - User's tax sensitivity preferences
 * @param {Object} town - Town tax data
 * @param {number} maxPoints - Maximum points for tax scoring (15)
 * @returns {Object} Score, factors, and descriptions
 */
function calculateTaxScore(preferences, town, maxPoints = 15) {
  let score = 0
  let factors = []
  
  // Get tax data - prioritize JSON field, fall back to individual fields
  const taxData = {
    income: town.tax_rates?.income_tax || town.income_tax_rate_pct,
    property: town.tax_rates?.property_tax || town.property_tax_rate_pct,
    sales: town.tax_rates?.sales_tax || town.sales_tax_rate_pct
  }
  
  let totalSensitiveTaxes = 0
  let taxScoreTotal = 0
  
  // Income tax scoring (if user is sensitive)
  if (preferences.income_tax_sensitive && taxData.income !== null && taxData.income !== undefined) {
    totalSensitiveTaxes++
    const incomeTaxResult = calculateGradualTaxScore(taxData.income, 'income')
    taxScoreTotal += incomeTaxResult.score
    factors.push({
      factor: `Income tax ${incomeTaxResult.description} (${taxData.income}%)`,
      score: incomeTaxResult.score
    })
  }
  
  // Property tax scoring (if user is sensitive)
  if (preferences.property_tax_sensitive && taxData.property !== null && taxData.property !== undefined) {
    totalSensitiveTaxes++
    const propertyTaxResult = calculateGradualTaxScore(taxData.property, 'property')
    taxScoreTotal += propertyTaxResult.score
    factors.push({
      factor: `Property tax ${propertyTaxResult.description} (${taxData.property}%)`,
      score: propertyTaxResult.score
    })
  }
  
  // Sales tax scoring (if user is sensitive)
  if (preferences.sales_tax_sensitive && taxData.sales !== null && taxData.sales !== undefined) {
    totalSensitiveTaxes++
    const salesTaxResult = calculateGradualTaxScore(taxData.sales, 'sales')
    taxScoreTotal += salesTaxResult.score
    factors.push({
      factor: `Sales tax ${salesTaxResult.description} (${taxData.sales}%)`,
      score: salesTaxResult.score
    })
  }
  
  // Calculate proportional score based on sensitive taxes
  if (totalSensitiveTaxes > 0) {
    score = (taxScoreTotal / totalSensitiveTaxes) * (maxPoints * 0.8) / 5 // 80% of points from tax rates
  }
  
  // Bonus scoring for tax benefits (20% of points)
  let bonusPoints = 0
  const maxBonus = maxPoints * 0.2
  
  // Tax treaty bonus
  if (town.tax_treaty_us) {
    bonusPoints += maxBonus * 0.4 // 40% of bonus
    factors.push({
      factor: 'US tax treaty available',
      score: Math.round(maxBonus * 0.4)
    })
  }
  
  // Tax haven status bonus
  if (town.tax_haven_status) {
    bonusPoints += maxBonus * 0.5 // 50% of bonus
    factors.push({
      factor: 'Recognized tax haven',
      score: Math.round(maxBonus * 0.5)
    })
  }
  
  // Foreign income not taxed bonus
  if (town.foreign_income_taxed === false) {
    bonusPoints += maxBonus * 0.3 // 30% of bonus
    factors.push({
      factor: 'Foreign income not taxed',
      score: Math.round(maxBonus * 0.3)
    })
  }
  
  score += bonusPoints
  
  // If user has no tax sensitivities, give neutral score
  if (totalSensitiveTaxes === 0) {
    score = maxPoints * 0.5 // 50% neutral score
    factors.push({
      factor: 'Tax rates not a priority',
      score: Math.round(maxPoints * 0.5)
    })
  }
  
  return {
    score: Math.min(Math.round(score), maxPoints),
    factors,
    hasTaxData: totalSensitiveTaxes > 0 || town.tax_treaty_us || town.tax_haven_status || town.foreign_income_taxed !== null
  }
}

/**
 * Calculate gradual tax scoring for a specific tax type
 * @param {number} taxRate - Tax rate percentage
 * @param {string} taxType - Type of tax ('income', 'property', 'sales')
 * @returns {Object} Score (0-5) and description
 */
function calculateGradualTaxScore(taxRate, taxType) {
  if (taxRate === null || taxRate === undefined) {
    return { score: 0, description: 'data unavailable' }
  }
  
  // Define tax rate thresholds by type
  const thresholds = {
    income: {
      excellent: 10,   // 0-10%
      good: 20,        // 10-20%
      fair: 30,        // 20-30%
      poor: 40         // 30-40%
    },
    property: {
      excellent: 1,    // 0-1%
      good: 2,         // 1-2%
      fair: 3,         // 2-3%
      poor: 4          // 3-4%
    },
    sales: {
      excellent: 8,    // 0-8%
      good: 15,        // 8-15%
      fair: 20,        // 15-20%
      poor: 25         // 20-25%
    }
  }
  
  const t = thresholds[taxType]
  
  if (taxRate <= t.excellent) {
    return { score: 5, description: 'excellent rate' }
  } else if (taxRate <= t.good) {
    return { score: 4, description: 'good rate' }
  } else if (taxRate <= t.fair) {
    return { score: 3, description: 'fair rate' }
  } else if (taxRate <= t.poor) {
    return { score: 2, description: 'high rate' }
  } else {
    return { score: 1, description: 'very high rate' }
  }
}

// 5. ADMINISTRATION MATCHING (15% of total)
export function calculateAdminScore(preferences, town) {
  let score = 0
  let factors = []
  
  // Healthcare quality match (30 points) - now with gradual scoring
  const healthcareArray = preferences.healthcare_quality || []
  const healthcarePref = Array.isArray(healthcareArray) ? healthcareArray[0] : healthcareArray
  
  if (town.healthcare_score && healthcarePref) {
    const healthcareResult = calculateGradualAdminScore(
      town.healthcare_score, 
      healthcarePref, 
      30
    )
    
    if (healthcareResult.score > 0) {
      score += healthcareResult.score
      factors.push({ 
        factor: `Healthcare ${healthcareResult.description} (score: ${town.healthcare_score})`, 
        score: healthcareResult.score 
      })
    }
  } else if (town.healthcare_score && !healthcarePref) {
    // Fallback if no preference specified - assume functional
    const healthcareResult = calculateGradualAdminScore(town.healthcare_score, 'functional', 30)
    score += healthcareResult.score
    factors.push({ 
      factor: `Healthcare ${healthcareResult.description} (score: ${town.healthcare_score})`, 
      score: healthcareResult.score 
    })
  }
  
  // Safety match (25 points) - now with gradual scoring
  const safetyArray = preferences.safety_importance || []
  const safetyPref = Array.isArray(safetyArray) ? safetyArray[0] : safetyArray
  
  if (town.safety_score && safetyPref) {
    const safetyResult = calculateGradualAdminScore(
      town.safety_score, 
      safetyPref, 
      25
    )
    
    if (safetyResult.score > 0) {
      score += safetyResult.score
      factors.push({ 
        factor: `Safety ${safetyResult.description} (score: ${town.safety_score})`, 
        score: safetyResult.score 
      })
    }
  } else if (town.safety_score && !safetyPref) {
    // Fallback if no preference specified - assume functional
    const safetyResult = calculateGradualAdminScore(town.safety_score, 'functional', 25)
    score += safetyResult.score
    factors.push({ 
      factor: `Safety ${safetyResult.description} (score: ${town.safety_score})`, 
      score: safetyResult.score 
    })
  }
  
  // Visa/residency match (20 points) - handle array format
  const visaArray = preferences.visa_preference || []
  const visaPref = Array.isArray(visaArray) ? visaArray[0] : visaArray
  
  if ((visaPref === 'good' || visaPref === 'functional') && preferences.stay_duration) {
    // Check visa requirements based on user citizenship
    const citizenship = preferences.citizenship || preferences.current_status?.citizenship || 'USA'
    if (town.visa_on_arrival_countries?.includes(citizenship) ||
        town.easy_residency_countries?.includes(citizenship)) {
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

// 6. BUDGET MATCHING (20% of total)
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
  
  // Comprehensive tax scoring (15 points)
  const taxResult = calculateTaxScore(preferences, town, 15)
  score += taxResult.score
  factors.push(...taxResult.factors)
  
  // Add tax data availability warning if needed
  if (!taxResult.hasTaxData && (preferences.income_tax_sensitive || preferences.property_tax_sensitive || preferences.sales_tax_sensitive)) {
    factors.push({ factor: 'Limited tax data available', score: -1 })
    score -= 1
  }
  
  return {
    score: Math.max(0, Math.min(score, 100)),
    factors,
    category: 'Budget'
  }
}

// Calculate data completeness score (0-5 bonus points)
function calculateDataCompleteness(town) {
  const importantFields = [
    'cost_index',
    'healthcare_score',
    'safety_score',
    'climate_description',
    'summer_climate_actual',
    'winter_climate_actual',
    'humidity_level_actual',
    'sunshine_level_actual',
    'primary_language',
    'english_proficiency_level',
    'expat_community_size',
    'pace_of_life_actual',
    'activities_available',
    'interests_supported',
    'typical_monthly_living_cost',
    'income_tax_rate_pct',
    'visa_on_arrival_countries',
    'geographic_features_actual'
  ]
  
  let completedFields = 0
  importantFields.forEach(field => {
    const value = town[field]
    if (value !== null && value !== undefined && value !== '' && 
        (!Array.isArray(value) || value.length > 0)) {
      completedFields++
    }
  })
  
  const completenessRatio = completedFields / importantFields.length
  return completenessRatio * 5 // 0-5 points based on completeness
}

// Main matching function that combines all scores
export async function calculateEnhancedMatch(userPreferences, town) {
  // Calculate individual category scores
  const regionResult = calculateRegionScore(userPreferences.region_preferences || {}, town)
  const climateResult = calculateClimateScore(userPreferences.climate_preferences || {}, town)
  const cultureResult = calculateCultureScore(userPreferences.culture_preferences || {}, town)
  const hobbiesResult = calculateHobbiesScore(userPreferences.hobbies_preferences || {}, town)
  const adminResult = calculateAdminScore({
    ...userPreferences.admin_preferences || {},
    citizenship: userPreferences.current_status?.citizenship
  }, town)
  const budgetResult = calculateBudgetScore(userPreferences.budget_preferences || {}, town)
  
  // Calculate weighted total score
  let totalScore = (
    (regionResult.score * CATEGORY_WEIGHTS.region / 100) +
    (climateResult.score * CATEGORY_WEIGHTS.climate / 100) +
    (cultureResult.score * CATEGORY_WEIGHTS.culture / 100) +
    (hobbiesResult.score * CATEGORY_WEIGHTS.hobbies / 100) +
    (adminResult.score * CATEGORY_WEIGHTS.admin / 100) +
    (budgetResult.score * CATEGORY_WEIGHTS.budget / 100)
  )
  
  // Add data completeness bonus (0-5 points)
  const dataBonus = calculateDataCompleteness(town)
  totalScore += dataBonus
  
  // Compile all factors
  const allFactors = [
    ...regionResult.factors,
    ...climateResult.factors,
    ...cultureResult.factors,
    ...hobbiesResult.factors,
    ...adminResult.factors,
    ...budgetResult.factors
  ]
  
  // Add data completeness factor if significant
  if (dataBonus >= 3) {
    allFactors.push({ factor: 'Comprehensive data available', score: dataBonus })
  } else if (dataBonus <= 1) {
    allFactors.push({ factor: 'Limited data available', score: -2 })
  }
  
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
      .map(f => f.factor),
    data_completeness: Math.round(dataBonus)
  }
}

// Function to get top matches for a user
export async function getTopMatches(userId, limit = 10) {
  try {
    // Get user preferences from user_preferences table
    const { data: userData, error: userError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (userError) throw userError
    
    // Transform user_preferences data to match expected format
    const userPreferences = {
      region_preferences: {
        regions: userData.regions || [],
        countries: userData.countries || [],
        provinces: userData.provinces || [],
        geographic_features: userData.geographic_features || [],
        vegetation_types: userData.vegetation_types || []
      },
      climate_preferences: {
        summer_climate_preference: userData.summer_climate_preference || [],
        winter_climate_preference: userData.winter_climate_preference || [],
        humidity_level: userData.humidity_level || [],
        sunshine: userData.sunshine || [],
        precipitation: userData.precipitation || [],
        seasonal_preference: userData.seasonal_preference || ''
      },
      culture_preferences: {
        expat_community_preference: userData.expat_community_preference || [],
        language_comfort: userData.language_comfort || {},
        cultural_importance: userData.cultural_importance || {},
        lifestyle_preferences: userData.lifestyle_preferences || {}
      },
      hobbies_preferences: {
        activities: userData.activities || [],
        interests: userData.interests || [],
        travel_frequency: userData.travel_frequency || '',
        lifestyle_importance: userData.lifestyle_importance || {}
      },
      admin_preferences: {
        healthcare_quality: userData.healthcare_quality || [],
        health_considerations: userData.health_considerations || {},
        insurance_importance: userData.insurance_importance || [],
        safety_importance: userData.safety_importance || [],
        emergency_services: userData.emergency_services || [],
        political_stability: userData.political_stability || [],
        tax_preference: userData.tax_preference || [],
        government_efficiency: userData.government_efficiency || [],
        visa_preference: userData.visa_preference || [],
        stay_duration: userData.stay_duration || [],
        residency_path: userData.residency_path || []
      },
      budget_preferences: {
        total_monthly_budget: userData.total_monthly_budget || 0,
        max_monthly_rent: userData.max_monthly_rent || 0,
        max_home_price: userData.max_home_price || 0,
        monthly_healthcare_budget: userData.monthly_healthcare_budget || 0,
        mobility: userData.mobility || {},
        property_tax_sensitive: userData.property_tax_sensitive || false,
        sales_tax_sensitive: userData.sales_tax_sensitive || false,
        income_tax_sensitive: userData.income_tax_sensitive || false
      },
      citizenship: userData.primary_citizenship || 'USA'
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