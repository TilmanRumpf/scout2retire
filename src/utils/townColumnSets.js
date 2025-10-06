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
  minimal: 'id, name, country, state_code',

  // Basic - For lists and search results
  basic: `
    id,
    name,
    country,
    state_code,
    region,
    overall_score,
    photos,
    description
  `,

  // Climate - Weather and environmental data
  climate: `
    id,
    name,
    summer_climate_actual,
    winter_climate_actual,
    sunshine_level_actual,
    precipitation_level_actual,
    seasonal_variation_actual,
    humidity_actual,
    geographic_features_actual,
    vegetation_type_actual,
    environmental_factors
  `,

  // Cost - Financial information
  cost: `
    id,
    name,
    monthly_budget_min,
    monthly_budget_max,
    cost_of_living_index,
    rent_1bedroom_center,
    rent_1bedroom_outside,
    healthcare_monthly_cost,
    groceries_monthly_cost,
    utilities_monthly_cost
  `,

  // Lifestyle - Community and activities
  lifestyle: `
    id,
    name,
    pace_of_life_actual,
    social_atmosphere,
    retirement_community_presence,
    expat_community_size,
    cultural_events_frequency,
    lgbtq_friendly_rating,
    pet_friendly_rating,
    traditional_progressive_lean
  `,

  // Infrastructure - Services and connectivity
  infrastructure: `
    id,
    name,
    walkability_score,
    public_transport_rating,
    hospital_distance_km,
    airport_distance_km,
    english_speaking_doctors_available,
    emergency_services_quality,
    local_mobility_options,
    regional_connectivity,
    international_access
  `,

  // Admin - Visa and residency
  admin: `
    id,
    name,
    country,
    visa_requirements_summary,
    residency_path_info,
    retirement_visa_available,
    digital_nomad_visa,
    ease_of_residency_rating,
    family_reunification_citizenship,
    easy_residency_countries
  `,

  // Scoring - All score components
  scoring: `
    id,
    name,
    overall_score,
    climate_score,
    cost_score,
    lifestyle_score,
    infrastructure_score,
    admin_score
  `,

  // Full detail - For single town view (use sparingly!)
  fullDetail: `
    id,
    name,
    country,
    state_code,
    region,
    latitude,
    longitude,
    population,

    overall_score,
    climate_score,
    cost_score,
    lifestyle_score,
    infrastructure_score,
    admin_score,

    description,
    photos,

    summer_climate_actual,
    winter_climate_actual,
    sunshine_level_actual,
    precipitation_level_actual,
    seasonal_variation_actual,
    humidity_actual,
    geographic_features_actual,
    vegetation_type_actual,
    environmental_factors,

    monthly_budget_min,
    monthly_budget_max,
    cost_of_living_index,
    rent_1bedroom_center,
    rent_1bedroom_outside,
    healthcare_monthly_cost,

    pace_of_life_actual,
    social_atmosphere,
    retirement_community_presence,
    expat_community_size,
    cultural_events_frequency,
    lgbtq_friendly_rating,
    pet_friendly_rating,

    walkability_score,
    public_transport_rating,
    hospital_distance_km,
    airport_distance_km,

    visa_requirements_summary,
    retirement_visa_available,
    ease_of_residency_rating
  `
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
  // Search results - scoring + basic info
  searchResults: combineColumnSets('basic', 'scoring'),

  // Town cards - basic + climate preview
  townCards: combineColumnSets('basic', 'scoring') + ', sunshine_level_actual, pace_of_life_actual',

  // Comparison view - key metrics only
  comparison: `
    id, name, country, overall_score, climate_score, cost_score,
    monthly_budget_min, summer_climate_actual, pace_of_life_actual,
    walkability_score, retirement_visa_available
  `
}

export default COLUMN_SETS
