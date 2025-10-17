/**
 * ADMINISTRATION SCORING - Category 5 of 6
 * Weight: 20% of total match score
 *
 * Scores how well a town's administrative features match user needs:
 * - Healthcare Quality: basic/functional/good
 * - Safety: basic/functional/good
 * - Government Efficiency: basic/functional/good
 * - Political Stability: basic/functional/good
 * - Visa/Residency: ease of access for user's citizenship
 * - Environmental Health: for sensitive users
 *
 * Scoring Breakdown (100 points total):
 * - Healthcare: 30 points
 * - Safety: 25 points
 * - Government Efficiency: 15 points
 * - Visa/Residency: 10 points
 * - Environmental Health: 15 points (conditional)
 * - Political Stability: 10 points
 */

import { parsePreferences } from '../helpers/preferenceParser.js';
import { calculateHealthcareScore } from '../helpers/calculateHealthcareScore.js';

/**
 * Calculate gradual healthcare/safety scoring based on user preference level
 * @param {number} actualScore - Town's actual score (0-10)
 * @param {string} userPref - User's preference level ('basic', 'functional', 'good')
 * @param {number} maxPoints - Maximum points for this category
 * @returns {Object} Score and description
 */
function calculateGradualAdminScore(actualScore, userPref, maxPoints) {
  if (!actualScore || !userPref) return { score: 0, description: null }
  
  // Define scoring tiers based on user preference
  if (userPref === 'good') {
    // User wants good quality (target ≥7.0)
    if (actualScore >= 7.0) {
      return { score: maxPoints, description: 'meets good requirements' }
    } else if (actualScore >= 6.0) {
      return { score: Math.round(maxPoints * 0.85), description: 'almost good quality' }
    } else if (actualScore >= 5.0) {
      return { score: Math.round(maxPoints * 0.65), description: 'functional quality' }
    } else if (actualScore >= 4.0) {
      return { score: Math.round(maxPoints * 0.4), description: 'basic quality' }
    } else {
      return { score: Math.round(maxPoints * 0.15), description: 'below basic quality' }
    }
  } else if (userPref === 'functional') {
    // User wants functional quality - LINEAR GRADUAL SCORING for real differentiation
    // Score linearly from 0-10 to create actual variation
    const percentage = actualScore / 10.0  // Convert 0-10 score to 0-1 percentage
    return { 
      score: Math.round(maxPoints * percentage), 
      description: `${Math.round(actualScore * 10)}/100 rating` 
    }
  } else if (userPref === 'basic') {
    // User wants basic quality (target ≥4.0)
    if (actualScore >= 4.0) {
      return { score: maxPoints, description: 'meets basic requirements' }
    } else if (actualScore >= 3.0) {
      return { score: Math.round(maxPoints * 0.7), description: 'almost basic' }
    } else if (actualScore >= 2.0) {
      return { score: Math.round(maxPoints * 0.4), description: 'below basic' }
    } else {
      return { score: Math.round(maxPoints * 0.15), description: 'lowest baseline' }
    }
  }
  
  // Fallback for unknown preference
  return { score: Math.round(maxPoints * 0.5), description: 'standard quality' }
}


/**
 * Calculate comprehensive tax scoring based on user's tax sensitivity
 * @param {Object} preferences - User's tax sensitivity preferences
 * @param {Object} town - Town tax data
 * @param {number} maxPoints - Maximum points for tax scoring (15)
 * @returns {Object} Score, factors, and descriptions
 */
