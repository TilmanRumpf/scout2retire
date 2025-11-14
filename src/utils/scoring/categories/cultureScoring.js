/**
 * CULTURE SCORING - Category 3 of 6
 * Weight: 15% of total match score
 *
 * Scores how well a town's culture matches user preferences:
 * - Living Environment: urban/suburban/rural
 * - Pace of Life: fast/moderate/relaxed
 * - Language: english_only/willing_to_learn/comfortable
 * - Expat Community: large/moderate/small
 * - Dining & Nightlife: 1-5 importance rating
 * - Cultural Events: 1-5 importance rating
 * - Museums & Arts: 1-5 importance rating
 *
 * Scoring Breakdown (100 points total):
 * - Living Environment: 20 points
 * - Pace of Life: 20 points
 * - Language Preference: 20 points
 * - Expat Community: 10 points
 * - Dining & Nightlife: 10 points
 * - Events & Concerts: 10 points
 * - Museums & Arts: 10 points
 */

import { parsePreferences } from '../helpers/preferenceParser.js';
import { mapCultureValue } from '../helpers/cultureInference.js';
import { compareIgnoreCase, includesIgnoreCase } from '../helpers/stringUtils.js';
import { scoreWithAdjacency } from '../helpers/adjacencyMatcher.js';
import {
  URBAN_RURAL_ADJACENCY,
  PACE_OF_LIFE_ADJACENCY,
  EXPAT_COMMUNITY_ADJACENCY,
  TRADITIONAL_PROGRESSIVE_ADJACENCY,  // V2
  SOCIAL_ATMOSPHERE_ADJACENCY         // V2
} from '../config/adjacencyRules.js';
import { FEATURE_FLAGS } from '../config.js';

// V1 Point Allocation (100 points total)
const POINTS_V1 = {
  LIVING_ENVIRONMENT: 20,
  PACE: 20,
  LANGUAGE: 20,
  EXPAT: 10,
  DINING: 10,
  EVENTS: 10,
  MUSEUMS: 10
};

// V2 Point Allocation (100 points total) - Added Nov 14, 2025
const POINTS_V2 = {
  LIVING_ENVIRONMENT: 15,       // Reduced from 20
  PACE: 15,                     // Reduced from 20
  LANGUAGE: 15,                 // Reduced from 20
  TRADITIONAL_PROGRESSIVE: 10,  // NEW
  SOCIAL_ATMOSPHERE: 10,        // NEW
  EXPAT: 10,
  DINING: 10,
  EVENTS: 10,
  MUSEUMS: 10
};

