/**
 * REGION SCORING - Category 1 of 6
 * Weight: 30% of total match score (UPDATED 2025-10-15: was 20%)
 *
 * Scores how well a town matches user's geographic preferences:
 * - Regions (max 2): Mediterranean, Caribbean, etc.
 * - Countries (max 2): Spain, Portugal, etc.
 * - Provinces: Andalusia, Algarve, etc.
 * - Geographic Features: coastal, mountain, island, etc.
 * - Vegetation: Mediterranean, tropical, forest, etc.
 *
 * Scoring Breakdown (90 points total → converted to 0-100%):
 * - Country/Region Match: 40 points (country alone = 44%, all three = 100%)
 * - Geographic Features: 30 points (with partial credit for related features)
 * - Vegetation Type: 20 points (with partial credit for related types)
 */

import { parsePreferences } from '../helpers/preferenceParser.js';
import { compareIgnoreCase, includesIgnoreCase, normalize, arrayIncludesIgnoreCase } from '../helpers/stringUtils.js';
import { REGION_SETTINGS } from '../config.js';
import { VALID_CATEGORICAL_VALUES } from '../../validation/categoricalValues.js';

// Helper function to calculate array overlap score
function calculateArrayOverlap(userArray, townArray, maxScore = 100) {
  if (!userArray?.length || !townArray?.length) return 0

  const userSet = new Set(userArray.map(item => normalize(item)))
  const townSet = new Set(townArray.map(item => normalize(item)))

  let matches = 0
  for (const item of userSet) {
    if (townSet.has(item)) matches++
  }

  return (matches / userSet.size) * maxScore
}

// Helper to normalize scores to 0-100 range
function normalizeScore(value, min, max) {
  if (value <= min) return 0
  if (value >= max) return 100
  return ((value - min) / (max - min)) * 100
}

/**
 * Calculate region match score
 *
 * @param {Object} preferences - User's region preferences
 * @param {Object} town - Town data
 * @returns {Object} Score result with factors
 */
