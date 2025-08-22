// Enhanced Matching Algorithm that fully utilizes new town data fields
// Maps directly to the 6 onboarding sections: Region, Climate, Culture, Hobbies, Admin, Budget

import supabase from './supabaseClient.js'
import { mapToStandardValue } from './climateInference.js'
import { calculateHobbiesScore as calculateNormalizedHobbiesScore } from './hobbiesMatching.js'

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

// 1. REGION MATCHING (20% of total)
export function calculateRegionScore(preferences, town) {
  let score = 0
  let factors = []
  
  // Check if user has any preferences at all
  const hasCountryPrefs = preferences.countries?.length > 0
  const hasRegionPrefs = preferences.regions?.length > 0
  const hasGeoPrefs = preferences.geographic_features?.length > 0
  const hasVegPrefs = preferences.vegetation_types?.length > 0
  
  // DEBUG: Log when score is unexpectedly low
  const DEBUG = false  // Set to true to enable debug logging
  if (DEBUG && town.country === 'Spain') {
    console.log(`\n=== REGION SCORING DEBUG for ${town.name} ===`)
    console.log('User preferences:', {
      countries: preferences.countries,
      regions: preferences.regions,
      geographic_features: preferences.geographic_features,
      vegetation_types: preferences.vegetation_types
    })
    console.log('Town data:', {
      country: town.country,
      geo_region: town.geo_region,
      geographic_features_actual: town.geographic_features_actual,
      vegetation_type_actual: town.vegetation_type_actual
    })
  }
  
  // If user has NO preferences at all, they're open to anywhere - give perfect score
  if (!hasCountryPrefs && !hasRegionPrefs && !hasGeoPrefs && !hasVegPrefs) {
    score = 100
    factors.push({ factor: 'Open to any location', score: 100 })
    return { score, factors, category: 'Region' }
  }
  
  // US States list for matching
  const US_STATES = new Set([
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas',
    'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
    'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
    'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
    'Wisconsin', 'Wyoming'
  ])
  
  // PART 1: REGION/COUNTRY MATCHING (Max 40 points)
  let regionCountryScore = 0
  
  if (!hasCountryPrefs && !hasRegionPrefs) {
    // No country/region preferences = 100% = 40 points
    regionCountryScore = 40
    factors.push({ factor: 'Open to any country/region', score: 40 })
  } else {
    // Check for country match first (highest priority)
    let countryMatched = false
    if (hasCountryPrefs) {
      for (const country of preferences.countries) {
        // Check if it's a US state
        if (US_STATES.has(country) && town.country === 'United States' && town.region === country) {
          regionCountryScore = 40
          factors.push({ factor: `State match (${country})`, score: 40 })
          countryMatched = true
          break
        } else if (country === town.country) {
          regionCountryScore = 40
          factors.push({ factor: 'Country match', score: 40 })
          countryMatched = true
          break
        }
      }
    }
    
    // If no country match, check for region match (75% = 30 points)
    if (!countryMatched && hasRegionPrefs) {
      // Check traditional regions array (case-insensitive)
      const userRegionsLower = preferences.regions.map(r => r.toLowerCase())
      
      if (town.regions?.some(region => userRegionsLower.includes(region.toLowerCase()))) {
        regionCountryScore = 30
        factors.push({ factor: 'Region match only', score: 30 })
      }
      // Also check geo_region for broader matches (now comma-separated)
      else if (town.geo_region) {
        // Handle comma-separated geo_region
        const geoRegions = town.geo_region.includes(',') 
          ? town.geo_region.split(',').map(r => r.trim().toLowerCase())
          : [town.geo_region.toLowerCase()]
        
        if (geoRegions.some(gr => userRegionsLower.includes(gr))) {
          regionCountryScore = 30
          factors.push({ factor: `Region match only (${town.geo_region})`, score: 30 })
        }
      }
    }
    
    // If nothing matched and user had preferences, no points awarded
    if (regionCountryScore === 0 && (hasCountryPrefs || hasRegionPrefs)) {
      // No match = 0 points (as per specification)
      regionCountryScore = 0
      factors.push({ factor: 'No location match', score: 0 })
    }
  }
  
  score += regionCountryScore
  
  // PART 2: GEOGRAPHIC FEATURES (Max 30 points)
  let geoScore = 0
  
  // Define all possible geographic features
  const ALL_GEO_FEATURES = ['coastal', 'mountain', 'island', 'lake', 'river', 'valley', 'desert', 'forest', 'plains']
  const userSelectedAllGeo = preferences.geographic_features?.length === ALL_GEO_FEATURES.length &&
    ALL_GEO_FEATURES.every(f => preferences.geographic_features.map(gf => gf.toLowerCase()).includes(f))
  
  if (!hasGeoPrefs || userSelectedAllGeo) {
    // No geographic preferences OR selected ALL = 100% = 30 points (user is open to anything)
    geoScore = 30
    factors.push({ factor: userSelectedAllGeo ? 'Open to all geographies (all selected)' : 'Open to any geography', score: 30 })
  } else {
    // Check if ANY geographic feature matches
    let hasMatch = false
    const userFeatures = preferences.geographic_features.map(f => f.toLowerCase())
    
    // First try actual geographic features
    if (town.geographic_features_actual?.length) {
      const townFeatures = town.geographic_features_actual.map(f => f.toLowerCase())
      hasMatch = userFeatures.some(feature => townFeatures.includes(feature))
    }
    
    // FALLBACK: Check regions array for coastal indicators when no geographic data
    if (!hasMatch && userFeatures.includes('coastal') && town.regions?.length) {
      const coastalIndicators = ['gulf', 'ocean', 'coast', 'beach', 'sea', 'atlantic', 'pacific', 'mediterranean']
      hasMatch = town.regions.some(region => 
        coastalIndicators.some(indicator => region.toLowerCase().includes(indicator))
      )
    }
    
    if (hasMatch) {
      geoScore = 30
      factors.push({ factor: 'Geographic features match', score: 30 })
    } else {
      // IMPROVED: Give partial credit for related geographic features
      // Water features are somewhat interchangeable for lifestyle purposes
      const relatedFeatures = {
        'coastal': ['island', 'lake', 'river'],  // All water access
        'island': ['coastal'],  // Islands are inherently coastal
        'lake': ['coastal', 'river'],  // Water features
        'river': ['lake', 'coastal'],  // Water features
        'mountain': ['valley', 'forest'],  // Often found together
        'valley': ['mountain', 'river'],  // Valleys often have rivers
        'forest': ['mountain', 'valley'],  // Forest areas
        'plains': ['valley'],  // Similar flat terrain
        'desert': []  // Desert is unique
      }
      
      let partialMatch = false
      if (town.geographic_features_actual?.length) {
        const townFeatures = town.geographic_features_actual.map(f => f.toLowerCase())
        for (const userFeature of userFeatures) {
          const related = relatedFeatures[userFeature] || []
          if (townFeatures.some(tf => related.includes(tf))) {
            geoScore = 15  // 50% credit for related features
            factors.push({ factor: 'Related geographic features (partial match)', score: 15 })
            partialMatch = true
            break
          }
        }
      }
      
      if (!partialMatch) {
        factors.push({ factor: 'No geographic feature match', score: 0 })
      }
    }
  }
  
  score += geoScore
  
  // PART 3: VEGETATION TYPE (Max 20 points)
  let vegScore = 0
  
  // Define all possible vegetation types
  const ALL_VEG_TYPES = ['tropical', 'subtropical', 'mediterranean', 'forest', 'grassland', 'desert']
  const userSelectedAllVeg = preferences.vegetation_types?.length === ALL_VEG_TYPES.length &&
    ALL_VEG_TYPES.every(v => preferences.vegetation_types.map(vt => vt.toLowerCase()).includes(v))
  
  // SMART INFERENCE: If user selected Mediterranean region but didn't specify vegetation,
  // they're likely OK with mediterranean vegetation (common sense)
  const impliedMediterraneanVeg = !hasVegPrefs && hasRegionPrefs && 
    preferences.regions?.some(r => r.toLowerCase() === 'mediterranean')
  
  if (!hasVegPrefs || userSelectedAllVeg) {
    // No vegetation preferences OR selected ALL = 100% = 20 points (user is open to anything)
    vegScore = 20
    if (impliedMediterraneanVeg && town.vegetation_type_actual?.includes('mediterranean')) {
      factors.push({ factor: 'Mediterranean region implies vegetation compatibility', score: 20 })
    } else {
      factors.push({ factor: userSelectedAllVeg ? 'Open to all vegetation (all selected)' : 'Open to any vegetation', score: 20 })
    }
  } else if (town.vegetation_type_actual?.length) {
    // Check if ANY vegetation type matches
    const userVeg = preferences.vegetation_types.map(v => v.toLowerCase())
    const townVeg = town.vegetation_type_actual.map(v => v.toLowerCase())
    const hasMatch = userVeg.some(veg => townVeg.includes(veg))
    
    if (hasMatch) {
      vegScore = 20
      factors.push({ factor: 'Vegetation type match', score: 20 })
    } else {
      // IMPROVED: Give partial credit for related vegetation types
      // Mediterranean is related to subtropical (both warm, dry climates)
      const relatedVegetation = {
        'mediterranean': ['subtropical'],
        'subtropical': ['mediterranean', 'tropical'],
        'tropical': ['subtropical'],
        'forest': ['grassland'],
        'grassland': ['forest']
      }
      
      let partialMatch = false
      for (const userVegType of userVeg) {
        const related = relatedVegetation[userVegType] || []
        if (townVeg.some(tv => related.includes(tv))) {
          vegScore = 10  // 50% credit for related vegetation
          factors.push({ factor: 'Related vegetation type (partial match)', score: 10 })
          partialMatch = true
          break
        }
      }
      
      if (!partialMatch) {
        factors.push({ factor: 'No vegetation match', score: 0 })
      }
    }
  } else {
    // User has preferences but town has no vegetation data
    factors.push({ factor: 'Vegetation data unavailable', score: 0 })
  }
  
  score += vegScore
  
  // Calculate final percentage based on 90 points total
  const totalPossible = 90
  const percentage = Math.round((score / totalPossible) * 100)
  
  // DEBUG: Log final score breakdown
  if (DEBUG && town.country === 'Spain' && percentage < 70) {
    console.log(`\nFINAL SCORE: ${percentage}% (${score}/${totalPossible})`)
    console.log('Breakdown:', factors)
    console.log('=== END DEBUG ===\n')
  }
  
  return {
    score: percentage,
    factors,
    category: 'Region',
    rawScore: score,
    maxScore: totalPossible
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

/**
 * Helper function for array-based climate preferences
 * @param {Array} userPrefs - User's preferences array
 * @param {string} townActual - Town's actual value
 * @param {number} maxPoints - Maximum points for perfect match
 * @param {Object} adjacencyMap - Map defining adjacent preferences
 * @returns {Object} Best score and description from all preferences
 */
function calculateGradualClimateScoreForArray(userPrefs, townActual, maxPoints, adjacencyMap) {
  if (!userPrefs?.length || !townActual) return { score: 0, description: null }
  
  let bestScore = 0
  let bestDescription = null
  let matchedPref = null
  
  // Check each user preference
  for (const pref of userPrefs) {
    const result = calculateGradualClimateScore(pref, townActual, maxPoints, adjacencyMap)
    if (result.score > bestScore) {
      bestScore = result.score
      bestDescription = result.description
      matchedPref = pref
    }
  }
  
  return {
    score: bestScore,
    description: bestDescription,
    matchedPref: matchedPref
  }
}

// 2. CLIMATE MATCHING (15% of total)
export function calculateClimateScore(preferences, town) {
  let score = 0
  let factors = []
  
  // If user has NO climate preferences at all, they're flexible - give perfect score
  if (!preferences.summer_climate_preference?.length && 
      !preferences.winter_climate_preference?.length &&
      !preferences.humidity_level?.length &&
      !preferences.sunshine?.length) {
    score = 100
    factors.push({ factor: 'Open to any climate', score: 100 })
    return { score, factors, category: 'Climate' }
  }
  
  // Note: Points adjusted to accommodate seasonal preference (was 100, now 100 with seasonal)
  // Summer climate match (25 points)
  if (town.avg_temp_summer !== null && town.avg_temp_summer !== undefined) {
    // Use numeric temperature data when available
    // Handle array preferences - use first value or check all
    const summerPrefs = Array.isArray(preferences.summer_climate_preference) 
      ? preferences.summer_climate_preference 
      : [preferences.summer_climate_preference].filter(Boolean)
    
    let bestScore = 0
    let bestPref = null
    
    for (const pref of summerPrefs) {
      if (TEMP_RANGES.summer[pref]) {
        const tempScore = calculateTemperatureScore(town.avg_temp_summer, TEMP_RANGES.summer[pref])
        if (tempScore > bestScore) {
          bestScore = tempScore
          bestPref = pref
        }
      }
    }
    
    if (bestScore > 0) {
      const points = Math.round(bestScore * 25 / 100)
      score += points
      
      if (bestScore === 100) {
        factors.push({ factor: `Perfect summer temperature (${town.avg_temp_summer}°C matches ${bestPref})`, score: points })
      } else if (bestScore >= 80) {
        factors.push({ factor: `Good summer temperature (${town.avg_temp_summer}°C near ${bestPref})`, score: points })
      } else if (bestScore >= 50) {
        factors.push({ factor: `Acceptable summer temperature (${town.avg_temp_summer}°C)`, score: points })
      } else if (bestScore > 0) {
        factors.push({ factor: `Summer temperature outside preference (${town.avg_temp_summer}°C)`, score: points })
      }
    }
  } else if (town.summer_climate_actual) {
    // Fall back to string matching with array handling
    const summerPrefs = Array.isArray(preferences.summer_climate_preference) 
      ? preferences.summer_climate_preference 
      : [preferences.summer_climate_preference].filter(Boolean)
    
    if (summerPrefs.includes(town.summer_climate_actual)) {
      score += 25
      factors.push({ factor: 'Perfect summer climate match', score: 25 })
    } else if (summerPrefs.includes('warm') && town.summer_climate_actual === 'hot') {
      // Hot is BETTER than warm for someone wanting warm!
      score += 25
      factors.push({ factor: 'Even warmer than requested', score: 25 })
    } else if (summerPrefs.includes('warm') && town.summer_climate_actual === 'mild') {
      score += 15
      factors.push({ factor: 'Acceptable summer climate', score: 15 })
    }
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
  
  // Winter climate match (25 points)
  if (town.avg_temp_winter !== null && town.avg_temp_winter !== undefined) {
    // Use numeric temperature data when available
    // Handle array preferences
    const winterPrefs = Array.isArray(preferences.winter_climate_preference) 
      ? preferences.winter_climate_preference 
      : [preferences.winter_climate_preference].filter(Boolean)
    
    let bestScore = 0
    let bestPref = null
    
    for (const pref of winterPrefs) {
      if (TEMP_RANGES.winter[pref]) {
        const tempScore = calculateTemperatureScore(town.avg_temp_winter, TEMP_RANGES.winter[pref])
        if (tempScore > bestScore) {
          bestScore = tempScore
          bestPref = pref
        }
      }
    }
    
    if (bestScore > 0) {
      const points = Math.round(bestScore * 25 / 100)
      score += points
      
      if (bestScore === 100) {
        factors.push({ factor: `Perfect winter temperature (${town.avg_temp_winter}°C matches ${bestPref})`, score: points })
      } else if (bestScore >= 80) {
        factors.push({ factor: `Good winter temperature (${town.avg_temp_winter}°C near ${bestPref})`, score: points })
      } else if (bestScore >= 50) {
        factors.push({ factor: `Acceptable winter temperature (${town.avg_temp_winter}°C)`, score: points })
      } else if (bestScore > 0) {
        factors.push({ factor: `Winter temperature outside preference (${town.avg_temp_winter}°C)`, score: points })
      }
    }
  } else if (town.winter_climate_actual) {
    // Fall back to string matching with array handling
    const winterPrefs = Array.isArray(preferences.winter_climate_preference) 
      ? preferences.winter_climate_preference 
      : [preferences.winter_climate_preference].filter(Boolean)
    
    const standardizedWinter = mapToStandardValue(town.winter_climate_actual, 'winter')
    
    if (winterPrefs.includes(standardizedWinter) || winterPrefs.includes(town.winter_climate_actual)) {
      score += 25
      factors.push({ factor: `Perfect winter climate match (${town.winter_climate_actual})`, score: 25 })
    } else if (
      (winterPrefs.includes('mild') && (standardizedWinter === 'cool' || town.winter_climate_actual === 'warm')) ||
      (winterPrefs.includes('cool') && standardizedWinter === 'mild')
    ) {
      score += 15
      factors.push({ factor: 'Acceptable winter climate', score: 15 })
    }
  } else if (!town.winter_climate_actual && !town.avg_temp_winter && town.climate_description) {
    // Last fallback: parse climate description
    const climateDesc = town.climate_description.toLowerCase()
    if (preferences.winter_climate_preference === 'mild' && (climateDesc.includes('mild') || climateDesc.includes('mediterranean'))) {
      score += 13
      factors.push({ factor: 'Winter climate appears suitable', score: 13 })
    }
  }
  
  // Humidity match (20 points) - now with gradual scoring
  const humidityAdjacency = {
    'dry': ['balanced'],
    'balanced': ['dry', 'humid'],
    'humid': ['balanced']
  }
  
  if (town.humidity_level_actual && preferences.humidity_level?.length > 0) {
    // Map town value to standard category first
    const standardizedHumidity = mapToStandardValue(town.humidity_level_actual, 'humidity')
    const humidityResult = calculateGradualClimateScoreForArray(
      preferences.humidity_level, 
      standardizedHumidity, 
      20, 
      humidityAdjacency
    )
    
    if (humidityResult.score > 0) {
      score += humidityResult.score
      const factorText = humidityResult.description === 'Perfect' ? 
        'Perfect humidity match' : 
        `Good humidity compatibility (${humidityResult.matchedPref} → ${standardizedHumidity})`
      // Add note if value was mapped
      if (town.humidity_level_actual !== standardizedHumidity) {
        factors.push({ factor: `${factorText} [${town.humidity_level_actual} = ${standardizedHumidity}]`, score: humidityResult.score })
      } else {
        factors.push({ factor: factorText, score: humidityResult.score })
      }
    }
  } else if (!town.humidity_level_actual && town.climate_description && preferences.humidity_level?.length > 0) {
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
      const humidityResult = calculateGradualClimateScoreForArray(
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
  
  // Sunshine match (20 points) - now with gradual scoring
  const sunshineAdjacency = {
    // User preferences (what they can select)
    'often_sunny': ['balanced', 'mostly_sunny', 'sunny', 'abundant'],
    'balanced': ['often_sunny', 'mostly_sunny', 'sunny', 'abundant', 'less_sunny', 'partly_sunny', 'often_cloudy'],
    'less_sunny': ['balanced', 'partly_sunny', 'often_cloudy'],
    
    // Town values (for reverse lookup - town value as key)
    'sunny': ['often_sunny', 'balanced'],
    'abundant': ['often_sunny', 'balanced'],
    'mostly_sunny': ['often_sunny', 'balanced'],
    'partly_sunny': ['balanced', 'less_sunny'],
    'often_cloudy': ['balanced', 'less_sunny']
  }
  
  if (town.sunshine_level_actual && preferences.sunshine?.length > 0) {
    // Map town value to standard category first
    const standardizedSunshine = mapToStandardValue(town.sunshine_level_actual, 'sunshine')
    const sunshineResult = calculateGradualClimateScoreForArray(
      preferences.sunshine, 
      standardizedSunshine, 
      20, 
      sunshineAdjacency
    )
    
    if (sunshineResult.score > 0) {
      score += sunshineResult.score
      const factorText = sunshineResult.description === 'Perfect' ? 
        'Perfect sunshine match' : 
        `Good sunshine compatibility (${sunshineResult.matchedPref} → ${standardizedSunshine})`
      // Add note if value was mapped
      if (town.sunshine_level_actual !== standardizedSunshine) {
        factors.push({ factor: `${factorText} [${town.sunshine_level_actual} = ${standardizedSunshine}]`, score: sunshineResult.score })
      } else {
        factors.push({ factor: factorText, score: sunshineResult.score })
      }
    }
  } else if (!town.sunshine_level_actual && town.sunshine_hours && preferences.sunshine?.length > 0) {
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
      const sunshineResult = calculateGradualClimateScoreForArray(
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
  } else if (!town.sunshine_level_actual && !town.sunshine_hours && town.climate_description && preferences.sunshine?.length > 0) {
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
      const sunshineResult = calculateGradualClimateScoreForArray(
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
  
  // Precipitation match (10 points) - now with gradual scoring
  const precipitationAdjacency = {
    'mostly_dry': ['balanced'],
    'dry': ['balanced'],           // Alternative spelling
    'balanced': ['mostly_dry', 'dry', 'often_rainy', 'wet'],
    'often_rainy': ['balanced'],
    'wet': ['balanced']            // Alternative spelling
  }
  
  if (town.precipitation_level_actual && preferences.precipitation?.length > 0) {
    // Map town value to standard category first
    const standardizedPrecipitation = mapToStandardValue(town.precipitation_level_actual, 'precipitation')
    const precipitationResult = calculateGradualClimateScoreForArray(
      preferences.precipitation, 
      standardizedPrecipitation, 
      10, 
      precipitationAdjacency
    )
    
    if (precipitationResult.score > 0) {
      score += precipitationResult.score
      const factorText = precipitationResult.description === 'Perfect' ? 
        'Perfect precipitation match' : 
        `Good precipitation compatibility (${precipitationResult.matchedPref} → ${standardizedPrecipitation})`
      // Add note if value was mapped
      if (town.precipitation_level_actual !== standardizedPrecipitation) {
        factors.push({ factor: `${factorText} [${town.precipitation_level_actual} = ${standardizedPrecipitation}]`, score: precipitationResult.score })
      } else {
        factors.push({ factor: factorText, score: precipitationResult.score })
      }
    }
  } else if (!town.precipitation_level_actual && town.annual_rainfall && preferences.precipitation?.length > 0) {
    // Fallback: use annual_rainfall data (in mm)
    let inferredPrecipitation = null
    
    if (town.annual_rainfall < 400) {
      inferredPrecipitation = 'mostly_dry'
    } else if (town.annual_rainfall < 1000) {
      inferredPrecipitation = 'balanced'
    } else {
      inferredPrecipitation = 'often_rainy'
    }
    
    const precipitationResult = calculateGradualClimateScoreForArray(
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
  } else if (!town.precipitation_level_actual && !town.annual_rainfall && town.climate_description && preferences.precipitation?.length > 0) {
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
      const precipitationResult = calculateGradualClimateScoreForArray(
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
  // Updated July 27, 2025: No preference = full points (as per Tobias specification)
  
  // First, handle cases where user has no preference (gets full points)
  // Including "Select Preference" which is the default dropdown value
  if (!preferences.seasonal_preference || 
      preferences.seasonal_preference === '' || 
      preferences.seasonal_preference === 'Optional' ||
      preferences.seasonal_preference === 'no_specific_preference' ||
      preferences.seasonal_preference === 'Select Preference' ||
      preferences.seasonal_preference === 'select_preference') {
    score += 15
    factors.push({ factor: 'Flexible on seasonal preferences', score: 15 })
  } 
  // Otherwise, apply seasonal matching if we have temperature data
  else if (town.avg_temp_summer !== null && town.avg_temp_summer !== undefined &&
           town.avg_temp_winter !== null && town.avg_temp_winter !== undefined) {
    
    const seasonPref = preferences.seasonal_preference
    
    if (seasonPref === 'summer_focused' || seasonPref === 'warm_seasons' || seasonPref === 'prefer_warm_seasons') {
      // User prefers warm seasons - check if Summer Climate fits = 15 Pts
      let seasonScore = 0
      let summerFits = false
      
      // Check if summer climate matches preference
      if (preferences.summer_climate_preference) {
        if (town.summer_climate_actual === preferences.summer_climate_preference) {
          summerFits = true
        } else if (town.avg_temp_summer !== null && TEMP_RANGES.summer[preferences.summer_climate_preference]) {
          // Use temperature-based check as fallback
          const tempScore = calculateTemperatureScore(town.avg_temp_summer, TEMP_RANGES.summer[preferences.summer_climate_preference])
          summerFits = tempScore >= 80 // Consider it a fit if temperature is good/perfect
        }
      } else {
        summerFits = true // No preference = fits
      }
      
      if (summerFits) {
        seasonScore = 15
        factors.push({ factor: 'Summer climate matches preference for warm seasons', score: 15 })
      } else {
        seasonScore = 0
        factors.push({ factor: 'Summer climate does not match warm season preference', score: 0 })
      }
      
      score += seasonScore
      
    } else if (seasonPref === 'winter_focused' || seasonPref === 'cool_seasons' || seasonPref === 'prefer_cool_seasons') {
      // User prefers cool seasons - check if Winter Climate fits = 15 Pts
      let seasonScore = 0
      let winterFits = false
      
      // Check if winter climate matches preference
      if (preferences.winter_climate_preference) {
        const standardizedWinter = mapToStandardValue(town.winter_climate_actual, 'winter')
        if (standardizedWinter === preferences.winter_climate_preference) {
          winterFits = true
        } else if (town.avg_temp_winter !== null && TEMP_RANGES.winter[preferences.winter_climate_preference]) {
          // Use temperature-based check as fallback
          const tempScore = calculateTemperatureScore(town.avg_temp_winter, TEMP_RANGES.winter[preferences.winter_climate_preference])
          winterFits = tempScore >= 80 // Consider it a fit if temperature is good/perfect
        }
      } else {
        winterFits = true // No preference = fits
      }
      
      if (winterFits) {
        seasonScore = 15
        factors.push({ factor: 'Winter climate matches preference for cool seasons', score: 15 })
      } else {
        seasonScore = 0
        factors.push({ factor: 'Winter climate does not match cool season preference', score: 0 })
      }
      
      score += seasonScore
      
    } else if (seasonPref === 'all_seasons') {
      // User enjoys all seasons - check if BOTH winter and summer climate match preferences
      // Per Tobias spec: if Winter Climate and Summer Climate fits = 15 Pts
      let seasonScore = 0
      let summerFits = false
      let winterFits = false
      
      // Check if summer climate matches preference
      if (preferences.summer_climate_preference) {
        if (town.summer_climate_actual === preferences.summer_climate_preference) {
          summerFits = true
        } else if (town.avg_temp_summer !== null && TEMP_RANGES.summer[preferences.summer_climate_preference]) {
          // Use temperature-based check as fallback
          const tempScore = calculateTemperatureScore(town.avg_temp_summer, TEMP_RANGES.summer[preferences.summer_climate_preference])
          summerFits = tempScore >= 80 // Consider it a fit if temperature is good/perfect
        }
      } else {
        summerFits = true // No preference = fits
      }
      
      // Check if winter climate matches preference
      if (preferences.winter_climate_preference) {
        const standardizedWinter = mapToStandardValue(town.winter_climate_actual, 'winter')
        if (standardizedWinter === preferences.winter_climate_preference) {
          winterFits = true
        } else if (town.avg_temp_winter !== null && TEMP_RANGES.winter[preferences.winter_climate_preference]) {
          // Use temperature-based check as fallback
          const tempScore = calculateTemperatureScore(town.avg_temp_winter, TEMP_RANGES.winter[preferences.winter_climate_preference])
          winterFits = tempScore >= 80 // Consider it a fit if temperature is good/perfect
        }
      } else {
        winterFits = true // No preference = fits
      }
      
      // Award points only if BOTH seasons fit
      if (summerFits && winterFits) {
        seasonScore = 15
        factors.push({ factor: 'Both summer and winter climate match preferences', score: 15 })
      } else {
        seasonScore = 0
        if (!summerFits && !winterFits) {
          factors.push({ factor: 'Neither summer nor winter climate matches', score: 0 })
        } else if (!summerFits) {
          factors.push({ factor: 'Summer climate does not match preference', score: 0 })
        } else {
          factors.push({ factor: 'Winter climate does not match preference', score: 0 })
        }
      }
      
      score += seasonScore
    }
  }
  
  return {
    score: Math.min(score, 100),
    factors,
    category: 'Climate'
  }
}

// 3. CULTURE MATCHING (20% of total) - NEW ALGORITHM
// Total: 100 pts distributed as:
// - Living Environment: 20 pts
// - Pace of Life: 20 pts  
// - Language Preference: 20 pts
// - Expat Community: 10 pts
// - Dining & Nightlife: 10 pts
// - Events & Concerts: 10 pts
// - Museums & Arts: 10 pts

// Adjacency maps for gradual scoring
const CULTURE_ADJACENCY = {
  urban_rural: {
    'urban': ['suburban'],
    'suburban': ['urban', 'rural'],
    'rural': ['suburban']
  },
  pace_of_life: {
    'fast': ['moderate'],
    'moderate': ['fast', 'relaxed'],
    'relaxed': ['moderate']
  },
  expat_community: {
    'large': ['moderate'],
    'moderate': ['large', 'small'],
    'small': ['moderate']
  }
}

export function calculateCultureScore(preferences, town) {
  let score = 0
  let factors = []
  
  // Check if user has any culture preferences at all
  const hasAnyPreferences = 
    preferences.lifestyle_preferences?.urban_rural?.length ||
    preferences.lifestyle_preferences?.pace_of_life?.length ||
    preferences.expat_community_preference?.length ||
    preferences.language_comfort?.preferences?.length ||
    preferences.language_comfort?.already_speak?.length ||
    (preferences.cultural_importance?.dining_nightlife > 1) ||
    (preferences.cultural_importance?.cultural_events > 1) ||
    (preferences.cultural_importance?.museums > 1)
  
  if (!hasAnyPreferences) {
    score = 100
    factors.push({ factor: 'Open to any culture', score: 100 })
    return { score, factors, category: 'Culture' }
  }
  
  // 1. LIVING ENVIRONMENT (20 points)
  const livingEnvPref = preferences.lifestyle_preferences?.urban_rural
  if (!livingEnvPref || livingEnvPref.length === 0) {
    // User doesn't care - full points
    score += 20
    factors.push({ factor: 'Flexible on living environment', score: 20 })
  } else if (town.urban_rural_character) {
    // Check for exact match
    if (livingEnvPref.includes(town.urban_rural_character)) {
      score += 20
      factors.push({ factor: `Living environment matched (${town.urban_rural_character})`, score: 20 })
    } else {
      // Check for adjacent match
      let isAdjacent = false
      for (const pref of livingEnvPref) {
        if (CULTURE_ADJACENCY.urban_rural[pref]?.includes(town.urban_rural_character)) {
          isAdjacent = true
          break
        }
      }
      if (isAdjacent) {
        score += 10
        factors.push({ factor: `Living environment close match (${town.urban_rural_character})`, score: 10 })
      } else {
        factors.push({ factor: `Living environment mismatch (${town.urban_rural_character})`, score: 0 })
      }
    }
  } else {
    // Town has no data - give partial credit
    score += 12
    factors.push({ factor: 'Living environment data unavailable', score: 12 })
  }
  
  // 2. PACE OF LIFE (20 points)
  const pacePref = preferences.lifestyle_preferences?.pace_of_life
  const townPace = town.pace_of_life_actual || town.pace_of_life // Use actual if available
  
  if (!pacePref || pacePref.length === 0) {
    // User doesn't care - full points
    score += 20
    factors.push({ factor: 'Flexible on pace of life', score: 20 })
  } else if (townPace) {
    // Check for exact match
    if (pacePref.includes(townPace)) {
      score += 20
      factors.push({ factor: `Pace of life matched (${townPace})`, score: 20 })
    } else {
      // Check for adjacent match
      let isAdjacent = false
      for (const pref of pacePref) {
        if (CULTURE_ADJACENCY.pace_of_life[pref]?.includes(townPace)) {
          isAdjacent = true
          break
        }
      }
      if (isAdjacent) {
        score += 10
        factors.push({ factor: `Pace of life close match (${townPace})`, score: 10 })
      } else {
        factors.push({ factor: `Pace of life mismatch (${townPace})`, score: 0 })
      }
    }
  } else {
    // Town has no data - give partial credit
    score += 12
    factors.push({ factor: 'Pace of life data unavailable', score: 12 })
  }
  
  // 3. LANGUAGE PREFERENCE (20 points)
  const languagePrefs = preferences.language_comfort?.preferences
  const langPref = Array.isArray(languagePrefs) ? languagePrefs[0] : languagePrefs
  const speaksLanguages = preferences.language_comfort?.already_speak || []
  
  // No language preference at all - full points
  if (!langPref && speaksLanguages.length === 0) {
    score += 20
    factors.push({ factor: 'Flexible on language', score: 20 })
  } 
  // Check if user speaks the local language
  else if (speaksLanguages.length > 0 && town.primary_language) {
    const speaksLocal = speaksLanguages.some(lang => 
      town.primary_language?.toLowerCase().includes(lang.toLowerCase()) ||
      town.languages_spoken?.some(l => l.toLowerCase().includes(lang.toLowerCase()))
    )
    
    if (speaksLocal) {
      score += 20
      factors.push({ factor: `Speaks local language (${town.primary_language})`, score: 20 })
    } else if (langPref === 'willing_to_learn' || langPref === 'comfortable') {
      score += 10
      factors.push({ factor: 'Willing to learn local language', score: 10 })
    } else {
      factors.push({ factor: 'Language barrier', score: 0 })
    }
  }
  // English only preference
  else if (langPref === 'english_only') {
    if (town.primary_language?.toLowerCase() === 'english') {
      score += 20
      factors.push({ factor: 'English is primary language', score: 20 })
    } else if (town.english_proficiency_level) {
      // Normalized values after database cleanup
      const proficiencyScores = {
        'native': 20,
        'high': 15,
        'moderate': 10,
        'low': 5
      }
      
      const proficiencyScore = proficiencyScores[town.english_proficiency_level] || 0
      score += proficiencyScore
      if (proficiencyScore > 0) {
        factors.push({ factor: `English proficiency: ${town.english_proficiency_level}`, score: proficiencyScore })
      } else {
        factors.push({ factor: 'English proficiency unknown', score: 0 })
      }
    } else {
      factors.push({ factor: 'English proficiency unknown', score: 0 })
    }
  }
  // Willing to learn or flexible
  else if (langPref === 'willing_to_learn' || langPref === 'comfortable') {
    score += 10
    factors.push({ factor: 'Open to learning local language', score: 10 })
  }
  
  // 4. EXPAT COMMUNITY (10 points)
  const expatPref = preferences.expat_community_preference
  
  if (!expatPref || (Array.isArray(expatPref) && expatPref.length === 0)) {
    // User doesn't care - full points
    score += 10
    factors.push({ factor: 'Flexible on expat community', score: 10 })
  } else if (town.expat_community_size) {
    const expatPrefs = Array.isArray(expatPref) ? expatPref : [expatPref]
    
    // Check for exact match
    if (expatPrefs.includes(town.expat_community_size)) {
      score += 10
      factors.push({ factor: `Expat community matched (${town.expat_community_size})`, score: 10 })
    } else {
      // Check for adjacent match
      let isAdjacent = false
      for (const pref of expatPrefs) {
        if (CULTURE_ADJACENCY.expat_community[pref]?.includes(town.expat_community_size)) {
          isAdjacent = true
          break
        }
      }
      if (isAdjacent) {
        score += 5
        factors.push({ factor: `Expat community close match (${town.expat_community_size})`, score: 5 })
      } else {
        factors.push({ factor: `Expat community mismatch (${town.expat_community_size})`, score: 0 })
      }
    }
  } else {
    // Town has no data - give partial credit
    score += 6
    factors.push({ factor: 'Expat community data unavailable', score: 6 })
  }
  
  // 5. DINING & NIGHTLIFE (10 points)
  const diningImportance = preferences.cultural_importance?.dining_nightlife || 1
  
  if (diningImportance === 1) {
    // User doesn't care - full points
    score += 10
    factors.push({ factor: 'Flexible on dining & nightlife', score: 10 })
  } else if (town.dining_nightlife_level) {
    const difference = Math.abs(diningImportance - town.dining_nightlife_level)
    let points = 0
    
    if (difference === 0) {
      points = 10 // Exact match
      factors.push({ factor: 'Dining & nightlife perfectly matched', score: 10 })
    } else if (difference === 1) {
      points = 7  // Adjacent
      factors.push({ factor: 'Dining & nightlife good match', score: 7 })
    } else if (difference === 2) {
      points = 4  // Near
      factors.push({ factor: 'Dining & nightlife acceptable', score: 4 })
    } else {
      factors.push({ factor: 'Dining & nightlife mismatch', score: 0 })
    }
    
    score += points
  } else {
    // No data - give partial credit
    score += 5
    factors.push({ factor: 'Dining & nightlife data unavailable', score: 5 })
  }
  
  // 6. EVENTS & CONCERTS (10 points)
  const eventsImportance = preferences.cultural_importance?.cultural_events || 1
  
  if (eventsImportance === 1) {
    // User doesn't care - full points
    score += 10
    factors.push({ factor: 'Flexible on cultural events', score: 10 })
  } else if (town.cultural_events_level) {
    const difference = Math.abs(eventsImportance - town.cultural_events_level)
    let points = 0
    
    if (difference === 0) {
      points = 10 // Exact match
      factors.push({ factor: 'Cultural events perfectly matched', score: 10 })
    } else if (difference === 1) {
      points = 7  // Adjacent
      factors.push({ factor: 'Cultural events good match', score: 7 })
    } else if (difference === 2) {
      points = 4  // Near
      factors.push({ factor: 'Cultural events acceptable', score: 4 })
    } else {
      factors.push({ factor: 'Cultural events mismatch', score: 0 })
    }
    
    score += points
  } else {
    // No data - give partial credit
    score += 5
    factors.push({ factor: 'Cultural events data unavailable', score: 5 })
  }
  
  // 7. MUSEUMS & ARTS (10 points)
  const museumsImportance = preferences.cultural_importance?.museums || 1
  
  if (museumsImportance === 1) {
    // User doesn't care - full points
    score += 10
    factors.push({ factor: 'Flexible on museums & arts', score: 10 })
  } else if (town.museums_level) {
    const difference = Math.abs(museumsImportance - town.museums_level)
    let points = 0
    
    if (difference === 0) {
      points = 10 // Exact match
      factors.push({ factor: 'Museums & arts perfectly matched', score: 10 })
    } else if (difference === 1) {
      points = 7  // Adjacent
      factors.push({ factor: 'Museums & arts good match', score: 7 })
    } else if (difference === 2) {
      points = 4  // Near
      factors.push({ factor: 'Museums & arts acceptable', score: 4 })
    } else {
      factors.push({ factor: 'Museums & arts mismatch', score: 0 })
    }
    
    score += points
  } else {
    // No data - give partial credit
    score += 5
    factors.push({ factor: 'Museums & arts data unavailable', score: 5 })
  }
  
  return {
    score: Math.min(score, 100),
    factors,
    category: 'Culture'
  }
}

// 4. HOBBIES MATCHING (20% of total)
// Now uses normalized hobbies database with universal vs location-specific hobbies
export async function calculateHobbiesScore(preferences, town) {
  // Use the new normalized hobbies matching
  const result = await calculateNormalizedHobbiesScore(preferences, town)
  return result
}

// Legacy hobbies scoring for backward compatibility (if needed)
export function calculateHobbiesScoreLegacy(preferences, town) {
  let score = 0
  let factors = []
  
  // If user has NO hobby preferences at all, they're flexible - give perfect score
  if (!preferences.activities?.length && 
      !preferences.interests?.length &&
      !preferences.lifestyle_importance) {
    score = 100
    factors.push({ factor: 'Open to any activities', score: 100 })
    return { score, factors, category: 'Hobbies' }
  }
  
  // Activity matching (40 points) with smart matching
  if (preferences.activities?.length && town.activities_available?.length) {
    let activityMatches = 0
    const totalActivities = preferences.activities.length
    
    // Smart activity matching - understand related activities
    preferences.activities.forEach(userActivity => {
      const activity = userActivity.toLowerCase()
      const townActivities = town.activities_available.map(a => a.toLowerCase())
      
      // Direct match
      if (townActivities.includes(activity)) {
        activityMatches++
      }
      // Smart matches - common sense relationships
      else if (activity === 'fishing' && (townActivities.includes('water_sports') || townActivities.includes('boating') || town.beaches_nearby)) {
        activityMatches++
        factors.push({ factor: 'Coastal location perfect for fishing', score: 0 })
      }
      else if (activity === 'swimming' && (townActivities.includes('beaches') || townActivities.includes('water_sports'))) {
        activityMatches++
      }
      else if (activity === 'walking' && (townActivities.includes('hiking') || townActivities.includes('trails'))) {
        activityMatches++
      }
    })
    
    const activityScore = (activityMatches / totalActivities) * 40
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
    // User wants adequate quality (ideal 6+, but reward exceeding)
    if (actualScore >= 9.0) {
      return { score: maxPoints, description: 'far exceeds requirements' }
    } else if (actualScore >= 8.0) {
      return { score: maxPoints, description: 'exceeds requirements' }
    } else if (actualScore >= 7.0) {
      return { score: maxPoints, description: 'exceeds requirements' }
    } else if (actualScore >= 6.0) {
      return { score: Math.round(maxPoints * 0.9), description: 'meets requirements' }
    } else if (actualScore >= 5.0) {
      return { score: Math.round(maxPoints * 0.7), description: 'nearly meets requirements' }
    } else if (actualScore >= 4.0) {
      return { score: Math.round(maxPoints * 0.5), description: 'basic but functional' }
    } else {
      return { score: 0, description: 'below functional level' }
    }
  } else if (userPref === 'basic') {
    // User wants minimal quality (ideal 4+, but reward exceeding)
    if (actualScore >= 8.0) {
      return { score: maxPoints, description: 'far exceeds requirements' }
    } else if (actualScore >= 6.0) {
      return { score: maxPoints, description: 'exceeds requirements' }
    } else if (actualScore >= 5.0) {
      return { score: maxPoints, description: 'meets requirements' }
    } else if (actualScore >= 4.0) {
      return { score: Math.round(maxPoints * 0.9), description: 'meets basic requirements' }
    } else if (actualScore >= 3.0) {
      return { score: Math.round(maxPoints * 0.7), description: 'nearly meets basic requirements' }
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
  
  // Debug logs removed - too verbose for production
  
  // If user has NO admin preferences at all, they're flexible - give perfect score
  if (!preferences.healthcare_quality?.length && 
      !preferences.safety_importance?.length &&
      !preferences.government_efficiency?.length &&
      !preferences.visa_preference?.length) {
    score = 100
    factors.push({ factor: 'Open to any administrative situation', score: 100 })
    return { score, factors, category: 'Admin' }
  }
  
  // Healthcare quality match (30 points) - now with gradual scoring
  const healthcareArray = preferences.healthcare_quality || []
  const healthcarePref = Array.isArray(healthcareArray) ? healthcareArray[0] : healthcareArray
  
  // Always score healthcare if town has data, even if no preference
  if (town.healthcare_score) {
    const prefToUse = healthcarePref || 'functional' // Default to functional if no preference
    const healthcareResult = calculateGradualAdminScore(
      town.healthcare_score, 
      prefToUse, 
      30
    )
    
    score += healthcareResult.score
    factors.push({ 
      factor: `Healthcare ${healthcareResult.description} (score: ${town.healthcare_score})`, 
      score: healthcareResult.score 
    })
  } else {
    // No healthcare data - penalize for missing critical data
    score += 5
    factors.push({ factor: 'Healthcare data not available', score: 5 })
  }
  
  // Safety match (25 points) - now with gradual scoring
  const safetyArray = preferences.safety_importance || []
  const safetyPref = Array.isArray(safetyArray) ? safetyArray[0] : safetyArray
  
  // Always score safety if town has data, even if no preference
  if (town.safety_score) {
    const prefToUse = safetyPref || 'functional' // Default to functional if no preference
    const safetyResult = calculateGradualAdminScore(
      town.safety_score, 
      prefToUse, 
      25
    )
    
    score += safetyResult.score
    factors.push({ 
      factor: `Safety ${safetyResult.description} (score: ${town.safety_score})`, 
      score: safetyResult.score 
    })
  } else {
    // No safety data - penalize for missing critical data
    score += 5
    factors.push({ factor: 'Safety data not available', score: 5 })
  }
  
  // Government efficiency match (15 points)
  const govArray = preferences.government_efficiency || []
  const govPref = Array.isArray(govArray) ? govArray[0] : govArray
  
  if (town.government_efficiency_rating && govPref) {
    // Government rating is 0-100, convert to 0-10 scale for scoring
    const govScore = town.government_efficiency_rating / 10
    const govResult = calculateGradualAdminScore(govScore, govPref, 15)
    
    score += govResult.score
    factors.push({ 
      factor: `Government efficiency ${govResult.description} (rating: ${town.government_efficiency_rating})`, 
      score: govResult.score 
    })
  } else if (town.government_efficiency_rating && !govPref) {
    // No preference but data exists - give partial credit
    const govScore = town.government_efficiency_rating / 10
    const govResult = calculateGradualAdminScore(govScore, 'functional', 15)
    score += govResult.score
    factors.push({ 
      factor: `Government efficiency rating: ${town.government_efficiency_rating}`, 
      score: govResult.score 
    })
  } else if (!town.government_efficiency_rating) {
    // No data available - minimal credit
    score += 3
    factors.push({ factor: 'Government efficiency data not available', score: 3 })
  }
  
  // Visa/residency match (10 points) - handle array format
  const visaArray = preferences.visa_preference || []
  const visaPref = Array.isArray(visaArray) ? visaArray[0] : visaArray
  
  if ((visaPref === 'good' || visaPref === 'functional') && preferences.stay_duration) {
    // Check visa requirements based on user citizenship
    const citizenship = preferences.citizenship || preferences.current_status?.citizenship || 'USA'
    if (town.visa_on_arrival_countries?.includes(citizenship) ||
        town.easy_residency_countries?.includes(citizenship)) {
      score += 10
      factors.push({ factor: 'Easy visa/residency access', score: 10 })
    } else if (town.retirement_visa_available) {
      score += 8
      factors.push({ factor: 'Retirement visa available', score: 8 })
    }
  } else {
    score += 5 // Basic visa access
  }
  
  // Environmental health for sensitive users (15 points)
  if (preferences.health_considerations?.environmental_health === 'sensitive' &&
      town.environmental_health_rating >= 4) {
    score += 15
    factors.push({ factor: 'Good environmental health', score: 15 })
  }
  
  // Political stability bonus (10 points)
  const stabilityArray = preferences.political_stability || []
  const stabilityPref = Array.isArray(stabilityArray) ? stabilityArray[0] : stabilityArray
  
  if (town.political_stability_rating) {
    if ((stabilityPref === 'good' && town.political_stability_rating >= 80) ||
        (stabilityPref === 'functional' && town.political_stability_rating >= 60) ||
        (stabilityPref === 'basic' && town.political_stability_rating >= 40)) {
      score += 10
      factors.push({ factor: `Political stability matches preference (rating: ${town.political_stability_rating})`, score: 10 })
    } else if (!stabilityPref && town.political_stability_rating >= 60) {
      // No preference - give credit for decent stability
      score += 5
      factors.push({ factor: `Political stability rating: ${town.political_stability_rating}`, score: 5 })
    } else if (stabilityPref && town.political_stability_rating < 60) {
      // Has preference but stability is poor
      factors.push({ factor: `Political stability below requirements (${town.political_stability_rating})`, score: 0 })
    }
  } else if (stabilityPref) {
    // User wants stability data but it's missing
    factors.push({ factor: 'Political stability data not available', score: 0 })
  }
  
  const finalScore = Math.min(score, 100);
  
  return {
    score: finalScore,
    factors,
    category: 'Administration'
  }
}

// 6. BUDGET MATCHING (20% of total)
export function calculateBudgetScore(preferences, town) {
  let score = 0
  let factors = []
  
  // If user has NO budget preferences at all, they're flexible - give perfect score
  const hasBudgetPrefs = preferences.total_monthly_budget || 
                         preferences.max_monthly_rent ||
                         preferences.monthly_healthcare_budget
  
  if (!hasBudgetPrefs) {
    score = 100
    factors.push({ factor: 'Open to any budget situation', score: 100 })
    return { score, factors, category: 'Budget' }
  }
  
  // Overall budget fit (40 points)
  // Use cost_of_living_usd (actual USD amount), NOT cost_index (relative scale)
  const townCost = town.cost_of_living_usd || town.typical_monthly_living_cost
  
  // Extract budget value from array (use max value as upper limit)
  const userBudget = Array.isArray(preferences.total_monthly_budget) 
    ? Math.max(...preferences.total_monthly_budget)
    : preferences.total_monthly_budget
  
  if (!townCost || !userBudget) {
    // If we don't have cost data, give neutral score
    score += 20
    factors.push({ factor: 'Cost data not available', score: 20 })
    return { score, factors, category: 'Budget' }
  }
  
  const budgetRatio = userBudget / townCost
  
  if (budgetRatio >= 2.0) {
    // User budget is 2x or more than cost - excellent value
    score += 40
    factors.push({ factor: `Excellent value (budget $${userBudget} vs cost $${townCost})`, score: 40 })
  } else if (budgetRatio >= 1.5) {
    // User budget is 1.5x cost - comfortable margin
    score += 35
    factors.push({ factor: `Comfortable budget margin (budget $${userBudget} vs cost $${townCost})`, score: 35 })
  } else if (budgetRatio >= 1.2) {
    // User budget is 1.2x cost - good fit
    score += 30
    factors.push({ factor: `Good budget fit (budget $${userBudget} vs cost $${townCost})`, score: 30 })
  } else if (budgetRatio >= 1.0) {
    // User budget meets cost - adequate
    score += 25
    factors.push({ factor: `Budget adequate (budget $${userBudget} vs cost $${townCost})`, score: 25 })
  } else if (budgetRatio >= 0.9) {
    // User budget is 90% of cost - slightly tight
    score += 20
    factors.push({ factor: `Budget slightly tight (budget $${userBudget} vs cost $${townCost})`, score: 20 })
  } else if (budgetRatio >= 0.8) {
    // User budget is 80% of cost - challenging but possible
    score += 15
    factors.push({ factor: `Budget challenging (budget $${userBudget} vs cost $${townCost})`, score: 15 })
  } else if (budgetRatio >= 0.7) {
    // User budget is 70% of cost - very tight
    score += 10
    factors.push({ factor: `Budget very tight (budget $${userBudget} vs cost $${townCost})`, score: 10 })
  } else {
    // Budget too low
    score += 5
    factors.push({ factor: `Over budget (budget $${userBudget} vs cost $${townCost})`, score: 5 })
  }
  
  // Rent budget match (30 points)
  const userRentBudget = Array.isArray(preferences.max_monthly_rent)
    ? Math.max(...preferences.max_monthly_rent)
    : preferences.max_monthly_rent
    
  if (userRentBudget && town.typical_rent_1bed) {
    if (userRentBudget >= town.typical_rent_1bed) {
      score += 30
      factors.push({ factor: 'Rent within budget', score: 30 })
    } else if (userRentBudget >= town.typical_rent_1bed * 0.8) {
      score += 15
      factors.push({ factor: 'Rent slightly over budget', score: 15 })
    }
  }
  
  // Healthcare budget match (20 points)
  const userHealthcareBudget = Array.isArray(preferences.monthly_healthcare_budget)
    ? Math.max(...preferences.monthly_healthcare_budget)
    : preferences.monthly_healthcare_budget
    
  if (userHealthcareBudget && town.healthcare_cost_monthly) {
    if (userHealthcareBudget >= town.healthcare_cost_monthly) {
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

/**
 * Main matching function that combines all scores
 * 
 * IMPORTANT LOGIC: Empty preferences = 100% match
 * - When a user has NO preferences in a category, they get 100% for that category
 * - This means "I don't care" = "I'm happy with anything"
 * - Only when users SELECT preferences do we filter/score based on matching
 * 
 * Example: User with only budget preference gets:
 * - Budget: Scored based on their budget vs town cost
 * - All other categories: 100% (open to any option)
 * 
 * This ensures users see many options unless they specifically narrow them down
 */
export async function calculateEnhancedMatch(userPreferences, town) {
  // Calculate individual category scores
  const regionResult = calculateRegionScore(userPreferences.region_preferences || {}, town)
  const climateResult = calculateClimateScore(userPreferences.climate_preferences || {}, town)
  const cultureResult = calculateCultureScore(userPreferences.culture_preferences || {}, town)
  const hobbiesResult = await calculateHobbiesScore(userPreferences.hobbies_preferences || userPreferences.hobbies || {}, town)
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
  
  // No bonuses - pure weighted scoring only
  
  // Cap the total score at 100
  totalScore = Math.min(totalScore, 100)
  
  // Compile all factors
  const allFactors = [
    ...regionResult.factors,
    ...climateResult.factors,
    ...cultureResult.factors,
    ...hobbiesResult.factors,
    ...adminResult.factors,
    ...budgetResult.factors
  ]
  
  // No data completeness factors
  
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
    match_score: Math.min(100, Math.round(totalScore)),
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