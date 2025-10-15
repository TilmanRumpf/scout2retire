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

// Adjacency maps for gradual scoring
const CULTURE_ADJACENCY = {
  urban_rural_preference: {
    'urban': ['suburban'],
    'suburban': ['urban', 'rural'],
    'rural': ['suburban']
  },
  pace_of_life_preference: {
    'fast': ['moderate'],
    'moderate': ['fast', 'relaxed'],
    'relaxed': ['moderate']
  },
  expat_community: {
    'large': ['moderate'],
    'moderate': ['large', 'small'],
    'small': ['moderate']
  }
}

// 3. CULTURE MATCHING (20% of total) - NEW ALGORITHM
// Total: 100 pts distributed as:
// - Living Environment: 20 pts
// - Pace of Life: 20 pts  
// - Language Preference: 20 pts
// - Expat Community: 10 pts
// - Dining & Nightlife: 10 pts
// - Events & Concerts: 10 pts
// - Museums & Arts: 10 pts

// Adjacency maps for gradual scoring
const CULTURE_ADJACENCY = {
  urban_rural_preference: {
    'urban': ['suburban'],
    'suburban': ['urban', 'rural'],
    'rural': ['suburban']
  },
  pace_of_life_preference: {
    'fast': ['moderate'],
    'moderate': ['fast', 'relaxed'],
    'relaxed': ['moderate']
  },
  expat_community: {
    'large': ['moderate'],
    'moderate': ['large', 'small'],
    'small': ['moderate']
  }
}

export function calculateCultureScore(preferences, town) {
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
      // Check for adjacent match
      let isAdjacent = false
      for (const pref of livingEnvPref) {
        if (CULTURE_ADJACENCY.urban_rural_preference[pref]?.includes(standardizedUrbanRural)) {
          isAdjacent = true
          break
        }
      }
      if (isAdjacent) {
        score += 10
        factors.push({ factor: `Living environment close match (${standardizedUrbanRural})`, score: 10 })
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
      // Check for adjacent match
      let isAdjacent = false
      for (const pref of pacePref) {
        if (CULTURE_ADJACENCY.pace_of_life_preference[pref]?.includes(townPace)) {
          isAdjacent = true
          break
        }
      }
      if (isAdjacent) {
        score += 10
        factors.push({ factor: `Pace of life close match (${townPace})`, score: 10 })
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
      // Check for adjacent match
      let isAdjacent = false
      for (const pref of expatPrefs) {
        if (CULTURE_ADJACENCY.expat_community[pref]?.includes(standardizedExpat)) {
          isAdjacent = true
          break
        }
      }
      if (isAdjacent) {
        score += 5
        factors.push({ factor: `Expat community close match (${town.expat_community_size})`, score: 5 })
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
  const diningImportance = parsed.culture.diningImportance || 1
  
  if (diningImportance === 1) {
    // User doesn't care - full points
    score += 10
    factors.push({ factor: 'Flexible on dining & nightlife', score: 10 })
  } else if (town.restaurants_rating && town.nightlife_rating) {
    // Average the two ratings for comparison
    const townDiningNightlife = Math.round((town.restaurants_rating + town.nightlife_rating) / 2)
    const difference = Math.abs(diningImportance - townDiningNightlife)
    let points = 0
    
    if (difference === 0) {
      points = 10 // Exact match
      factors.push({ factor: 'Dining & nightlife perfectly matched', score: 10 })
    } else if (difference === 1) {
      points = 7  // Adjacent
      factors.push({ factor: 'Dining & nightlife good match', score: 7 })
    } else if (difference === 2) {
      points = 4  // Near
      factors.push({ factor: 'Dining & nightlife acceptable', score: 4 })
    } else {
      factors.push({ factor: 'Dining & nightlife mismatch', score: 0 })
    }
    
    score += points
  } else {
    // No data - give partial credit
    score += 5
    factors.push({ factor: 'Dining & nightlife data unavailable', score: 5 })
  }
  
  // 6. EVENTS & CONCERTS (10 points)
  const eventsImportance = parsed.culture.culturalEventsImportance || 1
  
  if (eventsImportance === 1) {
    // User doesn't care - full points
    score += 10
    factors.push({ factor: 'Flexible on cultural events', score: 10 })
  } else if (town.cultural_events_rating) {
    const difference = Math.abs(eventsImportance - town.cultural_events_rating)
    let points = 0
    
    if (difference === 0) {
      points = 10 // Exact match
      factors.push({ factor: 'Cultural events perfectly matched', score: 10 })
    } else if (difference === 1) {
      points = 7  // Adjacent
      factors.push({ factor: 'Cultural events good match', score: 7 })
    } else if (difference === 2) {
      points = 4  // Near
      factors.push({ factor: 'Cultural events acceptable', score: 4 })
    } else {
      factors.push({ factor: 'Cultural events mismatch', score: 0 })
    }
    
    score += points
  } else {
    // No data - give partial credit
    score += 5
    factors.push({ factor: 'Cultural events data unavailable', score: 5 })
  }
  
  // 7. MUSEUMS & ARTS (10 points)
  const museumsImportance = parsed.culture.museumsImportance || 1
  
  if (museumsImportance === 1) {
    // User doesn't care - full points
    score += 10
    factors.push({ factor: 'Flexible on museums & arts', score: 10 })
  } else if (town.museums_rating) {
    const difference = Math.abs(museumsImportance - town.museums_rating)
    let points = 0
    
    if (difference === 0) {
      points = 10 // Exact match
      factors.push({ factor: 'Museums & arts perfectly matched', score: 10 })
    } else if (difference === 1) {
      points = 7  // Adjacent
      factors.push({ factor: 'Museums & arts good match', score: 7 })
    } else if (difference === 2) {
      points = 4  // Near
      factors.push({ factor: 'Museums & arts acceptable', score: 4 })
    } else {
      factors.push({ factor: 'Museums & arts mismatch', score: 0 })
    }
    
    score += points
  } else {
    // No data - give partial credit
    score += 5
    factors.push({ factor: 'Museums & arts data unavailable', score: 5 })
  }
  
  return {
    score: Math.min(score, 100),
    factors,
    category: 'Culture'
  }
}