export function calculateRegionScore(preferences, town) {
  let score = 0
  let factors = []

  // Parse and normalize preferences using centralized parser
  const parsed = parsePreferences(preferences)

  // Extract region preferences for easier access
  const hasCountryPrefs = parsed.region.countries.length > 0
  const hasRegionPrefs = parsed.region.regions.length > 0
  const hasGeoPrefs = parsed.region.geographic_features.length > 0
  const hasVegPrefs = parsed.region.vegetation_types.length > 0

  // DEBUG: Log when score is unexpectedly low
  const DEBUG = false  // Fixed: was case sensitivity issue
  // Debug logging disabled

  // If user has NO preferences at all, they're open to anywhere - give perfect score
  if (!hasCountryPrefs && !hasRegionPrefs && !hasGeoPrefs && !hasVegPrefs) {
    score = 100
    factors.push({ factor: 'Open to any location', score: 100 })
    return { score, factors, category: 'Region' }
  }

  // US States list for matching
  const US_STATES = new Set([
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas',
    'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
    'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
    'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
    'Wisconsin', 'Wyoming'
  ])

  // PART 1: REGION/COUNTRY MATCHING (Max 40 points)
  let regionCountryScore = 0

  if (!hasCountryPrefs && !hasRegionPrefs) {
    // No country/region preferences = 100% = 40 points
    regionCountryScore = 40
    factors.push({ factor: 'Open to any country/region', score: 40 })
  } else {
    // Check for country match first (highest priority)
    let countryMatched = false
    if (hasCountryPrefs) {
      for (const country of parsed.region.countries) {
        // Check if it's a US state
        if (US_STATES.has(country) && town.country === 'United States' && town.region === country) {
          regionCountryScore = REGION_SETTINGS.EXACT_COUNTRY_MATCH
          factors.push({ factor: `State match (${country})`, score: REGION_SETTINGS.EXACT_COUNTRY_MATCH })
          countryMatched = true
          break
        } else if (country === town.country) {
          regionCountryScore = REGION_SETTINGS.EXACT_COUNTRY_MATCH
          factors.push({ factor: 'Country match', score: REGION_SETTINGS.EXACT_COUNTRY_MATCH })
          countryMatched = true
          break
        }
      }
    }

    // If no country match, check for region match (75% = 30 points)
    if (!countryMatched && hasRegionPrefs) {
      // Check traditional regions array (case-insensitive)
      const userRegionsLower = parsed.region.regions.map(r => normalize(r))

      if (town.regions?.some(region => arrayIncludesIgnoreCase(userRegionsLower, region))) {
        regionCountryScore = REGION_SETTINGS.REGION_MATCH
        factors.push({ factor: 'Region match only', score: REGION_SETTINGS.REGION_MATCH })
      }
      // Also check geo_region for broader matches (now comma-separated)
      else if (town.geo_region) {
        // Handle comma-separated geo_region
        const geoRegions = town.geo_region.includes(',')
          ? town.geo_region.split(',').map(r => normalize(r.trim()))
          : [normalize(town.geo_region)]

        if (geoRegions.some(gr => userRegionsLower.includes(gr))) {
          regionCountryScore = REGION_SETTINGS.REGION_MATCH
          factors.push({ factor: `Region match only (${town.geo_region})`, score: REGION_SETTINGS.REGION_MATCH })
        }
      }
    }

    // If nothing matched and user had preferences, no points awarded
    if (regionCountryScore === 0 && (hasCountryPrefs || hasRegionPrefs)) {
      // No match = 0 points (as per specification)
      regionCountryScore = 0
      factors.push({ factor: 'No location match', score: 0 })
    }
  }

  score += regionCountryScore

  // PART 2: GEOGRAPHIC FEATURES (Max 30 points)
  let geoScore = 0

  // DYNAMIC: Use centralized geographic features from categoricalValues.js (RULE #2: NO HARDCODING)
  const ALL_GEO_FEATURES = VALID_CATEGORICAL_VALUES.geographic_features_actual
  const userSelectedAllGeo = parsed.region.geographic_features.length === ALL_GEO_FEATURES.length &&
    ALL_GEO_FEATURES.every(f => arrayIncludesIgnoreCase(parsed.region.geographic_features, f))

  if (!hasGeoPrefs || userSelectedAllGeo) {
    // No geographic preferences OR selected ALL = 100% = 30 points (user is open to anything)
    geoScore = 30
    factors.push({ factor: userSelectedAllGeo ? 'Open to all geographies (all selected)' : 'Open to any geography', score: 30 })
  } else {
    // Check if ANY geographic feature matches
    let hasMatch = false
    const userFeatures = parsed.region.geographic_features.map(f => normalize(f))

    // First try actual geographic features - CASE INSENSITIVE FIX
    if (town.geographic_features_actual?.length) {
      const townFeatures = town.geographic_features_actual.map(f => normalize(String(f)))
      hasMatch = userFeatures.some(feature => townFeatures.includes(feature))
    }

    // FALLBACK: Check regions array for coastal indicators when no geographic data
    if (!hasMatch && arrayIncludesIgnoreCase(userFeatures, 'coastal') && town.regions?.length) {
      const coastalIndicators = ['gulf', 'ocean', 'coast', 'beach', 'sea', 'atlantic', 'pacific', 'mediterranean']
      hasMatch = town.regions.some(region =>
        coastalIndicators.some(indicator => includesIgnoreCase(region, indicator))
      )
    }

    if (hasMatch) {
      geoScore = 30
      factors.push({ factor: 'Geographic features match', score: 30 })
    } else {
      // IMPROVED: Give partial credit for related geographic features
      // Water features are somewhat interchangeable for lifestyle purposes
      const relatedFeatures = {
        'coastal': ['island', 'lake', 'river'],  // All water access
        'island': ['coastal'],  // Islands are inherently coastal
        'lake': ['coastal', 'river'],  // Water features
        'river': ['lake', 'coastal'],  // Water features
        'mountain': ['valley', 'forest'],  // Often found together
        'valley': ['mountain', 'river'],  // Valleys often have rivers
        'forest': ['mountain', 'valley'],  // Forest areas
        'plains': ['valley'],  // Similar flat terrain
        'desert': []  // Desert is unique
      }

      let partialMatch = false
      if (town.geographic_features_actual?.length) {
        const townFeatures = town.geographic_features_actual.map(f => normalize(String(f)))
        for (const userFeature of userFeatures) {
          const related = relatedFeatures[userFeature] || []
          if (townFeatures.some(tf => related.includes(tf))) {
            geoScore = 15  // 50% credit for related features
            factors.push({ factor: 'Related geographic features (partial match)', score: 15 })
            partialMatch = true
            break
          }
        }
      }

      if (!partialMatch) {
        factors.push({ factor: 'No geographic feature match', score: 0 })
      }
    }
  }

  score += geoScore

  // PART 3: VEGETATION TYPE (Max 20 points)
  let vegScore = 0

  // DYNAMIC: Use centralized vegetation types from categoricalValues.js (RULE #2: NO HARDCODING)
  const ALL_VEG_TYPES = VALID_CATEGORICAL_VALUES.vegetation_type_actual
  const userSelectedAllVeg = parsed.region.vegetation_types.length === ALL_VEG_TYPES.length &&
    ALL_VEG_TYPES.every(v => arrayIncludesIgnoreCase(parsed.region.vegetation_types, v))

  // SMART INFERENCE: If user selected Mediterranean region but didn't specify vegetation,
  // they're likely OK with mediterranean vegetation (common sense)
  const impliedMediterraneanVeg = !hasVegPrefs && hasRegionPrefs &&
    parsed.region.regions.some(r => compareIgnoreCase(r, 'mediterranean'))

  if (!hasVegPrefs || userSelectedAllVeg) {
    // No vegetation preferences OR selected ALL = 100% = 20 points (user is open to anything)
    vegScore = 20
    if (impliedMediterraneanVeg && town.vegetation_type_actual?.includes('mediterranean')) {
      factors.push({ factor: 'Mediterranean region implies vegetation compatibility', score: 20 })
    } else {
      factors.push({ factor: userSelectedAllVeg ? 'Open to all vegetation (all selected)' : 'Open to any vegetation', score: 20 })
    }
  } else if (town.vegetation_type_actual?.length) {
    // Check if ANY vegetation type matches - CASE INSENSITIVE FIX
    const userVeg = parsed.region.vegetation_types.map(v => normalize(v))
    const townVeg = town.vegetation_type_actual.map(v => normalize(String(v)))
    const hasMatch = userVeg.some(veg => townVeg.includes(veg))

    if (hasMatch) {
      vegScore = 20
      factors.push({ factor: 'Vegetation type match', score: 20 })
    } else {
      // IMPROVED: Give partial credit for related vegetation types
      // Mediterranean is related to subtropical (both warm, dry climates)
      const relatedVegetation = {
        'mediterranean': ['subtropical'],
        'subtropical': ['mediterranean', 'tropical'],
        'tropical': ['subtropical'],
        'forest': ['grassland'],
        'grassland': ['forest']
      }

      let partialMatch = false
      for (const userVegType of userVeg) {
        const related = relatedVegetation[userVegType] || []
        if (townVeg.some(tv => related.includes(tv))) {
          vegScore = 10  // 50% credit for related vegetation
          factors.push({ factor: 'Related vegetation type (partial match)', score: 10 })
          partialMatch = true
          break
        }
      }

      if (!partialMatch) {
        factors.push({ factor: 'No vegetation match', score: 0 })
      }
    }
  } else {
    // User has preferences but town has no vegetation data
    factors.push({ factor: 'Vegetation data unavailable', score: 0 })
  }

  score += vegScore

  // Calculate final percentage based on 90 points total
  const totalPossible = 90
  const percentage = Math.round((score / totalPossible) * 100)

  // DEBUG: Log final score breakdown
  // Debug logging disabled

  return {
    score: percentage,
    factors,
    category: 'Region',
    rawScore: score,
    maxScore: totalPossible
  }
}