function calculateTaxScore(preferences, town, maxPoints = 15) {
  let score = 0
  let factors = []

  // Parse preferences to access tax sensitivity flags
  const parsed = parsePreferences(preferences)

  // Get tax data - prioritize JSON field, fall back to individual fields
  const taxData = {
    income: town.income_tax_rate_pct,
    property: town.property_tax_rate_pct,
    sales: town.sales_tax_rate_pct
  }
  
  let totalSensitiveTaxes = 0
  let taxScoreTotal = 0
  
  // Income tax scoring (if user is sensitive)
  if (parsed.cost.incomeTaxSensitive && taxData.income !== null && taxData.income !== undefined) {
    totalSensitiveTaxes++
    const incomeTaxResult = calculateGradualTaxScore(taxData.income, 'income')
    taxScoreTotal += incomeTaxResult.score
    factors.push({
      factor: `Income tax ${incomeTaxResult.description} (${taxData.income}%)`,
      score: incomeTaxResult.score
    })
  }
  
  // Property tax scoring (if user is sensitive)
  if (parsed.cost.propertyTaxSensitive && taxData.property !== null && taxData.property !== undefined) {
    totalSensitiveTaxes++
    const propertyTaxResult = calculateGradualTaxScore(taxData.property, 'property')
    taxScoreTotal += propertyTaxResult.score
    factors.push({
      factor: `Property tax ${propertyTaxResult.description} (${taxData.property}%)`,
      score: propertyTaxResult.score
    })
  }
  
  // Sales tax scoring (if user is sensitive)
  if (parsed.cost.salesTaxSensitive && taxData.sales !== null && taxData.sales !== undefined) {
    totalSensitiveTaxes++
    const salesTaxResult = calculateGradualTaxScore(taxData.sales, 'sales')
    taxScoreTotal += salesTaxResult.score
    factors.push({
      factor: `Sales tax ${salesTaxResult.description} (${taxData.sales}%)`,
      score: salesTaxResult.score
    })
  }
  
  // Calculate proportional score based on sensitive taxes
  if (totalSensitiveTaxes > 0) {
    // More forgiving calculation: minimum 2 points per tax, not 1
    const avgTaxScore = taxScoreTotal / totalSensitiveTaxes
    score = Math.max(2, avgTaxScore) * (maxPoints * 0.8) / 5 // 80% of points from tax rates
  }
  
  // Bonus scoring for tax benefits (20% of points)
  let bonusPoints = 0
  const maxBonus = maxPoints * 0.2
  
  // Tax treaty bonus
  if (town.tax_treaty_us) {
    bonusPoints += maxBonus * 0.4 // 40% of bonus
    factors.push({
      factor: 'US tax treaty available',
      score: Math.round(maxBonus * 0.4)
    })
  }
  
  // Tax haven status bonus
  if (town.tax_haven_status) {
    bonusPoints += maxBonus * 0.5 // 50% of bonus
    factors.push({
      factor: 'Recognized tax haven',
      score: Math.round(maxBonus * 0.5)
    })
  }
  
  // Foreign income not taxed bonus
  if (town.foreign_income_taxed === false) {
    bonusPoints += maxBonus * 0.3 // 30% of bonus
    factors.push({
      factor: 'Foreign income not taxed',
      score: Math.round(maxBonus * 0.3)
    })
  }
  
  score += bonusPoints
  
  // If user has no tax sensitivities, give neutral score
  if (totalSensitiveTaxes === 0) {
    score = maxPoints * 0.5 // 50% neutral score
    factors.push({
      factor: 'Tax rates not a priority',
      score: Math.round(maxPoints * 0.5)
    })
  }
  
  return {
    score: Math.min(Math.round(score), maxPoints),
    factors,
    hasTaxData: totalSensitiveTaxes > 0 || town.tax_treaty_us || town.tax_haven_status || town.foreign_income_taxed !== null
  }
}

/**
 * Calculate gradual tax scoring for a specific tax type
 * @param {number} taxRate - Tax rate percentage
 * @param {string} taxType - Type of tax ('income', 'property', 'sales')
 * @returns {Object} Score (0-5) and description
 */
function calculateGradualTaxScore(taxRate, taxType) {
  if (taxRate === null || taxRate === undefined) {
    return { score: 0, description: 'data unavailable' }
  }
  
  // Define tax rate thresholds by type
  const thresholds = {
    income: {
      excellent: 10,   // 0-10%
      good: 20,        // 10-20%
      fair: 30,        // 20-30%
      poor: 40         // 30-40%
    },
    property: {
      excellent: 1,    // 0-1%
      good: 2,         // 1-2%
      fair: 3,         // 2-3%
      poor: 4          // 3-4%
    },
    sales: {
      excellent: 10,   // 0-10%
      good: 17,        // 10-17%
      fair: 22,        // 17-22% (includes most EU VAT rates)
      poor: 27         // 22-27%
    }
  }
  
  const t = thresholds[taxType]
  
  if (taxRate <= t.excellent) {
    return { score: 5, description: 'excellent rate' }
  } else if (taxRate <= t.good) {
    return { score: 4, description: 'good rate' }
  } else if (taxRate <= t.fair) {
    return { score: 3, description: 'fair rate' }
  } else if (taxRate <= t.poor) {
    return { score: 2, description: 'high rate' }
  } else {
    return { score: 1, description: 'very high rate' }
  }
}

