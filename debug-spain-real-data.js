#!/usr/bin/env node

// Debug script with REAL data from database to test Spain region scoring issue

function calculateRegionScore(preferences, town) {
  let score = 0
  let factors = []
  
  console.log('=== DEBUGGING REGION SCORE CALCULATION ===')
  console.log('User preferences:', JSON.stringify(preferences, null, 2))
  console.log('Town data:', JSON.stringify(town, null, 2))
  console.log('')
  
  // Check if user has any preferences at all
  const hasCountryPrefs = preferences.countries?.length > 0
  const hasRegionPrefs = preferences.regions?.length > 0
  const hasGeoPrefs = preferences.geographic_features?.length > 0
  const hasVegPrefs = preferences.vegetation_types?.length > 0
  
  console.log('Preference flags:')
  console.log('- hasCountryPrefs:', hasCountryPrefs, '(countries:', preferences.countries, ')')
  console.log('- hasRegionPrefs:', hasRegionPrefs, '(regions:', preferences.regions, ')')
  console.log('- hasGeoPrefs:', hasGeoPrefs, '(geo_features count:', preferences.geographic_features?.length, ')')
  console.log('- hasVegPrefs:', hasVegPrefs, '(veg_types count:', preferences.vegetation_types?.length, ')')
  console.log('')
  
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
  
  console.log('=== PART 1: COUNTRY/REGION MATCHING ===')
  
  if (!hasCountryPrefs && !hasRegionPrefs) {
    // No country/region preferences = 100% = 40 points
    regionCountryScore = 40
    factors.push({ factor: 'Open to any country/region', score: 40 })
    console.log('No country/region preferences - giving 40 points')
  } else {
    console.log('User has country/region preferences, checking matches...')
    
    // Check for country match first (highest priority)
    let countryMatched = false
    if (hasCountryPrefs) {
      console.log('Checking country preferences:', preferences.countries)
      console.log('Town country:', town.country)
      
      for (const country of preferences.countries) {
        console.log(`Checking country: "${country}" vs town: "${town.country}"`)
        
        // Check if it's a US state
        if (US_STATES.has(country) && town.country === 'United States' && town.region === country) {
          regionCountryScore = 40
          factors.push({ factor: `State match (${country})`, score: 40 })
          countryMatched = true
          console.log(`✅ US State match found: ${country}`)
          break
        } else if (country === town.country) {
          regionCountryScore = 40
          factors.push({ factor: 'Country match', score: 40 })
          countryMatched = true
          console.log(`✅ Country match found: ${country}`)
          break
        } else {
          console.log(`❌ No match: "${country}" != "${town.country}"`)
        }
      }
    }
    
    // If no country match, check for region match (75% = 30 points)
    if (!countryMatched && hasRegionPrefs) {
      console.log('No country match, checking region preferences:', preferences.regions)
      console.log('Town regions array:', town.regions)
      console.log('Town geo_region:', town.geo_region)
      
      // Check traditional regions array
      if (town.regions?.some(region => preferences.regions.includes(region))) {
        const matchingRegion = town.regions.find(region => preferences.regions.includes(region))
        regionCountryScore = 30
        factors.push({ factor: 'Region match only', score: 30 })
        console.log(`✅ Region match found in regions array: ${matchingRegion}`)
      }
      // Also check geo_region for broader matches
      else if (town.geo_region && preferences.regions.includes(town.geo_region)) {
        regionCountryScore = 30
        factors.push({ factor: `Region match only (${town.geo_region})`, score: 30 })
        console.log(`✅ Region match found in geo_region: ${town.geo_region}`)
      } else {
        console.log('❌ No region matches found')
      }
    }
    
    // If nothing matched and user had preferences, no points awarded
    if (regionCountryScore === 0 && (hasCountryPrefs || hasRegionPrefs)) {
      regionCountryScore = 0
      factors.push({ factor: 'No location match', score: 0 })
      console.log('❌ No location match - 0 points')
    }
  }
  
  score += regionCountryScore
  console.log(`Country/Region score: ${regionCountryScore} points`)
  console.log('')
  
  // PART 2: GEOGRAPHIC FEATURES (Max 30 points)
  let geoScore = 0
  
  console.log('=== PART 2: GEOGRAPHIC FEATURES ===')
  
  if (!hasGeoPrefs) {
    geoScore = 30
    factors.push({ factor: 'Open to any geography', score: 30 })
    console.log('No geographic preferences - giving 30 points')
  } else {
    console.log('User geographic preferences:', preferences.geographic_features)
    console.log('Town geographic_features_actual:', town.geographic_features_actual)
    
    // Check if ANY geographic feature matches
    let hasMatch = false
    
    // First try actual geographic features
    if (town.geographic_features_actual?.length) {
      const userFeatures = preferences.geographic_features.map(f => f.toLowerCase())
      const townFeatures = town.geographic_features_actual.map(f => f.toLowerCase())
      console.log('Comparing user features:', userFeatures)
      console.log('Against town features:', townFeatures)
      
      hasMatch = userFeatures.some(feature => {
        const match = townFeatures.includes(feature)
        console.log(`Checking "${feature}": ${match ? '✅ MATCH' : '❌ no match'}`)
        return match
      })
    }
    
    // FALLBACK: Check regions array for coastal indicators when no geographic data
    if (!hasMatch && preferences.geographic_features.includes('coastal') && town.regions?.length) {
      console.log('Checking coastal fallback in regions:', town.regions)
      const coastalIndicators = ['gulf', 'ocean', 'coast', 'beach', 'sea', 'atlantic', 'pacific']
      hasMatch = town.regions.some(region => 
        coastalIndicators.some(indicator => {
          const regionMatch = region.toLowerCase().includes(indicator)
          if (regionMatch) console.log(`✅ Coastal fallback match: "${region}" contains "${indicator}"`)
          return regionMatch
        })
      )
    }
    
    if (hasMatch) {
      geoScore = 30
      factors.push({ factor: 'Geographic features match', score: 30 })
      console.log('✅ Geographic match found - 30 points')
    } else {
      factors.push({ factor: 'No geographic feature match', score: 0 })
      console.log('❌ No geographic match - 0 points')
    }
  }
  
  score += geoScore
  console.log(`Geographic score: ${geoScore} points`)
  console.log('')
  
  // PART 3: VEGETATION TYPE (Max 20 points)
  let vegScore = 0
  
  console.log('=== PART 3: VEGETATION TYPES ===')
  
  if (!hasVegPrefs) {
    vegScore = 20
    factors.push({ factor: 'Open to any vegetation', score: 20 })
    console.log('No vegetation preferences - giving 20 points')
  } else if (town.vegetation_type_actual?.length) {
    console.log('User vegetation preferences:', preferences.vegetation_types)
    console.log('Town vegetation_type_actual:', town.vegetation_type_actual)
    
    const userVeg = preferences.vegetation_types.map(v => v.toLowerCase())
    const townVeg = town.vegetation_type_actual.map(v => v.toLowerCase())
    console.log('Comparing user veg:', userVeg)
    console.log('Against town veg:', townVeg)
    
    const hasMatch = userVeg.some(veg => {
      const match = townVeg.includes(veg)
      console.log(`Checking "${veg}": ${match ? '✅ MATCH' : '❌ no match'}`)
      return match
    })
    
    if (hasMatch) {
      vegScore = 20
      factors.push({ factor: 'Vegetation type match', score: 20 })
      console.log('✅ Vegetation match found - 20 points')
    } else {
      factors.push({ factor: 'No vegetation match', score: 0 })
      console.log('❌ No vegetation match - 0 points')
    }
  } else {
    factors.push({ factor: 'Vegetation data unavailable', score: 0 })
    console.log('❌ Town has no vegetation data - 0 points')
  }
  
  score += vegScore
  console.log(`Vegetation score: ${vegScore} points`)
  console.log('')
  
  // Calculate final percentage based on 90 points total
  const totalPossible = 90
  const percentage = Math.round((score / totalPossible) * 100)
  
  console.log('=== FINAL CALCULATION ===')
  console.log(`Total raw score: ${score} / ${totalPossible}`)
  console.log(`Final percentage: ${percentage}%`)
  console.log('')
  
  return {
    score: percentage,
    factors,
    category: 'Region',
    rawScore: score,
    maxScore: totalPossible
  }
}

