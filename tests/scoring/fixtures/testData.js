/**
 * Test fixtures for scoring golden master tests
 *
 * These fixtures are used to create reproducible test scenarios
 * for verifying scoring algorithm behavior.
 */

/**
 * Complete user preferences - representative of a detailed onboarding
 */
export const testUserComplete = {
  current_status: {
    citizenship: 'USA',
    timeline: 'within_2_years',
    family_situation: 'couple'
  },

  region_preferences: {
    country: 'Spain',
    region: ['Europe', 'Mediterranean'],
    states: ['Valencia'],
    geographic_features: ['coastal', 'mountain'],
    vegetation_type: ['mediterranean', 'temperate']
  },

  climate_preferences: {
    summer_climate: ['warm'],
    winter_climate: ['mild'],
    humidity_level: ['balanced'],
    sunshine_level: ['high', 'often_sunny'],
    precipitation_level: ['low', 'moderate'],
    seasonal_variation: ['distinct', 'moderate']
  },

  culture_preferences: {
    urban_rural_character: ['suburban', 'small_town'],
    pace_of_life: ['relaxed', 'moderate'],
    language_preference: ['some_english', 'learn_local'],
    expat_community: ['moderate', 'strong'],
    dining_scene_quality: ['good', 'excellent'],
    cultural_events_frequency: ['regular', 'frequent'],
    museums_and_culture: ['moderate', 'rich']
  },

  hobbies_preferences: {
    hobbies: [
      'hiking', 'beach_activities', 'cycling',
      'dining_out', 'wine_tasting', 'nature_walks',
      'photography', 'golf', 'swimming'
    ]
  },

  admin_preferences: {
    healthcare_quality: ['good', 'excellent'],
    safety_priority: ['moderate', 'high'],
    government_quality: ['functional', 'good'],
    visa_requirements: ['reasonable', 'easy'],
    environmental_quality: ['good', 'excellent'],
    political_stability: ['stable', 'very_stable']
  },

  cost_preferences: {
    budget_monthly: 2500, // USD
    rent_budget: 1200,
    healthcare_cost_tolerance: 'moderate',
    tax_preference: 'moderate'
  }
};

/**
 * Minimal user preferences - only country specified
 * Used to test missing data fallback behavior
 */
export const testUserMinimal = {
  current_status: {
    citizenship: 'USA',
    timeline: 'within_2_years',
    family_situation: 'single'
  },

  region_preferences: {
    country: 'Spain'
    // All other preferences missing
  },

  climate_preferences: {},
  culture_preferences: {},
  hobbies_preferences: {},
  admin_preferences: {},
  cost_preferences: {}
};

/**
 * User with mixed preferences - some categories filled, others empty
 */
export const testUserMixed = {
  current_status: {
    citizenship: 'USA',
    timeline: 'within_5_years',
    family_situation: 'couple'
  },

  region_preferences: {
    country: 'Spain',
    region: ['Europe']
  },

  climate_preferences: {
    summer_climate: ['warm'],
    winter_climate: ['mild']
    // Other climate prefs missing
  },

  culture_preferences: {
    urban_rural_character: ['suburban']
    // Other culture prefs missing
  },

  hobbies_preferences: {
    hobbies: ['hiking', 'dining_out']
  },

  admin_preferences: {},

  cost_preferences: {
    budget_monthly: 2000
    // Other cost prefs missing
  }
};

/**
 * Perfect match town - Valencia, Spain
 * Should score very high (~85%+) with testUserComplete
 */
export const testTownValencia = {
  id: 'test-town-valencia',
  town_name: 'Valencia',
  country: 'Spain',
  state_code: 'VC',
  region: 'Europe',
  published: true,

  // Region attributes - stored as arrays in database
  geographic_features_actual: ['coastal'],
  vegetation_type_actual: ['mediterranean'],

  // Climate attributes
  summer_climate_actual: 'warm',
  winter_climate_actual: 'mild',
  humidity_level_actual: 'balanced',
  sunshine_level_actual: 'high',
  precipitation_level_actual: 'low',
  seasonal_variation_actual: 'distinct',
  avg_summer_high_c: 28,
  avg_summer_low_c: 18,
  avg_winter_high_c: 16,
  avg_winter_low_c: 7,

  // Culture attributes
  urban_rural_character: 'suburban',
  pace_of_life_actual: 'relaxed',
  english_proficiency_level: 'some',
  expat_community_size: 'moderate',
  dining_scene_quality: 'excellent',
  cultural_events_frequency: 'frequent',
  museums_and_culture_rating: 'rich',

  // Admin attributes
  healthcare_quality_rating: 'excellent',
  crime_rate: 'low',
  natural_disaster_risk_level: 'low',
  emergency_services_quality: 'excellent',
  english_speaking_doctors: 'common',
  government_efficiency_rating: 'good',
  visa_difficulty_rating: 'reasonable',
  environmental_quality_rating: 'good',
  political_stability_rating: 'stable',

  // Cost attributes
  cost_index: 65, // Mid-range
  rent_1br_center_usd: 900,
  healthcare_cost_level: 'moderate',
  tax_burden_category: 'moderate'
};

