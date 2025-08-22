#!/usr/bin/env node

// Debug the TOTAL match calculation, not just region scoring
// The issue might be in calculateEnhancedMatch, not calculateRegionScore

// Import the category weights from the algorithm
const CATEGORY_WEIGHTS = {
  region: 20,      // Geographic match
  climate: 15,     // Climate preferences 
  culture: 15,     // Cultural fit
  hobbies: 10,     // Activities & interests
  admin: 20,       // Healthcare, safety, visa
  budget: 20       // Financial fit
}

// Mock versions of all category scoring functions
function calculateRegionScore(preferences, town) {
  // We know this works correctly - simulate perfect Spain match
  if (preferences.countries?.includes('Spain') && town.country === 'Spain') {
    return {
      score: 100, // Perfect match
      factors: [
        { factor: 'Country match', score: 40 },
        { factor: 'Geographic features match', score: 30 },
        { factor: 'Vegetation type match', score: 20 }
      ],
      category: 'Region'
    }
  }
  return { score: 44, factors: [], category: 'Region' } // Simulate current bug
}

function calculateClimateScore(preferences, town) {
  // Spanish Mediterranean climate should score well
  if (town.country === 'Spain') {
    return {
      score: 85, // Good climate match for Spanish towns
      factors: [
        { factor: 'Mediterranean climate match', score: 25 },
        { factor: 'Sunshine level good', score: 20 },
        { factor: 'Temperature suitable', score: 25 },
        { factor: 'Seasonal preference match', score: 15 }
      ],
      category: 'Climate'
    }
  }
  return { score: 60, factors: [], category: 'Climate' }
}

function calculateCultureScore(preferences, town) {
  // Spanish culture
  if (town.country === 'Spain') {
    return {
      score: 75, // Good culture match
      factors: [
        { factor: 'Language learning opportunity', score: 15 },
        { factor: 'Expat community present', score: 10 },
        { factor: 'Mediterranean lifestyle', score: 20 }
      ],
      category: 'Culture'
    }
  }
  return { score: 50, factors: [], category: 'Culture' }
}

function calculateHobbiesScore(preferences, town) {
  // Spanish coastal activities
  if (town.country === 'Spain') {
    return {
      score: 80, // Good hobbies match
      factors: [
        { factor: 'Water sports available', score: 20 },
        { factor: 'Cultural activities', score: 15 }
      ],
      category: 'Hobbies'
    }
  }
  return { score: 60, factors: [], category: 'Hobbies' }
}

function calculateAdminScore(preferences, town) {
  // Spanish healthcare and admin
  if (town.country === 'Spain') {
    return {
      score: 85, // Good admin score
      factors: [
        { factor: 'Healthcare quality good', score: 25 },
        { factor: 'Safety adequate', score: 20 },
        { factor: 'EU visa benefits', score: 15 }
      ],
      category: 'Admin'
    }
  }
  return { score: 70, factors: [], category: 'Admin' }
}

function calculateBudgetScore(preferences, town) {
  // Spanish cost of living
  if (town.country === 'Spain') {
    return {
      score: 90, // Good budget match
      factors: [
        { factor: 'Cost of living reasonable', score: 40 },
        { factor: 'Housing affordable', score: 30 }
      ],
      category: 'Budget'
    }
  }
  return { score: 75, factors: [], category: 'Budget' }
}

// Mock calculateEnhancedMatch function
function calculateEnhancedMatch(userPreferences, town) {
  console.log('=== CALCULATING ENHANCED MATCH ===')
  console.log('Town:', town.name, '(' + town.country + ')')
  console.log('')
  
  // Calculate individual category scores
  const regionResult = calculateRegionScore(userPreferences.region_preferences || {}, town)
  const climateResult = calculateClimateScore(userPreferences.climate_preferences || {}, town)
  const cultureResult = calculateCultureScore(userPreferences.culture_preferences || {}, town)
  const hobbiesResult = calculateHobbiesScore(userPreferences.hobbies_preferences || {}, town)
  const adminResult = calculateAdminScore(userPreferences.admin_preferences || {}, town)
  const budgetResult = calculateBudgetScore(userPreferences.budget_preferences || {}, town)
  
  console.log('Category scores:')
  console.log('- Region:', regionResult.score + '%')
  console.log('- Climate:', climateResult.score + '%')
  console.log('- Culture:', cultureResult.score + '%')
  console.log('- Hobbies:', hobbiesResult.score + '%')
  console.log('- Admin:', adminResult.score + '%')
  console.log('- Budget:', budgetResult.score + '%')
  console.log('')
  
  // Calculate weighted total score - THIS IS WHERE THE BUG MIGHT BE!
  let totalScore = (
    (regionResult.score * CATEGORY_WEIGHTS.region / 100) +
    (climateResult.score * CATEGORY_WEIGHTS.climate / 100) +
    (cultureResult.score * CATEGORY_WEIGHTS.culture / 100) +
    (hobbiesResult.score * CATEGORY_WEIGHTS.hobbies / 100) +
    (adminResult.score * CATEGORY_WEIGHTS.admin / 100) +
    (budgetResult.score * CATEGORY_WEIGHTS.budget / 100)
  )
  
  console.log('Weighted calculation:')
  console.log(`- Region: ${regionResult.score}% × ${CATEGORY_WEIGHTS.region}% = ${(regionResult.score * CATEGORY_WEIGHTS.region / 100).toFixed(1)} points`)
  console.log(`- Climate: ${climateResult.score}% × ${CATEGORY_WEIGHTS.climate}% = ${(climateResult.score * CATEGORY_WEIGHTS.climate / 100).toFixed(1)} points`)
  console.log(`- Culture: ${cultureResult.score}% × ${CATEGORY_WEIGHTS.culture}% = ${(cultureResult.score * CATEGORY_WEIGHTS.culture / 100).toFixed(1)} points`)
  console.log(`- Hobbies: ${hobbiesResult.score}% × ${CATEGORY_WEIGHTS.hobbies}% = ${(hobbiesResult.score * CATEGORY_WEIGHTS.hobbies / 100).toFixed(1)} points`)
  console.log(`- Admin: ${adminResult.score}% × ${CATEGORY_WEIGHTS.admin}% = ${(adminResult.score * CATEGORY_WEIGHTS.admin / 100).toFixed(1)} points`)
  console.log(`- Budget: ${budgetResult.score}% × ${CATEGORY_WEIGHTS.budget}% = ${(budgetResult.score * CATEGORY_WEIGHTS.budget / 100).toFixed(1)} points`)
  console.log('')
  console.log(`Total weighted score: ${totalScore.toFixed(1)}%`)
  
  // Cap the total score at 100
  totalScore = Math.min(totalScore, 100)
  
  console.log(`Final score (capped): ${totalScore.toFixed(1)}%`)
  console.log('')
  
  return {
    match_score: Math.round(totalScore),
    category_scores: {
      region: Math.round(regionResult.score),
      climate: Math.round(climateResult.score),
      culture: Math.round(cultureResult.score),
      hobbies: Math.round(hobbiesResult.score),
      admin: Math.round(adminResult.score),
      budget: Math.round(budgetResult.score)
    }
  }
}