// Real user preferences from database (user who wants Spain)
const userPreferences = {
  regions: ["Mediterranean", "North America"],
  countries: ["Spain", "Florida"], 
  provinces: ["Any Province"],
  geographic_features: ["Coastal"],
  vegetation_types: ["Subtropical", "Mediterranean", "Tropical"]
}

// Real Spanish town from database (Alicante)
const spanishTown = {
  id: "104f60bd-12a3-44ca-8a8d-ddbdae8fea6a",
  name: "Alicante",
  country: "Spain",
  region: "Europe",
  regions: ["EU", "Schengen", "Iberian Peninsula", "Mediterranean"],
  geographic_features_actual: ["coastal", "plains"],
  vegetation_type_actual: ["mediterranean"]
}

console.log('=== TESTING REAL SPAIN DATA ===\n')

const result = calculateRegionScore(userPreferences, spanishTown)

console.log('=== FINAL RESULT ===')
console.log('Score:', result.score + '%')
console.log('Expected: 100% (perfect country + geo + veg match)')
console.log('Factors:')
result.factors.forEach((factor, index) => {
  console.log(`  ${index + 1}. ${factor.factor} = ${factor.score} points`)
})

if (result.score !== 100) {
  console.log('\n🚨 BUG CONFIRMED!')
  console.log('This explains why users see 44% instead of 100% for Spanish towns')
} else {
  console.log('\n✅ Working correctly')
}