// 5. ADMINISTRATION MATCHING (15% of total)
export function calculateAdminScore(preferences, town) {
  let score = 0
  let factors = []

  // Parse and normalize preferences using centralized parser
  const parsed = parsePreferences(preferences)

  // Admin score calculation

  // If user has NO admin preferences at all, they're flexible - give perfect score
  if (!parsed.admin.hasAnyPreferences) {
    score = 100
    factors.push({ factor: 'Open to any administrative situation', score: 100 })
    return { score, factors, category: 'Admin' }
  }
  
  // Healthcare quality match (30 points) - now with gradual scoring
  const healthcareArray = parsed.admin.healthcare || []
  const healthcarePref = Array.isArray(healthcareArray) ? healthcareArray[0] : healthcareArray
  
  // Always score healthcare if town has data, even if no preference
  if (town.healthcare_score) {
    const prefToUse = healthcarePref || 'functional' // Default to functional if no preference

    // DYNAMIC CALCULATION: Admin base + auto bonuses
    const calculatedScore = calculateHealthcareScore(town);

    const healthcareResult = calculateGradualAdminScore(
      calculatedScore,  // Use calculated score instead of static field
      prefToUse,
      30
    )

    score += healthcareResult.score
    factors.push({
      factor: `Healthcare ${healthcareResult.description} (score: ${calculatedScore})`,
      score: healthcareResult.score
    })
  } else {
    // No healthcare data - penalize for missing critical data
    score += 5
    factors.push({ factor: 'Healthcare data not available', score: 5 })
  }
  
  // Safety match (25 points) - now with gradual scoring
  const safetyArray = parsed.admin.safety || []
  const safetyPref = Array.isArray(safetyArray) ? safetyArray[0] : safetyArray
  
  // Always score safety if town has data, even if no preference
  if (town.safety_score) {
    const prefToUse = safetyPref || 'functional' // Default to functional if no preference
    const safetyResult = calculateGradualAdminScore(
      town.safety_score, 
      prefToUse, 
      25
    )
    
    score += safetyResult.score
    factors.push({ 
      factor: `Safety ${safetyResult.description} (score: ${town.safety_score})`, 
      score: safetyResult.score 
    })
  } else {
    // No safety data - penalize for missing critical data
    score += 5
    factors.push({ factor: 'Safety data not available', score: 5 })
  }
  
  // Government efficiency match (15 points)
  const govArray = parsed.admin.governmentEfficiency || []
  const govPref = Array.isArray(govArray) ? govArray[0] : govArray
  
  if (town.government_efficiency_rating) {
    // Government rating is 0-100, convert to 0-10 scale for scoring
    const govScore = town.government_efficiency_rating / 10
    // Use user preference if exists, otherwise default to 'functional'
    const prefToUse = govPref || 'functional'
    const govResult = calculateGradualAdminScore(govScore, prefToUse, 15)
    
    score += govResult.score
    factors.push({ 
      factor: `Government efficiency ${govResult.description} (rating: ${town.government_efficiency_rating})`, 
      score: govResult.score 
    })
  } else {
    // No data available - minimal credit
    score += 3
    factors.push({ factor: 'Government efficiency data not available', score: 3 })
  }
  
  // Visa/residency match (10 points) - handle array format
  const visaArray = parsed.admin.visaPreference || []
  const visaPref = Array.isArray(visaArray) ? visaArray[0] : visaArray
  
  if ((visaPref === 'good' || visaPref === 'functional') && parsed.admin.stayDuration) {
    // Check visa requirements based on user citizenship
    // CRITICAL FIX (2025-10-16): Case-insensitive citizenship matching
    const citizenshipRaw = parsed.citizenship || preferences.current_status?.citizenship || 'USA'
    const citizenship = String(citizenshipRaw).toLowerCase()
    const visaCountries = (town.visa_on_arrival_countries || []).map(c => String(c).toLowerCase())
    const residencyCountries = (town.easy_residency_countries || []).map(c => String(c).toLowerCase())

    if (visaCountries.includes(citizenship) || residencyCountries.includes(citizenship)) {
      score += 10
      factors.push({ factor: 'Easy visa/residency access', score: 10 })
    } else if (town.retirement_visa_available) {
      score += 8
      factors.push({ factor: 'Retirement visa available', score: 8 })
    }
  } else {
    score += 5 // Basic visa access
  }
  
  // Environmental health for sensitive users (15 points)
  if (preferences.health_considerations?.environmental_health === 'sensitive' &&
      town.environmental_health_rating >= 4) {
    score += 15
    factors.push({ factor: 'Good environmental health', score: 15 })
  }
  
  // Political stability bonus (10 points) - now with gradual scoring
  const stabilityArray = parsed.admin.politicalStability || []
  const stabilityPref = Array.isArray(stabilityArray) ? stabilityArray[0] : stabilityArray
  
  if (town.political_stability_rating) {
    const prefToUse = stabilityPref || 'functional' // Default to functional if no preference
    const stabilityScore = town.political_stability_rating / 10 // Convert to 0-10 scale
    const stabilityResult = calculateGradualAdminScore(stabilityScore, prefToUse, 10)
    
    score += stabilityResult.score
    factors.push({ 
      factor: `Political stability ${stabilityResult.description} (rating: ${town.political_stability_rating})`, 
      score: stabilityResult.score 
    })
  } else {
    // No data available - minimal credit
    score += 2
    factors.push({ factor: 'Political stability data not available', score: 2 })
  }
  
  const finalScore = Math.min(score, 100);
  
  // Final score calculated
  
  return {
    score: finalScore,
    factors,
    category: 'Administration'
  }
}
