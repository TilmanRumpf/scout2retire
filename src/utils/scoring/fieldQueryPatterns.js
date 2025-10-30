/**
 * INTELLIGENT SEARCH QUERY PATTERNS FOR TOWNS TABLE FIELDS
 *
 * This module maps database field names to optimized Google search queries.
 * Based on analysis of 195 fields in the towns table.
 *
 * PATTERN ANALYSIS:
 * - 8 COUNT fields (ending in _count)
 * - 24 RATING/SCORE fields (quality metrics 1-10)
 * - 6 DISTANCE fields (ending in _km or _distance)
 * - 14 COST fields (monetary values in USD)
 * - 20 BOOLEAN fields (true/false or yes/no)
 * - 7 AVAILABLE fields (comma-separated lists)
 * - 4 LEVEL fields (categorical: low/moderate/high)
 * - 6 ACTUAL fields (descriptive text)
 * - 4 QUALITY fields (categorical quality ratings)
 * - 3 INDEX fields (normalized scores)
 */

/**
 * Builds location string with proper formatting
 * @param {Object} town - Town object with name, region, country
 * @returns {string} Formatted location string
 */
export function buildLocationString(town) {
  const parts = [town.town_name];
  if (town.region) parts.push(town.region);
  parts.push(town.country);
  return parts.join(', ');
}

/**
 * PATTERN 1: COUNT FIELDS
 * Fields ending in _count → "How many X..."
 *
 * Examples:
 * - golf_courses_count
 * - hospital_count
 * - marinas_count
 */
export const COUNT_PATTERNS = {
  hospital_count: {
    template: (town) => `How many hospitals are in ${buildLocationString(town)}?`,
    expectedFormat: 'number (0-50)',
    searchTips: 'Include "medical facilities" or "healthcare centers" as alternatives',
    queryVariations: [
      (town) => `Number of hospitals in ${buildLocationString(town)}`,
      (town) => `${town.town_name} ${town.country} hospitals count`,
      (town) => `Medical facilities in ${buildLocationString(town)}`
    ]
  },

  golf_courses_count: {
    template: (town) => `How many golf courses are in ${buildLocationString(town)}?`,
    expectedFormat: 'number (0-20)',
    searchTips: 'Look for "golf clubs" as alternative',
    queryVariations: [
      (town) => `Number of golf courses ${buildLocationString(town)}`,
      (town) => `${town.town_name} ${town.country} golf facilities`
    ]
  },

  tennis_courts_count: {
    template: (town) => `How many tennis courts in ${buildLocationString(town)}?`,
    expectedFormat: 'number (0-30)',
    queryVariations: [
      (town) => `Tennis facilities ${buildLocationString(town)}`,
      (town) => `${town.town_name} tennis clubs count`
    ]
  },

  marinas_count: {
    template: (town) => `How many marinas in ${buildLocationString(town)}?`,
    expectedFormat: 'number (0-15)',
    searchTips: 'Include "yacht harbors" and "boat docks"',
    queryVariations: [
      (town) => `Number of marinas ${buildLocationString(town)}`,
      (town) => `${town.town_name} yacht harbors`
    ]
  },

  international_schools_count: {
    template: (town) => `How many international schools in ${buildLocationString(town)}?`,
    expectedFormat: 'number (0-20)',
    searchTips: 'Search for "English-speaking schools" and "expat schools"',
    queryVariations: [
      (town) => `International schools ${buildLocationString(town)}`,
      (town) => `${town.town_name} English-speaking schools list`
    ]
  },

  coworking_spaces_count: {
    template: (town) => `How many coworking spaces in ${buildLocationString(town)}?`,
    expectedFormat: 'number (0-30)',
    queryVariations: [
      (town) => `Coworking spaces ${buildLocationString(town)}`,
      (town) => `${town.town_name} ${town.country} shared offices`
    ]
  },

  veterinary_clinics_count: {
    template: (town) => `How many veterinary clinics in ${buildLocationString(town)}?`,
    expectedFormat: 'number (0-20)',
    queryVariations: [
      (town) => `Veterinary clinics ${buildLocationString(town)}`,
      (town) => `${town.town_name} animal hospitals count`
    ]
  },

  dog_parks_count: {
    template: (town) => `How many dog parks in ${buildLocationString(town)}?`,
    expectedFormat: 'number (0-15)',
    searchTips: 'Include "off-leash areas" and "pet recreation areas"',
    queryVariations: [
      (town) => `Dog parks ${buildLocationString(town)}`,
      (town) => `${town.town_name} pet-friendly parks`
    ]
  }
};

