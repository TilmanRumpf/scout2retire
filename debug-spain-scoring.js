#!/usr/bin/env node

// Debug script to test Spain region scoring issue
import { calculateRegionScore } from './src/utils/enhancedMatchingAlgorithm.js'

// Simulate the user's preferences from the problem description
const userPreferences = {
  // First Preference: Mediterranean, Spain, Any Province
  // Optional Preference: Southern Europe, Spain, Any Province
  regions: ['Mediterranean', 'Southern Europe'],
  countries: ['Spain'],
  provinces: [], // Any Province
  
  // Geographic Features: Coastal, Mountain, Island, Lake, River, Valley, Desert, Forest, Plains (all selected)
  geographic_features: ['Coastal', 'Mountain', 'Island', 'Lake', 'River', 'Valley', 'Desert', 'Forest', 'Plains'],
  
  // Vegetation Types: Tropical, Subtropical, Mediterranean, Forest, Grassland, Desert (all selected)  
  vegetation_types: ['Tropical', 'Subtropical', 'Mediterranean', 'Forest', 'Grassland', 'Desert']
}

// Create a test Spanish town
const spanishTown = {
  id: 'test-spanish-town',
  name: 'Test Spanish Town', 
  country: 'Spain',
  region: 'Andalusia',
  regions: ['Mediterranean', 'Southern Europe'], 
  geo_region: 'Mediterranean',
  geographic_features_actual: ['Coastal', 'Mountain'],
  vegetation_type_actual: ['Mediterranean', 'Forest']
}

// Also test a town that should NOT match Spain
const nonSpanishTown = {
  id: 'test-non-spanish-town',
  name: 'Test Non-Spanish Town',
  country: 'Portugal', 
  region: 'Algarve',
  regions: ['Atlantic Coast'],
  geo_region: 'Atlantic',
  geographic_features_actual: ['Coastal'],
  vegetation_type_actual: ['Mediterranean']
}

console.log('=== DEBUGGING SPAIN SCORING ISSUE ===\n')

console.log('User Preferences:')
console.log('- Countries:', userPreferences.countries)
console.log('- Regions:', userPreferences.regions) 
console.log('- Geographic Features:', userPreferences.geographic_features)
console.log('- Vegetation Types:', userPreferences.vegetation_types)
console.log('')

// Test Spanish town
console.log('=== TESTING SPANISH TOWN ===')
console.log('Town:', spanishTown.name, '(' + spanishTown.country + ')')
console.log('Town Country:', spanishTown.country)
console.log('Town Regions:', spanishTown.regions)
console.log('Town Geographic Features:', spanishTown.geographic_features_actual)
console.log('Town Vegetation:', spanishTown.vegetation_type_actual)
console.log('')

const spanishResult = calculateRegionScore(userPreferences, spanishTown)
console.log('SPANISH TOWN RESULT:')
console.log('Final Score:', spanishResult.score + '%')
console.log('Raw Score:', spanishResult.rawScore, '/ Max:', spanishResult.maxScore)
console.log('Factors:')
spanishResult.factors.forEach((factor, index) => {
  console.log(`  ${index + 1}. ${factor.factor} = ${factor.score} points`)
})
console.log('')

// Test non-Spanish town
console.log('=== TESTING NON-SPANISH TOWN (for comparison) ===')
console.log('Town:', nonSpanishTown.name, '(' + nonSpanishTown.country + ')')

const nonSpanishResult = calculateRegionScore(userPreferences, nonSpanishTown)
console.log('NON-SPANISH TOWN RESULT:')
console.log('Final Score:', nonSpanishResult.score + '%')
console.log('Raw Score:', nonSpanishResult.rawScore, '/ Max:', nonSpanishResult.maxScore)
console.log('Factors:')
nonSpanishResult.factors.forEach((factor, index) => {
  console.log(`  ${index + 1}. ${factor.factor} = ${factor.score} points`)
})
console.log('')

// Expected results
console.log('=== EXPECTED RESULTS ===')
console.log('Spanish town should get 100% (perfect country match)')
console.log('Non-Spanish town should get lower score (no country match)')
console.log('')

if (spanishResult.score !== 100) {
  console.log('🚨 BUG FOUND!')
  console.log(`Spanish town getting ${spanishResult.score}% instead of 100%`)
  console.log('Need to examine why country match is not giving full points...')
} else {
  console.log('✅ Spanish town scoring looks correct')
}