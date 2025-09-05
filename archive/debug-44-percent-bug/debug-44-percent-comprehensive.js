#!/usr/bin/env node

/**
 * COMPREHENSIVE DEBUG: Why ALL Spanish towns show EXACTLY 44% region score
 * 
 * This script will:
 * 1. Get Tilman's EXACT region preferences from database
 * 2. Get a sample of Spanish towns data  
 * 3. Trace through the EXACT calculateRegionScore logic step by step
 * 4. Find WHERE the 40/90 points (44%) is coming from
 * 
 * The fact that ALL Spanish towns show EXACTLY 44% means there's a systematic issue.
 */

import { createClient } from '@supabase/supabase-js'
import { calculateRegionScore } from './src/utils/enhancedMatchingAlgorithm.js'

// Supabase config
const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
)

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
      .eq('user_id', '3fa85f64-5717-4562-b3fc-2c963f66afa6') // Tilman's ID
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
      .limit(5)
    
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
      
      console.log(`\n🏘️  ANALYZING: ${town.name}, Spain`)
      console.log('-'.repeat(60))
      
      // Enable debug in the scoring function
      console.log('📊 User Preferences:')
      console.log('   - countries:', regionPreferences.countries)
      console.log('   - regions:', regionPreferences.regions) 
      console.log('   - geographic_features:', regionPreferences.geographic_features)
      console.log('   - vegetation_types:', regionPreferences.vegetation_types)
      
      console.log('\n📊 Town Data:')
      console.log('   - country:', town.country)
      console.log('   - geo_region:', town.geo_region)
      console.log('   - geographic_features_actual:', town.geographic_features_actual)
      console.log('   - vegetation_type_actual:', town.vegetation_type_actual)
      
      // Call the scoring function
      const result = calculateRegionScore(regionPreferences, town)
      
      console.log('\n🎯 SCORING RESULTS:')
      console.log(`   - Final Score: ${result.score}% (${result.rawScore}/${result.maxScore} points)`)
      console.log('   - Breakdown:')
      result.factors.forEach((factor, idx) => {
        console.log(`     ${idx+1}. ${factor.factor}: ${factor.score} points`)
      })
      
      // CRITICAL ANALYSIS: Break down the 44%
      if (result.score === 44) {
        console.log('\n🚨 FOUND THE 44% ISSUE!')
        console.log('   Analysis:')
        console.log(`   - Raw Score: ${result.rawScore} points`)
        console.log(`   - Max Score: ${result.maxScore} points`) 
        console.log(`   - Percentage: ${result.rawScore}/${result.maxScore} = ${(result.rawScore/result.maxScore*100).toFixed(1)}%`)
        
        // Look at the individual parts
        console.log('\n   Detailed Breakdown:')
        console.log('   - PART 1 (Region/Country): Max 40 points')
        console.log('   - PART 2 (Geographic Features): Max 30 points')
        console.log('   - PART 3 (Vegetation Types): Max 20 points')
        console.log('   - TOTAL: 90 points maximum')
        
        if (result.rawScore === 40) {
          console.log('\n   🎯 ANALYSIS: Getting exactly 40/90 = 44.4%')
          console.log('   This means:')
          console.log('   ✅ PART 1 (Region/Country): Getting full 40 points')
          console.log('   ❌ PART 2 (Geographic Features): Getting 0 points')
          console.log('   ❌ PART 3 (Vegetation Types): Getting 0 points')
        }
      }
      
      if (i === 0) {
        // Deep dive on first town
        console.log('\n🔬 DEEP DIVE ANALYSIS (First Town Only)')
        console.log('-'.repeat(60))
        
        console.log('\nStep 1: Check if user has ANY preferences')
        const hasCountryPrefs = regionPreferences.countries?.length > 0
        const hasRegionPrefs = regionPreferences.regions?.length > 0  
        const hasGeoPrefs = regionPreferences.geographic_features?.length > 0
        const hasVegPrefs = regionPreferences.vegetation_types?.length > 0
        
        console.log(`   - Has country preferences: ${hasCountryPrefs}`)
        console.log(`   - Has region preferences: ${hasRegionPrefs}`)
        console.log(`   - Has geographic preferences: ${hasGeoPrefs}`)
        console.log(`   - Has vegetation preferences: ${hasVegPrefs}`)
        
        if (!hasCountryPrefs && !hasRegionPrefs && !hasGeoPrefs && !hasVegPrefs) {
          console.log('   ➤ User has NO preferences = 100% score (open to anywhere)')
        } else {
          console.log('   ➤ User has preferences, will score based on matches')
          
          console.log('\nStep 2: PART 1 - Region/Country Matching (Max 40 points)')
          
          if (!hasCountryPrefs && !hasRegionPrefs) {
            console.log('   ➤ No country/region preferences = 40 points')
          } else {
            console.log('   ➤ Checking country/region matches...')
            
            // Check country matches
            if (hasCountryPrefs) {
              console.log('   Country matching:')
              for (const country of regionPreferences.countries) {
                console.log(`     - Checking "${country}" vs town country "${town.country}"`)
                if (country === town.country) {
                  console.log('       ✅ MATCH! Should get 40 points')
                } else {
                  console.log('       ❌ No match')
                }
              }
            }
            
            // Check region matches  
            if (hasRegionPrefs && !hasCountryPrefs) {
              console.log('   Region matching (since no country match):')
              const userRegionsLower = regionPreferences.regions.map(r => r.toLowerCase())
              console.log(`     - User regions (lowercase): ${JSON.stringify(userRegionsLower)}`)
              
              if (town.regions?.length) {
                console.log(`     - Town regions: ${JSON.stringify(town.regions)}`)
                const match = town.regions.some(region => userRegionsLower.includes(region.toLowerCase()))
                console.log(`     - Region match found: ${match}`)
              }
              
              if (town.geo_region) {
                console.log(`     - Town geo_region: "${town.geo_region}"`)
                const geoRegions = town.geo_region.includes(',') 
                  ? town.geo_region.split(',').map(r => r.trim().toLowerCase())
                  : [town.geo_region.toLowerCase()]
                console.log(`     - Geo regions (lowercase): ${JSON.stringify(geoRegions)}`)
                const match = geoRegions.some(gr => userRegionsLower.includes(gr))
                console.log(`     - Geo region match found: ${match}`)
              }
            }
          }
          
          console.log('\nStep 3: PART 2 - Geographic Features (Max 30 points)')
          
          if (!hasGeoPrefs) {
            console.log('   ➤ No geographic preferences = 30 points')
          } else {
            console.log('   ➤ Checking geographic feature matches...')
            console.log(`     - User features: ${JSON.stringify(regionPreferences.geographic_features)}`)
            console.log(`     - Town features: ${JSON.stringify(town.geographic_features_actual)}`)
            
            if (town.geographic_features_actual?.length) {
              const userFeatures = regionPreferences.geographic_features.map(f => f.toLowerCase())
              const townFeatures = town.geographic_features_actual.map(f => f.toLowerCase())
              const hasMatch = userFeatures.some(feature => townFeatures.includes(feature))
              console.log(`     - Direct match found: ${hasMatch}`)
              
              if (!hasMatch) {
                console.log('     - Checking for partial matches...')
                // Check the partial match logic
              }
            } else {
              console.log('     - No geographic features data in town')
            }
          }
          
          console.log('\nStep 4: PART 3 - Vegetation Types (Max 20 points)')
          
          if (!hasVegPrefs) {
            console.log('   ➤ No vegetation preferences = 20 points')
          } else {
            console.log('   ➤ Checking vegetation type matches...')
            console.log(`     - User vegetation: ${JSON.stringify(regionPreferences.vegetation_types)}`)
            console.log(`     - Town vegetation: ${JSON.stringify(town.vegetation_type_actual)}`)
            
            if (town.vegetation_type_actual?.length) {
              const userVeg = regionPreferences.vegetation_types.map(v => v.toLowerCase())
              const townVeg = town.vegetation_type_actual.map(v => v.toLowerCase())
              const hasMatch = userVeg.some(veg => townVeg.includes(veg))
              console.log(`     - Direct match found: ${hasMatch}`)
              
              if (!hasMatch) {
                console.log('     - Checking for partial matches...')
                // Check the partial match logic
              }
            } else {
              console.log('     - No vegetation type data in town')
            }
          }
        }
      }
    }
    
    // 4. HYPOTHESIS TESTING
    console.log('\n4. HYPOTHESIS TESTING')
    console.log('='.repeat(80))
    
    console.log('\n🧪 Testing possible causes of 44% (40/90 points):')
    console.log('   Hypothesis 1: User gets 40 points from country/region match')
    console.log('   Hypothesis 2: User gets 0 points from geographic features')
    console.log('   Hypothesis 3: User gets 0 points from vegetation types')
    console.log('   Result: 40 + 0 + 0 = 40/90 = 44.4% → rounds to 44%')
    
    console.log('\n🔍 Key Questions:')
    console.log('   1. Does user have Spain in their country preferences?')
    console.log('   2. If not, do they have matching regions?')  
    console.log('   3. Why are geographic features scoring 0?')
    console.log('   4. Why are vegetation types scoring 0?')
    console.log('   5. Is there missing data in Spanish towns?')
    
  } catch (error) {
    console.error('❌ Error during analysis:', error)
  }
}

// Run the debug analysis
debugSpanish44Percent()