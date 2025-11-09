/**
 * TOWN TABLE COLUMN DEFINITIONS
 *
 * The towns table has 170+ columns. NEVER use SELECT * - always use these predefined sets.
 * This improves performance, reduces payload size, and makes queries maintainable.
 *
 * Usage:
 *   import { COLUMN_SETS } from './townColumnSets'
 *   const query = supabase.from('towns').select(COLUMN_SETS.basic)
 */

export const COLUMN_SETS = {
  // Minimal - Just identification (fastest)
  minimal: 'id, town_name, country, region',

  // Basic - For lists and search results
  basic: 'id, town_name, country, region, quality_of_life, image_url_1, description, is_published',

  // Climate - Weather and environmental data
  climate: 'id, town_name, summer_climate_actual, winter_climate_actual, sunshine_level_actual, precipitation_level_actual, seasonal_variation_actual, humidity_level_actual, geographic_features_actual, vegetation_type_actual, environmental_factors',

  // Cost - Financial information
  cost: 'id, town_name, cost_of_living_usd, cost_index, rent_1bed, rent_2bed_usd, healthcare_cost_monthly, groceries_cost, utilities_cost',

  // Lifestyle - Community and activities
  lifestyle: 'id, town_name, pace_of_life_actual, social_atmosphere, retirement_community_presence, expat_community_size, cultural_events_frequency, lgbtq_friendly_rating, pet_friendly_rating, traditional_progressive_lean',

  // Infrastructure - Services and connectivity
  infrastructure: 'id, town_name, walkability, public_transport_quality, nearest_major_hospital_km, airport_distance, english_speaking_doctors, emergency_services_quality, local_mobility_options, regional_connectivity, international_access',

  // Culture - Language and communication
  culture: 'id, town_name, primary_language, english_proficiency, english_proficiency_level, cultural_events_frequency, traditional_progressive_lean',

  // Admin - Visa and residency + publication status
  admin: 'id, town_name, country, visa_requirements, residency_path_info, retirement_visa_available, digital_nomad_visa, easy_residency_countries, is_published, published_at, published_by',

  // Scoring - All score components (using actual columns that exist)
  scoring: 'id, town_name, quality_of_life, healthcare_score, safety_score, cost_index',

  // Full detail - For single town view (use sparingly!)
  fullDetail: 'id, town_name, country, region, latitude, longitude, population, quality_of_life, healthcare_score, safety_score, cost_index, description, image_url_1, image_url_2, image_url_3, summer_climate_actual, winter_climate_actual, sunshine_level_actual, precipitation_level_actual, seasonal_variation_actual, humidity_level_actual, geographic_features_actual, vegetation_type_actual, environmental_factors, cost_of_living_usd, rent_1bed, rent_2bed_usd, healthcare_cost_monthly, pace_of_life_actual, social_atmosphere, retirement_community_presence, expat_community_size, cultural_events_frequency, lgbtq_friendly_rating, pet_friendly_rating, walkability, public_transport_quality, nearest_major_hospital_km, airport_distance, visa_requirements, retirement_visa_available, is_published, published_at, published_by'
}

/**
 * Build custom column set by combining predefined sets
 * @param {...string} sets - Column set names to combine
 * @returns {string} Combined column list
 */
export function combineColumnSets(...sets) {
  const columns = new Set()

  sets.forEach(setName => {
    if (!COLUMN_SETS[setName]) {
      console.warn(`Unknown column set: ${setName}`)
      return
    }

    // Parse columns from the set (handles multiline strings)
    const setColumns = COLUMN_SETS[setName]
      .split(',')
      .map(col => col.trim())
      .filter(col => col.length > 0)

    setColumns.forEach(col => columns.add(col))
  })

  return Array.from(columns).join(', ')
}

/**
 * Common query combinations
 */
export const COMMON_QUERIES = {
  // Search results - scoring + basic info + location for maps
  searchResults: combineColumnSets('basic', 'scoring') + ', latitude, longitude, cost_index',

  // Town cards - basic + climate preview
  townCards: combineColumnSets('basic', 'scoring') + ', sunshine_level_actual, pace_of_life_actual',

  // Comparison view - key metrics only
  comparison: 'id, town_name, country, quality_of_life, healthcare_score, cost_index, cost_of_living_usd, summer_climate_actual, pace_of_life_actual, walkability, retirement_visa_available'
}

export default COLUMN_SETS
