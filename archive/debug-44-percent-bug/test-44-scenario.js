#!/usr/bin/env node

/**
 * TEST SCENARIO: Recreate the exact 44% scoring scenario
 * 
 * From the algorithm: 44% = 40/90 points
 * This means: 40 points from PART 1, 0 from PART 2, 0 from PART 3
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
)

// Copy the exact calculateRegionScore logic
function calculateRegionScore(preferences, town) {
  let score = 0
  let factors = []
  
  const hasCountryPrefs = preferences.countries?.length > 0
  const hasRegionPrefs = preferences.regions?.length > 0
  const hasGeoPrefs = preferences.geographic_features?.length > 0
  const hasVegPrefs = preferences.vegetation_types?.length > 0
  
  if (!hasCountryPrefs && !hasRegionPrefs && !hasGeoPrefs && !hasVegPrefs) {
    score = 100
    factors.push({ factor: 'Open to any location', score: 100 })
    return { score, factors, category: 'Region' }
  }
  
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
    regionCountryScore = 40
    factors.push({ factor: 'Open to any country/region', score: 40 })
  } else {
    let countryMatched = false
    if (hasCountryPrefs) {
      for (const country of preferences.countries) {
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
    
    if (!countryMatched && hasRegionPrefs) {
      const userRegionsLower = preferences.regions.map(r => r.toLowerCase())
      
      if (town.regions?.some(region => userRegionsLower.includes(region.toLowerCase()))) {
        regionCountryScore = 30
        factors.push({ factor: 'Region match only', score: 30 })
      } else if (town.geo_region) {
        const geoRegions = town.geo_region.includes(',') 
          ? town.geo_region.split(',').map(r => r.trim().toLowerCase())
          : [town.geo_region.toLowerCase()]
        
        if (geoRegions.some(gr => userRegionsLower.includes(gr))) {
          regionCountryScore = 30
          factors.push({ factor: `Region match only (${town.geo_region})`, score: 30 })
        }
      }
    }
    
    if (regionCountryScore === 0 && (hasCountryPrefs || hasRegionPrefs)) {
      regionCountryScore = 0
      factors.push({ factor: 'No location match', score: 0 })
    }
  }
  
  score += regionCountryScore
  
  // PART 2: GEOGRAPHIC FEATURES (Max 30 points)
  let geoScore = 0
  
  const ALL_GEO_FEATURES = ['coastal', 'mountain', 'island', 'lake', 'river', 'valley', 'desert', 'forest', 'plains']
  const userSelectedAllGeo = preferences.geographic_features?.length === ALL_GEO_FEATURES.length &&
    ALL_GEO_FEATURES.every(f => preferences.geographic_features.map(gf => gf.toLowerCase()).includes(f))
  
  if (!hasGeoPrefs || userSelectedAllGeo) {
    geoScore = 30
    factors.push({ factor: userSelectedAllGeo ? 'Open to all geographies (all selected)' : 'Open to any geography', score: 30 })
  } else {
    let hasMatch = false
    const userFeatures = preferences.geographic_features.map(f => f.toLowerCase())
    
    if (town.geographic_features_actual?.length) {
      const townFeatures = town.geographic_features_actual.map(f => f.toLowerCase())
      hasMatch = userFeatures.some(feature => townFeatures.includes(feature))
    }
    
    if (!hasMatch && userFeatures.includes('coastal') && town.regions?.length) {
      const coastalIndicators = ['gulf', 'ocean', 'coast', 'beach', 'sea', 'atlantic', 'pacific', 'mediterranean']
      hasMatch = town.regions.some(region => 
        coastalIndicators.some(indicator => region.toLowerCase().includes(indicator))
      )
    }
    
    if (hasMatch) {
      geoScore = 30
      factors.push({ factor: 'Geographic features match', score: 30 })
    } else {
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
      if (town.geographic_features_actual?.length) {
        const townFeatures = town.geographic_features_actual.map(f => f.toLowerCase())
        for (const userFeature of userFeatures) {
          const related = relatedFeatures[userFeature] || []
          if (townFeatures.some(tf => related.includes(tf))) {
            geoScore = 15
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
  
  const ALL_VEG_TYPES = ['tropical', 'subtropical', 'mediterranean', 'forest', 'grassland', 'desert']
  const userSelectedAllVeg = preferences.vegetation_types?.length === ALL_VEG_TYPES.length &&
    ALL_VEG_TYPES.every(v => preferences.vegetation_types.map(vt => vt.toLowerCase()).includes(v))
  
  const impliedMediterraneanVeg = !hasVegPrefs && hasRegionPrefs && 
    preferences.regions?.some(r => r.toLowerCase() === 'mediterranean')
  
  if (!hasVegPrefs || userSelectedAllVeg) {
    vegScore = 20
    if (impliedMediterraneanVeg && town.vegetation_type_actual?.includes('mediterranean')) {
      factors.push({ factor: 'Mediterranean region implies vegetation compatibility', score: 20 })
    } else {
      factors.push({ factor: userSelectedAllVeg ? 'Open to all vegetation (all selected)' : 'Open to any vegetation', score: 20 })
    }
  } else if (town.vegetation_type_actual?.length) {
    const userVeg = preferences.vegetation_types.map(v => v.toLowerCase())
    const townVeg = town.vegetation_type_actual.map(v => v.toLowerCase())
    const hasMatch = userVeg.some(veg => townVeg.includes(veg))
    
    if (hasMatch) {
      vegScore = 20
      factors.push({ factor: 'Vegetation type match', score: 20 })
    } else {
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
          vegScore = 10
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
    factors.push({ factor: 'Vegetation data unavailable', score: 0 })
  }
  
  score += vegScore
  
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

async function test44Scenario() {
  console.log('🧪 TESTING: Scenarios that could produce 44% region score')
  console.log('=' .repeat(80))
  
  // Get one Spanish town for testing
  const { data: spanishTowns, error } = await supabase
    .from('towns')
    .select(`id, name, country, region, geo_region, geographic_features_actual, vegetation_type_actual, regions`)
    .eq('country', 'Spain')
    .limit(1)
  
  if (error) {
    console.error('Error getting Spanish town:', error)
    return
  }
  
  const testTown = spanishTowns[0]
  console.log(`\n📍 Test Town: ${testTown.name}, Spain`)
  console.log('Town data:', {
    country: testTown.country,
    geo_region: testTown.geo_region,
    geographic_features_actual: testTown.geographic_features_actual,
    vegetation_type_actual: testTown.vegetation_type_actual,
    regions: testTown.regions
  })
  
  console.log('\n🎯 HYPOTHESIS: 44% = 40/90 points means:')
  console.log('   - PART 1 (Region/Country): 40 points (full match)')
  console.log('   - PART 2 (Geographic): 0 points (no match)')
  console.log('   - PART 3 (Vegetation): 0 points (no match)')
  
  // SCENARIO 1: User wants Spain country, but wrong geographic features and vegetation
  console.log('\n🧪 SCENARIO 1: Spain country + wrong geo/veg preferences')
  console.log('-'.repeat(70))
  
  const scenario1Prefs = {
    countries: ['Spain'],  // This should give 40 points
    regions: [],
    geographic_features: ['mountain', 'valley'],  // Valencia is coastal, not mountain
    vegetation_types: ['tropical', 'desert']      // Valencia is mediterranean, not tropical/desert
  }
  
  const result1 = calculateRegionScore(scenario1Prefs, testTown)
  console.log(`Result: ${result1.score}% (${result1.rawScore}/${result1.maxScore})`)
  console.log('Factors:')
  result1.factors.forEach(f => console.log(`  - ${f.factor}: ${f.score} points`))
  
  if (result1.score === 44) {
    console.log('🎯 FOUND THE 44% SCENARIO!')
  }
  
  // SCENARIO 2: User wants Mediterranean region, but wrong geo/veg
  console.log('\n🧪 SCENARIO 2: Mediterranean region + wrong geo/veg preferences')
  console.log('-'.repeat(70))
  
  const scenario2Prefs = {
    countries: [],
    regions: ['Mediterranean'],  // This could give 30 points (not 40)
    geographic_features: ['mountain', 'valley'],
    vegetation_types: ['tropical', 'desert']
  }
  
  const result2 = calculateRegionScore(scenario2Prefs, testTown)
  console.log(`Result: ${result2.score}% (${result2.rawScore}/${result2.maxScore})`)
  console.log('Factors:')
  result2.factors.forEach(f => console.log(`  - ${f.factor}: ${f.score} points`))
  
  // SCENARIO 3: Let's look at the UI scoring in action
  console.log('\n🔍 TESTING WITH ACTUAL USER FROM DATABASE')
  console.log('-'.repeat(70))
  
  // Get the user whose preferences we tested earlier
  const { data: userPrefs, error: userError } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', 'a9e07b59-c10e-4376-8431-879c566df9c6')
    .single()
  
  if (userError) {
    console.error('Error getting user:', userError)
    return
  }
  
  const realPrefs = {
    countries: userPrefs.countries || [],
    regions: userPrefs.regions || [],
    geographic_features: userPrefs.geographic_features || [],
    vegetation_types: userPrefs.vegetation_types || []
  }
  
  const realResult = calculateRegionScore(realPrefs, testTown)
  console.log('Real user preferences:', realPrefs)
  console.log(`Real result: ${realResult.score}% (${realResult.rawScore}/${realResult.maxScore})`)
  console.log('Real factors:')
  realResult.factors.forEach(f => console.log(`  - ${f.factor}: ${f.score} points`))
  
  // SCENARIO 4: Force a 44% scenario
  console.log('\n🧪 SCENARIO 4: Force exact 44% (40 points scenario)')
  console.log('-'.repeat(70))
  
  // Create a town that will give us EXACTLY 40 points
  const forcedTown = {
    ...testTown,
    country: 'TestCountry',
    geographic_features_actual: ['desert'],  // User wants coastal, town has desert
    vegetation_type_actual: ['tropical']     // User wants mediterranean, town has tropical
  }
  
  const forcedPrefs = {
    countries: ['TestCountry'],           // Will match = 40 points
    regions: [],
    geographic_features: ['coastal'],     // Won't match desert = 0 points  
    vegetation_types: ['mediterranean']   // Won't match tropical = 0 points
  }
  
  const forcedResult = calculateRegionScore(forcedPrefs, forcedTown)
  console.log('Forced scenario:')
  console.log('  - Country: TestCountry (match = 40 points)')
  console.log('  - Geographic: coastal vs desert (no match = 0 points)')
  console.log('  - Vegetation: mediterranean vs tropical (no match = 0 points)')
  console.log(`Result: ${forcedResult.score}% (${forcedResult.rawScore}/${forcedResult.maxScore})`)
  
  if (forcedResult.score === 44) {
    console.log('🎯 CONFIRMED: This creates exactly 44%!')
    console.log('\n🔍 ROOT CAUSE ANALYSIS:')
    console.log('   The 44% score happens when:')
    console.log('   1. User gets a country match (40 points)')
    console.log('   2. User has geographic preferences that don\'t match (0 points)')
    console.log('   3. User has vegetation preferences that don\'t match (0 points)')
    console.log('   4. Total: 40/90 = 44.4% → rounded to 44%')
  }
  
  console.log('\n🚨 CRITICAL FINDINGS:')
  console.log('   - The 44% issue is NOT with Spanish towns specifically')
  console.log('   - It happens when user preferences partially match towns')
  console.log('   - Need to check: What are the EXACT preferences causing 44% in UI?')
  console.log('   - Recommendation: Check the actual user data being used in production')
}

test44Scenario()