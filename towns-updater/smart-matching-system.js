// Smart Matching System for Scout2Retire
// Intelligent matching with citizenship-aware data

export async function calculateMatchScore(userPrefs, town) {
  let score = 0
  const factors = {}
  
  // Budget matching
  if (userPrefs.budget && town.cost_index) {
    const budgetRatio = town.cost_index / userPrefs.budget
    if (budgetRatio <= 0.7) {
      score += 3
      factors.budget = 'Excellent value'
    } else if (budgetRatio <= 1.0) {
      score += 2
      factors.budget = 'Within budget'
    } else {
      score += 0
      factors.budget = 'Over budget'
    }
  }
  
  // Climate matching
  if (userPrefs.climate_preference && town.climate_description) {
    const climateMatch = town.climate_description.toLowerCase().includes(userPrefs.climate_preference.toLowerCase())
    if (climateMatch) {
      score += 2
      factors.climate = 'Perfect climate match'
    }
  }
  
  // Citizenship-specific visa ease
  if (userPrefs.citizenship && town.visa_requirements) {
    // Check if we have citizenship-specific visa data
    const visaInfo = typeof town.visa_requirements === 'object' 
      ? town.visa_requirements[userPrefs.citizenship]
      : town.visa_requirements
      
    if (visaInfo) {
      if (visaInfo.includes('visa-free') || visaInfo.includes('90 days')) {
        score += 2
        factors.visa = 'Easy visa access'
      } else if (visaInfo.includes('D7') || visaInfo.includes('retirement visa')) {
        score += 1
        factors.visa = 'Retirement visa available'
      }
    }
  }
  
  // Pet-friendly check
  if (userPrefs.has_pets && town.pet_friendly_rating) {
    if (town.pet_friendly_rating >= 8) {
      score += 1
      factors.pets = 'Very pet-friendly'
    }
  }
  
  // Healthcare quality
  if (town.healthcare_score >= 7) {
    score += 2
    factors.healthcare = 'Excellent healthcare'
  }
  
  return {
    match_score: Math.min(10, score),
    match_factors: factors,
    town_name: town.town_name,
    town_country: town.country
  }
}

export async function batchUpdateStrategy(supabase) {
  console.log('\n🔄 Analyzing update priorities...')
  
  // Get towns with missing data
  const { data: towns, error } = await supabase
    .from('towns')
    .select('id, town_name, country, data_completeness_score, last_ai_update')
    .order('data_completeness_score', { ascending: true })
    .limit(10)
  
  if (error) {
    console.error('Error fetching towns:', error)
    return
  }
  
  console.log('\n📈 Update Priority List:')
  console.log('(Lower completeness = higher priority)\n')
  
  towns.forEach((town, idx) => {
    const completeness = town.data_completeness_score || 0
    const lastUpdate = town.last_ai_update 
      ? new Date(town.last_ai_update).toLocaleDateString()
      : 'Never'
    
    console.log(`${idx + 1}. ${town.town_name}, ${town.country}`)
    console.log(`   Completeness: ${completeness}%`)
    console.log(`   Last updated: ${lastUpdate}`)
    console.log('')
  })
  
  // Calculate estimated time
  const totalTowns = towns.length
  const timePerTown = 2 // minutes
  const totalTime = totalTowns * timePerTown
  
  console.log(`⏱️  Estimated update time: ${totalTime} minutes for ${totalTowns} towns`)
  console.log(`💡 Tip: Start with towns having < 50% completeness for maximum impact`)
  
  return {
    priorityTowns: towns,
    estimatedTime: totalTime
  }
}