/**
 * PATTERN 2: RATING/SCORE FIELDS
 * Fields with _rating or _score → "Rate the X on a scale of 1-10"
 *
 * Examples:
 * - healthcare_score
 * - nightlife_rating
 * - outdoor_activities_rating
 */
export const RATING_PATTERNS = {
  healthcare_score: {
    template: (town) => `Rate the healthcare quality in ${buildLocationString(town)} on a scale of 1-10`,
    expectedFormat: '1-10 (numeric)',
    searchTips: 'Look for healthcare rankings, hospital quality reports, expat reviews',
    queryVariations: [
      (town) => `Healthcare quality rating ${buildLocationString(town)}`,
      (town) => `${town.town_name} ${town.country} medical care quality`,
      (town) => `Best hospitals ${buildLocationString(town)} quality score`
    ]
  },

  safety_score: {
    template: (town) => `Rate the safety and security in ${buildLocationString(town)} on a scale of 1-10`,
    expectedFormat: '1-10 (numeric)',
    searchTips: 'Check crime statistics, safety rankings, expat forums',
    queryVariations: [
      (town) => `Safety rating ${buildLocationString(town)}`,
      (town) => `${town.town_name} crime rate safety score`,
      (town) => `How safe is ${buildLocationString(town)}`
    ]
  },

  nightlife_rating: {
    template: (town) => `Rate the nightlife and entertainment scene in ${buildLocationString(town)} on a scale of 1-10`,
    expectedFormat: '1-10 (numeric)',
    queryVariations: [
      (town) => `Nightlife quality ${buildLocationString(town)}`,
      (town) => `${town.town_name} bars clubs entertainment rating`
    ]
  },

  restaurants_rating: {
    template: (town) => `Rate the restaurant and dining scene in ${buildLocationString(town)} on a scale of 1-10`,
    expectedFormat: '1-10 (numeric)',
    queryVariations: [
      (town) => `Restaurant quality ${buildLocationString(town)}`,
      (town) => `${town.town_name} dining scene rating`
    ]
  },

  outdoor_rating: {
    template: (town) => `Rate the outdoor activities and nature access in ${buildLocationString(town)} on a scale of 1-10`,
    expectedFormat: '1-10 (numeric)',
    queryVariations: [
      (town) => `Outdoor recreation rating ${buildLocationString(town)}`,
      (town) => `${town.town_name} nature activities quality`
    ]
  },

  cultural_rating: {
    template: (town) => `Rate the cultural attractions and arts scene in ${buildLocationString(town)} on a scale of 1-10`,
    expectedFormat: '1-10 (numeric)',
    queryVariations: [
      (town) => `Cultural activities ${buildLocationString(town)}`,
      (town) => `${town.town_name} arts and culture rating`
    ]
  },

  museums_rating: {
    template: (town) => `Rate the museums and galleries in ${buildLocationString(town)} on a scale of 1-10`,
    expectedFormat: '1-10 (numeric)',
    queryVariations: [
      (town) => `Museum quality ${buildLocationString(town)}`,
      (town) => `${town.town_name} museums rating`
    ]
  },

  shopping_rating: {
    template: (town) => `Rate the shopping options in ${buildLocationString(town)} on a scale of 1-10`,
    expectedFormat: '1-10 (numeric)',
    queryVariations: [
      (town) => `Shopping quality ${buildLocationString(town)}`,
      (town) => `${town.town_name} retail shopping rating`
    ]
  },

  wellness_rating: {
    template: (town) => `Rate the wellness facilities (spas, gyms, yoga) in ${buildLocationString(town)} on a scale of 1-10`,
    expectedFormat: '1-10 (numeric)',
    queryVariations: [
      (town) => `Wellness facilities ${buildLocationString(town)}`,
      (town) => `${town.town_name} fitness and wellness rating`
    ]
  }
};

/**
 * PATTERN 3: DISTANCE FIELDS
 * Fields with _km or _distance → "How far is X from Y?"
 *
 * Examples:
 * - airport_distance
 * - nearest_major_hospital_km
 * - distance_to_ocean_km
 */
