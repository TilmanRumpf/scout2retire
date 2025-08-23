import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

// Weights from enhanced matching algorithm
const CATEGORY_WEIGHTS = {
  region: 20,      // Geographic match
  climate: 15,     // Climate preferences 
  culture: 15,     // Cultural fit
  hobbies: 10,     // Activities & interests
  admin: 20,       // Healthcare, safety, visa
  budget: 20       // Financial fit
}

// Convert preferences function (simplified)
function convertPreferencesToAlgorithmFormat(userPreferences) {
  return {
    region_preferences: {
      countries: userPreferences.countries || [],
      regions: userPreferences.regions || [],
      geographic_features: userPreferences.geographic_features || [],
      vegetation_types: userPreferences.vegetation_types || [],
      provinces: userPreferences.provinces || []
    },
    climate_preferences: {
      summer_climate_preference: userPreferences.summer_climate_preference,
      winter_climate_preference: userPreferences.winter_climate_preference,
      humidity_level: userPreferences.humidity_level,
      sunshine: userPreferences.sunshine,
      precipitation: userPreferences.precipitation,
      seasonal_preference: userPreferences.seasonal_preference
    },
    culture_preferences: {
      expat_community_preference: userPreferences.expat_community_preference,
      language_comfort: userPreferences.language_comfort,
      cultural_importance: userPreferences.cultural_importance,
      lifestyle_preferences: userPreferences.lifestyle_preferences
    },
    hobbies_preferences: {
      activities: userPreferences.activities,
      interests: userPreferences.interests,
      travel_frequency: userPreferences.travel_frequency,
      lifestyle_importance: userPreferences.lifestyle_importance,
      custom_activities: userPreferences.custom_activities
    },
    admin_preferences: {
      healthcare_quality: userPreferences.healthcare_quality,
      safety_importance: userPreferences.safety_importance,
      government_efficiency: userPreferences.government_efficiency,
      political_stability: userPreferences.political_stability,
      visa_preference: userPreferences.visa_preference,
      health_considerations: userPreferences.health_considerations,
      insurance_importance: userPreferences.insurance_importance,
      emergency_services: userPreferences.emergency_services,
      tax_preference: userPreferences.tax_preference,
      stay_duration: userPreferences.stay_duration,
      residency_path: userPreferences.residency_path
    },
    budget_preferences: {
      total_monthly_budget: userPreferences.total_monthly_budget,
      max_monthly_rent: userPreferences.max_monthly_rent,
      max_home_price: userPreferences.max_home_price,
      monthly_healthcare_budget: userPreferences.monthly_healthcare_budget,
      mobility: userPreferences.mobility,
      property_tax_sensitive: userPreferences.property_tax_sensitive,
      sales_tax_sensitive: userPreferences.sales_tax_sensitive,
      income_tax_sensitive: userPreferences.income_tax_sensitive
    },
    current_status: {
      citizenship: userPreferences.primary_citizenship
    }
  };
}

// Mock scoring functions to identify which is the problem
function mockCalculateRegionScore(preferences, town) {
  // We know this works and scores 89%
  return {
    score: 89,
    factors: [
      { factor: 'Region match (Mediterranean)', score: 30 },
      { factor: 'Geographic features match (Coastal)', score: 30 },
      { factor: 'Vegetation type match (Mediterranean)', score: 20 }
    ]
  }
}

function mockCalculateClimateScore(preferences, town) {
  console.log('\\n🌤️ CLIMATE SCORING DEBUG:')
  console.log('  User summer preference:', preferences.summer_climate_preference)
  console.log('  User winter preference:', preferences.winter_climate_preference)
  console.log('  User humidity preference:', preferences.humidity_level)
  console.log('  User sunshine preference:', preferences.sunshine)
  console.log('  User precipitation preference:', preferences.precipitation)
  console.log('  User seasonal preference:', preferences.seasonal_preference)
  
  console.log('\\n  Town summer climate:', town.summer_climate_actual)
  console.log('  Town winter climate:', town.winter_climate_actual)
  console.log('  Town humidity level:', town.humidity_level_actual)
  console.log('  Town sunshine level:', town.sunshine_level_actual)
  console.log('  Town precipitation level:', town.precipitation_level_actual)
  console.log('  Town seasonal variation:', town.seasonal_variation_actual)
  
  // Check for obvious mismatches
  let issues = []
  
  if (!preferences.summer_climate_preference) {
    console.log('  ✅ No summer climate preference - should get full points')
  } else if (Array.isArray(preferences.summer_climate_preference)) {
    console.log('  📋 User summer preferences:', preferences.summer_climate_preference)
    const hasMatch = preferences.summer_climate_preference.includes(town.summer_climate_actual)
    console.log('  🎯 Summer match?', hasMatch)
    if (!hasMatch) issues.push('Summer climate mismatch')
  }
  
  if (!preferences.winter_climate_preference) {
    console.log('  ✅ No winter climate preference - should get full points')
  } else if (Array.isArray(preferences.winter_climate_preference)) {
    console.log('  📋 User winter preferences:', preferences.winter_climate_preference)
    const hasMatch = preferences.winter_climate_preference.includes(town.winter_climate_actual)
    console.log('  🎯 Winter match?', hasMatch)
    if (!hasMatch) issues.push('Winter climate mismatch')
  }
  
  console.log('\\n  🚨 Potential issues:', issues.length > 0 ? issues : 'None')
  
  // Return a mock score - assume it's the problem if we have issues
  const mockScore = issues.length > 0 ? 20 : 85
  
  return {
    score: mockScore,
    factors: [{ factor: `Mock climate score (${issues.length} issues found)`, score: mockScore }]
  }
}

