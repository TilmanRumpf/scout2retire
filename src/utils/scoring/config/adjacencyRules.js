/**
 * CENTRALIZED ADJACENCY RULES
 *
 * This module contains all adjacency/compatibility mappings used across
 * the scoring system. Centralizing these rules eliminates duplication
 * and makes it easier to update adjacency logic.
 *
 * Created: November 14, 2025 (Phase 1 - Step 1)
 * Purpose: Eliminate duplication of adjacency maps across category scorers
 *
 * IMPORTANT: These rules define which preference values are "close enough"
 * to award partial credit (typically 70% for climate, 50% for culture/region).
 */

// ============================================================================
// CLIMATE ADJACENCY RULES
// ============================================================================

/**
 * Humidity level adjacency
 *
 * Defines which humidity preferences are compatible.
 * Moved from: climateScoring.js lines 288-292
 */
export const HUMIDITY_ADJACENCY = {
  'dry': ['balanced'],
  'balanced': ['dry', 'humid'],
  'humid': ['balanced']
};

/**
 * Sunshine level adjacency
 *
 * Defines which sunshine preferences are compatible.
 * Includes bidirectional mappings for both user preferences and town values.
 *
 * Moved from: climateScoring.js lines 350-362
 */
export const SUNSHINE_ADJACENCY = {
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
};

/**
 * Precipitation level adjacency
 *
 * Defines which precipitation preferences are compatible.
 * Includes alternative spellings (dry/mostly_dry, wet/less_dry).
 *
 * Moved from: climateScoring.js lines 448-454
 */
export const PRECIPITATION_ADJACENCY = {
  'mostly_dry': ['balanced'],
  'dry': ['balanced'],           // Alternative spelling
  'balanced': ['mostly_dry', 'dry', 'less_dry', 'wet'],
  'less_dry': ['balanced'],
  'wet': ['balanced']            // Alternative spelling
};

// ============================================================================
// CULTURE ADJACENCY RULES
// ============================================================================

/**
 * Urban/Rural character adjacency
 *
 * Defines which urban/rural preferences are compatible.
 * Moved from: cultureScoring.js lines 30-34
 */
export const URBAN_RURAL_ADJACENCY = {
  'urban': ['suburban'],
  'suburban': ['urban', 'rural'],
  'rural': ['suburban']
};

/**
 * Pace of life adjacency
 *
 * Defines which pace preferences are compatible.
 * Moved from: cultureScoring.js lines 35-39
 */
export const PACE_OF_LIFE_ADJACENCY = {
  'fast': ['moderate'],
  'moderate': ['fast', 'relaxed'],
  'relaxed': ['moderate']
};

/**
 * Expat community size adjacency
 *
 * Defines which expat community preferences are compatible.
 * Moved from: cultureScoring.js lines 40-44
 */
export const EXPAT_COMMUNITY_ADJACENCY = {
  'large': ['moderate'],
  'moderate': ['large', 'small'],
  'small': ['moderate']
};

/**
 * Traditional vs Progressive lean adjacency (V2)
 *
 * Defines which traditional/progressive preferences are compatible.
 * Added: November 14, 2025 (Phase 2 - Culture V2)
 */
export const TRADITIONAL_PROGRESSIVE_ADJACENCY = {
  'traditional': ['balanced'],
  'balanced': ['traditional', 'progressive'],
  'progressive': ['balanced']
};

/**
 * Social atmosphere adjacency (V2)
 *
 * Defines which social atmosphere preferences are compatible.
 * Added: November 14, 2025 (Phase 2 - Culture V2)
 */
export const SOCIAL_ATMOSPHERE_ADJACENCY = {
  'quiet': ['friendly'],
  'friendly': ['quiet', 'vibrant'],
  'vibrant': ['friendly']
};

// ============================================================================
// REGION ADJACENCY RULES
// ============================================================================

