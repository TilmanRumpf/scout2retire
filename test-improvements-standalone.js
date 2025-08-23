// Standalone test of improvements (copied function to avoid supabase import)

function calculateRegionScore(preferences, town) {
  let score = 0
  let factors = []
  
  const hasCountryPrefs = preferences.countries?.length > 0
  const hasRegionPrefs = preferences.regions?.length > 0
  const hasGeoPrefs = preferences.geographic_features?.length > 0
  const hasVegPrefs = preferences.vegetation_types?.length > 0
  
  // If user has NO preferences at all, they're open to anywhere
  if (!hasCountryPrefs && !hasRegionPrefs && !hasGeoPrefs && !hasVegPrefs) {
    score = 100
    factors.push({ factor: 'Open to any location', score: 100 })
    return { score, factors }
  }
  
  // PART 1: REGION/COUNTRY MATCHING (Max 40 points)
  let regionCountryScore = 0
  
  if (!hasCountryPrefs && !hasRegionPrefs) {
    regionCountryScore = 40
    factors.push({ factor: 'Open to any country/region', score: 40 })
  } else {
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
    
    if (!countryMatched && hasRegionPrefs) {
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
    
    if (regionCountryScore === 0 && (hasCountryPrefs || hasRegionPrefs)) {
      factors.push({ factor: 'No location match', score: 0 })
    }
  }
  
  score += regionCountryScore
  
  // PART 2: GEOGRAPHIC FEATURES (Max 30 points) - WITH IMPROVEMENTS
  let geoScore = 0
  
  if (!hasGeoPrefs) {
    geoScore = 30
    factors.push({ factor: 'Open to any geography', score: 30 })
  } else {
    const userFeatures = preferences.geographic_features.map(f => f.toLowerCase())
    const townFeatures = (town.geographic_features_actual || []).map(f => f.toLowerCase())
    let hasMatch = userFeatures.some(feature => townFeatures.includes(feature))
    
    if (hasMatch) {
      geoScore = 30
      factors.push({ factor: 'Geographic features match', score: 30 })
    } else {
      // IMPROVED: Give partial credit for related features
      const relatedFeatures = {
        'coastal': ['island', 'lake', 'river'],
        'island': ['coastal'],
        'lake': ['coastal', 'river'],
        'river': ['lake', 'coastal'],
        'mountain': ['valley', 'forest'],
        'valley': ['mountain', 'river'],
        'forest': ['mountain', 'valley'],
        'plains': ['valley'],
        'desert': []
      }
      
      let partialMatch = false
      if (townFeatures.length > 0) {
        for (const userFeature of userFeatures) {
          const related = relatedFeatures[userFeature] || []
          if (townFeatures.some(tf => related.includes(tf))) {
            geoScore = 15  // 50% credit for related features
            factors.push({ factor: 'Related geographic features (partial)', score: 15 })
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
  
  // PART 3: VEGETATION TYPE (Max 20 points) - WITH IMPROVEMENTS
  let vegScore = 0
  
  // SMART INFERENCE: Mediterranean region implies vegetation compatibility
  const impliedMediterraneanVeg = !hasVegPrefs && hasRegionPrefs && 
    preferences.regions?.some(r => r.toLowerCase() === 'mediterranean')
  
  if (!hasVegPrefs) {
    vegScore = 20
    if (impliedMediterraneanVeg && town.vegetation_type_actual?.includes('mediterranean')) {
      factors.push({ factor: 'Mediterranean region implies vegetation OK', score: 20 })
    } else {
      factors.push({ factor: 'Open to any vegetation', score: 20 })
    }
  } else if (town.vegetation_type_actual?.length) {
    const userVeg = preferences.vegetation_types.map(v => v.toLowerCase())
    const townVeg = town.vegetation_type_actual.map(v => v.toLowerCase())
    const hasMatch = userVeg.some(veg => townVeg.includes(veg))
    
    if (hasMatch) {
      vegScore = 20
      factors.push({ factor: 'Vegetation type match', score: 20 })
    } else {
      // IMPROVED: Give partial credit for related vegetation
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
          factors.push({ factor: 'Related vegetation (partial)', score: 10 })
          partialMatch = true
          break
        }
      }
      
      if (!partialMatch) {
        factors.push({ factor: 'No vegetation match', score: 0 })
      }
    }
  } else {
    factors.push({ factor: 'Vegetation data unavailable', score: 0 })
  }
  
  score += vegScore
  
  const totalPossible = 90
  const percentage = Math.round((score / totalPossible) * 100)
  
  return { score: percentage, factors, rawScore: score, maxScore: totalPossible }
}

// Test data
const granada = {
  name: 'Granada',
  country: 'Spain',
  geo_region: 'Southern Europe,Western Europe,Mediterranean',
  geographic_features_actual: ['continental', 'mountain'],
  vegetation_type_actual: ['mediterranean']
}

const alicante = {
  name: 'Alicante',
  country: 'Spain',
  geo_region: 'Southern Europe,Western Europe,Mediterranean',
  geographic_features_actual: ['coastal'],
  vegetation_type_actual: ['mediterranean']
}

console.log('=== TESTING REGION SCORING IMPROVEMENTS ===\n')

// TEST 1: User wants coastal Spain but gets mountain town
console.log('TEST 1: User wants coastal Spain, testing Granada (mountain)')
console.log('OLD: 44% (40 country + 0 geo + 0 veg)')
console.log('NEW: Should get partial credit for related features')
const test1 = calculateRegionScore({
  countries: ['Spain'],
  regions: ['Mediterranean'],
  geographic_features: ['coastal'],
  vegetation_types: ['subtropical']
}, granada)
console.log(`RESULT: ${test1.score}%`)
console.log('Points:', test1.factors.map(f => `${f.score}pts`).join(' + '), `= ${test1.rawScore}/${test1.maxScore}`)
console.log('')

// TEST 2: Island vs Coastal (related water features)
console.log('TEST 2: User wants island, testing Alicante (coastal)')
const test2 = calculateRegionScore({
  countries: ['Spain'],
  regions: [],
  geographic_features: ['island'],
  vegetation_types: []
}, alicante)
console.log(`RESULT: ${test2.score}%`)
console.log('Points:', test2.factors.map(f => `${f.score}pts`).join(' + '), `= ${test2.rawScore}/${test2.maxScore}`)
console.log('')

// TEST 3: Mediterranean region implies vegetation
console.log('TEST 3: Mediterranean region (no veg specified) vs Granada')
const test3 = calculateRegionScore({
  countries: ['Spain'],
  regions: ['Mediterranean'],
  // NO geographic_features
  // NO vegetation_types
}, granada)
console.log(`RESULT: ${test3.score}%`)
console.log('Points:', test3.factors.map(f => `${f.score}pts`).join(' + '), `= ${test3.rawScore}/${test3.maxScore}`)
console.log('')

// TEST 4: Subtropical vs Mediterranean (related)
console.log('TEST 4: User wants subtropical, Granada has mediterranean')
const test4 = calculateRegionScore({
  countries: ['Spain'],
  regions: [],
  geographic_features: [],
  vegetation_types: ['subtropical']
}, granada)
console.log(`RESULT: ${test4.score}%`)
console.log('Points:', test4.factors.map(f => `${f.score}pts`).join(' + '), `= ${test4.rawScore}/${test4.maxScore}`)
console.log('')

// TEST 5: Valley vs Mountain (related terrain)
console.log('TEST 5: User wants valley, Granada has mountain')
const test5 = calculateRegionScore({
  countries: ['Spain'],
  regions: [],
  geographic_features: ['valley'],
  vegetation_types: []
}, granada)
console.log(`RESULT: ${test5.score}%`)
console.log('Points:', test5.factors.map(f => `${f.score}pts`).join(' + '), `= ${test5.rawScore}/${test5.maxScore}`)
console.log('')

// TEST 6: The original problem case
console.log('TEST 6: Spain + Med + wrong features (original 44% case)')
const test6 = calculateRegionScore({
  countries: ['Spain'],
  regions: ['Southern Europe', 'Mediterranean'],
  geographic_features: ['coastal', 'island'],  // Granada has neither
  vegetation_types: ['tropical']  // Granada is not tropical
}, granada)
console.log(`RESULT: ${test6.score}%`)
console.log('Points:', test6.factors.map(f => `${f.score}pts`).join(' + '), `= ${test6.rawScore}/${test6.maxScore}`)
console.log('')

console.log('=== SUMMARY OF IMPROVEMENTS ===')
console.log('✓ Related features get 50% credit (15/30 or 10/20 pts)')
console.log('✓ Water features are interchangeable (coastal/island/lake)')
console.log('✓ Terrain features are related (mountain/valley/forest)')
console.log('✓ Climate vegetation is related (mediterranean/subtropical)')
console.log('✓ Mediterranean region implies vegetation compatibility')
console.log('\nThese changes make scoring more forgiving and intuitive!')