export const DISTANCE_PATTERNS = {
  airport_distance: {
    template: (town) => `What is the distance from ${buildLocationString(town)} to the nearest international airport in kilometers?`,
    expectedFormat: 'number (0-500) km',
    searchTips: 'Look for "nearest airport to [town]" or "[town] airport distance"',
    queryVariations: [
      (town) => `Nearest airport to ${buildLocationString(town)}`,
      (town) => `${town.town_name} ${town.country} airport distance kilometers`,
      (town) => `How far is ${town.town_name} from nearest airport`
    ]
  },

  nearest_major_hospital_km: {
    template: (town) => `What is the distance from ${buildLocationString(town)} to the nearest major hospital in kilometers?`,
    expectedFormat: 'number (0-100) km',
    queryVariations: [
      (town) => `Nearest hospital to ${buildLocationString(town)}`,
      (town) => `${town.town_name} hospital distance`
    ]
  },

  distance_to_ocean_km: {
    template: (town) => `What is the distance from ${buildLocationString(town)} to the nearest ocean or sea in kilometers?`,
    expectedFormat: 'number (0-500) km, or 0 if coastal',
    searchTips: 'Check if town is coastal first, then calculate distance',
    queryVariations: [
      (town) => `${town.town_name} distance to coast`,
      (town) => `How far is ${buildLocationString(town)} from ocean`
    ]
  },

  hiking_trails_km: {
    template: (town) => `What is the distance from ${buildLocationString(town)} to hiking trails in kilometers?`,
    expectedFormat: 'number (0-100) km',
    queryVariations: [
      (town) => `Hiking near ${buildLocationString(town)}`,
      (town) => `${town.town_name} hiking trails distance`
    ]
  },

  regional_airport_distance: {
    template: (town) => `What is the distance from ${buildLocationString(town)} to the nearest regional airport in kilometers?`,
    expectedFormat: 'number (0-300) km',
    queryVariations: [
      (town) => `Regional airport near ${buildLocationString(town)}`,
      (town) => `${town.town_name} domestic airport distance`
    ]
  },

  international_airport_distance: {
    template: (town) => `What is the distance from ${buildLocationString(town)} to the nearest international airport in kilometers?`,
    expectedFormat: 'number (0-500) km',
    queryVariations: [
      (town) => `International airport ${buildLocationString(town)}`,
      (town) => `${town.town_name} major airport distance`
    ]
  }
};

/**
 * PATTERN 4: COST FIELDS
 * Fields with _cost or _usd → "What is the average cost of X in Y?"
 *
 * Examples:
 * - cost_of_living_usd
 * - healthcare_cost_monthly
 * - rent_2bed_usd
 */
export const COST_PATTERNS = {
  cost_of_living_usd: {
    template: (town) => `What is the average monthly cost of living in ${buildLocationString(town)} in USD?`,
    expectedFormat: 'number (500-5000) USD',
    searchTips: 'Check Numbeo, Expatistan, or local expat forums',
    queryVariations: [
      (town) => `Cost of living ${buildLocationString(town)} USD`,
      (town) => `${town.town_name} ${town.country} monthly expenses`,
      (town) => `How much to live in ${buildLocationString(town)}`
    ]
  },

  healthcare_cost_monthly: {
    template: (town) => `What is the average monthly healthcare cost in ${buildLocationString(town)} in USD?`,
    expectedFormat: 'number (50-500) USD',
    queryVariations: [
      (town) => `Healthcare costs ${buildLocationString(town)}`,
      (town) => `${town.town_name} medical expenses monthly`
    ]
  },

  rent_2bed_usd: {
    template: (town) => `What is the average monthly rent for a 2-bedroom apartment in ${buildLocationString(town)} in USD?`,
    expectedFormat: 'number (300-3000) USD',
    queryVariations: [
      (town) => `Rent 2 bedroom ${buildLocationString(town)}`,
      (town) => `${town.town_name} apartment rental prices`
    ]
  },

  groceries_cost: {
    template: (town) => `What is the average monthly grocery cost in ${buildLocationString(town)} in USD?`,
    expectedFormat: 'number (200-800) USD',
    queryVariations: [
      (town) => `Grocery costs ${buildLocationString(town)}`,
      (town) => `${town.town_name} food shopping expenses`
    ]
  },

  utilities_cost: {
    template: (town) => `What is the average monthly utilities cost in ${buildLocationString(town)} in USD?`,
    expectedFormat: 'number (50-300) USD',
    queryVariations: [
      (town) => `Utilities costs ${buildLocationString(town)}`,
      (town) => `${town.town_name} electricity water internet costs`
    ]
  },

  meal_cost: {
    template: (town) => `What is the average cost of a meal at a mid-range restaurant in ${buildLocationString(town)} in USD?`,
    expectedFormat: 'number (5-50) USD',
    queryVariations: [
      (town) => `Restaurant meal price ${buildLocationString(town)}`,
      (town) => `${town.town_name} dining costs average`
    ]
  },

  typical_home_price: {
    template: (town) => `What is the average home purchase price in ${buildLocationString(town)} in USD?`,
    expectedFormat: 'number (50000-1000000) USD',
    queryVariations: [
      (town) => `Home prices ${buildLocationString(town)}`,
      (town) => `${town.town_name} real estate average price`
    ]
  }
};

