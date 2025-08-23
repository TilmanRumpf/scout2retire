import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

// Copy of the enhanced matching algorithm components for debugging
// Weights optimized for 55+ retirees
const CATEGORY_WEIGHTS = {
  region: 20,      // Geographic match
  climate: 15,     // Climate preferences 
  culture: 15,     // Cultural fit
  hobbies: 10,     // Activities & interests
  admin: 20,       // Healthcare, safety, visa
  budget: 20       // Financial fit
}

// Helper function to calculate array overlap score
function calculateArrayOverlap(userArray, townArray, maxScore = 100) {
  if (!userArray?.length || !townArray?.length) return 0
  
  const userSet = new Set(userArray.map(item => item.toLowerCase()))
  const townSet = new Set(townArray.map(item => item.toLowerCase()))
  
  let matches = 0
  for (const item of userSet) {
    if (townSet.has(item)) matches++
  }
  
  return (matches / userSet.size) * maxScore
}

// Helper to normalize scores to 0-100 range
function normalizeScore(value, min, max) {
  if (value <= min) return 0
  if (value >= max) return 100
  return ((value - min) / (max - min)) * 100
}

// Region scoring function
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
    regionCountryScore = 40
    factors.push({ factor: 'Open to any country/region', score: 40 })
  } else {
    // Check for region match
    if (hasRegionPrefs) {
      const userRegionsLower = preferences.regions.map(r => r.toLowerCase())
      
      if (town.regions?.some(region => userRegionsLower.includes(region.toLowerCase()))) {
        regionCountryScore = 30
        factors.push({ factor: 'Region match only', score: 30 })
      }
      else if (town.geo_region) {
        const geoRegions = town.geo_region.includes(',') 
          ? town.geo_region.split(',').map(r => r.trim().toLowerCase())
          : [town.geo_region.toLowerCase()]
        
        if (geoRegions.some(gr => userRegionsLower.includes(gr))) {
          regionCountryScore = 30
          factors.push({ factor: `Region match only (${town.geo_region})`, score: 30 })
        }
      }
    }
  }
  
  score += regionCountryScore
  
  // PART 2: GEOGRAPHIC FEATURES (Max 30 points)
  let geoScore = 0
  
  if (!hasGeoPrefs) {
    geoScore = 30
    factors.push({ factor: 'Open to any geography', score: 30 })
  } else {
    const userFeatures = preferences.geographic_features.map(f => f.toLowerCase())
    
    if (town.geographic_features_actual?.length) {
      const townFeatures = town.geographic_features_actual.map(f => f.toLowerCase())
      const hasMatch = userFeatures.some(feature => townFeatures.includes(feature))
      
      if (hasMatch) {
        geoScore = 30
        factors.push({ factor: 'Geographic features match', score: 30 })
      }
    }
  }
  
  score += geoScore
  
  // PART 3: VEGETATION TYPE (Max 20 points)
  let vegScore = 0
  
  if (!hasVegPrefs) {
    vegScore = 20
    factors.push({ factor: 'Open to any vegetation', score: 20 })
  } else if (town.vegetation_type_actual?.length) {
    const userVeg = preferences.vegetation_types.map(v => v.toLowerCase())
    const townVeg = town.vegetation_type_actual.map(v => v.toLowerCase())
    const hasMatch = userVeg.some(veg => townVeg.includes(veg))
    
    if (hasMatch) {
      vegScore = 20
      factors.push({ factor: 'Vegetation type match', score: 20 })
    }
  }
  
  score += vegScore
  
  // Calculate final percentage based on 90 points total
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

// Mock climate scoring function
function calculateClimateScore(preferences, town) {
  // Simple mock implementation - return 80%
  return {
    score: 80,
    factors: [{ factor: 'Mock climate score', score: 80 }],
    category: 'Climate'
  }
}

// Mock culture scoring function
function calculateCultureScore(preferences, town) {
  // Simple mock implementation - return 70%
  return {
    score: 70,
    factors: [{ factor: 'Mock culture score', score: 70 }],
    category: 'Culture'
  }
}

// Mock hobbies scoring function
function calculateHobbiesScore(preferences, town) {
  // Simple mock implementation - return 60%
  return {
    score: 60,
    factors: [{ factor: 'Mock hobbies score', score: 60 }],
    category: 'Hobbies'
  }
}

