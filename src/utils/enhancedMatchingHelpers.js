// Enhanced Matching Helpers for Scout2Retire
// Utilizes new town data fields: primary_language, visa_on_arrival_countries, geographic_features, income_tax_rate_pct

/**
 * Enhanced culture scoring using primary_language field
 */
export const calculateEnhancedCultureScore = (town, preferences) => {
  if (!preferences.culture_preferences) return 70
  
  let totalScore = 0
  let factors = 0
  
  // Language compatibility using actual town data (updated to match main algorithm)
  if (preferences.culture_preferences?.language_comfort?.preferences?.length > 0) {
    let langScore = 70
    const langPrefs = preferences.culture_preferences.language_comfort.preferences
    
    // Prioritize actual town data over assumptions
    const townLanguage = town.primary_language ? town.primary_language.toLowerCase() : ''
    const usingRealData = !!town.primary_language
    
    if (langPrefs.includes('english_only')) {
      if (townLanguage === 'english') {
        langScore = 100
      } else if (town.english_proficiency_level) {
        // Use the same proficiency scoring as main algorithm
        const proficiencyScores = {
          'excellent': 88,    // Scaled for 100-point system (22/25 * 100)
          'good': 72,         // 18/25 * 100
          'moderate': 48,     // 12/25 * 100
          'basic': 32,        // 8/25 * 100
          'none': 0,
          // Legacy values
          'native': 100,
          'very_high': 88,
          'high': 72
        }
        langScore = proficiencyScores[town.english_proficiency_level] || 40
      } else if (town.english_proficiency_score) {
        // Fallback to numeric score if available
        if (town.english_proficiency_score >= 80) {
          langScore = 85
        } else if (town.english_proficiency_score >= 60) {
          langScore = 65
        } else {
          langScore = 40
        }
      } else if (!usingRealData) {
        // Only use country assumption if no real data available
        langScore = 40
      }
    } else if (langPrefs.includes('willing_to_learn')) {
      langScore = 85
      // Bonus for Romance languages (easier for English speakers)
      if (usingRealData && ['spanish', 'portuguese', 'italian', 'french', 'catalan', 'romanian'].includes(townLanguage)) {
        langScore += 10
      }
    } else if (langPrefs.includes('comfortable')) {
      langScore = 95
    }
    
    totalScore += langScore
    factors++
  }
  
  // Rest of culture scoring remains the same
  return factors > 0 ? Math.min(100, Math.max(0, totalScore / factors)) : 70
}

/**
 * Enhanced administration scoring using visa_on_arrival_countries
 */
export const calculateEnhancedAdminScore = (town, preferences) => {
  if (!preferences.administration && !preferences.current_status) return 70
  
  let totalScore = 0
  let factors = 0
  
  // Visa requirements using new visa_on_arrival_countries field
  if (preferences.current_status?.citizenship && town.visa_on_arrival_countries) {
    const citizenship = preferences.current_status.citizenship
    const visaCountries = town.visa_on_arrival_countries || []
    let visaScore = 50
    
    // Check if user's citizenship is in visa-on-arrival list
    if (visaCountries.includes(citizenship)) {
      visaScore = 95 // Easy entry
    } else if (visaCountries.includes('USA') || visaCountries.includes('UK') || visaCountries.includes('EU')) {
      // If major countries get visa on arrival, process might be easier
      visaScore = 75
    } else if (visaCountries.length > 50) {
      // Many countries get visa on arrival = generally open
      visaScore = 85
    } else if (visaCountries.length < 10) {
      // Very restrictive visa policy
      visaScore = 40
    }
    
    // Adjust for stay duration preferences
    if (preferences.administration?.stay_duration?.includes('long')) {
      if (town.retirement_visa_available) visaScore += 10
      if (town.digital_nomad_visa) visaScore += 5
    }
    
    totalScore += Math.min(100, visaScore)
    factors++
  }
  
  return factors > 0 ? totalScore / factors : 70
}

/**
 * Enhanced budget scoring using income_tax_rate_pct
 */
export const calculateEnhancedBudgetScore = (town, preferences) => {
  if (!preferences.costs?.total_monthly_budget || !town.cost_index) return 50
  
  const budget = preferences.costs.total_monthly_budget
  const cost = town.cost_index
  const ratio = cost / budget
  
  // Base score
  let score
  if (ratio <= 0.5) score = 100
  else if (ratio <= 0.7) score = 95
  else if (ratio <= 0.85) score = 90
  else if (ratio <= 1.0) score = 85
  else if (ratio <= 1.15) score = 70
  else if (ratio <= 1.3) score = 50
  else score = 30
  
  // Enhanced tax considerations using new income_tax_rate_pct field
  if (town.income_tax_rate_pct !== null && town.income_tax_rate_pct !== undefined) {
    const taxRate = town.income_tax_rate_pct
    
    // Tax sensitivity adjustment
    if (preferences.costs?.income_tax_sensitive) {
      if (taxRate === 0) score += 15 // No income tax!
      else if (taxRate < 10) score += 10
      else if (taxRate < 20) score += 5
      else if (taxRate > 30) score -= 10
      else if (taxRate > 40) score -= 20
    } else {
      // Even if not tax sensitive, extreme rates matter
      if (taxRate === 0) score += 5
      else if (taxRate > 40) score -= 10
    }
  }
  
  return Math.min(100, Math.max(0, score))
}