/**
 * PATTERN 5: BOOLEAN FIELDS
 * Fields like has_X, is_X, or _available → "Does X have Y?"
 *
 * Examples:
 * - has_uber
 * - retirement_visa_available
 * - beaches_nearby
 */
export const BOOLEAN_PATTERNS = {
  has_uber: {
    template: (town) => `Is Uber available in ${buildLocationString(town)}?`,
    expectedFormat: 'Yes or No',
    queryVariations: [
      (town) => `Uber ${buildLocationString(town)}`,
      (town) => `${town.town_name} ${town.country} Uber service`
    ]
  },

  has_public_transit: {
    template: (town) => `Does ${buildLocationString(town)} have public transportation?`,
    expectedFormat: 'Yes or No',
    queryVariations: [
      (town) => `Public transport ${buildLocationString(town)}`,
      (town) => `${town.town_name} buses trains metro`
    ]
  },

  retirement_visa_available: {
    template: (town) => `Does ${town.country} offer a retirement visa for ${town.town_name}?`,
    expectedFormat: 'Yes or No',
    searchTips: 'Check country-level visa requirements',
    queryVariations: [
      (town) => `${town.country} retirement visa`,
      (town) => `Retire in ${town.country} visa requirements`
    ]
  },

  digital_nomad_visa: {
    template: (town) => `Does ${town.country} offer a digital nomad visa?`,
    expectedFormat: 'Yes or No',
    queryVariations: [
      (town) => `${town.country} digital nomad visa`,
      (town) => `Remote work visa ${town.country}`
    ]
  },

  beaches_nearby: {
    template: (town) => `Are there beaches near ${buildLocationString(town)}?`,
    expectedFormat: 'Yes or No',
    queryVariations: [
      (town) => `Beaches near ${buildLocationString(town)}`,
      (town) => `${town.town_name} beach access`
    ]
  },

  farmers_markets: {
    template: (town) => `Does ${buildLocationString(town)} have farmers markets?`,
    expectedFormat: 'Yes or No',
    queryVariations: [
      (town) => `Farmers market ${buildLocationString(town)}`,
      (town) => `${town.town_name} fresh produce markets`
    ]
  },

  english_speaking_doctors: {
    template: (town) => `Are there English-speaking doctors in ${buildLocationString(town)}?`,
    expectedFormat: 'Yes or No',
    queryVariations: [
      (town) => `English doctors ${buildLocationString(town)}`,
      (town) => `${town.town_name} English-speaking healthcare`
    ]
  }
};

/**
 * PATTERN 6: LEVEL FIELDS
 * Fields ending in _level → Categorical values (low, moderate, high)
 *
 * Examples:
 * - sunshine_level_actual
 * - humidity_level_actual
 * - precipitation_level_actual
 */
export const LEVEL_PATTERNS = {
  sunshine_level_actual: {
    template: (town) => `What is the sunshine level in ${buildLocationString(town)}?`,
    expectedFormat: 'low, less_sunny, balanced, high, often_sunny',
    searchTips: 'Look for "sunshine hours per year" or "sunny days per year"',
    queryVariations: [
      (town) => `Sunshine hours ${buildLocationString(town)}`,
      (town) => `${town.town_name} sunny days per year`,
      (town) => `How sunny is ${buildLocationString(town)}`
    ]
  },

  humidity_level_actual: {
    template: (town) => `What is the humidity level in ${buildLocationString(town)}?`,
    expectedFormat: 'low, moderate, high',
    queryVariations: [
      (town) => `Humidity ${buildLocationString(town)}`,
      (town) => `${town.town_name} average humidity`
    ]
  },

  precipitation_level_actual: {
    template: (town) => `What is the precipitation level in ${buildLocationString(town)}?`,
    expectedFormat: 'low, mostly_dry, balanced, high, less_dry',
    queryVariations: [
      (town) => `Rainfall ${buildLocationString(town)}`,
      (town) => `${town.town_name} annual precipitation`
    ]
  },

  english_proficiency_level: {
    template: (town) => `What is the English proficiency level in ${buildLocationString(town)}?`,
    expectedFormat: 'low, moderate, high, native',
    queryVariations: [
      (town) => `English spoken ${buildLocationString(town)}`,
      (town) => `${town.town_name} ${town.country} English proficiency`
    ]
  }
};

