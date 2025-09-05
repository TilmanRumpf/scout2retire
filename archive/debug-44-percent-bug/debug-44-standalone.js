#!/usr/bin/env node

/**
 * STANDALONE DEBUG: Why ALL Spanish towns show EXACTLY 44% region score
 * 
 * This script recreates the calculateRegionScore logic without imports
 */

import { createClient } from '@supabase/supabase-js'

// Supabase config
const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
)

// Recreate the exact calculateRegionScore logic (simplified)
function debugCalculateRegionScore(preferences, town) {
  let score = 0
  let factors = []
  
  console.log(`\n🔍 DEBUG CALCULATE REGION SCORE for ${town.name}`)
  console.log('Input preferences:', JSON.stringify(preferences, null, 2))
  console.log('Input town data:', {
    country: town.country,
    geo_region: town.geo_region,
    geographic_features_actual: town.geographic_features_actual,
    vegetation_type_actual: town.vegetation_type_actual
  })
  
  // Check if user has any preferences at all
  const hasCountryPrefs = preferences.countries?.length > 0
  const hasRegionPrefs = preferences.regions?.length > 0
  const hasGeoPrefs = preferences.geographic_features?.length > 0
  const hasVegPrefs = preferences.vegetation_types?.length > 0
  
  console.log('\nPreference flags:')
  console.log('  hasCountryPrefs:', hasCountryPrefs, hasCountryPrefs ? preferences.countries : 'none')
  console.log('  hasRegionPrefs:', hasRegionPrefs, hasRegionPrefs ? preferences.regions : 'none')
  console.log('  hasGeoPrefs:', hasGeoPrefs, hasGeoPrefs ? preferences.geographic_features : 'none')
  console.log('  hasVegPrefs:', hasVegPrefs, hasVegPrefs ? preferences.vegetation_types : 'none')
  
  // If user has NO preferences at all, they're open to anywhere - give perfect score
  if (!hasCountryPrefs && !hasRegionPrefs && !hasGeoPrefs && !hasVegPrefs) {
    score = 100
    factors.push({ factor: 'Open to any location', score: 100 })
    console.log('➤ No preferences at all = 100% score')
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
  console.log('\n🏴 PART 1: REGION/COUNTRY MATCHING (Max 40 points)')
  let regionCountryScore = 0
  
  if (!hasCountryPrefs && !hasRegionPrefs) {
    // No country/region preferences = 100% = 40 points
    regionCountryScore = 40
    factors.push({ factor: 'Open to any country/region', score: 40 })
    console.log('➤ No country/region preferences = 40 points')
  } else {
    // Check for country match first (highest priority)
    let countryMatched = false
    if (hasCountryPrefs) {
      console.log('  Checking country matches:')
      for (const country of preferences.countries) {
        console.log(`    "${country}" vs town "${town.country}"`)
        // Check if it's a US state
        if (US_STATES.has(country) && town.country === 'United States' && town.region === country) {
          regionCountryScore = 40
          factors.push({ factor: `State match (${country})`, score: 40 })
          countryMatched = true
          console.log(`    ✅ US STATE MATCH: ${country} = 40 points`)
          break
        } else if (country === town.country) {
          regionCountryScore = 40
          factors.push({ factor: 'Country match', score: 40 })
          countryMatched = true
          console.log(`    ✅ COUNTRY MATCH: ${country} = 40 points`)
          break
        } else {
          console.log(`    ❌ No match: "${country}" !== "${town.country}"`)
        }
      }
    }
    
    // If no country match, check for region match (75% = 30 points)
    if (!countryMatched && hasRegionPrefs) {
      console.log('  No country match, checking region matches:')
      // Check traditional regions array (case-insensitive)
      const userRegionsLower = preferences.regions.map(r => r.toLowerCase())
      console.log('    User regions (lowercase):', userRegionsLower)
      
      if (town.regions?.some(region => userRegionsLower.includes(region.toLowerCase()))) {
        regionCountryScore = 30
        factors.push({ factor: 'Region match only', score: 30 })
        console.log('    ✅ REGION MATCH in regions array = 30 points')
      }
      // Also check geo_region for broader matches (now comma-separated)
      else if (town.geo_region) {
        console.log('    Checking geo_region:', town.geo_region)
        // Handle comma-separated geo_region
        const geoRegions = town.geo_region.includes(',') 
          ? town.geo_region.split(',').map(r => r.trim().toLowerCase())
          : [town.geo_region.toLowerCase()]
        
        console.log('    Geo regions (lowercase):', geoRegions)
        if (geoRegions.some(gr => userRegionsLower.includes(gr))) {
          regionCountryScore = 30
          factors.push({ factor: `Region match only (${town.geo_region})`, score: 30 })
          console.log(`    ✅ GEO_REGION MATCH: ${town.geo_region} = 30 points`)
        } else {
          console.log('    ❌ No geo_region match found')
        }
      } else {
        console.log('    ❌ No geo_region data available')
      }
    }
    
    // If nothing matched and user had preferences, no points awarded
    if (regionCountryScore === 0 && (hasCountryPrefs || hasRegionPrefs)) {
      // No match = 0 points (as per specification)
      regionCountryScore = 0
      factors.push({ factor: 'No location match', score: 0 })
      console.log('    ❌ NO MATCHES FOUND = 0 points')
    }
  }
  
  score += regionCountryScore
  console.log(`  PART 1 RESULT: ${regionCountryScore} points (running total: ${score})`)
  
  // PART 2: GEOGRAPHIC FEATURES (Max 30 points)
  console.log('\n🏔️ PART 2: GEOGRAPHIC FEATURES (Max 30 points)')
  let geoScore = 0
  
  // Define all possible geographic features
  const ALL_GEO_FEATURES = ['coastal', 'mountain', 'island', 'lake', 'river', 'valley', 'desert', 'forest', 'plains']
  const userSelectedAllGeo = preferences.geographic_features?.length === ALL_GEO_FEATURES.length &&
    ALL_GEO_FEATURES.every(f => preferences.geographic_features.map(gf => gf.toLowerCase()).includes(f))
  
  if (!hasGeoPrefs || userSelectedAllGeo) {
    // No geographic preferences OR selected ALL = 100% = 30 points (user is open to anything)
    geoScore = 30
    factors.push({ factor: userSelectedAllGeo ? 'Open to all geographies (all selected)' : 'Open to any geography', score: 30 })
    console.log(`➤ ${userSelectedAllGeo ? 'Selected all geographies' : 'No geographic preferences'} = 30 points`)
  } else {
    console.log('  User has specific geographic preferences')
    console.log('    User features:', preferences.geographic_features)
    console.log('    Town features:', town.geographic_features_actual)
    
    // Check if ANY geographic feature matches
    let hasMatch = false
    const userFeatures = preferences.geographic_features.map(f => f.toLowerCase())
    
    // First try actual geographic features
    if (town.geographic_features_actual?.length) {
      const townFeatures = town.geographic_features_actual.map(f => f.toLowerCase())
      hasMatch = userFeatures.some(feature => townFeatures.includes(feature))
      console.log('    Direct feature match found:', hasMatch)
      
      if (hasMatch) {
        const matchingFeatures = userFeatures.filter(feature => townFeatures.includes(feature))
        console.log('    Matching features:', matchingFeatures)
      }
    } else {
      console.log('    No geographic_features_actual data in town')
    }
    
    // FALLBACK: Check regions array for coastal indicators when no geographic data
    if (!hasMatch && userFeatures.includes('coastal') && town.regions?.length) {
      console.log('    Checking coastal fallback in regions...')
      const coastalIndicators = ['gulf', 'ocean', 'coast', 'beach', 'sea', 'atlantic', 'pacific', 'mediterranean']
      hasMatch = town.regions.some(region => 
        coastalIndicators.some(indicator => region.toLowerCase().includes(indicator))
      )
      console.log('    Coastal fallback match:', hasMatch)
    }
    
    if (hasMatch) {
      geoScore = 30
      factors.push({ factor: 'Geographic features match', score: 30 })
      console.log('    ✅ GEOGRAPHIC MATCH = 30 points')
    } else {
      console.log('    Checking for partial matches...')
      // IMPROVED: Give partial credit for related geographic features
      // Water features are somewhat interchangeable for lifestyle purposes
      const relatedFeatures = {
        'coastal': ['island', 'lake', 'river'],  // All water access
        'island': ['coastal'],  // Islands are inherently coastal
        'lake': ['coastal', 'river'],  // Water features
        'river': ['lake', 'coastal'],  // Water features
        'mountain': ['valley', 'forest'],  // Often found together
        'valley': ['mountain', 'river'],  // Valleys often have rivers
        'forest': ['mountain', 'valley'],  // Forest areas
        'plains': ['valley'],  // Similar flat terrain
        'desert': []  // Desert is unique
      }
      
      let partialMatch = false
      if (town.geographic_features_actual?.length) {
        const townFeatures = town.geographic_features_actual.map(f => f.toLowerCase())
        for (const userFeature of userFeatures) {
          const related = relatedFeatures[userFeature] || []
          console.log(`      Checking ${userFeature} vs related features:`, related)
          if (townFeatures.some(tf => related.includes(tf))) {
            geoScore = 15  // 50% credit for related features
            factors.push({ factor: 'Related geographic features (partial match)', score: 15 })
            partialMatch = true
            console.log(`      ✅ PARTIAL MATCH: ${userFeature} related to town features = 15 points`)
            break
          }
        }
      }
      
      if (!partialMatch) {
        factors.push({ factor: 'No geographic feature match', score: 0 })
        console.log('      ❌ NO MATCHES (including partial) = 0 points')
      }
    }
  }
  
  score += geoScore
  console.log(`  PART 2 RESULT: ${geoScore} points (running total: ${score})`)
  
  // PART 3: VEGETATION TYPE (Max 20 points)
  console.log('\n🌿 PART 3: VEGETATION TYPE (Max 20 points)')
  let vegScore = 0
  
  // Define all possible vegetation types
  const ALL_VEG_TYPES = ['tropical', 'subtropical', 'mediterranean', 'forest', 'grassland', 'desert']
  const userSelectedAllVeg = preferences.vegetation_types?.length === ALL_VEG_TYPES.length &&
    ALL_VEG_TYPES.every(v => preferences.vegetation_types.map(vt => vt.toLowerCase()).includes(v))
  
  // SMART INFERENCE: If user selected Mediterranean region but didn't specify vegetation,
  // they're likely OK with mediterranean vegetation (common sense)
  const impliedMediterraneanVeg = !hasVegPrefs && hasRegionPrefs && 
    preferences.regions?.some(r => r.toLowerCase() === 'mediterranean')
  
  if (!hasVegPrefs || userSelectedAllVeg) {
    // No vegetation preferences OR selected ALL = 100% = 20 points (user is open to anything)
    vegScore = 20
    if (impliedMediterraneanVeg && town.vegetation_type_actual?.includes('mediterranean')) {
      factors.push({ factor: 'Mediterranean region implies vegetation compatibility', score: 20 })
      console.log('➤ Mediterranean region inference = 20 points')
    } else {
      factors.push({ factor: userSelectedAllVeg ? 'Open to all vegetation (all selected)' : 'Open to any vegetation', score: 20 })
      console.log(`➤ ${userSelectedAllVeg ? 'Selected all vegetation' : 'No vegetation preferences'} = 20 points`)
    }
  } else if (town.vegetation_type_actual?.length) {
    console.log('  User has specific vegetation preferences')
    console.log('    User vegetation:', preferences.vegetation_types)
    console.log('    Town vegetation:', town.vegetation_type_actual)
    
    // Check if ANY vegetation type matches
    const userVeg = preferences.vegetation_types.map(v => v.toLowerCase())
    const townVeg = town.vegetation_type_actual.map(v => v.toLowerCase())
    const hasMatch = userVeg.some(veg => townVeg.includes(veg))
    
    console.log('    Direct vegetation match found:', hasMatch)
    if (hasMatch) {
      const matchingVeg = userVeg.filter(veg => townVeg.includes(veg))
      console.log('    Matching vegetation:', matchingVeg)
    }
    
    if (hasMatch) {
      vegScore = 20
      factors.push({ factor: 'Vegetation type match', score: 20 })
      console.log('    ✅ VEGETATION MATCH = 20 points')
    } else {
      console.log('    Checking for partial vegetation matches...')
      // IMPROVED: Give partial credit for related vegetation types
      // Mediterranean is related to subtropical (both warm, dry climates)
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
        console.log(`      Checking ${userVegType} vs related vegetation:`, related)
        if (townVeg.some(tv => related.includes(tv))) {
          vegScore = 10  // 50% credit for related vegetation
          factors.push({ factor: 'Related vegetation type (partial match)', score: 10 })
          partialMatch = true
          console.log(`      ✅ PARTIAL MATCH: ${userVegType} related to town vegetation = 10 points`)
          break
        }
      }
      
      if (!partialMatch) {
        factors.push({ factor: 'No vegetation match', score: 0 })
        console.log('      ❌ NO MATCHES (including partial) = 0 points')
      }
    }
  } else {
    // User has preferences but town has no vegetation data
    factors.push({ factor: 'Vegetation data unavailable', score: 0 })
    console.log('    ❌ Town has no vegetation data = 0 points')
  }
  
  score += vegScore
  console.log(`  PART 3 RESULT: ${vegScore} points (running total: ${score})`)
  
  // Calculate final percentage based on 90 points total
  const totalPossible = 90
  const percentage = Math.round((score / totalPossible) * 100)
  
  console.log('\n📊 FINAL CALCULATION:')
  console.log(`  Raw Score: ${score} points`)
  console.log(`  Total Possible: ${totalPossible} points`)
  console.log(`  Percentage: ${score}/${totalPossible} = ${(score/totalPossible*100).toFixed(2)}%`)
  console.log(`  Rounded: ${percentage}%`)
  
  if (percentage === 44) {
    console.log('\n🚨 CONFIRMED: This gives exactly 44%!')
    console.log('  Analysis of 40/90 = 44.4% → 44%:')
    console.log('    - PART 1: 40 points (likely country or region match)')
    console.log('    - PART 2: 0 points (no geographic features match)')
    console.log('    - PART 3: 0 points (no vegetation match)')
  }
  
  return {
    score: percentage,
    factors,
    category: 'Region',
    rawScore: score,
    maxScore: totalPossible
  }
}

