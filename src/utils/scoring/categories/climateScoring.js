/**
 * CLIMATE SCORING - Category 2 of 6
 * Weight: 15% of total match score
 *
 * Scores how well a town's climate matches user preferences:
 * - Summer Climate: mild/warm/hot temperatures
 * - Winter Climate: cold/cool/mild temperatures
 * - Humidity: dry/balanced/humid
 * - Sunshine: often_sunny/balanced/less_sunny
 * - Precipitation: mostly_dry/balanced/less_dry
 * - Seasonal Preference: warm_all_year/all_seasons/summer_focused/winter_focused
 *
 * Scoring Breakdown (100 points total):
 * - Summer Temperature: 25 points
 * - Winter Temperature: 25 points
 * - Humidity: 20 points
 * - Sunshine: 20 points
 * - Precipitation: 10 points
 * - Seasonal Match: 15 points (bonus for seasonal preference alignment)
 */

import { parsePreferences } from '../helpers/preferenceParser.js';
import { mapToStandardValue } from '../helpers/climateInference.js';
import { compareIgnoreCase, normalize, arrayIncludesIgnoreCase } from '../helpers/stringUtils.js';

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

  // Parse and normalize preferences using centralized parser
  const parsed = parsePreferences(preferences)


  // If preferences is empty object or undefined, return 0 (not 100!)
  if (!preferences || Object.keys(preferences).length === 0) {
    console.log('❌ NO PREFERENCES PASSED - returning 0%');
    return { score: 0, factors: [{ factor: 'No climate preferences available', score: 0 }], category: 'Climate' }
  }

  // If user has NO climate preferences at all, they're flexible - give perfect score
  if (!parsed.climate.hasAnyPreferences) {
    score = 100
    factors.push({ factor: 'Open to any climate', score: 100 })
    return { score, factors, category: 'Climate' }
  }
  
  // Note: Points adjusted to accommodate seasonal preference (was 100, now 100 with seasonal)
  // Summer climate match (25 points)
  if (town.avg_temp_summer !== null && town.avg_temp_summer !== undefined) {
    // Use numeric temperature data when available
    const summerPrefs = parsed.climate.summer
    
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
    const summerPrefs = parsed.climate.summer.map(p => normalize(p))

    if (arrayIncludesIgnoreCase(summerPrefs, town.summer_climate_actual)) {
      score += 25
      factors.push({ factor: 'Perfect summer climate match', score: 25 })
    } else if (summerPrefs.includes('warm') && compareIgnoreCase(town.summer_climate_actual, 'hot')) {
      // Hot is BETTER than warm for someone wanting warm!
      score += 25
      factors.push({ factor: 'Even warmer than requested', score: 25 })
    } else if (summerPrefs.includes('warm') && compareIgnoreCase(town.summer_climate_actual, 'mild')) {
      score += 15
      factors.push({ factor: 'Acceptable summer climate', score: 15 })
    }
  } else if (!town.summer_climate_actual && !town.avg_temp_summer && town.climate_description) {
    // Last fallback: parse climate description
    const climateDesc = typeof town.climate_description === 'string'
      ? normalize(town.climate_description)
      : ''
    // Handle both array and string preferences
    const summerPrefForFallback = parsed.climate.summer.length > 0
      ? normalize(parsed.climate.summer[0])
      : ''

    if (summerPrefForFallback === 'warm' && (climateDesc.includes('warm') || climateDesc.includes('mediterranean'))) {
      score += 13
      factors.push({ factor: 'Climate appears suitable', score: 13 })
    } else if (summerPrefForFallback === 'hot' && (climateDesc.includes('hot') || climateDesc.includes('tropical'))) {
      score += 13
      factors.push({ factor: 'Climate appears suitable', score: 13 })
    }
  }
  
  // Winter climate match (25 points)
  if (town.avg_temp_winter !== null && town.avg_temp_winter !== undefined) {
    // Use numeric temperature data when available
    const winterPrefs = parsed.climate.winter
    
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
    const winterPrefs = parsed.climate.winter
    
    const standardizedWinter = mapToStandardValue(town.winter_climate_actual, 'winter')
    
    if (winterPrefs.includes(standardizedWinter) || winterPrefs.includes(town.winter_climate_actual)) {
      score += 25
      factors.push({ factor: `Perfect winter climate match (${town.winter_climate_actual})`, score: 25 })
    } else if (
      (winterPrefs.includes('mild') && (standardizedWinter === 'cool' || compareIgnoreCase(town.winter_climate_actual, 'warm'))) ||
      (winterPrefs.includes('cool') && standardizedWinter === 'mild')
    ) {
      score += 15
      factors.push({ factor: 'Acceptable winter climate', score: 15 })
    }
  } else if (!town.winter_climate_actual && !town.avg_temp_winter && town.climate_description) {
    // Last fallback: parse climate description
    const climateDesc = typeof town.climate_description === 'string'
      ? normalize(town.climate_description)
      : ''
    // Handle both array and string preferences
    const winterPrefForFallback = parsed.climate.winter.length > 0
      ? normalize(parsed.climate.winter[0])
      : ''

    if (winterPrefForFallback === 'mild' && (climateDesc.includes('mild') || climateDesc.includes('mediterranean'))) {
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
  
  if (town.humidity_level_actual && parsed.climate.humidity.length > 0) {
    // Map town value to standard category first
    const standardizedHumidity = mapToStandardValue(town.humidity_level_actual, 'humidity')
    const humidityResult = calculateGradualClimateScoreForArray(
      parsed.climate.humidity, 
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
  } else if (!town.humidity_level_actual && town.climate_description && parsed.climate.humidity?.length > 0) {
    // Fallback: try to infer from climate description
    const climateDesc = typeof town.climate_description === 'string'
      ? normalize(town.climate_description)
      : ''
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
        parsed.climate.humidity, 
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
  
  if (town.sunshine_level_actual && parsed.climate.sunshine?.length > 0) {
    // Map town value to standard category first
    const standardizedSunshine = mapToStandardValue(town.sunshine_level_actual, 'sunshine')
    const sunshineResult = calculateGradualClimateScoreForArray(
      parsed.climate.sunshine, 
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
  } else if (!town.sunshine_level_actual && town.sunshine_hours && parsed.climate.sunshine?.length > 0) {
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
        parsed.climate.sunshine, 
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
  } else if (!town.sunshine_level_actual && !town.sunshine_hours && town.climate_description && parsed.climate.sunshine?.length > 0) {
    // Last fallback: infer from climate description
    const climateDesc = typeof town.climate_description === 'string'
      ? normalize(town.climate_description)
      : ''
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
        parsed.climate.sunshine, 
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
    'balanced': ['mostly_dry', 'dry', 'less_dry', 'wet'],
    'less_dry': ['balanced'],
    'wet': ['balanced']            // Alternative spelling
  }
  
  if (town.precipitation_level_actual && parsed.climate.precipitation?.length > 0) {
    // Map town value to standard category first
    const standardizedPrecipitation = mapToStandardValue(town.precipitation_level_actual, 'precipitation')
    const precipitationResult = calculateGradualClimateScoreForArray(
      parsed.climate.precipitation, 
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
  } else if (!town.precipitation_level_actual && town.annual_rainfall && parsed.climate.precipitation?.length > 0) {
    // Fallback: use annual_rainfall data (in mm)
    let inferredPrecipitation = null
    
    if (town.annual_rainfall < 400) {
      inferredPrecipitation = 'mostly_dry'
    } else if (town.annual_rainfall < 1000) {
      inferredPrecipitation = 'balanced'
    } else {
      inferredPrecipitation = 'less_dry'
    }
    
    const precipitationResult = calculateGradualClimateScoreForArray(
      parsed.climate.precipitation, 
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
  } else if (!town.precipitation_level_actual && !town.annual_rainfall && town.climate_description && parsed.climate.precipitation?.length > 0) {
    // Last fallback: infer from climate description
    const climateDesc = typeof town.climate_description === 'string'
      ? normalize(town.climate_description)
      : ''
    let inferredPrecipitation = null

    if (climateDesc.includes('arid') || climateDesc.includes('desert') || climateDesc.includes('dry')) {
      inferredPrecipitation = 'mostly_dry'
    } else if (climateDesc.includes('mediterranean') || climateDesc.includes('temperate')) {
      inferredPrecipitation = 'balanced'
    } else if (climateDesc.includes('tropical') || climateDesc.includes('rainforest') || climateDesc.includes('wet')) {
      inferredPrecipitation = 'less_dry'
    }
    
    if (inferredPrecipitation) {
      const precipitationResult = calculateGradualClimateScoreForArray(
        parsed.climate.precipitation, 
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
  if (!parsed.climate.seasonal || 
      parsed.climate.seasonal === '' || 
      parsed.climate.seasonal === 'Optional' ||
      parsed.climate.seasonal === 'no_specific_preference' ||
      parsed.climate.seasonal === 'Select Preference' ||
      parsed.climate.seasonal === 'select_preference') {
    score += 15
    factors.push({ factor: 'Flexible on seasonal preferences', score: 15 })
  } 
  // Otherwise, apply seasonal matching if we have temperature data
  else if (town.avg_temp_summer !== null && town.avg_temp_summer !== undefined &&
           town.avg_temp_winter !== null && town.avg_temp_winter !== undefined) {

    const seasonPref = normalize(parsed.climate.seasonal)

    if (seasonPref === 'summer_focused' || seasonPref === 'warm_seasons' || seasonPref === 'prefer_warm_seasons') {
      // User prefers warm seasons - check if Summer Climate fits = 15 Pts
      let seasonScore = 0
      let summerFits = false

      // Check if summer climate matches preference
      if (parsed.climate.summer) {
        // Handle both array and string preferences
        const summerPrefs = Array.isArray(parsed.climate.summer)
          ? parsed.climate.summer.map(p => normalize(p))
          : [parsed.climate.summer].filter(Boolean).map(p => normalize(p))

        const townSummer = normalize(town.summer_climate_actual)

        if (townSummer && summerPrefs.includes(townSummer)) {
          summerFits = true
        } else if (town.avg_temp_summer !== null) {
          // Use temperature-based check as fallback - check against first preference
          const firstPref = Array.isArray(parsed.climate.summer)
            ? parsed.climate.summer[0]
            : parsed.climate.summer

          if (TEMP_RANGES.summer[firstPref]) {
            const tempScore = calculateTemperatureScore(town.avg_temp_summer, TEMP_RANGES.summer[firstPref])
            summerFits = tempScore >= 80 // Consider it a fit if temperature is good/perfect
          }
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
      if (parsed.climate.winter) {
        const standardizedWinter = mapToStandardValue(town.winter_climate_actual, 'winter')
        if (standardizedWinter === parsed.climate.winter) {
          winterFits = true
        } else if (town.avg_temp_winter !== null && TEMP_RANGES.winter[parsed.climate.winter]) {
          // Use temperature-based check as fallback
          const tempScore = calculateTemperatureScore(town.avg_temp_winter, TEMP_RANGES.winter[parsed.climate.winter])
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
      if (parsed.climate.summer) {
        // Handle both array and string preferences
        const summerPrefs = Array.isArray(parsed.climate.summer)
          ? parsed.climate.summer.map(p => normalize(p))
          : [parsed.climate.summer].filter(Boolean).map(p => normalize(p))

        const townSummer = normalize(town.summer_climate_actual)

        if (townSummer && summerPrefs.includes(townSummer)) {
          summerFits = true
        } else if (town.avg_temp_summer !== null) {
          // Use temperature-based check as fallback - check against first preference
          const firstPref = Array.isArray(parsed.climate.summer)
            ? parsed.climate.summer[0]
            : parsed.climate.summer

          if (TEMP_RANGES.summer[firstPref]) {
            const tempScore = calculateTemperatureScore(town.avg_temp_summer, TEMP_RANGES.summer[firstPref])
            summerFits = tempScore >= 80 // Consider it a fit if temperature is good/perfect
          }
        }
      } else {
        summerFits = true // No preference = fits
      }
      
      // Check if winter climate matches preference
      if (parsed.climate.winter) {
        const standardizedWinter = mapToStandardValue(town.winter_climate_actual, 'winter')
        if (standardizedWinter === parsed.climate.winter) {
          winterFits = true
        } else if (town.avg_temp_winter !== null && TEMP_RANGES.winter[parsed.climate.winter]) {
          // Use temperature-based check as fallback
          const tempScore = calculateTemperatureScore(town.avg_temp_winter, TEMP_RANGES.winter[parsed.climate.winter])
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

