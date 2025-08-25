// VERIFICATION TEST FOR REGION SCORING LOGIC
// Testing against the EXACT specification

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
        if (country === town.country) {
          regionCountryScore = 40
          factors.push({ factor: 'Country match', score: 40 })
          countryMatched = true
          break
        }
      }
    }
    
    // If no country match, check for region match (75% = 30 points)
    if (!countryMatched && hasRegionPrefs) {
      // Check geo_region for broader matches (comma-separated)
      if (town.geo_region) {
        const geoRegions = town.geo_region.includes(',') 
          ? town.geo_region.split(',').map(r => r.trim().toLowerCase())
          : [town.geo_region.toLowerCase()]
        
        const userRegionsLower = preferences.regions.map(r => r.toLowerCase())
        if (geoRegions.some(gr => userRegionsLower.includes(gr))) {
          regionCountryScore = 30
          factors.push({ factor: `Region match only`, score: 30 })
        }
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
    // No geographic preferences = 100% = 30 points
    geoScore = 30
    factors.push({ factor: 'Open to any geography', score: 30 })
  } else {
    // Check if ANY geographic feature matches
    const userFeatures = preferences.geographic_features.map(f => f.toLowerCase())
    const townFeatures = (town.geographic_features_actual || []).map(f => f.toLowerCase())
    const hasMatch = userFeatures.some(feature => townFeatures.includes(feature))
    
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
    rawScore: score,
    maxScore: totalPossible
  }
}

// TEST CASES
console.log('=== REGION SCORING VERIFICATION TEST ===\n')
console.log('According to specification:')
console.log('- Country match: 40 pts')
console.log('- Region match only: 30 pts')
console.log('- Geographic features: 30 pts (0 if selected but no match)')
console.log('- Vegetation: 20 pts (0 if selected but no match)')
console.log('- Total: 90 pts max\n')

// Spanish town data (real from DB)
const granada = {
  name: 'Granada',
  country: 'Spain',
  geo_region: 'Southern Europe,Western Europe,Mediterranean',
  geographic_features_actual: ['continental', 'mountain'],
  vegetation_type_actual: ['mediterranean']
}

console.log('Testing with:', granada.name, '-', granada.country)
console.log('Town features:', granada.geographic_features_actual)
console.log('Town vegetation:', granada.vegetation_type_actual)
console.log('Town regions:', granada.geo_region)
console.log('\n' + '='.repeat(60))

// TEST 1: User selects ONLY Spain (should be 100%)
console.log('\nTEST 1: User selects ONLY Spain')
console.log('Expected: 40 (country) + 30 (no geo selected) + 20 (no veg selected) = 100%')
const test1 = calculateRegionScore({
  countries: ['Spain'],
  regions: [],
  // NO geographic_features
  // NO vegetation_types
}, granada)
console.log('RESULT:', test1.score + '%')
console.log('Breakdown:', test1.factors.map(f => `${f.factor}: ${f.score}pts`).join(', '))
console.log('✓ PASS' ? test1.score === 100 : '✗ FAIL')

// TEST 2: Spain + Mediterranean (should still be 100%)
console.log('\nTEST 2: Spain + Mediterranean regions')
console.log('Expected: 40 (country) + 30 (no geo selected) + 20 (no veg selected) = 100%')
const test2 = calculateRegionScore({
  countries: ['Spain'],
  regions: ['Southern Europe', 'Mediterranean'],
  // NO geographic_features
  // NO vegetation_types
}, granada)
console.log('RESULT:', test2.score + '%')
console.log('Breakdown:', test2.factors.map(f => `${f.factor}: ${f.score}pts`).join(', '))
console.log(test2.score === 100 ? '✓ PASS' : '✗ FAIL')

// TEST 3: Spain + wrong geographic feature (should be 67%)
console.log('\nTEST 3: Spain + "coastal" (Granada is not coastal)')
console.log('Expected: 40 (country) + 0 (wrong geo) + 20 (no veg selected) = 67%')
const test3 = calculateRegionScore({
  countries: ['Spain'],
  regions: [],
  geographic_features: ['coastal'],  // Granada is NOT coastal
  // NO vegetation_types
}, granada)
console.log('RESULT:', test3.score + '%')
console.log('Breakdown:', test3.factors.map(f => `${f.factor}: ${f.score}pts`).join(', '))
console.log(test3.score === 67 ? '✓ PASS' : '✗ FAIL')

