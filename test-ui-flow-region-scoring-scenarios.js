#!/usr/bin/env node

/**
 * TEST SCENARIOS: Different preference scenarios to reproduce 44% Spanish towns
 * 
 * This script tests various scenarios that could lead to 44% region scoring:
 * 1. User has Spain in countries but missing geographic/vegetation preferences
 * 2. User has geographic preferences that don't match Spanish towns
 * 3. User has Mediterranean regions but missing Spain in countries
 * 4. Various data corruption scenarios
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
)

// Same conversion function from unifiedScoring.js
function convertPreferencesToAlgorithmFormat(userPreferences) {
  const regionPreferences = userPreferences.region || userPreferences.region_preferences || {};
  
  if (userPreferences.countries || userPreferences.regions) {
    regionPreferences.countries = userPreferences.countries || regionPreferences.countries || [];
    regionPreferences.regions = userPreferences.regions || regionPreferences.regions || [];
  }
  
  if (userPreferences.geographic_features) {
    regionPreferences.geographic_features = userPreferences.geographic_features;
  }
  if (userPreferences.vegetation_types) {
    regionPreferences.vegetation_types = userPreferences.vegetation_types;
  }
  if (userPreferences.provinces) {
    regionPreferences.provinces = userPreferences.provinces;
  }
  
  return { region_preferences: regionPreferences };
}

// Same region scoring function from enhancedMatchingAlgorithm.js
function calculateRegionScore(preferences, town, debug = false) {
  let score = 0
  let factors = []
  
  const hasCountryPrefs = preferences.countries?.length > 0
  const hasRegionPrefs = preferences.regions?.length > 0
  const hasGeoPrefs = preferences.geographic_features?.length > 0
  const hasVegPrefs = preferences.vegetation_types?.length > 0
  
  if (debug) {
    console.log(`\n=== REGION SCORING for ${town.name} ===`)
    console.log('User preferences:', {
      countries: preferences.countries,
      regions: preferences.regions,
      geographic_features: preferences.geographic_features,
      vegetation_types: preferences.vegetation_types
    })
  }
  
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
  
  // PART 1: COUNTRY/REGION MATCHING (Max 40 points)
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
        'mediterranean': ['subtropical', 'forest'],
        'subtropical': ['tropical', 'mediterranean'],
        'tropical': ['subtropical'],
        'forest': ['mediterranean'],
        'grassland': [],
        'desert': []
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
        factors.push({ factor: 'No vegetation type match', score: 0 })
      }
    }
  } else {
    factors.push({ factor: 'No town vegetation data available', score: 0 })
  }
  
  score += vegScore
  
  return { score, factors, category: 'Region' }
}

function testScenario(scenarioName, mockPreferences, spanishTown) {
  console.log(`\n🧪 SCENARIO: ${scenarioName}`)
  console.log('=' .repeat(60))
  
  const convertedPrefs = convertPreferencesToAlgorithmFormat(mockPreferences)
  console.log('Converted preferences:', convertedPrefs.region_preferences)
  
  const result = calculateRegionScore(convertedPrefs.region_preferences, spanishTown, true)
  const percentage = Math.round((result.score / 90) * 100)
  
  console.log(`\n📊 RESULT: ${result.score}/90 (${percentage}%)`)
  console.log('Factors:', result.factors.map(f => `${f.factor}: ${f.score}`))
  
  if (percentage === 44) {
    console.log('🎯 BINGO! This scenario produces 44%!')
  }
  
  return { score: result.score, percentage }
}

async function runAllScenarios() {
  console.log('🎯 TESTING SCENARIOS TO REPRODUCE 44% SPANISH REGION SCORE')
  console.log('=' .repeat(80))
  
  // Get a Spanish town
  const { data: spanishTowns } = await supabase
    .from('towns')
    .select('*')
    .eq('country', 'Spain')
    .limit(1)
  
  const spanishTown = spanishTowns[0]
  console.log('Using Spanish town:', spanishTown.name)
  console.log('Town data:', {
    country: spanishTown.country,
    geographic_features_actual: spanishTown.geographic_features_actual,
    vegetation_type_actual: spanishTown.vegetation_type_actual
  })
  
  // SCENARIO 1: Has Spain in countries, but no geographic or vegetation preferences
  const scenario1 = {
    countries: ['Spain'],
    regions: [],
    geographic_features: [],
    vegetation_types: []
  }
  testScenario('Spain in countries, NO geo/vegetation preferences', scenario1, spanishTown)
  
  // SCENARIO 2: Has Spain in countries, but non-matching geographic features
  const scenario2 = {
    countries: ['Spain'],
    regions: [],
    geographic_features: ['mountain', 'forest'], // Spanish towns are coastal
    vegetation_types: []
  }
  testScenario('Spain in countries, NON-matching geographic features', scenario2, spanishTown)
  
  // SCENARIO 3: Has Spain in countries, but non-matching vegetation
  const scenario3 = {
    countries: ['Spain'],
    regions: [],
    geographic_features: [],
    vegetation_types: ['desert', 'grassland'] // Spanish towns are mediterranean
  }
  testScenario('Spain in countries, NON-matching vegetation types', scenario3, spanishTown)
  
  // SCENARIO 4: Has Spain + non-matching geo + non-matching vegetation
  const scenario4 = {
    countries: ['Spain'],
    regions: [],
    geographic_features: ['mountain'],
    vegetation_types: ['desert']
  }
  testScenario('Spain in countries, BOTH geo & vegetation non-matching', scenario4, spanishTown)
  
  // SCENARIO 5: Mediterranean region but NO Spain in countries
  const scenario5 = {
    countries: ['Portugal'], // Not Spain!
    regions: ['Mediterranean'],
    geographic_features: ['coastal'],
    vegetation_types: ['mediterranean']
  }
  testScenario('Mediterranean region but NO Spain in countries', scenario5, spanishTown)
  
  // SCENARIO 6: Empty countries array but has regions
  const scenario6 = {
    countries: [], // Empty!
    regions: ['Mediterranean'],
    geographic_features: ['coastal'],
    vegetation_types: ['mediterranean']
  }
  testScenario('EMPTY countries, but has Mediterranean region', scenario6, spanishTown)
  
  // SCENARIO 7: Tilman's ACTUAL current preferences (should be 100%)
  const { data: tilmanPrefs } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', '83d285b2-b21b-4d13-a1a1-6d51b6733d52')
    .single()
  
  testScenario('Tilman\'s ACTUAL current preferences', tilmanPrefs, spanishTown)
  
  console.log('\n✅ ALL SCENARIOS TESTED')
  console.log('🔍 Look for the scenario that produces exactly 44%')
}

runAllScenarios()