function mockCalculateCultureScore(preferences, town) {
  console.log('\\n🏛️ CULTURE SCORING DEBUG:')
  console.log('  User expat community pref:', preferences.expat_community_preference)
  console.log('  User language comfort:', preferences.language_comfort)
  console.log('  User cultural importance:', preferences.cultural_importance)
  console.log('  User lifestyle prefs:', preferences.lifestyle_preferences)
  
  console.log('\\n  Town expat community size:', town.expat_community_size)
  console.log('  Town english proficiency:', town.english_proficiency_level)
  console.log('  Town languages spoken:', town.languages_spoken)
  console.log('  Town cultural rating:', town.cultural_rating)
  
  // Mock scoring
  return {
    score: 70,
    factors: [{ factor: 'Mock culture score', score: 70 }]
  }
}

function mockCalculateHobbiesScore(preferences, town) {
  console.log('\\n🎯 HOBBIES SCORING DEBUG:')
  console.log('  User activities:', preferences.activities)
  console.log('  User interests:', preferences.interests)
  console.log('  User travel frequency:', preferences.travel_frequency)
  console.log('  User lifestyle importance:', preferences.lifestyle_importance)
  
  console.log('\\n  Town activities available:', town.activities_available?.length || 0, 'items')
  console.log('  Town interests supported:', town.interests_supported?.length || 0, 'items')
  
  // Mock scoring
  return {
    score: 75,
    factors: [{ factor: 'Mock hobbies score', score: 75 }]
  }
}

function mockCalculateAdminScore(preferences, town) {
  console.log('\\n🏥 ADMIN SCORING DEBUG:')
  console.log('  User healthcare quality pref:', preferences.healthcare_quality)
  console.log('  User safety importance:', preferences.safety_importance)
  console.log('  User govt efficiency pref:', preferences.government_efficiency)
  console.log('  User political stability pref:', preferences.political_stability)
  console.log('  User visa preference:', preferences.visa_preference)
  
  console.log('\\n  Town healthcare score:', town.healthcare_score)
  console.log('  Town safety score:', town.safety_score)
  console.log('  Town govt efficiency rating:', town.government_efficiency_rating)
  console.log('  Town political stability rating:', town.political_stability_rating)
  console.log('  Town visa requirements:', town.visa_requirements)
  
  // Mock scoring
  return {
    score: 80,
    factors: [{ factor: 'Mock admin score', score: 80 }]
  }
}

function mockCalculateBudgetScore(preferences, town) {
  console.log('\\n💰 BUDGET SCORING DEBUG:')
  console.log('  User total monthly budget:', preferences.total_monthly_budget)
  console.log('  User max monthly rent:', preferences.max_monthly_rent)
  console.log('  User max home price:', preferences.max_home_price)
  console.log('  User healthcare budget:', preferences.monthly_healthcare_budget)
  
  console.log('\\n  Town cost of living USD:', town.cost_of_living_usd)
  console.log('  Town typical monthly cost:', town.typical_monthly_living_cost)
  console.log('  Town rent 1bed:', town.rent_1bed)
  console.log('  Town typical home price:', town.typical_home_price)
  console.log('  Town healthcare cost monthly:', town.healthcare_cost_monthly)
  
  // Check for budget mismatches
  let budgetIssues = []
  
  if (preferences.total_monthly_budget && town.typical_monthly_living_cost) {
    if (town.typical_monthly_living_cost > preferences.total_monthly_budget) {
      budgetIssues.push('Monthly budget exceeded')
    }
  }
  
  if (preferences.max_monthly_rent && town.rent_1bed) {
    if (town.rent_1bed > preferences.max_monthly_rent) {
      budgetIssues.push('Rent budget exceeded')
    }
  }
  
  console.log('\\n  🚨 Budget issues:', budgetIssues.length > 0 ? budgetIssues : 'None')
  
  // Mock scoring based on issues
  const mockScore = budgetIssues.length > 0 ? 25 : 85
  
  return {
    score: mockScore,
    factors: [{ factor: `Mock budget score (${budgetIssues.length} issues)`, score: mockScore }]
  }
}

