/**
 * ADD TOWN CONFIGURATION
 *
 * All mappings, field lists, and configuration for the add-town utility.
 * NO HARDCODING in main files - everything configurable here.
 */

export const FIELD_TIERS = {
  // TIER 1: Critical - Required for town to exist
  critical: ['name', 'country', 'latitude', 'longitude'],

  // TIER 2: Important - Required for good matching
  important: [
    'region',
    'geo_region',
    'climate',
    'summer_climate_actual',
    'winter_climate_actual',
    'pace_of_life_actual',
    'cost_of_living_usd',
    'typical_monthly_living_cost'
  ],

  // TIER 3: Nice-to-have - Can be filled later
  // (Everything else is tier 3)
};

/**
 * Region mapping based on geographic coordinates
 */
export const REGION_MAPPING = {
  // Europe
  europe: {
    name: 'Europe',
    latRange: [35, 72],
    lonRange: [-25, 45]
  },
  // Asia
  asia: {
    name: 'Asia',
    latRange: [-10, 55],
    lonRange: [45, 150]
  },
  // Africa
  africa: {
    name: 'Africa',
    latRange: [-35, 37],
    lonRange: [-18, 52]
  },
  // North America
  north_america: {
    name: 'North America',
    latRange: [15, 72],
    lonRange: [-170, -50]
  },
  // South America
  south_america: {
    name: 'South America',
    latRange: [-56, 12],
    lonRange: [-82, -35]
  },
  // Oceania
  oceania: {
    name: 'Oceania',
    latRange: [-50, 0],
    lonRange: [110, 180]
  }
};

/**
 * Geo-region mapping for more specific regional classification
 */
export const GEO_REGION_MAPPING = {
  // Africa sub-regions
  'Guinea-Bissau': 'West Africa',
  'Nigeria': 'West Africa',
  'Ghana': 'West Africa',
  'Senegal': 'West Africa',
  'Mali': 'West Africa',

  // Europe sub-regions
  'Spain': 'Southern Europe',
  'Portugal': 'Southern Europe',
  'Italy': 'Southern Europe',
  'France': 'Western Europe',
  'Germany': 'Central Europe',

  // Add more as needed
};

/**
 * Climate categorization thresholds (Celsius)
 */
export const CLIMATE_THRESHOLDS = {
  summer_temp: {
    cold: { max: 15 },
    cool: { min: 15, max: 20 },
    mild: { min: 20, max: 25 },
    warm: { min: 25, max: 30 },
    hot: { min: 30 }
  },
  winter_temp: {
    cold: { max: 5 },
    cool: { min: 5, max: 12 },
    mild: { min: 12, max: 18 },
    warm: { min: 18, max: 25 },
    hot: { min: 25 }
  },
  sunshine_hours: {
    low: { max: 1800 },
    less_sunny: { min: 1800, max: 2200 },
    balanced: { min: 2200, max: 2600 },
    high: { min: 2600, max: 3000 },
    often_sunny: { min: 3000 }
  },
  annual_rainfall: {
    low: { max: 300 },
    mostly_dry: { min: 300, max: 600 },
    balanced: { min: 600, max: 1000 },
    high: { min: 1000, max: 1500 },
    less_dry: { min: 1500 }
  },
  humidity: {
    dry: { max: 50 },
    balanced: { min: 50, max: 70 },
    humid: { min: 70 }
  }
};

/**
 * Default structure for complex fields
 */
export const DEFAULT_STRUCTURES = {
  arrays: [
    'activities_available',
    'interests_supported',
    'top_hobbies',
    'water_bodies',
    'regions',
    'languages_spoken',
    'geographic_features_actual',
    'vegetation_type_actual',
    'healthcare_specialties_available',
    'local_mobility_options',
    'regional_connectivity',
    'international_access'
  ],
  objects: [
    'environmental_factors',
    'activity_infrastructure',
    'residency_path_info',
    'pet_friendliness'
  ]
};

/**
 * Fields that should default to null (not false or 0)
 */
export const NULL_DEFAULT_FIELDS = [
  'healthcare_score',
  'safety_score',
  'quality_of_life',
  'english_speaking_doctors',
  'beaches_nearby',
  'retirement_visa_available',
  'digital_nomad_visa'
];

/**
 * Metadata fields to auto-populate
 */
export const METADATA_DEFAULTS = {
  created_at: () => new Date().toISOString(),
  last_ai_update: () => new Date().toISOString(),
  needs_update: () => true,
  data_completeness_score: () => 0
};
