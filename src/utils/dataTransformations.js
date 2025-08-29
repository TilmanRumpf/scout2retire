/**
 * DATA TRANSFORMATION UTILITIES - V5.0 AUDITED
 * Handles all database <-> UI transformations
 * FIXED: Complete VALUE_LABEL_MAPS with all UI options
 */

/**
 * Convert database lowercase to UI Title Case
 * @param {string|Array|null|undefined} value - Database value(s)
 * @returns {string|Array|null|undefined} Title Case for display
 */
export const toTitleCase = (value) => {
  // FIXED: Added null/undefined handling
  if (value === null || value === undefined) return value;
  if (value === '') return '';
  
  const convertString = (str) => {
    // FIXED: Added type checking
    if (typeof str !== 'string') {
      console.warn('toTitleCase received non-string:', str);
      return String(str);
    }
    
    return str
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };
  
  if (Array.isArray(value)) {
    return value.map(v => v ? convertString(v) : v);
  }
  
  // Handle comma-separated strings from towns table
  if (typeof value === 'string' && value.includes(',')) {
    return value.split(',').map(v => convertString(v.trim())).join(', ');
  }
  
  return convertString(value);
};

/**
 * Convert UI input to database lowercase
 * @param {string|Array|null|undefined} value - UI value(s)  
 * @returns {string|Array|null|undefined} Lowercase for storage
 */
export const toDatabase = (value) => {
  // FIXED: Added null/undefined handling
  if (value === null || value === undefined) return value;
  if (value === '') return '';
  
  const convertString = (str) => {
    if (typeof str !== 'string') {
      console.warn('toDatabase received non-string:', str);
      return String(str).toLowerCase().trim();
    }
    // FIXED: Don't convert spaces to underscores for towns data
    return str.toLowerCase().trim();
  };
  
  if (Array.isArray(value)) {
    return value.filter(v => v).map(convertString);
  }
  
  return convertString(value);
};

/**
 * Transform database record for UI display
 * @param {Object} record - Database record
 * @param {Array} fieldsToTransform - Field names to transform
 * @returns {Object} Transformed record
 */
export const fromDatabase = (record, fieldsToTransform = []) => {
  if (!record) return record;
  
  const transformed = { ...record };
  
  fieldsToTransform.forEach(field => {
    if (transformed[field] !== null && transformed[field] !== undefined) {
      transformed[field] = toTitleCase(transformed[field]);
    }
  });
  
  return transformed;
};

// FIXED: Complete VALUE_LABEL_MAPS with all options from UI and database
export const VALUE_LABEL_MAPS = {
  geographic_features: {
    // ONLY user preference values - lowercase for case-insensitive matching
    'coastal': 'Coastal',
    'mountain': 'Mountain',
    'island': 'Island',
    'lake': 'Lake',
    'river': 'River',
    'valley': 'Valley',
    'desert': 'Desert',
    'forest': 'Forest',
    'plains': 'Plains'
  },
  geographic_features_actual: {  // For towns table
    'coastal': 'Coastal',
    'mountain': 'Mountain',
    'island': 'Island',
    'lake': 'Lake',
    'river': 'River',
    'valley': 'Valley',
    'desert': 'Desert',
    'forest': 'Forest',
    'plains': 'Plains'
  },
  vegetation_types: {
    // ONLY user preference values - lowercase for case-insensitive matching
    'tropical': 'Tropical',
    'subtropical': 'Subtropical',
    'mediterranean': 'Mediterranean',
    'forest': 'Forest',
    'grassland': 'Grassland',
    'desert': 'Desert'
  },
  vegetation_type_actual: {  // For towns table
    'tropical': 'Tropical',
    'subtropical': 'Subtropical',
    'mediterranean': 'Mediterranean',
    'forest': 'Forest',
    'grassland': 'Grassland',
    'desert': 'Desert'
  },
  activities: {
    'hiking': 'Hiking',
    'swimming': 'Swimming',
    'skiing': 'Skiing',
    'surfing': 'Surfing',
    'cycling': 'Cycling',
    'walking': 'Walking',
    'cooking': 'Cooking',
    'wine': 'Wine',
    'golf': 'Golf',
    'fishing': 'Fishing',
    'sailing': 'Sailing',
    'diving': 'Diving',
    'kayaking': 'Kayaking',
    'climbing': 'Climbing',
    'tennis': 'Tennis',
    'yoga': 'Yoga',
    'photography': 'Photography',
    'birdwatching': 'Birdwatching',
    'walking_cycling': 'Walking & Cycling', // Compound value
    'cooking_wine': 'Cooking & Wine' // Compound value
  },
  sunshine: {
    'often_sunny': 'Often Sunny',
    'balanced': 'Balanced',
    'less_sunny': 'Less Sunny'
    // NEVER add: mostly_sunny, abundant, sunny - these are INVALID!
  },
  sunshine_level_actual: {  // Added for towns table
    'often_sunny': 'Often Sunny',
    'balanced': 'Balanced',
    'less_sunny': 'Less Sunny'
    // NEVER add: mostly_sunny, abundant, sunny - these are INVALID!
  },
  precipitation: {
    'mostly_dry': 'Mostly Dry',
    'balanced': 'Balanced',
    'less_dry': 'Less Dry'
    // NEVER add: often_rainy, dry, moderate - these are INVALID!
  },
  humidity_level: {
    'dry': 'Dry',
    'balanced': 'Balanced',
    'humid': 'Humid'
    // ONLY user preference values: dry, balanced, humid
  },
  humidity_level_actual: {  // For towns table
    'dry': 'Dry',
    'balanced': 'Balanced',
    'humid': 'Humid'
    // ONLY user preference values: dry, balanced, humid
  },
  temperature_summer: {
    'hot': 'Hot',
    'warm': 'Warm',
    'mild': 'Mild',  // FIXED: was 'moderate' - user preference rules!
    'cool': 'Cool'
  },
  summer_climate_actual: {  // Added for towns table
    'hot': 'Hot',
    'warm': 'Warm',
    'mild': 'Mild'
    // ONLY these 3 values allowed!
  },
  temperature_winter: {
    'cold': 'Cold',
    'cool': 'Cool',
    'mild': 'Mild'
    // ONLY user preference values: cold, cool, mild - NO WARM!
  },
  winter_climate_actual: {  // For towns table
    'cold': 'Cold',
    'cool': 'Cool',
    'mild': 'Mild'
    // ONLY user preference values: cold, cool, mild - NO WARM!
  },
  // Culture fields
  expat_community_size: {
    'small': 'Small',
    'moderate': 'Moderate',
    'large': 'Large'
    // ONLY user preference values - NO expat_population field
  },
  pace_of_life_preference: {
    'relaxed': 'Relaxed',
    'moderate': 'Moderate',
    'fast': 'Fast'
  },
  pace_of_life_actual: {  // For towns table
    'relaxed': 'Relaxed',
    'moderate': 'Moderate',
    'fast': 'Fast'
  },
  urban_rural: {
    'rural': 'Rural',
    'suburban': 'Suburban',
    'urban': 'Urban'
  },
  urban_rural_character: {  // For towns table
    'rural': 'Rural',
    'suburban': 'Suburban',
    'urban': 'Urban'
  }
};