/**
 * PATTERN 7: ACTUAL FIELDS
 * Fields ending in _actual → Descriptive categorical values
 *
 * Examples:
 * - pace_of_life_actual
 * - social_atmosphere
 * - geographic_features_actual
 */
export const ACTUAL_PATTERNS = {
  pace_of_life_actual: {
    template: (town) => `What is the pace of life in ${buildLocationString(town)}?`,
    expectedFormat: 'slow, relaxed, moderate, fast',
    searchTips: 'Look for expat reviews, lifestyle articles about the town',
    queryVariations: [
      (town) => `Pace of life ${buildLocationString(town)}`,
      (town) => `${town.town_name} lifestyle speed`,
      (town) => `Is ${buildLocationString(town)} relaxed or busy`
    ]
  },

  social_atmosphere: {
    template: (town) => `What is the social atmosphere in ${buildLocationString(town)}?`,
    expectedFormat: 'reserved, quiet, moderate, friendly, vibrant, very friendly',
    queryVariations: [
      (town) => `Social life ${buildLocationString(town)}`,
      (town) => `${town.town_name} community atmosphere`
    ]
  },

  geographic_features_actual: {
    template: (town) => `What are the geographic features of ${buildLocationString(town)}?`,
    expectedFormat: 'coastal, mountain, valley, plains, island, etc.',
    queryVariations: [
      (town) => `Geography ${buildLocationString(town)}`,
      (town) => `${town.town_name} terrain landscape`
    ]
  },

  vegetation_type_actual: {
    template: (town) => `What type of vegetation surrounds ${buildLocationString(town)}?`,
    expectedFormat: 'desert, forest, grassland, tropical, etc.',
    queryVariations: [
      (town) => `Vegetation ${buildLocationString(town)}`,
      (town) => `${town.town_name} natural environment`
    ]
  },

  summer_climate_actual: {
    template: (town) => `What is the summer climate like in ${buildLocationString(town)}?`,
    expectedFormat: 'hot, warm, mild, cool (descriptive)',
    queryVariations: [
      (town) => `Summer weather ${buildLocationString(town)}`,
      (town) => `${town.town_name} summer temperature`
    ]
  },

  winter_climate_actual: {
    template: (town) => `What is the winter climate like in ${buildLocationString(town)}?`,
    expectedFormat: 'cold, cool, mild, warm (descriptive)',
    queryVariations: [
      (town) => `Winter weather ${buildLocationString(town)}`,
      (town) => `${town.town_name} winter temperature`
    ]
  }
};

/**
 * PATTERN 8: QUALITY FIELDS
 * Fields with _quality → Categorical quality ratings
 *
 * Examples:
 * - public_transport_quality
 * - emergency_services_quality
 * - road_quality
 */
export const QUALITY_PATTERNS = {
  public_transport_quality: {
    template: (town) => `What is the public transportation quality in ${buildLocationString(town)}?`,
    expectedFormat: 'poor, basic, adequate, good, excellent',
    queryVariations: [
      (town) => `Public transport quality ${buildLocationString(town)}`,
      (town) => `${town.town_name} bus train service rating`
    ]
  },

  emergency_services_quality: {
    template: (town) => `What is the emergency services quality in ${buildLocationString(town)}?`,
    expectedFormat: 'poor, basic, adequate, good, excellent',
    queryVariations: [
      (town) => `Emergency services ${buildLocationString(town)}`,
      (town) => `${town.town_name} ambulance fire police quality`
    ]
  },

  road_quality: {
    template: (town) => `What is the road quality in ${buildLocationString(town)}?`,
    expectedFormat: 'poor, basic, adequate, good, excellent',
    queryVariations: [
      (town) => `Road conditions ${buildLocationString(town)}`,
      (town) => `${town.town_name} infrastructure roads`
    ]
  }
};