async function debugSpanish44Percent() {
  console.log('🔍 DEBUGGING: Why ALL Spanish towns show exactly 44% region score')
  console.log('=' .repeat(80))
  
  try {
    // 1. Get Tilman's user preferences
    console.log('\n1. GETTING TILMAN\'S USER PREFERENCES')
    console.log('-'.repeat(50))
    
    const { data: userPrefs, error: userError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', 'a9e07b59-c10e-4376-8431-879c566df9c6') // Recent user with preferences
      .single()
    
    if (userError) {
      console.error('❌ Error getting user preferences:', userError)
      return
    }
    
    console.log('✅ User preferences found')
    console.log('Region-related preferences:')
    console.log('  - countries:', userPrefs.countries)
    console.log('  - regions:', userPrefs.regions)
    console.log('  - geographic_features:', userPrefs.geographic_features)
    console.log('  - vegetation_types:', userPrefs.vegetation_types)
    
    // Transform to the format expected by calculateRegionScore
    const regionPreferences = {
      countries: userPrefs.countries || [],
      regions: userPrefs.regions || [],
      geographic_features: userPrefs.geographic_features || [],
      vegetation_types: userPrefs.vegetation_types || []
    }
    
    // 2. Get Spanish towns sample
    console.log('\n2. GETTING SPANISH TOWNS SAMPLE')
    console.log('-'.repeat(50))
    
    const { data: spanishTowns, error: townsError } = await supabase
      .from('towns')
      .select(`
        id, name, country, region, geo_region, 
        geographic_features_actual, vegetation_type_actual, regions
      `)
      .eq('country', 'Spain')
      .limit(3)
    
    if (townsError) {
      console.error('❌ Error getting Spanish towns:', townsError)
      return
    }
    
    console.log(`✅ Found ${spanishTowns.length} Spanish towns`)
    spanishTowns.forEach((town, i) => {
      console.log(`  ${i+1}. ${town.name}:`)
      console.log(`     - country: ${town.country}`)
      console.log(`     - region: ${town.region}`)
      console.log(`     - geo_region: ${town.geo_region}`)
      console.log(`     - geographic_features_actual: ${JSON.stringify(town.geographic_features_actual)}`)
      console.log(`     - vegetation_type_actual: ${JSON.stringify(town.vegetation_type_actual)}`)
      console.log(`     - regions: ${JSON.stringify(town.regions)}`)
    })
    
    // 3. DETAILED STEP-BY-STEP ANALYSIS
    console.log('\n3. STEP-BY-STEP REGION SCORING ANALYSIS')
    console.log('='.repeat(80))
    
    for (let i = 0; i < spanishTowns.length; i++) {
      const town = spanishTowns[i]
      
      console.log(`\n🏘️  ANALYZING: ${town.name}, Spain (#${i+1})`)
      console.log('=' .repeat(70))
      
      const result = debugCalculateRegionScore(regionPreferences, town)
      
      console.log(`\n🎯 FINAL RESULT FOR ${town.name}:`)
      console.log(`   Score: ${result.score}% (${result.rawScore}/${result.maxScore})`)
      console.log(`   Factors:`)
      result.factors.forEach((factor, idx) => {
        console.log(`     ${idx+1}. ${factor.factor}: ${factor.score} points`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error during analysis:', error)
  }
}

// Run the debug analysis
debugSpanish44Percent()