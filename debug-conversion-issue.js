#!/usr/bin/env node

// Debug script to test the conversion issue

// Copy of the conversion function from unifiedScoring.js
function convertPreferencesToAlgorithmFormat(userPreferences) {
  // Handle region preferences - combine countries and regions from top-level fields
  const regionPreferences = userPreferences.region || userPreferences.region_preferences || {};
  
  // If top-level countries/regions exist, ensure they're in the region_preferences object
  if (userPreferences.countries || userPreferences.regions) {
    regionPreferences.countries = userPreferences.countries || regionPreferences.countries || [];
    regionPreferences.regions = userPreferences.regions || regionPreferences.regions || [];
  }
  
  // Add geographic_features and vegetation_types if present at top level
  if (userPreferences.geographic_features) {
    regionPreferences.geographic_features = userPreferences.geographic_features;
  }
  if (userPreferences.vegetation_types) {
    regionPreferences.vegetation_types = userPreferences.vegetation_types;
  }
  if (userPreferences.provinces) {
    regionPreferences.provinces = userPreferences.provinces;
  }
  
  return {
    region_preferences: regionPreferences,
    // ... other categories omitted for this test
  };
}

// Copy of the calculateRegionScore function
function calculateRegionScore(preferences, town) {
  let score = 0
  let factors = []
  
  console.log('=== DEBUGGING REGION SCORE WITH CONVERSION ===')
  console.log('Input preferences (raw):', JSON.stringify(preferences, null, 2))
  
  // Check if user has any preferences at all
  const hasCountryPrefs = preferences.countries?.length > 0
  const hasRegionPrefs = preferences.regions?.length > 0
  const hasGeoPrefs = preferences.geographic_features?.length > 0
  const hasVegPrefs = preferences.vegetation_types?.length > 0
  
  console.log('')
  console.log('Preference flags:')
  console.log('- hasCountryPrefs:', hasCountryPrefs, preferences.countries)
  console.log('- hasRegionPrefs:', hasRegionPrefs, preferences.regions)
  console.log('- hasGeoPrefs:', hasGeoPrefs, preferences.geographic_features?.length)
  console.log('- hasVegPrefs:', hasVegPrefs, preferences.vegetation_types?.length)
  console.log('')
  
  // If user has NO preferences at all, they're open to anywhere - give perfect score
  if (!hasCountryPrefs && !hasRegionPrefs && !hasGeoPrefs && !hasVegPrefs) {
    score = 100
    factors.push({ factor: 'Open to any location', score: 100 })
    return { score, factors, category: 'Region' }
  }
  
  // PART 1: REGION/COUNTRY MATCHING (Max 40 points)
  let regionCountryScore = 0
  
  if (!hasCountryPrefs && !hasRegionPrefs) {
    regionCountryScore = 40
    factors.push({ factor: 'Open to any country/region', score: 40 })
  } else {
    // Check for country match first (highest priority)
    let countryMatched = false
    if (hasCountryPrefs) {
      console.log('Checking countries:', preferences.countries, 'vs town country:', town.country)
      for (const country of preferences.countries) {
        if (country === town.country) {
          regionCountryScore = 40
          factors.push({ factor: 'Country match', score: 40 })
          countryMatched = true
          console.log('✅ Found country match:', country)
          break
        }
      }
    }
    
    // If no country match, check for region match
    if (!countryMatched && hasRegionPrefs) {
      console.log('Checking regions:', preferences.regions, 'vs town regions:', town.regions)
      if (town.regions?.some(region => preferences.regions.includes(region))) {
        regionCountryScore = 30
        factors.push({ factor: 'Region match only', score: 30 })
        console.log('✅ Found region match')
      }
    }
    
    // If nothing matched and user had preferences, no points awarded
    if (regionCountryScore === 0 && (hasCountryPrefs || hasRegionPrefs)) {
      regionCountryScore = 0
      factors.push({ factor: 'No location match', score: 0 })
    }
  }
  
  score += regionCountryScore
  
  // PART 2: GEOGRAPHIC FEATURES (Max 30 points)
  let geoScore = 0
  if (!hasGeoPrefs) {
    geoScore = 30
    factors.push({ factor: 'Open to any geography', score: 30 })
  } else {
    let hasMatch = false
    if (town.geographic_features_actual?.length) {
      const userFeatures = preferences.geographic_features.map(f => f.toLowerCase())
      const townFeatures = town.geographic_features_actual.map(f => f.toLowerCase())
      hasMatch = userFeatures.some(feature => townFeatures.includes(feature))
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
    vegScore = 20
    factors.push({ factor: 'Open to any vegetation', score: 20 })
  } else if (town.vegetation_type_actual?.length) {
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

// Test with the exact database user preferences format
const userPreferencesFromDB = {
  regions: ["Mediterranean", "North America"],
  countries: ["Spain", "Florida"], 
  provinces: ["Any Province"],
  geographic_features: ["Coastal"],
  vegetation_types: ["Subtropical", "Mediterranean", "Tropical"],
  // ... other preferences
}

// Spanish town from database
const spanishTown = {
  name: "Alicante",
  country: "Spain",
  regions: ["EU", "Schengen", "Iberian Peninsula", "Mediterranean"],
  geographic_features_actual: ["coastal", "plains"],
  vegetation_type_actual: ["mediterranean"]
}

console.log('=== TESTING CONVERSION PIPELINE ===\n')

console.log('1. Original user preferences from DB:')
console.log(JSON.stringify(userPreferencesFromDB, null, 2))
console.log('')

console.log('2. After conversion:')
const converted = convertPreferencesToAlgorithmFormat(userPreferencesFromDB)
console.log(JSON.stringify(converted.region_preferences, null, 2))
console.log('')

console.log('3. Passing to calculateRegionScore:')
const result = calculateRegionScore(converted.region_preferences, spanishTown)

console.log('')
console.log('=== FINAL RESULT ===')
console.log('Score:', result.score + '%')
console.log('Expected: 100% for Spain match')
console.log('Factors:')
result.factors.forEach((factor, index) => {
  console.log(`  ${index + 1}. ${factor.factor} = ${factor.score} points`)
})

if (result.score !== 100) {
  console.log('\n🚨 BUG FOUND in conversion pipeline!')
} else {
  console.log('\n✅ Conversion pipeline working correctly')
}