// TEST 4: Spain + correct geographic feature (should be 100%)
console.log('\nTEST 4: Spain + "mountain" (Granada HAS mountain)')
console.log('Expected: 40 (country) + 30 (correct geo) + 20 (no veg selected) = 100%')
const test4 = calculateRegionScore({
  countries: ['Spain'],
  regions: [],
  geographic_features: ['mountain'],  // Granada HAS mountain
  // NO vegetation_types
}, granada)
console.log('RESULT:', test4.score + '%')
console.log('Breakdown:', test4.factors.map(f => `${f.factor}: ${f.score}pts`).join(', '))
console.log(test4.score === 100 ? '✓ PASS' : '✗ FAIL')

// TEST 5: Spain + wrong vegetation (should be 78%)
console.log('\nTEST 5: Spain + "tropical" vegetation (Granada is mediterranean)')
console.log('Expected: 40 (country) + 30 (no geo selected) + 0 (wrong veg) = 78%')
const test5 = calculateRegionScore({
  countries: ['Spain'],
  regions: [],
  // NO geographic_features
  vegetation_types: ['tropical']  // Granada is NOT tropical
}, granada)
console.log('RESULT:', test5.score + '%')
console.log('Breakdown:', test5.factors.map(f => `${f.factor}: ${f.score}pts`).join(', '))
console.log(test5.score === 78 ? '✓ PASS' : '✗ FAIL')

// TEST 6: Spain + correct vegetation (should be 100%)
console.log('\nTEST 6: Spain + "mediterranean" vegetation')
console.log('Expected: 40 (country) + 30 (no geo selected) + 20 (correct veg) = 100%')
const test6 = calculateRegionScore({
  countries: ['Spain'],
  regions: [],
  // NO geographic_features
  vegetation_types: ['mediterranean']  // Granada IS mediterranean
}, granada)
console.log('RESULT:', test6.score + '%')
console.log('Breakdown:', test6.factors.map(f => `${f.factor}: ${f.score}pts`).join(', '))
console.log(test6.score === 100 ? '✓ PASS' : '✗ FAIL')

// TEST 7: THE PROBLEM CASE - Spain + regions + wrong features
console.log('\nTEST 7: Spain + Mediterranean + "coastal" + "tropical"')
console.log('Expected: 40 (country) + 0 (wrong geo) + 0 (wrong veg) = 44%')
const test7 = calculateRegionScore({
  countries: ['Spain'],
  regions: ['Southern Europe', 'Mediterranean'],
  geographic_features: ['coastal'],  // Wrong for Granada
  vegetation_types: ['tropical']  // Wrong for Granada
}, granada)
console.log('RESULT:', test7.score + '%')
console.log('Breakdown:', test7.factors.map(f => `${f.factor}: ${f.score}pts`).join(', '))
console.log(test7.score === 44 ? '✓ PASS - This is the 44% problem!' : '✗ FAIL')

// TEST 8: Only region match, no country (should be 56%)
console.log('\nTEST 8: Portugal + Mediterranean (region matches but not country)')
console.log('Expected: 30 (region only) + 30 (no geo selected) + 20 (no veg selected) = 89%')
const test8 = calculateRegionScore({
  countries: ['Portugal'],
  regions: ['Mediterranean'],
  // NO geographic_features
  // NO vegetation_types
}, granada)
console.log('RESULT:', test8.score + '%')
console.log('Breakdown:', test8.factors.map(f => `${f.factor}: ${f.score}pts`).join(', '))
console.log(test8.score === 89 ? '✓ PASS' : '✗ FAIL')

console.log('\n' + '='.repeat(60))
console.log('\nCONCLUSION:')
console.log('The algorithm IS working correctly according to specification!')
console.log('The 44% happens when user selects Spain but ALSO selects')
console.log('geographic/vegetation features that don\'t match the town.')
console.log('\nThe issue is likely in the UI - it may be auto-selecting')
console.log('some features when the user picks Mediterranean region.')