#!/usr/bin/env node

// Simplified debug script to test Spain region scoring issue
// Copy of the calculateRegionScore function without external dependencies

function calculateRegionScore(preferences, town) {
  let score = 0
  let factors = []
  
  // Check if user has any preferences at all
  const hasCountryPrefs = preferences.countries?.length > 0
  const hasRegionPrefs = preferences.regions?.length > 0
  const hasGeoPrefs = preferences.geographic_features?.length > 0
  const hasVegPrefs = preferences.vegetation_types?.length > 0
  
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
      for (const country of preferences.countries) {
        // Check if it's a US state
        if (US_STATES.has(country) && town.country === 'United States' && town.region === country) {
          regionCountryScore = 40
          factors.push({ factor: `State match (${country})`, score: 40 })
          countryMatched = true
          break
        } else if (country === town.country) {
          regionCountryScore = 40
          factors.push({ factor: 'Country match', score: 40 })
          countryMatched = true
          break
        }
      }
    }
    
    // If no country match, check for region match (75% = 30 points)
    if (!countryMatched && hasRegionPrefs) {
      // Check traditional regions array
      if (town.regions?.some(region => preferences.regions.includes(region))) {
        regionCountryScore = 30
        factors.push({ factor: 'Region match only', score: 30 })
      }
      // Also check geo_region for broader matches
      else if (town.geo_region && preferences.regions.includes(town.geo_region)) {
        regionCountryScore = 30
        factors.push({ factor: `Region match only (${town.geo_region})`, score: 30 })
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
  
  if (!hasGeoPrefs) {
    // No geographic preferences = 100% = 30 points
    geoScore = 30
    factors.push({ factor: 'Open to any geography', score: 30 })
  } else {
    // Check if ANY geographic feature matches
    let hasMatch = false
    
    // First try actual geographic features
    if (town.geographic_features_actual?.length) {
      const userFeatures = preferences.geographic_features.map(f => f.toLowerCase())
      const townFeatures = town.geographic_features_actual.map(f => f.toLowerCase())
      hasMatch = userFeatures.some(feature => townFeatures.includes(feature))
    }
    
    // FALLBACK: Check regions array for coastal indicators when no geographic data
    if (!hasMatch && preferences.geographic_features.includes('coastal') && town.regions?.length) {
      const coastalIndicators = ['gulf', 'ocean', 'coast', 'beach', 'sea', 'atlantic', 'pacific']
      hasMatch = town.regions.some(region => 
        coastalIndicators.some(indicator => region.toLowerCase().includes(indicator))
      )
    }
    
    if (hasMatch) {
      geoScore = 30
      factors.push({ factor: 'Geographic features match', score: 30 })
    } else {
      factors.push({ factor: 'No geographic feature match', score: 0 })
    }
  }
  
  score += geoScore
  
  // PART 3: VEGETATION TYPE (Max 20 points)
  let vegScore = 0
  
  if (!hasVegPrefs) {
    // No vegetation preferences = 100% = 20 points
    vegScore = 20
    factors.push({ factor: 'Open to any vegetation', score: 20 })
  } else if (town.vegetation_type_actual?.length) {
    // Check if ANY vegetation type matches
    const userVeg = preferences.vegetation_types.map(v => v.toLowerCase())
    const townVeg = town.vegetation_type_actual.map(v => v.toLowerCase())
    const hasMatch = userVeg.some(veg => townVeg.includes(veg))
    
    if (hasMatch) {
      vegScore = 20
      factors.push({ factor: 'Vegetation type match', score: 20 })
    } else {
      factors.push({ factor: 'No vegetation match', score: 0 })
    }
  } else {
    // User has preferences but town has no vegetation data
    factors.push({ factor: 'Vegetation data unavailable', score: 0 })
  }
  
  score += vegScore
  
  // Calculate final percentage based on 90 points total
  const totalPossible = 90
  const percentage = Math.round((score / totalPossible) * 100)
  
  return {
    score: percentage,
    factors,
    category: 'Region',
    rawScore: score,
    maxScore: totalPossible
  }
}

// Simulate the user's preferences from the problem description
const userPreferences = {
  // First Preference: Mediterranean, Spain, Any Province
  // Optional Preference: Southern Europe, Spain, Any Province
  regions: ['Mediterranean', 'Southern Europe'],
  countries: ['Spain'],
  provinces: [], // Any Province
  
  // Geographic Features: Coastal, Mountain, Island, Lake, River, Valley, Desert, Forest, Plains (all selected)
  geographic_features: ['Coastal', 'Mountain', 'Island', 'Lake', 'River', 'Valley', 'Desert', 'Forest', 'Plains'],
  
  // Vegetation Types: Tropical, Subtropical, Mediterranean, Forest, Grassland, Desert (all selected)  
  vegetation_types: ['Tropical', 'Subtropical', 'Mediterranean', 'Forest', 'Grassland', 'Desert']
}

// Create a test Spanish town
const spanishTown = {
  id: 'test-spanish-town',
  name: 'Test Spanish Town', 
  country: 'Spain',
  region: 'Andalusia',
  regions: ['Mediterranean', 'Southern Europe'], 
  geo_region: 'Mediterranean',
  geographic_features_actual: ['Coastal', 'Mountain'],
  vegetation_type_actual: ['Mediterranean', 'Forest']
}

console.log('=== DEBUGGING SPAIN SCORING ISSUE ===\n')

console.log('User Preferences:')
console.log('- Countries:', userPreferences.countries)
console.log('- Regions:', userPreferences.regions) 
console.log('- Geographic Features (count):', userPreferences.geographic_features.length)
console.log('- Vegetation Types (count):', userPreferences.vegetation_types.length)
console.log('')

// Test Spanish town
console.log('=== TESTING SPANISH TOWN ===')
console.log('Town:', spanishTown.name, '(' + spanishTown.country + ')')
console.log('Town Country:', spanishTown.country)
console.log('Town Regions:', spanishTown.regions)
console.log('Town Geographic Features:', spanishTown.geographic_features_actual)
console.log('Town Vegetation:', spanishTown.vegetation_type_actual)
console.log('')

const spanishResult = calculateRegionScore(userPreferences, spanishTown)
console.log('SPANISH TOWN RESULT:')
console.log('Final Score:', spanishResult.score + '%')
console.log('Raw Score:', spanishResult.rawScore, '/ Max:', spanishResult.maxScore)
console.log('Factors:')
spanishResult.factors.forEach((factor, index) => {
  console.log(`  ${index + 1}. ${factor.factor} = ${factor.score} points`)
})
console.log('')

console.log('=== ANALYSIS ===')
if (spanishResult.score !== 100) {
  console.log('🚨 BUG FOUND!')
  console.log(`Spanish town getting ${spanishResult.score}% instead of 100%`)
  console.log('')
  console.log('Expected calculation for perfect Spanish match:')
  console.log('- Country match: 40 points (Spain = Spain)')
  console.log('- Geographic features match: 30 points (has Coastal, Mountain)')
  console.log('- Vegetation match: 20 points (has Mediterranean, Forest)')
  console.log('- Total: 90/90 points = 100%')
  console.log('')
  
  // Analyze what went wrong
  const countryFactor = spanishResult.factors.find(f => f.factor.includes('Country match'))
  const geoFactor = spanishResult.factors.find(f => f.factor.includes('Geographic features'))
  const vegFactor = spanishResult.factors.find(f => f.factor.includes('Vegetation'))
  
  console.log('Actual breakdown:')
  if (countryFactor) {
    console.log(`- Country: ${countryFactor.score} points (${countryFactor.factor})`)
  } else {
    console.log('- Country: NO FACTOR FOUND - this might be the bug!')
  }
  
  if (geoFactor) {
    console.log(`- Geographic: ${geoFactor.score} points (${geoFactor.factor})`)
  } else {
    console.log('- Geographic: NO FACTOR FOUND - potential issue!')
  }
  
  if (vegFactor) {
    console.log(`- Vegetation: ${vegFactor.score} points (${vegFactor.factor})`)
  } else {
    console.log('- Vegetation: NO FACTOR FOUND - potential issue!')
  }
} else {
  console.log('✅ Spanish town scoring looks correct')
}