/**
 * Generate enhanced insights using new data fields
 */
export const generateEnhancedInsights = (town, preferences, scores) => {
  const insights = []
  
  // Language insights
  if (town.primary_language) {
    if (town.primary_language.toLowerCase() === 'english') {
      insights.push({
        category: 'culture',
        type: 'positive',
        text: 'English is the primary language - no language barrier'
      })
    } else if (preferences.culture_preferences?.language_comfort?.preferences?.includes('english_only')) {
      insights.push({
        category: 'culture',
        type: 'consideration',
        text: `Primary language is ${town.primary_language} - consider language learning`
      })
    }
  }
  
  // Visa insights
  if (preferences.current_status?.citizenship && town.visa_on_arrival_countries) {
    const citizenship = preferences.current_status.citizenship
    if (town.visa_on_arrival_countries.includes(citizenship)) {
      insights.push({
        category: 'administration',
        type: 'positive',
        text: `Visa on arrival available for ${citizenship} citizens`
      })
    }
  }
  
  // Tax insights
  if (town.income_tax_rate_pct !== null && town.income_tax_rate_pct !== undefined) {
    if (town.income_tax_rate_pct === 0) {
      insights.push({
        category: 'budget',
        type: 'positive',
        text: 'No income tax on retirement income'
      })
    } else if (town.income_tax_rate_pct > 30) {
      insights.push({
        category: 'budget',
        type: 'warning',
        text: `High income tax rate of ${town.income_tax_rate_pct}%`
      })
    }
  }
  
  // Geographic insights
  if (town.geographic_features && town.geographic_features.length > 0) {
    const features = town.geographic_features
    if (features.includes('beach') || features.includes('coast')) {
      insights.push({
        category: 'lifestyle',
        type: 'positive',
        text: 'Coastal location with beach access'
      })
    }
    if (features.includes('mountain')) {
      insights.push({
        category: 'lifestyle',
        type: 'positive',
        text: 'Mountain views and hiking opportunities'
      })
    }
  }
  
  return insights
}

/**
 * Generate enhanced warnings using new data
 */
export const generateEnhancedWarnings = (town, preferences) => {
  const warnings = []
  
  // Language barrier warning
  if (preferences.culture_preferences?.language_comfort?.preferences?.includes('english_only') &&
      town.primary_language &&
      town.primary_language.toLowerCase() !== 'english' &&
      (!town.english_proficiency_score || town.english_proficiency_score < 60)) {
    warnings.push({
      category: 'culture',
      severity: 'high',
      text: `Language barrier: Primary language is ${town.primary_language} with limited English`
    })
  }
  
  // Visa complexity warning
  if (preferences.administration?.stay_duration?.includes('long') &&
      preferences.current_status?.citizenship &&
      town.visa_on_arrival_countries &&
      !town.visa_on_arrival_countries.includes(preferences.current_status.citizenship) &&
      !town.retirement_visa_available) {
    warnings.push({
      category: 'administration',
      severity: 'medium',
      text: 'Complex visa process for long-term stays'
    })
  }
  
  // High tax warning
  if (town.income_tax_rate_pct !== null && town.income_tax_rate_pct > 40) {
    warnings.push({
      category: 'budget',
      severity: 'high',
      text: `Very high income tax rate of ${town.income_tax_rate_pct}%`
    })
  }
  
  return warnings
}

/**
 * Generate enhanced highlights
 */
export const generateEnhancedHighlights = (town, scores) => {
  const highlights = []
  
  if (town.income_tax_rate_pct === 0) {
    highlights.push('Tax-free retirement income')
  }
  
  if (town.primary_language?.toLowerCase() === 'english') {
    highlights.push('English-speaking country')
  }
  
  if (town.visa_on_arrival_countries?.length > 100) {
    highlights.push('Very welcoming visa policy')
  }
  
  if (town.geographic_features?.includes('beach') && town.geographic_features?.includes('mountain')) {
    highlights.push('Beach and mountain access')
  }
  
  if (scores.budget >= 90 && scores.administration >= 90) {
    highlights.push('Great value with easy residency')
  }
  
  return highlights
}