// Test data
const userPreferences = {
  region_preferences: {
    countries: ['Spain'],
    regions: ['Mediterranean', 'Southern Europe'],
    geographic_features: ['Coastal'],
    vegetation_types: ['Mediterranean']
  },
  climate_preferences: {
    summer_climate_preference: ['warm'],
    winter_climate_preference: ['mild']
  },
  culture_preferences: {
    language_comfort: { preferences: 'willing_to_learn' }
  },
  hobbies_preferences: {
    activities: ['water_sports']
  },
  admin_preferences: {
    healthcare_quality: ['good']
  },
  budget_preferences: {
    total_monthly_budget: 2500
  }
}

const spanishTown = {
  name: "Alicante",
  country: "Spain"
}

console.log('=== TESTING TOTAL MATCH CALCULATION ===\n')

const result = calculateEnhancedMatch(userPreferences, spanishTown)

console.log('=== EXPECTED vs ACTUAL ===')
console.log('Expected: Should be 80-90% for Spain with good scores across all categories')
console.log('Actual:', result.match_score + '%')
console.log('')

if (result.match_score < 80) {
  console.log('🚨 TOTAL MATCH CALCULATION ISSUE!')
  console.log('Even with good category scores, total is low')
  console.log('Check the weighting calculation or score aggregation')
} else {
  console.log('✅ Total match calculation looks correct')
}

console.log('')
console.log('=== NOW TEST WITH REGION SCORE = 44% (simulating current bug) ===')

// Test again but simulate the 44% region score bug
function calculateRegionScoreBuggy(preferences, town) {
  return {
    score: 44, // This is what users are reporting
    factors: [{ factor: 'Partial match somehow', score: 39 }],
    category: 'Region'
  }
}

// Replace the function temporarily
const originalRegionScore = calculateRegionScore
global.calculateRegionScore = calculateRegionScoreBuggy

function calculateEnhancedMatchWithBug(userPreferences, town) {
  const regionResult = calculateRegionScoreBuggy(userPreferences.region_preferences || {}, town)
  const climateResult = calculateClimateScore(userPreferences.climate_preferences || {}, town)
  const cultureResult = calculateCultureScore(userPreferences.culture_preferences || {}, town)
  const hobbiesResult = calculateHobbiesScore(userPreferences.hobbies_preferences || {}, town)
  const adminResult = calculateAdminScore(userPreferences.admin_preferences || {}, town)
  const budgetResult = calculateBudgetScore(userPreferences.budget_preferences || {}, town)
  
  // Calculate weighted total score
  let totalScore = (
    (regionResult.score * CATEGORY_WEIGHTS.region / 100) +
    (climateResult.score * CATEGORY_WEIGHTS.climate / 100) +
    (cultureResult.score * CATEGORY_WEIGHTS.culture / 100) +
    (hobbiesResult.score * CATEGORY_WEIGHTS.hobbies / 100) +
    (adminResult.score * CATEGORY_WEIGHTS.admin / 100) +
    (budgetResult.score * CATEGORY_WEIGHTS.budget / 100)
  )
  
  console.log('WITH BUGGY REGION SCORE:')
  console.log(`Region: 44% × 20% = ${(44 * 20 / 100).toFixed(1)} points (instead of ${(100 * 20 / 100).toFixed(1)})`)
  console.log(`Total: ${totalScore.toFixed(1)}% (instead of higher score)`)
  
  return {
    match_score: Math.round(totalScore)
  }
}

const buggyResult = calculateEnhancedMatchWithBug(userPreferences, spanishTown)
console.log('')
console.log('Buggy total score:', buggyResult.match_score + '%')
console.log('This shows how a region scoring bug would affect the total!')