// Mock enhanced matching function
function mockCalculateEnhancedMatch(preferences, town) {
  const regionResult = mockCalculateRegionScore(preferences.region_preferences, town)
  const climateResult = mockCalculateClimateScore(preferences.climate_preferences, town)
  const cultureResult = mockCalculateCultureScore(preferences.culture_preferences, town)
  const hobbiesResult = mockCalculateHobbiesScore(preferences.hobbies_preferences, town)
  const adminResult = mockCalculateAdminScore(preferences.admin_preferences, town)
  const budgetResult = mockCalculateBudgetScore(preferences.budget_preferences, town)
  
  // Calculate weighted total score
  let totalScore = (
    (regionResult.score * CATEGORY_WEIGHTS.region / 100) +
    (climateResult.score * CATEGORY_WEIGHTS.climate / 100) +
    (cultureResult.score * CATEGORY_WEIGHTS.culture / 100) +
    (hobbiesResult.score * CATEGORY_WEIGHTS.hobbies / 100) +
    (adminResult.score * CATEGORY_WEIGHTS.admin / 100) +
    (budgetResult.score * CATEGORY_WEIGHTS.budget / 100)
  )
  
  totalScore = Math.min(totalScore, 100)
  
  const allFactors = [
    ...regionResult.factors,
    ...climateResult.factors,
    ...cultureResult.factors,
    ...hobbiesResult.factors,
    ...adminResult.factors,
    ...budgetResult.factors
  ]
  
  return {
    match_score: Math.round(totalScore),
    category_scores: {
      region: Math.round(regionResult.score),
      climate: Math.round(climateResult.score),
      culture: Math.round(cultureResult.score),
      hobbies: Math.round(hobbiesResult.score),
      admin: Math.round(adminResult.score),
      budget: Math.round(budgetResult.score)
    },
    top_factors: allFactors.sort((a, b) => b.score - a.score).slice(0, 5)
  }
}

async function debugSpanishFullAlgorithm() {
  console.log('🚀 SPANISH FULL ALGORITHM DEBUG SCRIPT')
  console.log('======================================\n')
  
  try {
    // Get user preferences
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
    
    // Get Valencia data
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
    
    console.log('✅ Data loaded successfully')
    
    // Convert preferences
    const convertedPreferences = convertPreferencesToAlgorithmFormat(user)
    
    console.log('\\n🧮 RUNNING FULL ALGORITHM ANALYSIS...')
    console.log('=' * 60)
    
    // Run mock algorithm with detailed debugging
    const result = mockCalculateEnhancedMatch(convertedPreferences, valencia)
    
    console.log('\\n🎯 FINAL RESULTS:')
    console.log(`Total Score: ${result.match_score}%`)
    console.log('\\nCategory Breakdown:')
    console.log(`  Region: ${result.category_scores.region}% (weight: ${CATEGORY_WEIGHTS.region}%) = ${(result.category_scores.region * CATEGORY_WEIGHTS.region / 100).toFixed(1)} points`)
    console.log(`  Climate: ${result.category_scores.climate}% (weight: ${CATEGORY_WEIGHTS.climate}%) = ${(result.category_scores.climate * CATEGORY_WEIGHTS.climate / 100).toFixed(1)} points`)
    console.log(`  Culture: ${result.category_scores.culture}% (weight: ${CATEGORY_WEIGHTS.culture}%) = ${(result.category_scores.culture * CATEGORY_WEIGHTS.culture / 100).toFixed(1)} points`)
    console.log(`  Hobbies: ${result.category_scores.hobbies}% (weight: ${CATEGORY_WEIGHTS.hobbies}%) = ${(result.category_scores.hobbies * CATEGORY_WEIGHTS.hobbies / 100).toFixed(1)} points`)
    console.log(`  Admin: ${result.category_scores.admin}% (weight: ${CATEGORY_WEIGHTS.admin}%) = ${(result.category_scores.admin * CATEGORY_WEIGHTS.admin / 100).toFixed(1)} points`)
    console.log(`  Budget: ${result.category_scores.budget}% (weight: ${CATEGORY_WEIGHTS.budget}%) = ${(result.category_scores.budget * CATEGORY_WEIGHTS.budget / 100).toFixed(1)} points`)
    
    // Identify the problem
    const lowCategories = Object.entries(result.category_scores)
      .filter(([_, score]) => score < 50)
      .map(([cat, score]) => ({ category: cat, score }))
    
    if (lowCategories.length > 0) {
      console.log('\\n🚨 LOW SCORING CATEGORIES (dragging down total):')
      lowCategories.forEach(({ category, score }) => {
        const weight = CATEGORY_WEIGHTS[category]
        const impact = (score * weight / 100).toFixed(1)
        console.log(`  ${category.toUpperCase()}: ${score}% → Only contributing ${impact}/${weight} points`)
      })
    }
    
    console.log('\\n💡 ANALYSIS:')
    if (result.match_score < 50) {
      console.log('❌ The 44% score is likely due to the categories identified above.')
      console.log('   Focus debugging efforts on these specific scoring functions.')
    } else {
      console.log('✅ Score would be reasonable if these were the real category scores.')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

debugSpanishFullAlgorithm()