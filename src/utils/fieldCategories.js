/**
 * Field Category Mapping
 * Maps field names to Towns Manager tab categories
 */

export const FIELD_CATEGORIES = {
  // Overview
  description: 'Overview',
  town_name: 'Overview',
  country: 'Overview',
  state_code: 'Overview',
  population: 'Overview',
  overview: 'Overview',

  // Region
  region: 'Region',
  regions: 'Region',
  geo_region: 'Region',
  geographic_features_actual: 'Region',
  vegetation_type_actual: 'Region',
  water_bodies: 'Region',
  elevation_m: 'Region',
  latitude: 'Region',
  longitude: 'Region',
  time_zone: 'Region',

  // Climate
  climate: 'Climate',
  climate_description: 'Climate',
  summer_climate_actual: 'Climate',
  winter_climate_actual: 'Climate',
  sunshine_level_actual: 'Climate',
  precipitation_level_actual: 'Climate',
  seasonal_variation_actual: 'Climate',
  humidity_level_actual: 'Climate',
  avg_temp_summer: 'Climate',
  avg_temp_winter: 'Climate',
  avg_summer_temp_c: 'Climate',
  avg_winter_temp_c: 'Climate',
  annual_rainfall: 'Climate',
  avg_precipitation_mm: 'Climate',
  avg_humidity_pct: 'Climate',
  air_quality_index: 'Climate',
  natural_disaster_risk: 'Climate',

  // Culture
  pace_of_life_actual: 'Culture',
  social_atmosphere: 'Culture',
  traditional_progressive_lean: 'Culture',
  english_proficiency_level: 'Culture',
  languages_spoken: 'Culture',
  cultural_events_frequency: 'Culture',
  expat_community_size: 'Culture',
  retirement_community_presence: 'Culture',

  // Healthcare
  healthcare_score: 'Healthcare',
  healthcare_specialties_available: 'Healthcare',
  medical_specialties_available: 'Healthcare',
  medical_specialties_rating: 'Healthcare',
  emergency_services_quality: 'Healthcare',
  hospitals_count: 'Healthcare',
  clinics_count: 'Healthcare',

  // Safety
  safety_score: 'Safety',
  crime_rate: 'Safety',
  emergency_response_time: 'Safety',

  // Infrastructure
  internet_speed_mbps: 'Infrastructure',
  internet_quality_rating: 'Infrastructure',
  public_transport_quality: 'Infrastructure',
  airport_distance_km: 'Infrastructure',
  walkability_score: 'Infrastructure',
  bike_friendliness: 'Infrastructure',
  grocery_stores: 'Infrastructure',
  farmers_markets: 'Infrastructure',
  shopping_malls: 'Infrastructure',
  restaurants_count: 'Infrastructure',

  // Activities
  activities_available: 'Activities',
  beach_distance_km: 'Activities',
  mountain_distance_km: 'Activities',
  golf_courses: 'Activities',
  parks_count: 'Activities',
  gyms_count: 'Activities',
  yoga_studios: 'Activities',
  swimming_pools: 'Activities',

  // Hobbies
  hobby_: 'Hobbies', // Prefix match for all hobby fields

  // Admin
  image_url_1: 'Admin',
  image_url_2: 'Admin',
  image_url_3: 'Admin',
  created_at: 'Admin',
  updated_at: 'Admin',
  published: 'Admin',

  // Costs
  cost_of_living_usd: 'Costs',
  rent_1br_usd: 'Costs',
  rent_3br_usd: 'Costs',
  income_tax_rate_pct: 'Costs',
  property_tax_rate_pct: 'Costs',
  sales_tax_rate_pct: 'Costs',
  meal_cost_usd: 'Costs',
  beer_cost_usd: 'Costs',
  coffee_cost_usd: 'Costs',
};

/**
 * Get category for a field name
 * @param {string} fieldName - Database field name
 * @returns {string} Category name
 */
export function getFieldCategory(fieldName) {
  if (!fieldName) return 'Other';

  // Direct match
  if (FIELD_CATEGORIES[fieldName]) {
    return FIELD_CATEGORIES[fieldName];
  }

  // Check for hobby prefix
  if (fieldName.startsWith('hobby_')) {
    return 'Hobbies';
  }

  // Check for partial matches (e.g., avg_temp variations)
  const lowerField = fieldName.toLowerCase();

  if (lowerField.includes('climate') || lowerField.includes('temp') ||
      lowerField.includes('weather') || lowerField.includes('rain') ||
      lowerField.includes('humidity') || lowerField.includes('sunshine')) {
    return 'Climate';
  }

  if (lowerField.includes('health') || lowerField.includes('medical') ||
      lowerField.includes('hospital') || lowerField.includes('clinic')) {
    return 'Healthcare';
  }

  if (lowerField.includes('cost') || lowerField.includes('price') ||
      lowerField.includes('rent') || lowerField.includes('tax')) {
    return 'Costs';
  }

  if (lowerField.includes('safety') || lowerField.includes('crime') ||
      lowerField.includes('security')) {
    return 'Safety';
  }

  if (lowerField.includes('culture') || lowerField.includes('language') ||
      lowerField.includes('community') || lowerField.includes('expat')) {
    return 'Culture';
  }

  if (lowerField.includes('activity') || lowerField.includes('activities') ||
      lowerField.includes('recreation')) {
    return 'Activities';
  }

  if (lowerField.includes('transport') || lowerField.includes('internet') ||
      lowerField.includes('infrastructure') || lowerField.includes('grocery')) {
    return 'Infrastructure';
  }

  if (lowerField.includes('region') || lowerField.includes('geography') ||
      lowerField.includes('location') || lowerField.includes('elevation')) {
    return 'Region';
  }

  // Default
  return 'Other';
}

/**
 * Get all unique categories
 * @returns {Array<string>} List of category names
 */
export function getAllCategories() {
  return [
    'Overview',
    'Region',
    'Climate',
    'Culture',
    'Healthcare',
    'Safety',
    'Infrastructure',
    'Activities',
    'Hobbies',
    'Admin',
    'Costs',
    'Other'
  ];
}

/**
 * Get category color for UI display
 * @param {string} category - Category name
 * @returns {string} Tailwind color classes
 */
export function getCategoryColor(category) {
  const colors = {
    'Overview': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'Region': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Climate': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'Culture': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'Healthcare': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'Safety': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    'Infrastructure': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    'Activities': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    'Hobbies': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
    'Admin': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    'Costs': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    'Other': 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  };

  return colors[category] || colors.Other;
}
