#!/usr/bin/env node

// Test potential real-world data issues that could cause 44% region scores

function calculateRegionScore(preferences, town) {
  let score = 0
  let factors = []
  
  console.log('=== DEBUGGING REAL-WORLD ISSUES ===')
  console.log('Preferences:', JSON.stringify(preferences, null, 2))
  console.log('Town:', JSON.stringify(town, null, 2))
  console.log('')
  
  // Check if user has any preferences at all
  const hasCountryPrefs = preferences.countries?.length > 0
  const hasRegionPrefs = preferences.regions?.length > 0
  const hasGeoPrefs = preferences.geographic_features?.length > 0
  const hasVegPrefs = preferences.vegetation_types?.length > 0
  
  console.log('Preference analysis:')
  console.log('- Countries:', preferences.countries, '(has:', hasCountryPrefs + ')')
  console.log('- Regions:', preferences.regions, '(has:', hasRegionPrefs + ')')
  console.log('- Geographic:', preferences.geographic_features, '(has:', hasGeoPrefs + ')')
  console.log('- Vegetation:', preferences.vegetation_types, '(has:', hasVegPrefs + ')')
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
      console.log('Checking countries...')
      for (const country of preferences.countries) {
        console.log(`  "${country}" (type: ${typeof country}) vs town "${town.country}" (type: ${typeof town.country})`)
        if (country === town.country) {
          regionCountryScore = 40
          factors.push({ factor: 'Country match', score: 40 })
          countryMatched = true
          console.log('  ✅ MATCH!')
          break
        } else {
          console.log('  ❌ No match')
        }
      }
    }
    
    // If no country match, check for region match (75% = 30 points)
    if (!countryMatched && hasRegionPrefs) {
      console.log('No country match, checking regions...')
      if (town.regions?.length) {
        console.log('Town regions:', town.regions)
        const regionMatch = town.regions.some(region => preferences.regions.includes(region))
        if (regionMatch) {
          const matchedRegion = town.regions.find(region => preferences.regions.includes(region))
          regionCountryScore = 30
          factors.push({ factor: 'Region match only', score: 30 })
          console.log('  ✅ Region match found:', matchedRegion)
        } else {
          console.log('  ❌ No region matches found')
        }
      }
    }
    
    // If nothing matched and user had preferences, no points awarded
    if (regionCountryScore === 0 && (hasCountryPrefs || hasRegionPrefs)) {
      regionCountryScore = 0
      factors.push({ factor: 'No location match', score: 0 })
      console.log('  ❌ No location match at all')
    }
  }
  
  console.log('Country/Region score:', regionCountryScore, 'points')
  score += regionCountryScore
  
  // PART 2: GEOGRAPHIC FEATURES (Max 30 points)
  let geoScore = 0
  
  if (!hasGeoPrefs) {
    geoScore = 30
    factors.push({ factor: 'Open to any geography', score: 30 })
    console.log('Geographic: No preferences, 30 points')
  } else {
    console.log('Checking geographic features...')
    console.log('User wants:', preferences.geographic_features)
    console.log('Town has:', town.geographic_features_actual)
    
    let hasMatch = false
    if (town.geographic_features_actual?.length) {
      const userFeatures = preferences.geographic_features.map(f => f.toLowerCase())
      const townFeatures = town.geographic_features_actual.map(f => f.toLowerCase())
      console.log('Normalized - User:', userFeatures, 'Town:', townFeatures)
      
      hasMatch = userFeatures.some(feature => {
        const found = townFeatures.includes(feature)
        console.log(`  Checking "${feature}":`, found ? '✅' : '❌')
        return found
      })
    }
    
    if (hasMatch) {
      geoScore = 30
      factors.push({ factor: 'Geographic features match', score: 30 })
      console.log('Geographic: Match found, 30 points')
    } else {
      factors.push({ factor: 'No geographic feature match', score: 0 })
      console.log('Geographic: No match, 0 points')
    }
  }
  
  console.log('Geographic score:', geoScore, 'points')
  score += geoScore
  
  // PART 3: VEGETATION TYPE (Max 20 points)
  let vegScore = 0
  
  if (!hasVegPrefs) {
    vegScore = 20
    factors.push({ factor: 'Open to any vegetation', score: 20 })
    console.log('Vegetation: No preferences, 20 points')
  } else if (town.vegetation_type_actual?.length) {
    console.log('Checking vegetation...')
    console.log('User wants:', preferences.vegetation_types)
    console.log('Town has:', town.vegetation_type_actual)
    
    const userVeg = preferences.vegetation_types.map(v => v.toLowerCase())
    const townVeg = town.vegetation_type_actual.map(v => v.toLowerCase())
    console.log('Normalized - User:', userVeg, 'Town:', townVeg)
    
    const hasMatch = userVeg.some(veg => {
      const found = townVeg.includes(veg)
      console.log(`  Checking "${veg}":`, found ? '✅' : '❌')
      return found
    })
    
    if (hasMatch) {
      vegScore = 20
      factors.push({ factor: 'Vegetation type match', score: 20 })
      console.log('Vegetation: Match found, 20 points')
    } else {
      factors.push({ factor: 'No vegetation match', score: 0 })
      console.log('Vegetation: No match, 0 points')
    }
  } else {
    factors.push({ factor: 'Vegetation data unavailable', score: 0 })
    console.log('Vegetation: Town has no data, 0 points')
  }
  
  console.log('Vegetation score:', vegScore, 'points')
  score += vegScore
  
  // Calculate final percentage based on 90 points total
  const totalPossible = 90
  const percentage = Math.round((score / totalPossible) * 100)
  
  console.log('')
  console.log('=== FINAL CALCULATION ===')
  console.log(`Total raw score: ${score} / ${totalPossible}`)
  console.log(`Percentage: ${percentage}%`)
  
  return {
    score: percentage,
    factors,
    category: 'Region',
    rawScore: score,
    maxScore: totalPossible
  }
}

