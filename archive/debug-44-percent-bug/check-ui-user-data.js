#!/usr/bin/env node

/**
 * CHECK UI USER DATA: Find the exact user data causing Spanish towns to show 44%
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

async function checkUIUserData() {
  console.log('🔍 CHECKING: What user data is causing Spanish towns to show 44%')
  console.log('=' .repeat(80))
  
  try {
    // 1. Get ALL users and test each against Spanish towns
    console.log('\n1. GETTING ALL USERS TO TEST')
    console.log('-'.repeat(50))
    
    const { data: allUsers, error: usersError } = await supabase
      .from('user_preferences')
      .select('user_id, countries, regions, geographic_features, vegetation_types')
      .order('created_at', { ascending: false })
    
    if (usersError) {
      console.error('❌ Error getting users:', usersError)
      return
    }
    
    console.log(`✅ Found ${allUsers.length} users`)
    
    // 2. Get Spanish towns sample
    const { data: spanishTowns, error: townsError } = await supabase
      .from('towns')
      .select(`id, name, country, region, geo_region, geographic_features_actual, vegetation_type_actual, regions`)
      .eq('country', 'Spain')
      .limit(3)
    
    if (townsError) {
      console.error('❌ Error getting Spanish towns:', townsError)
      return
    }
    
    console.log(`✅ Testing against ${spanishTowns.length} Spanish towns`)
    
    // 3. Test each user against Spanish towns
    console.log('\n2. TESTING ALL USERS AGAINST SPANISH TOWNS')
    console.log('=' .repeat(80))
    
    for (let i = 0; i < allUsers.length; i++) {
      const user = allUsers[i]
      
      // Skip users with no preferences
      if (!user.countries && !user.regions && !user.geographic_features && !user.vegetation_types) {
        console.log(`\n👤 User ${i+1} (${user.user_id.substring(0, 8)}...): No preferences - SKIP`)
        continue
      }
      
      console.log(`\n👤 User ${i+1} (${user.user_id.substring(0, 8)}...):`)
      console.log('   Preferences:', {
        countries: user.countries,
        regions: user.regions,
        geographic_features: user.geographic_features,
        vegetation_types: user.vegetation_types
      })
      
      const regionPreferences = {
        countries: user.countries || [],
        regions: user.regions || [],
        geographic_features: user.geographic_features || [],
        vegetation_types: user.vegetation_types || []
      }
      
      // Test against each Spanish town
      let has44Percent = false
      for (const town of spanishTowns) {
        const result = calculateRegionScore(regionPreferences, town)
        
        if (result.score === 44) {
          has44Percent = true
          console.log(`   🚨 FOUND 44% with ${town.name}!`)
          console.log(`      Score: ${result.score}% (${result.rawScore}/${result.maxScore})`)
          console.log('      Factors:')
          result.factors.forEach(f => console.log(`        - ${f.factor}: ${f.score} points`))
          
          // This is the culprit - analyze in detail
          console.log('\n   🔬 DETAILED ANALYSIS:')
          console.log('      This user preferences profile causes 44% scores!')
          console.log(`      Problem: User wants "${user.countries?.[0]}" country but town is "Spain"`)
          console.log('      - No country match, so checking regions...')
          
          if (user.regions) {
            console.log(`      - User regions: ${JSON.stringify(user.regions)}`)
            console.log(`      - Town regions: ${JSON.stringify(town.regions)}`)
            console.log(`      - Town geo_region: ${town.geo_region}`)
            
            // Check if any region matches
            const userRegionsLower = user.regions.map(r => r.toLowerCase())
            const hasRegionMatch = town.regions?.some(region => userRegionsLower.includes(region.toLowerCase()))
            const hasGeoRegionMatch = town.geo_region && town.geo_region.split(',').some(gr => 
              userRegionsLower.includes(gr.trim().toLowerCase())
            )
            
            if (hasRegionMatch || hasGeoRegionMatch) {
              console.log('      - Region match found, should get 30 points, not 40')
              console.log('      - This suggests the actual calculation differs from expectation')
            }
          }
          
          break // Found the issue, no need to test other towns
        }
      }
      
      if (!has44Percent) {
        // Show what scores this user gets
        const sampleResult = calculateRegionScore(regionPreferences, spanishTowns[0])
        console.log(`   ✅ Gets ${sampleResult.score}% with ${spanishTowns[0].name} (not 44%)`)
      }
    }
    
    // 4. Create the exact 44% scenario for verification
    console.log('\n3. CREATING EXACT 44% SCENARIO FOR VERIFICATION')
    console.log('=' .repeat(80))
    
    // We know from our earlier test that this creates 44%:
    const problem44Prefs = {
      countries: ['Spain'],
      regions: [],
      geographic_features: ['mountain', 'valley'], // Valencia is coastal, not mountain
      vegetation_types: ['tropical', 'desert']     // Valencia is mediterranean, not tropical/desert
    }
    
    console.log('\n🧪 Testing known 44% scenario:')
    console.log('User preferences that cause 44%:', problem44Prefs)
    
    const testResult = calculateRegionScore(problem44Prefs, spanishTowns[0])
    console.log(`Result: ${testResult.score}% (${testResult.rawScore}/${testResult.maxScore})`)
    console.log('Factors:')
    testResult.factors.forEach(f => console.log(`  - ${f.factor}: ${f.score} points`))
    
    if (testResult.score === 44) {
      console.log('\n🎯 CONFIRMED: This preference profile creates exactly 44%!')
      console.log('\n💡 SOLUTION RECOMMENDATIONS:')
      console.log('   1. Check if there are users with "Spain" in countries but mismatched geo/veg preferences')
      console.log('   2. The issue is not with the algorithm - it\'s working correctly')
      console.log('   3. The 44% score is legitimate for users who want Spain but have incompatible preferences')
      console.log('   4. Consider improving the UI to show WHY the score is 44% (show the breakdown)')
      console.log('   5. Consider suggesting better geo/veg preferences for Spanish towns')
    }
    
  } catch (error) {
    console.error('❌ Error during analysis:', error)
  }
}

checkUIUserData()