// Mock admin scoring function
function calculateAdminScore(preferences, town) {
  // Simple mock implementation - return 75%
  return {
    score: 75,
    factors: [{ factor: 'Mock admin score', score: 75 }],
    category: 'Admin'
  }
}

// Mock budget scoring function
function calculateBudgetScore(preferences, town) {
  // Simple mock implementation - return 85%
  return {
    score: 85,
    factors: [{ factor: 'Mock budget score', score: 85 }],
    category: 'Budget'
  }
}

// Main scoring function
function calculateTotalScore(preferences, town) {
  console.log(`\n🧮 CALCULATING FULL MATCH SCORE FOR ${town.name}, ${town.country}`)
  console.log('=' * 70)
  
  const scores = {
    region: calculateRegionScore(preferences, town),
    climate: calculateClimateScore(preferences, town),
    culture: calculateCultureScore(preferences, town),
    hobbies: calculateHobbiesScore(preferences, town),
    admin: calculateAdminScore(preferences, town),
    budget: calculateBudgetScore(preferences, town)
  }
  
  console.log('\n📊 CATEGORY SCORES:')
  console.log('-' * 30)
  
  let weightedTotal = 0
  let totalWeight = 0
  
  for (const [category, result] of Object.entries(scores)) {
    const weight = CATEGORY_WEIGHTS[category]
    const weightedScore = (result.score * weight) / 100
    weightedTotal += weightedScore
    totalWeight += weight
    
    console.log(`${category.toUpperCase().padEnd(10)}: ${result.score}% (weight: ${weight}%) = ${weightedScore.toFixed(1)} points`)
  }
  
  const finalScore = Math.round((weightedTotal / totalWeight) * 100)
  
  console.log('\n🎯 FINAL CALCULATION:')
  console.log(`Weighted Total: ${weightedTotal.toFixed(1)}`)
  console.log(`Total Weight: ${totalWeight}`)
  console.log(`Final Score: ${finalScore}%`)
  
  console.log('\n📋 DETAILED BREAKDOWN:')
  for (const [category, result] of Object.entries(scores)) {
    console.log(`\\n${category.toUpperCase()} (${result.score}%):`)
    result.factors.forEach((factor, index) => {
      console.log(`  ${index + 1}. ${factor.factor}: ${factor.score} points`)
    })
  }
  
  return {
    finalScore,
    categoryScores: scores,
    weightedTotal,
    totalWeight
  }
}

async function debugFullSpanishScoring() {
  console.log('🚀 FULL SPANISH TOWN SCORING DEBUG SCRIPT')
  console.log('==========================================\n')
  
  try {
    // Get the latest user preferences
    console.log('📥 Fetching user preferences...')
    const { data: user, error: userError } = await supabase
      .from('user_preferences')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    if (userError) {
      console.error('❌ Error fetching user preferences:', userError)
      return
    }
    
    console.log('✅ User preferences loaded')
    console.log('  Countries:', user.countries)
    console.log('  Regions:', user.regions)
    console.log('  Geographic Features:', user.geographic_features)
    console.log('  Vegetation Types:', user.vegetation_types)
    
    // Get Valencia town data
    console.log('\\n📥 Fetching Valencia town data...')
    const { data: valencia, error: townError } = await supabase
      .from('towns')
      .select('*')
      .eq('name', 'Valencia')
      .eq('country', 'Spain')
      .single()
    
    if (townError) {
      console.error('❌ Error fetching Valencia data:', townError)
      return
    }
    
    console.log('✅ Valencia town data loaded')
    
    // Run the full scoring debug
    const result = calculateTotalScore(user, valencia)
    
    console.log('\\n🎯 ANALYSIS SUMMARY:')
    console.log(`Valencia total score: ${result.finalScore}%`)
    
    if (result.finalScore < 70) {
      console.log('\\n⚠️  SCORE IS UNEXPECTEDLY LOW!')
      console.log('This indicates a potential issue in one of the scoring components.')
      console.log('Review the detailed breakdown above to identify which category is dragging down the score.')
    } else {
      console.log('\\n✅ Score looks reasonable.')
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the debug
debugFullSpanishScoring()