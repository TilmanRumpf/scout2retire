/**
 * Climate data inference utilities
 * Used when direct climate data is missing from towns
 */

/**
 * Infer humidity level from available town data
 * Priority: 1) Climate description, 2) Rainfall data, 3) Geographic features
 * 
 * @param {Object} town - Town data object
 * @returns {Object} { value: inferred humidity value, source: inference source, confidence: high/medium/low }
 */
export function inferHumidity(town) {
  // Priority 1: Check climate description for keywords
  if (town.climate_description) {
    const desc = town.climate_description.toLowerCase();
    
    // High confidence keywords
    if (desc.includes('humid') || desc.includes('muggy') || desc.includes('moist')) {
      return { value: 'humid', source: 'climate_description', confidence: 'high' };
    }
    if (desc.includes('dry') || desc.includes('arid') || desc.includes('desert')) {
      return { value: 'dry', source: 'climate_description', confidence: 'high' };
    }
    if (desc.includes('mediterranean')) {
      return { value: 'balanced', source: 'climate_description', confidence: 'high' };
    }
    
    // Medium confidence keywords
    if (desc.includes('tropical') || desc.includes('rainforest')) {
      return { value: 'humid', source: 'climate_description', confidence: 'medium' };
    }
    if (desc.includes('temperate')) {
      return { value: 'balanced', source: 'climate_description', confidence: 'medium' };
    }
  }
  
  // Priority 2: Use annual rainfall data
  if (town.annual_rainfall !== null && town.annual_rainfall !== undefined) {
    if (town.annual_rainfall < 400) {
      return { value: 'dry', source: 'annual_rainfall', confidence: 'high' };
    } else if (town.annual_rainfall > 1200) {
      return { value: 'humid', source: 'annual_rainfall', confidence: 'high' };
    } else {
      return { value: 'balanced', source: 'annual_rainfall', confidence: 'medium' };
    }
  }
  
  // Priority 3: Geographic features (lower confidence)
  if (town.geographic_features_actual || town.beaches_nearby) {
    const features = town.geographic_features_actual || [];
    
    if (features.includes('Desert')) {
      return { value: 'dry', source: 'geographic_features', confidence: 'medium' };
    }
    if (features.includes('Coastal') || town.beaches_nearby) {
      // Coastal areas tend to be more humid, but not always
      return { value: 'humid', source: 'geographic_features', confidence: 'low' };
    }
    if (features.includes('Mountains') && !features.includes('Coastal')) {
      // Mountain areas tend to be drier
      return { value: 'balanced', source: 'geographic_features', confidence: 'low' };
    }
  }
  
  // No inference possible
  return { value: null, source: null, confidence: null };
}

/**
 * Infer summer climate from temperature data
 * Updated to match marketing-friendly database labels (July 27, 2025)
 * @param {number} avgTempSummer - Average summer temperature in Celsius
 * @returns {string|null} - Inferred climate category
 */
export function inferSummerClimate(avgTempSummer) {
  if (avgTempSummer === null || avgTempSummer === undefined) return null;
  
  // Marketing-friendly ranges that match database labels
  // Note: Some edge cases exist (e.g., Funchal at 23°C = "hot")
  // These are handled by trusting the database labels
  if (avgTempSummer < 15) return 'cool';
  if (avgTempSummer >= 15 && avgTempSummer <= 22) return 'mild';
  if (avgTempSummer > 22 && avgTempSummer < 27) return 'warm';
  if (avgTempSummer >= 27) return 'hot';
  
  return 'mild'; // Default fallback
}

/**
 * Infer winter climate from temperature data
 * Updated to match marketing-friendly database labels (July 27, 2025)
 * @param {number} avgTempWinter - Average winter temperature in Celsius
 * @returns {string|null} - Inferred climate category
 */
export function inferWinterClimate(avgTempWinter) {
  if (avgTempWinter === null || avgTempWinter === undefined) return null;
  
  // Marketing-friendly ranges that match database labels
  // Note: 12°C is often labeled "cool" in Mediterranean towns
  if (avgTempWinter <= 5) return 'cold';
  if (avgTempWinter > 5 && avgTempWinter <= 14) return 'cool';
  if (avgTempWinter > 14) return 'mild';
  
  return 'cool'; // Default fallback
}

/**
 * Map town climate values to our standardized three-tier system
 * @param {string} value - Original town value
 * @param {string} category - Climate category (summer, winter, humidity, sunshine, precipitation)
 * @returns {string} - Standardized value
 */
export function mapToStandardValue(value, category) {
  if (!value) return null;
  
  const mappings = {
    winter: {
      'warm': 'mild'  // Warm winters map to mild
    },
    humidity: {
      'low': 'dry',
      'dry': 'dry',
      'medium': 'balanced',
      'balanced': 'balanced',
      'high': 'humid',
      'humid': 'humid'
    },
    sunshine: {
      'less_sunny': 'less_sunny',
      'often_cloudy': 'less_sunny',
      'partly_sunny': 'less_sunny',
      'balanced': 'balanced',
      'mostly_sunny': 'often_sunny',
      'sunny': 'often_sunny',
      'abundant': 'often_sunny'
    },
    precipitation: {
      'dry': 'mostly_dry',
      'mostly_dry': 'mostly_dry',
      'moderate': 'balanced',
      'balanced': 'balanced',
      'often_rainy': 'often_rainy'
    }
  };
  
  // Return mapped value or original if no mapping needed
  return mappings[category]?.[value] || value;
}

/**
 * Get effective climate value with inference fallback
 * Updated July 27, 2025: Trust database labels when they exist (marketing-friendly approach)
 * @param {Object} town - Town data
 * @param {string} category - Climate category
 * @returns {Object} { value: string, isInferred: boolean, source: string, temperature: number|null }
 */
export function getEffectiveClimateValue(town, category) {
  let value = null;
  let isInferred = false;
  let source = 'actual';
  let temperature = null;
  
  switch (category) {
    case 'summer':
      value = town.summer_climate_actual;
      temperature = town.avg_temp_summer;
      // Only infer if label is missing
      if (!value && town.avg_temp_summer !== null) {
        value = inferSummerClimate(town.avg_temp_summer);
        isInferred = true;
        source = 'temperature';
      }
      break;
      
    case 'winter':
      value = town.winter_climate_actual;
      temperature = town.avg_temp_winter;
      // Only infer if label is missing
      if (!value && town.avg_temp_winter !== null) {
        value = inferWinterClimate(town.avg_temp_winter);
        isInferred = true;
        source = 'temperature';
      }
      break;
      
    case 'humidity':
      value = town.humidity_level_actual;
      if (!value) {
        const inference = inferHumidity(town);
        if (inference.value) {
          value = inference.value;
          isInferred = true;
          source = inference.source;
        }
      }
      break;
      
    case 'sunshine':
      value = town.sunshine_level_actual;
      // Could add sunshine inference from sunshine_hours if needed
      break;
      
    case 'precipitation':
      value = town.precipitation_level_actual;
      // Could add precipitation inference from annual_rainfall if needed
      break;
  }
  
  // Map to standard value
  if (value) {
    value = mapToStandardValue(value, category);
  }
  
  return { value, isInferred, source, temperature };
}