/**
 * Geographic features adjacency
 *
 * Defines which geographic features are related/compatible.
 * Water features are interchangeable for lifestyle purposes.
 *
 * Moved from: regionScoring.js lines 184-194
 */
export const GEOGRAPHIC_FEATURES_ADJACENCY = {
  'coastal': ['island', 'lake', 'river'],  // All water access
  'island': ['coastal'],  // Islands are inherently coastal
  'lake': ['coastal', 'river'],  // Water features
  'river': ['lake', 'coastal'],  // Water features
  'mountain': ['valley', 'forest'],  // Often found together
  'valley': ['mountain', 'river'],  // Valleys often have rivers
  'forest': ['mountain', 'valley'],  // Forest areas
  'plains': ['valley'],  // Similar flat terrain
  'desert': []  // Desert is unique
};

/**
 * Vegetation type adjacency
 *
 * Defines which vegetation types are related/compatible.
 * Mediterranean is related to subtropical (both warm, dry climates).
 *
 * Moved from: regionScoring.js lines 251-257
 */
export const VEGETATION_ADJACENCY = {
  'mediterranean': ['subtropical'],
  'subtropical': ['mediterranean', 'tropical'],
  'tropical': ['subtropical'],
  'forest': ['grassland'],
  'grassland': ['forest']
};

// ============================================================================
// ADJACENCY CREDIT PERCENTAGES
// ============================================================================

/**
 * Credit awarded for adjacent (compatible but not exact) matches
 *
 * Different categories use different credit percentages:
 * - Climate: 70% (more forgiving)
 * - Culture: 50% (moderate)
 * - Region: 50% (moderate)
 */
export const ADJACENCY_CREDIT = {
  climate: 0.70,  // 70% of max points for adjacent climate match
  culture: 0.50,  // 50% of max points for adjacent culture match
  region: 0.50    // 50% of max points for adjacent region match
};

// ============================================================================
// EXPORTS FOR BACKWARD COMPATIBILITY
// ============================================================================

/**
 * Combined climate adjacency rules object
 * Useful for importing all climate rules at once
 */
export const CLIMATE_ADJACENCY = {
  humidity: HUMIDITY_ADJACENCY,
  sunshine: SUNSHINE_ADJACENCY,
  precipitation: PRECIPITATION_ADJACENCY
};

/**
 * Combined culture adjacency rules object
 * Useful for importing all culture rules at once
 */
export const CULTURE_ADJACENCY = {
  urban_rural: URBAN_RURAL_ADJACENCY,
  pace_of_life: PACE_OF_LIFE_ADJACENCY,
  expat_community: EXPAT_COMMUNITY_ADJACENCY,
  traditional_progressive: TRADITIONAL_PROGRESSIVE_ADJACENCY,  // V2
  social_atmosphere: SOCIAL_ATMOSPHERE_ADJACENCY              // V2
};

/**
 * Combined region adjacency rules object
 * Useful for importing all region rules at once
 */
export const REGION_ADJACENCY = {
  geographic_features: GEOGRAPHIC_FEATURES_ADJACENCY,
  vegetation: VEGETATION_ADJACENCY
};

/**
 * Default export for convenience
 */
export default {
  // Climate
  HUMIDITY_ADJACENCY,
  SUNSHINE_ADJACENCY,
  PRECIPITATION_ADJACENCY,
  CLIMATE_ADJACENCY,

  // Culture
  URBAN_RURAL_ADJACENCY,
  PACE_OF_LIFE_ADJACENCY,
  EXPAT_COMMUNITY_ADJACENCY,
  TRADITIONAL_PROGRESSIVE_ADJACENCY,  // V2
  SOCIAL_ATMOSPHERE_ADJACENCY,        // V2
  CULTURE_ADJACENCY,

  // Region
  GEOGRAPHIC_FEATURES_ADJACENCY,
  VEGETATION_ADJACENCY,
  REGION_ADJACENCY,

  // Credit percentages
  ADJACENCY_CREDIT
};
