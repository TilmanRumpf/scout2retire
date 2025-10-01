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
  if (town.climate_description && typeof town.climate_description === 'string') {
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
 * MUST MATCH OnboardingClimate.jsx golden values: ['mild', 'warm', 'hot']
 * @param {number} avgTempSummer - Average summer temperature in Celsius
 * @returns {string|null} - Inferred climate category
 */
export function inferSummerClimate(avgTempSummer) {
  if (avgTempSummer === null || avgTempSummer === undefined) return null;

  // GOLDEN VALUES: mild, warm, hot (NO 'cool'!)
  if (avgTempSummer < 22) return 'mild';
  if (avgTempSummer >= 22 && avgTempSummer < 27) return 'warm';
  if (avgTempSummer >= 27) return 'hot';

  return 'mild'; // Default fallback
}

/**
 * Infer winter climate from temperature data
 * MUST MATCH OnboardingClimate.jsx golden values: ['cold', 'cool', 'mild']
 * @param {number} avgTempWinter - Average winter temperature in Celsius
 * @returns {string|null} - Inferred climate category
 */
export function inferWinterClimate(avgTempWinter) {
  if (avgTempWinter === null || avgTempWinter === undefined) return null;

  // GOLDEN VALUES: cold, cool, mild
  if (avgTempWinter <= 5) return 'cold';
  if (avgTempWinter > 5 && avgTempWinter <= 14) return 'cool';
  if (avgTempWinter > 14) return 'mild';

  return 'cool'; // Default fallback
}

/**
 * Map town climate values to GOLDEN onboarding values
 * CRITICAL: These MUST match OnboardingClimate.jsx exactly!
 * @param {string} value - Original town value
 * @param {string} category - Climate category (summer, winter, humidity, sunshine, precipitation)
 * @returns {string} - Standardized value
 */
export function mapToStandardValue(value, category) {
  if (!value) return null;

  // Normalize to lowercase for comparison
  const normalizedValue = String(value).toLowerCase().trim();

  const mappings = {
    summer: {
      // GOLDEN: ['mild', 'warm', 'hot']
      'mild': 'mild',
      'warm': 'warm',
      'hot': 'hot',
      // Map legacy/wrong values to closest golden value
      'cool': 'mild',
      'very hot': 'hot'
    },
    winter: {
      // GOLDEN: ['cold', 'cool', 'mild']
      'cold': 'cold',
      'cool': 'cool',
      'mild': 'mild',
      // Map legacy values
      'very cold': 'cold',
      'warm': 'mild'
    },
    humidity: {
      // GOLDEN: ['dry', 'balanced', 'humid']
      'dry': 'dry',
      'balanced': 'balanced',
      'humid': 'humid',
      // Map legacy/wrong values
      'very low': 'dry',
      'low': 'dry',
      'moderate': 'balanced',
      'high': 'humid',
      'very high': 'humid'
    },
    sunshine: {
      // GOLDEN: ['often_sunny', 'balanced', 'less_sunny']
      'often_sunny': 'often_sunny',
      'balanced': 'balanced',
      'less_sunny': 'less_sunny',
      // Map WRONG old values from TownsManager
      'limited': 'less_sunny',
      'moderate': 'balanced',
      'abundant': 'often_sunny',
      'very abundant': 'often_sunny',
      // Map other variations
      'sunny': 'often_sunny',
      'mostly_sunny': 'often_sunny',
      'cloudy': 'less_sunny',
      'often_cloudy': 'less_sunny'
    },
    precipitation: {
      // GOLDEN: ['mostly_dry', 'balanced', 'less_dry']
      'mostly_dry': 'mostly_dry',
      'balanced': 'balanced',
      'less_dry': 'less_dry',
      // Map WRONG old values from TownsManager
      'very low': 'mostly_dry',
      'low': 'mostly_dry',
      'moderate': 'balanced',
      'high': 'less_dry',
      'very high': 'less_dry',
      // Map other variations
      'dry': 'mostly_dry',
      'wet': 'less_dry',
      'rainy': 'less_dry',
      'often_rainy': 'less_dry'
    }
  };

  // Return mapped value or original if no mapping exists
  return mappings[category]?.[normalizedValue] || value;
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