console.log('=== TESTING POTENTIAL REAL-WORLD BUGS ===\n')

// TEST 1: Perfect case
console.log('TEST 1: Perfect case - should be 100%')
const perfectPrefs = {
  countries: ['Spain'],
  regions: ['Mediterranean'],
  geographic_features: ['Coastal'],
  vegetation_types: ['Mediterranean']
}
const spanishTown = {
  country: 'Spain',
  regions: ['Mediterranean'],
  geographic_features_actual: ['coastal'],
  vegetation_type_actual: ['mediterranean']
}
const perfectResult = calculateRegionScore(perfectPrefs, spanishTown)
console.log('Result:', perfectResult.score + '%')
console.log('Expected: 100%')
console.log('')

// TEST 2: Case sensitivity issue
console.log('TEST 2: Case sensitivity issue - might cause problems')
const caseSensitivePrefs = {
  countries: ['Spain'], // Capital S
  regions: ['Mediterranean'],
  geographic_features: ['Coastal'], // Capital C
  vegetation_types: ['Mediterranean'] // Capital M
}
const lowerCaseTown = {
  country: 'spain', // lowercase s - THIS COULD BE THE BUG!
  regions: ['mediterranean'],
  geographic_features_actual: ['coastal'], // lowercase c
  vegetation_type_actual: ['mediterranean'] // lowercase m
}
const caseResult = calculateRegionScore(caseSensitivePrefs, lowerCaseTown)
console.log('Result:', caseResult.score + '%')
console.log('Expected: Should be 100% but might fail due to case sensitivity')
console.log('')

// TEST 3: Missing geographic/vegetation data
console.log('TEST 3: Spanish town with missing geographic/vegetation data')
const incompletePrefs = {
  countries: ['Spain'],
  regions: ['Mediterranean'],
  geographic_features: ['Coastal'],
  vegetation_types: ['Mediterranean']
}
const incompleteTown = {
  country: 'Spain',
  regions: ['Mediterranean'],
  // Missing: geographic_features_actual
  // Missing: vegetation_type_actual
}
const incompleteResult = calculateRegionScore(incompletePrefs, incompleteTown)
console.log('Result:', incompleteResult.score + '%')
console.log('This might explain the 44% if Spanish towns have incomplete data!')
console.log('')

// TEST 4: What would give exactly 44%?
console.log('TEST 4: What combination gives exactly 44%?')
console.log('40 points out of 90 = 44.4% (rounded to 44%)')
console.log('So user gets country match (40 points) but no geo/veg matches (0+0 points)')
console.log('This suggests Spanish towns might have missing geographic_features_actual or vegetation_type_actual data!')

// Calculate what 44% means
const fortyFourPercent = Math.round(40 / 90 * 100)
console.log('')
console.log(`40/90 points = ${fortyFourPercent}% - THIS MATCHES THE REPORTED BUG!`)
console.log('')
console.log('🚨 DIAGNOSIS: Spanish towns likely have missing geographic_features_actual or vegetation_type_actual data!')
console.log('Users get country match (40 points) but miss geo (0 points) and vegetation (0 points) = 40/90 = 44%')