/**
 * PATTERN 9: SPECIAL FIELDS (Comma-separated lists)
 * Fields like activities_available, healthcare_specialties_available
 */
export const LIST_PATTERNS = {
  activities_available: {
    template: (town) => `What outdoor and recreational activities are available in ${buildLocationString(town)}?`,
    expectedFormat: 'comma-separated list',
    searchTips: 'Look for tourism sites, activity guides, local recreation departments',
    queryVariations: [
      (town) => `Things to do ${buildLocationString(town)}`,
      (town) => `${town.town_name} activities and recreation`,
      (town) => `Outdoor activities near ${buildLocationString(town)}`
    ]
  },

  healthcare_specialties_available: {
    template: (town) => `What medical specialties are available in ${buildLocationString(town)}?`,
    expectedFormat: 'comma-separated list (cardiology, oncology, etc.)',
    queryVariations: [
      (town) => `Medical specialties ${buildLocationString(town)}`,
      (town) => `${town.town_name} specialist doctors available`
    ]
  },

  water_sports_available: {
    template: (town) => `What water sports are available in ${buildLocationString(town)}?`,
    expectedFormat: 'comma-separated list',
    queryVariations: [
      (town) => `Water sports ${buildLocationString(town)}`,
      (town) => `${town.town_name} beach ocean activities`
    ]
  }
};

/**
 * Get the appropriate query pattern for any field
 * @param {string} fieldName - Database field name
 * @param {Object} town - Town object with name, region, country
 * @returns {Object|null} Query pattern object or null if no pattern found
 */
export function getQueryPattern(fieldName, town) {
  // Check all pattern categories
  const allPatterns = {
    ...COUNT_PATTERNS,
    ...RATING_PATTERNS,
    ...DISTANCE_PATTERNS,
    ...COST_PATTERNS,
    ...BOOLEAN_PATTERNS,
    ...LEVEL_PATTERNS,
    ...ACTUAL_PATTERNS,
    ...QUALITY_PATTERNS,
    ...LIST_PATTERNS
  };

  const pattern = allPatterns[fieldName];
  if (!pattern) return null;

  // Build the query using the template
  return {
    primaryQuery: pattern.template(town),
    variations: pattern.queryVariations?.map(fn => fn(town)) || [],
    expectedFormat: pattern.expectedFormat,
    searchTips: pattern.searchTips
  };
}

/**
 * Get query patterns for multiple fields
 * @param {Array<string>} fieldNames - Array of field names
 * @param {Object} town - Town object
 * @returns {Array<Object>} Array of query pattern objects
 */
export function getQueryPatterns(fieldNames, town) {
  return fieldNames
    .map(fieldName => ({
      field: fieldName,
      ...getQueryPattern(fieldName, town)
    }))
    .filter(pattern => pattern.primaryQuery !== null);
}

/**
 * EDGE CASES AND SPECIAL HANDLING
 */
export const EDGE_CASES = {
  // Fields that need country-level queries, not town-level
  countryLevel: [
    'retirement_visa_available',
    'digital_nomad_visa',
    'visa_requirements',
    'tax_treaty_us',
    'tax_haven_status',
    'foreign_income_taxed'
  ],

  // Fields that may not apply to all towns (conditional)
  conditional: {
    marinas_count: (town) => town.distance_to_ocean_km === 0, // Only for coastal towns
    water_sports_available: (town) => town.distance_to_ocean_km < 50,
    beaches_nearby: (town) => town.distance_to_ocean_km < 30
  },

  // Fields that need calculation or derived values
  calculated: [
    'cost_index', // Relative to other towns
    'data_completeness_score' // Internal metric
  ],

  // Fields that are coordinates or identifiers (never query)
  noQuery: [
    'id',
    'latitude',
    'longitude',
    'google_maps_link',
    'image_url_1',
    'image_url_2',
    'image_url_3'
  ]
};

/**
 * Check if a field should be queried
 * @param {string} fieldName - Field to check
 * @param {Object} town - Town object for conditional checks
 * @returns {boolean} Whether field should be queried
 */
export function shouldQueryField(fieldName, town) {
  // Never query these
  if (EDGE_CASES.noQuery.includes(fieldName)) return false;
  if (EDGE_CASES.calculated.includes(fieldName)) return false;

  // Check conditional fields
  const condition = EDGE_CASES.conditional[fieldName];
  if (condition && !condition(town)) return false;

  return true;
}