/**
 * Poor match town - Bangkok, Thailand
 * Should score low (~20-30%) with testUserComplete
 * Hot/humid climate, urban environment - opposite of preferences
 */
export const testTownBangkok = {
  id: 'test-town-bangkok',
  town_name: 'Bangkok',
  country: 'Thailand',
  state_code: null,
  region: 'Southeast Asia',
  published: true,

  // Region attributes (opposite) - stored as arrays in database
  geographic_features_actual: ['plains'],
  vegetation_type_actual: ['tropical'],

  // Climate attributes (hot & humid vs mild preference)
  summer_climate_actual: 'hot',
  winter_climate_actual: 'warm',
  humidity_level_actual: 'humid',
  sunshine_level_actual: 'high',
  precipitation_level_actual: 'high',
  seasonal_variation_actual: 'minimal',
  avg_summer_high_c: 35,
  avg_summer_low_c: 26,
  avg_winter_high_c: 32,
  avg_winter_low_c: 22,

  // Culture attributes (urban vs suburban preference)
  urban_rural_character: 'urban',
  pace_of_life_actual: 'fast',
  english_proficiency_level: 'some',
  expat_community_size: 'strong',
  dining_scene_quality: 'excellent',
  cultural_events_frequency: 'frequent',
  museums_and_culture_rating: 'rich',

  // Admin attributes
  healthcare_quality_rating: 'good',
  crime_rate: 'moderate',
  natural_disaster_risk_level: 'moderate',
  emergency_services_quality: 'good',
  english_speaking_doctors: 'common',
  government_efficiency_rating: 'functional',
  visa_difficulty_rating: 'easy',
  environmental_quality_rating: 'basic',
  political_stability_rating: 'stable',

  // Cost attributes (lower cost)
  cost_index: 45,
  rent_1br_center_usd: 600,
  healthcare_cost_level: 'low',
  tax_burden_category: 'low'
};

/**
 * Partial match town - Porto, Portugal
 * Should score mid-range (~55-65%) with testUserComplete
 * Right region/climate, but different country
 */
export const testTownPorto = {
  id: 'test-town-porto',
  town_name: 'Porto',
  country: 'Portugal',
  state_code: null,
  region: 'Europe',
  published: true,

  // Region attributes (similar) - stored as arrays in database
  geographic_features_actual: ['coastal'],
  vegetation_type_actual: ['mediterranean'],

  // Climate attributes (similar)
  summer_climate_actual: 'warm',
  winter_climate_actual: 'mild',
  humidity_level_actual: 'balanced',
  sunshine_level_actual: 'high',
  precipitation_level_actual: 'moderate',
  seasonal_variation_actual: 'distinct',
  avg_summer_high_c: 25,
  avg_summer_low_c: 16,
  avg_winter_high_c: 14,
  avg_winter_low_c: 6,

  // Culture attributes (mostly similar)
  urban_rural_character: 'small_town',
  pace_of_life_actual: 'relaxed',
  english_proficiency_level: 'some',
  expat_community_size: 'limited',
  dining_scene_quality: 'good',
  cultural_events_frequency: 'regular',
  museums_and_culture_rating: 'moderate',

  // Admin attributes
  healthcare_quality_rating: 'good',
  crime_rate: 'low',
  natural_disaster_risk_level: 'low',
  emergency_services_quality: 'good',
  english_speaking_doctors: 'some',
  government_efficiency_rating: 'functional',
  visa_difficulty_rating: 'reasonable',
  environmental_quality_rating: 'good',
  political_stability_rating: 'stable',

  // Cost attributes (lower cost)
  cost_index: 55,
  rent_1br_center_usd: 700,
  healthcare_cost_level: 'moderate',
  tax_burden_category: 'moderate'
};

/**
 * All test cases combining users and towns
 * Each entry represents a scoring scenario we want to capture
 */
export const testCases = [
  {
    name: 'complete_valencia_perfect_match',
    user: testUserComplete,
    town: testTownValencia,
    expectedRange: { min: 80, max: 100 } // Expect excellent match
  },
  {
    name: 'complete_bangkok_poor_match',
    user: testUserComplete,
    town: testTownBangkok,
    expectedRange: { min: 15, max: 35 } // Expect poor match
  },
  {
    name: 'complete_porto_partial_match',
    user: testUserComplete,
    town: testTownPorto,
    expectedRange: { min: 50, max: 70 } // Expect fair to good match
  },
  {
    name: 'minimal_valencia_fallback',
    user: testUserMinimal,
    town: testTownValencia,
    expectedRange: { min: 15, max: 30 } // Minimal prefs = low score (mostly missing data)
  },
  {
    name: 'minimal_bangkok_fallback',
    user: testUserMinimal,
    town: testTownBangkok,
    expectedRange: { min: 15, max: 30 } // Similar - mostly missing data
  },
  {
    name: 'mixed_valencia_moderate',
    user: testUserMixed,
    town: testTownValencia,
    expectedRange: { min: 45, max: 70 } // Some prefs match, others missing
  }
];