/**
 * Validate if a value is in the allowed list
 * @param {string} field - Field name to validate against
 * @param {string} value - Value to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidValue = (field, value) => {
  const validValues = VALUE_LABEL_MAPS[field];
  if (!validValues) return true; // No validation for unknown fields
  
  const normalizedValue = value?.toLowerCase?.();
  return normalizedValue && Object.keys(validValues).includes(normalizedValue);
};

/**
 * Expand compound values (e.g., 'walking_cycling' -> ['walking', 'cycling'])
 * @param {string} field - Field name
 * @param {Array} values - Array of values to expand
 * @returns {Array} Expanded array with individual values
 */
export const expandCompoundValues = (field, values) => {
  if (!Array.isArray(values)) return values;
  
  const expanded = new Set();
  
  values.forEach(value => {
    const normalized = value?.toLowerCase?.();
    
    // Handle compound values
    if (normalized === 'walking_cycling') {
      expanded.add('walking');
      expanded.add('cycling');
    } else if (normalized === 'cooking_wine') {
      expanded.add('cooking');
      expanded.add('wine');
    } else if (normalized === 'golf_tennis') {
      expanded.add('golf');
      expanded.add('tennis');
      expanded.add('pickleball');
      expanded.add('badminton');
    } else if (normalized === 'water_sports') {
      expanded.add('swimming');
      expanded.add('snorkeling');
    } else if (normalized === 'water_crafts') {
      expanded.add('kayaking');
      expanded.add('sailing');
      expanded.add('boating');
    } else if (normalized === 'winter_sports') {
      expanded.add('skiing');
      expanded.add('cross_country_skiing');
    } else if (normalized === 'music_theater') {
      expanded.add('music');
      expanded.add('theater');
    } else if (normalized) {
      expanded.add(normalized);
    }
  });
  
  return Array.from(expanded).sort();
};

/**
 * Get display label for a database value
 * @param {string} field - Field name
 * @param {string} value - Database value
 * @returns {string} Display label
 */
export const getDisplayLabel = (field, value) => {
  const map = VALUE_LABEL_MAPS[field];
  if (!map) return toTitleCase(value);
  
  const normalized = value?.toLowerCase?.();
  return map[normalized] || toTitleCase(value);
};

/**
 * Batch transform multiple fields
 * @param {Object} data - Data object to transform
 * @param {Object} fieldConfig - Config object { fieldName: 'toTitleCase' | 'toDatabase' }
 * @returns {Object} Transformed data
 */
export const batchTransform = (data, fieldConfig) => {
  const transformed = { ...data };
  
  Object.entries(fieldConfig).forEach(([field, transform]) => {
    if (data[field] !== undefined) {
      if (transform === 'toTitleCase') {
        transformed[field] = toTitleCase(data[field]);
      } else if (transform === 'toDatabase') {
        transformed[field] = toDatabase(data[field]);
      }
    }
  });
  
  return transformed;
};

// Export all functions
export default {
  toTitleCase,
  toDatabase,
  fromDatabase,
  VALUE_LABEL_MAPS,
  isValidValue,
  expandCompoundValues,
  getDisplayLabel,
  batchTransform
};