export function calculateCultureScore(preferences, town) {
  // Choose point allocation based on feature flag
  const POINTS = FEATURE_FLAGS.ENABLE_CULTURE_V2_SCORING ? POINTS_V2 : POINTS_V1;
  let score = 0
  let factors = []

  // Parse and normalize preferences using centralized parser
  const parsed = parsePreferences(preferences)

  // Check if user has any culture preferences at all
  if (!parsed.culture.hasAnyPreferences) {
    score = 100
    factors.push({ factor: 'Open to any culture', score: 100 })
    return { score, factors, category: 'Culture' }
  }
  
  // 1. LIVING ENVIRONMENT (20 points)
  const livingEnvPref = parsed.culture.urbanRural
  if (!livingEnvPref || livingEnvPref.length === 0) {
    // User doesn't care - full points
    score += 20
    factors.push({ factor: 'Flexible on living environment', score: 20 })
  } else if (town.urban_rural_character) {
    // Map town value to golden onboarding values
    const standardizedUrbanRural = mapCultureValue(town.urban_rural_character, 'urban_rural')

    // Check for exact match
    if (livingEnvPref.includes(standardizedUrbanRural)) {
      score += 20
      // Show mapping in debug if value was transformed
      if (town.urban_rural_character !== standardizedUrbanRural) {
        factors.push({ factor: `Living environment matched [${town.urban_rural_character} → ${standardizedUrbanRural}]`, score: 20 })
      } else {
        factors.push({ factor: `Living environment matched (${standardizedUrbanRural})`, score: 20 })
      }
    } else {
      // Check for adjacent match using centralized helper
      const urbanRuralScore = scoreWithAdjacency({
        userValues: livingEnvPref,
        townValue: standardizedUrbanRural,
        maxPoints: 20,
        adjacencyMap: URBAN_RURAL_ADJACENCY,
        adjacentFactor: 0.50,
        treatEmptyAsOpen: false
      })

      if (urbanRuralScore > 0) {
        score += urbanRuralScore
        factors.push({ factor: `Living environment close match (${standardizedUrbanRural})`, score: urbanRuralScore })
      } else {
        factors.push({ factor: `Living environment mismatch (${standardizedUrbanRural})`, score: 0 })
      }
    }
  } else {
    // Town has no data - give partial credit
    score += 12
    factors.push({ factor: 'Living environment data unavailable', score: 12 })
  }
  
  // 2. PACE OF LIFE (20 points)
  const pacePref = parsed.culture.paceOfLife
  const townPaceRaw = town.pace_of_life_actual // Use actual field

  if (!pacePref || pacePref.length === 0) {
    // User doesn't care - full points
    score += 20
    factors.push({ factor: 'Flexible on pace of life', score: 20 })
  } else if (townPaceRaw) {
    // Map town value to golden onboarding values
    const townPace = mapCultureValue(townPaceRaw, 'pace')

    // Check for exact match
    if (pacePref.includes(townPace)) {
      score += 20
      // Show mapping in debug if value was transformed
      if (townPaceRaw !== townPace) {
        factors.push({ factor: `Pace of life matched [${townPaceRaw} → ${townPace}]`, score: 20 })
      } else {
        factors.push({ factor: `Pace of life matched (${townPace})`, score: 20 })
      }
    } else {
      // Check for adjacent match using centralized helper
      const paceScore = scoreWithAdjacency({
        userValues: pacePref,
        townValue: townPace,
        maxPoints: 20,
        adjacencyMap: PACE_OF_LIFE_ADJACENCY,
        adjacentFactor: 0.50,
        treatEmptyAsOpen: false
      })

      if (paceScore > 0) {
        score += paceScore
        factors.push({ factor: `Pace of life close match (${townPace})`, score: paceScore })
      } else {
        factors.push({ factor: `Pace of life mismatch (${townPace})`, score: 0 })
      }
    }
  } else {
    // Town has no data - give partial credit
    score += 12
    factors.push({ factor: 'Pace of life data unavailable', score: 12 })
  }
  
  // 3. LANGUAGE PREFERENCE (20 points)
  const languagePrefs = parsed.culture.languagePreferences
  const langPref = Array.isArray(languagePrefs) ? languagePrefs[0] : languagePrefs
  const speaksLanguages = parsed.culture.languagesSpoken || []
  
  // No language preference at all - full points
  if (!langPref && speaksLanguages.length === 0) {
    score += 20
    factors.push({ factor: 'Flexible on language', score: 20 })
  } 
  // Check if user speaks the local language
  else if (speaksLanguages.length > 0 && town.primary_language) {
    const speaksLocal = speaksLanguages.some(lang =>
      includesIgnoreCase(town.primary_language, lang) ||
      town.languages_spoken?.some(l => includesIgnoreCase(l, lang))
    )

    if (speaksLocal) {
      score += 20
      factors.push({ factor: `Speaks local language (${town.primary_language})`, score: 20 })
    } else if (langPref === 'willing_to_learn' || langPref === 'comfortable') {
      score += 10
      factors.push({ factor: 'Willing to learn local language', score: 10 })
    } else {
      factors.push({ factor: 'Language barrier', score: 0 })
    }
  }
  // English only preference
  else if (langPref === 'english_only') {
    if (compareIgnoreCase(town.primary_language, 'english')) {
      score += 20
      factors.push({ factor: 'English is primary language', score: 20 })
    } else if (town.english_proficiency_level) {
      // Normalized values after database cleanup
      const proficiencyScores = {
        'native': 20,
        'high': 15,
        'moderate': 10,
        'low': 5
      }
      
      const proficiencyScore = proficiencyScores[town.english_proficiency_level] || 0
      score += proficiencyScore
      if (proficiencyScore > 0) {
        factors.push({ factor: `English proficiency: ${town.english_proficiency_level}`, score: proficiencyScore })
      } else {
        factors.push({ factor: 'English proficiency unknown', score: 0 })
      }
    } else {
      factors.push({ factor: 'English proficiency unknown', score: 0 })
    }
  }
  // Willing to learn or flexible
  else if (langPref === 'willing_to_learn' || langPref === 'comfortable') {
    score += 10
    factors.push({ factor: 'Open to learning local language', score: 10 })
  }
  
  // 4. EXPAT COMMUNITY (10 points)
  const expatPref = parsed.culture.expatCommunity

  if (!expatPref || (Array.isArray(expatPref) && expatPref.length === 0)) {
    // User doesn't care - full points
    score += 10
    factors.push({ factor: 'Flexible on expat community', score: 10 })
  } else if (town.expat_community_size) {
    const expatPrefs = Array.isArray(expatPref) ? expatPref : [expatPref]

    // Map town value to golden onboarding values
    const standardizedExpat = mapCultureValue(town.expat_community_size, 'expat')

    // Check for exact match
    if (expatPrefs.includes(standardizedExpat)) {
      score += 10
      // Show mapping in debug if value was transformed
      if (town.expat_community_size !== standardizedExpat) {
        factors.push({ factor: `Expat community matched [${town.expat_community_size} → ${standardizedExpat}]`, score: 10 })
      } else {
        factors.push({ factor: `Expat community matched (${standardizedExpat})`, score: 10 })
      }
    } else {
      // Check for adjacent match using centralized helper
      const expatScore = scoreWithAdjacency({
        userValues: expatPrefs,
        townValue: standardizedExpat,
        maxPoints: 10,
        adjacencyMap: EXPAT_COMMUNITY_ADJACENCY,
        adjacentFactor: 0.50,
        treatEmptyAsOpen: false
      })

      if (expatScore > 0) {
        score += expatScore
        factors.push({ factor: `Expat community close match (${town.expat_community_size})`, score: expatScore })
      } else {
        factors.push({ factor: `Expat community mismatch (${town.expat_community_size})`, score: 0 })
      }
    }
  } else {
    // Town has no data - give partial credit
    score += 6
    factors.push({ factor: 'Expat community data unavailable', score: 6 })
  }
  
  // 5. DINING & NIGHTLIFE (10 points)
  // User specifies IMPORTANCE (1-5), town has QUALITY ratings (1-10)
  // Logic: Higher importance requires higher quality threshold
  const diningImportance = parsed.culture.diningImportance || 1

  if (diningImportance === 1) {
    // User doesn't care - full points regardless of town quality
    score += 10
    factors.push({ factor: 'Flexible on dining & nightlife', score: 10 })
  } else if (town.restaurants_rating && town.nightlife_rating) {
    // Average the two quality ratings (1-10 scale)
    const avgQuality = Math.round((town.restaurants_rating + town.nightlife_rating) / 2)
    let points = 0

    if (diningImportance === 5) {
      // Very Important - wants excellent quality (8-10)
      if (avgQuality >= 8) {
        points = 10
        factors.push({ factor: `Dining & nightlife excellent match (quality ${avgQuality}/10)`, score: 10 })
      } else if (avgQuality >= 6) {
        points = 5
        factors.push({ factor: `Dining & nightlife acceptable (quality ${avgQuality}/10)`, score: 5 })
      } else {
        points = 0
        factors.push({ factor: `Dining & nightlife below expectations (quality ${avgQuality}/10)`, score: 0 })
      }
    } else if (diningImportance === 3) {
      // Nice to Have - wants decent quality (5-10)
      if (avgQuality >= 7) {
        points = 10
        factors.push({ factor: `Dining & nightlife great match (quality ${avgQuality}/10)`, score: 10 })
      } else if (avgQuality >= 5) {
        points = 7
        factors.push({ factor: `Dining & nightlife good match (quality ${avgQuality}/10)`, score: 7 })
      } else if (avgQuality >= 3) {
        points = 3
        factors.push({ factor: `Dining & nightlife acceptable (quality ${avgQuality}/10)`, score: 3 })
      } else {
        points = 0
        factors.push({ factor: `Dining & nightlife below expectations (quality ${avgQuality}/10)`, score: 0 })
      }
    } else {
      // Unexpected importance value - give partial credit
      points = 5
      factors.push({ factor: `Dining & nightlife (unexpected importance: ${diningImportance})`, score: 5 })
    }

    score += points
  } else {
    // No data - give partial credit
    score += 5
    factors.push({ factor: 'Dining & nightlife data unavailable', score: 5 })
  }
  
  // 6. EVENTS & CONCERTS (10 points)
  // Now uses frequency matching: occasional, regular, frequent
  const userFrequency = parsed.culture.culturalEventsFrequency || 'occasional'

  if (town.cultural_events_frequency) {
    const townFrequency = town.cultural_events_frequency
    let points = 0

    // Exact match
    if (userFrequency === townFrequency) {
      points = 10
      factors.push({ factor: 'Cultural events perfectly matched', score: 10 })
    }
    // Adjacent frequencies (1 step away)
    else if (
      (userFrequency === 'occasional' && townFrequency === 'regular') ||
      (userFrequency === 'regular' && townFrequency === 'occasional') ||
      (userFrequency === 'regular' && townFrequency === 'frequent') ||
      (userFrequency === 'frequent' && townFrequency === 'regular')
    ) {
      points = 7
      factors.push({ factor: 'Cultural events good match', score: 7 })
    }
    // Far apart (occasional vs frequent)
    else if (
      (userFrequency === 'occasional' && townFrequency === 'frequent') ||
      (userFrequency === 'frequent' && townFrequency === 'occasional')
    ) {
      points = 4
      factors.push({ factor: 'Cultural events acceptable', score: 4 })
    }

    score += points
  } else {
    // No data - give partial credit
    score += 5
    factors.push({ factor: 'Cultural events data unavailable', score: 5 })
  }
  
  // 7. MUSEUMS & ARTS (10 points)
  // User specifies IMPORTANCE (1-5), town has QUALITY rating (1-10)
  // Logic: Higher importance requires higher quality threshold
  const museumsImportance = parsed.culture.museumsImportance || 1

  if (museumsImportance === 1) {
    // User doesn't care - full points regardless of town quality
    score += 10
    factors.push({ factor: 'Flexible on museums & arts', score: 10 })
  } else if (town.museums_rating) {
    // Town has quality rating (1-10 scale)
    const quality = town.museums_rating
    let points = 0

    if (museumsImportance === 5) {
      // Very Important - wants excellent quality (8-10)
      if (quality >= 8) {
        points = 10
        factors.push({ factor: `Museums excellent match (quality ${quality}/10)`, score: 10 })
      } else if (quality >= 6) {
        points = 5
        factors.push({ factor: `Museums acceptable (quality ${quality}/10)`, score: 5 })
      } else {
        points = 0
        factors.push({ factor: `Museums below expectations (quality ${quality}/10)`, score: 0 })
      }
    } else if (museumsImportance === 3) {
      // Nice to Have - wants decent quality (5-10)
      if (quality >= 7) {
        points = 10
        factors.push({ factor: `Museums great match (quality ${quality}/10)`, score: 10 })
      } else if (quality >= 5) {
        points = 7
        factors.push({ factor: `Museums good match (quality ${quality}/10)`, score: 7 })
      } else if (quality >= 3) {
        points = 3
        factors.push({ factor: `Museums acceptable (quality ${quality}/10)`, score: 3 })
      } else {
        points = 0
        factors.push({ factor: `Museums below expectations (quality ${quality}/10)`, score: 0 })
      }
    } else {
      // Unexpected importance value - give partial credit
      points = 5
      factors.push({ factor: `Museums (unexpected importance: ${museumsImportance})`, score: 5 })
    }

    score += points
  } else {
    // No data - give partial credit
    score += 5
    factors.push({ factor: 'Museums data unavailable', score: 5 })
  }

  // V2 SCORING (only runs if feature flag enabled)
  if (FEATURE_FLAGS.ENABLE_CULTURE_V2_SCORING) {
    // 8. TRADITIONAL VS PROGRESSIVE LEAN (10 points) - V2
    const traditionalProgressivePref = parsed.culture.traditionalProgressiveLean

    if (!traditionalProgressivePref || traditionalProgressivePref.length === 0) {
      // User doesn't care - 50% fallback
      score += POINTS.TRADITIONAL_PROGRESSIVE * 0.5
      factors.push({ factor: 'Flexible on traditional/progressive values', score: Math.round(POINTS.TRADITIONAL_PROGRESSIVE * 0.5) })
    } else if (town.traditional_progressive_lean) {
      // Check for exact or adjacent match
      const traditionalScore = scoreWithAdjacency({
        userValues: traditionalProgressivePref,
        townValue: town.traditional_progressive_lean,
        maxPoints: POINTS.TRADITIONAL_PROGRESSIVE,
        adjacencyMap: TRADITIONAL_PROGRESSIVE_ADJACENCY,
        adjacentFactor: 0.50,
        treatEmptyAsOpen: false
      })

      score += traditionalScore
      if (traditionalScore === POINTS.TRADITIONAL_PROGRESSIVE) {
        factors.push({ factor: `Traditional/progressive matched (${town.traditional_progressive_lean})`, score: traditionalScore })
      } else if (traditionalScore > 0) {
        factors.push({ factor: `Traditional/progressive close match (${town.traditional_progressive_lean})`, score: traditionalScore })
      } else {
        factors.push({ factor: `Traditional/progressive mismatch (${town.traditional_progressive_lean})`, score: 0 })
      }
    } else {
      // Town has no data - 50% fallback
      score += POINTS.TRADITIONAL_PROGRESSIVE * 0.5
      factors.push({ factor: 'Traditional/progressive data unavailable', score: Math.round(POINTS.TRADITIONAL_PROGRESSIVE * 0.5) })
    }

    // 9. SOCIAL ATMOSPHERE (10 points) - V2
    const socialAtmospherePref = parsed.culture.socialAtmosphere

    if (!socialAtmospherePref || socialAtmospherePref.length === 0) {
      // User doesn't care - 50% fallback
      score += POINTS.SOCIAL_ATMOSPHERE * 0.5
      factors.push({ factor: 'Flexible on social atmosphere', score: Math.round(POINTS.SOCIAL_ATMOSPHERE * 0.5) })
    } else if (town.social_atmosphere) {
      // Check for exact or adjacent match
      const socialScore = scoreWithAdjacency({
        userValues: socialAtmospherePref,
        townValue: town.social_atmosphere,
        maxPoints: POINTS.SOCIAL_ATMOSPHERE,
        adjacencyMap: SOCIAL_ATMOSPHERE_ADJACENCY,
        adjacentFactor: 0.50,
        treatEmptyAsOpen: false
      })

      score += socialScore
      if (socialScore === POINTS.SOCIAL_ATMOSPHERE) {
        factors.push({ factor: `Social atmosphere matched (${town.social_atmosphere})`, score: socialScore })
      } else if (socialScore > 0) {
        factors.push({ factor: `Social atmosphere close match (${town.social_atmosphere})`, score: socialScore })
      } else {
        factors.push({ factor: `Social atmosphere mismatch (${town.social_atmosphere})`, score: 0 })
      }
    } else {
      // Town has no data - 50% fallback
      score += POINTS.SOCIAL_ATMOSPHERE * 0.5
      factors.push({ factor: 'Social atmosphere data unavailable', score: Math.round(POINTS.SOCIAL_ATMOSPHERE * 0.5) })
    }
  }

  return {
    score: Math.min(score, 100),
    factors,
    category: 'Culture'
  }
}
