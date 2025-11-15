/**
 * COST SCORING - Category 6 of 6
 * Weight: 19% of total match score
 *
 * Scores how well a town's cost of living matches user's costs:
 * - Overall Cost: Town cost vs user's total monthly cost
 * - Rent Cost: Accommodation costs (BONUS if set)
 * - Healthcare Cost: Medical insurance/costs (BONUS if set)
 * - Tax Considerations: Income, property, sales tax sensitivity
 *
 * FIXED 2025-10-17: REMOVED POWER USER PENALTY
 * - OLD BROKEN: Users penalized 50% for setting rent/healthcare costs
 * - NEW FIXED: Everyone gets same base cost score, bonuses for additional matches
 *
 * Scoring Breakdown (100 points max, capped):
 * - Base Cost Fit: 70 points max (based on cost ratio)
 * - Rent Match Bonus: +20 points (if user sets rent cost AND town has data AND matches)
 * - Healthcare Bonus: +10 points (if user sets healthcare cost AND town has data AND matches)
 * - Tax Scoring: 15 points (based on tax sensitivity and rates)
 * - Total possible: 115 points → capped at 100
 *
 * This ensures setting MORE cost fields = MORE potential points, not penalties
 */

import { parsePreferences } from '../helpers/preferenceParser.js';
import { FEATURE_FLAGS } from '../config.js';

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
  // CRITICAL FIX (2025-10-16): Simplified tax scoring formula
  // - Old: Math.max(2, avgTaxScore) * (maxPoints * 0.8) / 5 (confusing)
  // - New: Direct conversion from 0-5 scale to 0-80% of maxPoints
  if (totalSensitiveTaxes > 0) {
    const avgTaxScore = taxScoreTotal / totalSensitiveTaxes // 0-5 scale
    score = (avgTaxScore / 5) * (maxPoints * 0.8) // Convert to 0-12 points (80% of 15)
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

/**
 * COST V2: Compute asymmetric cost scoring (cheaper = good, expensive = penalized)
 * @param {number} townCost - Town's monthly cost in USD
 * @param {number} userBudget - User's monthly budget in USD
 * @param {number} maxPoints - Maximum points for base cost fit (default 70)
 * @returns {Object} Score and description
 */
function computeCostScoreV2(townCost, userBudget, maxPoints = 70) {
  // Input validation
  if (!townCost || !userBudget || isNaN(townCost) || isNaN(userBudget) || townCost <= 0 || userBudget <= 0) {
    return {
      score: 0,
      description: 'Invalid cost data',
      ratio: 0
    };
  }

  // Calculate ratio: townCost / userBudget
  const ratio = townCost / userBudget;

  // ASYMMETRIC SCORING:
  // - If town is cheaper or equal (ratio <= 1.0): FULL score
  // - If town is expensive (ratio > 1.0): SMOOTH exponential penalty

  if (ratio <= 1.0) {
    // Town costs LESS than budget → Perfect fit
    return {
      score: maxPoints,
      description: `Affordable (cost $${townCost} vs budget $${userBudget})`,
      ratio: ratio
    };
  } else {
    // Town costs MORE than budget → Exponential penalty
    // Formula: maxPoints * exp(-(ratio - 1) * steepness)
    // steepness = 2.0 gives smooth degradation
    const steepness = 2.0;
    const score = maxPoints * Math.exp(-(ratio - 1) * steepness);

    let description;
    if (ratio <= 1.2) {
      description = `Slightly over budget (cost $${townCost} vs budget $${userBudget})`;
    } else if (ratio <= 1.5) {
      description = `Moderately over budget (cost $${townCost} vs budget $${userBudget})`;
    } else {
      description = `Significantly over budget (cost $${townCost} vs budget $${userBudget})`;
    }

    return {
      score: Math.round(score),
      description: description,
      ratio: ratio
    };
  }
}

/**
 * COST V2: Apply luxury underbudget adjustment for high-budget users
 * Prevents extremely cheap towns from getting perfect scores for luxury lifestyle users
 * @param {number} baseScore - Base cost score (0-70)
 * @param {number} townCost - Town's monthly cost in USD
 * @param {number} userBudget - User's monthly budget in USD
 * @returns {Object} Adjusted score and description
 */
function applyLuxuryUnderbudgetAdjustment(baseScore, townCost, userBudget) {
  // Only apply to high-budget users (>= $4000/month)
  const LUXURY_THRESHOLD = 4000;

  if (userBudget < LUXURY_THRESHOLD) {
    // Not a luxury user - no adjustment
    return {
      score: baseScore,
      description: null,
      penaltyApplied: 0
    };
  }

  // Only penalize if town is EXTREMELY cheap (< 50% of budget)
  const EXTREME_CHEAP_THRESHOLD = 0.5;
  const ratio = townCost / userBudget;

  if (ratio >= EXTREME_CHEAP_THRESHOLD) {
    // Town is not extremely cheap - no adjustment
    return {
      score: baseScore,
      description: null,
      penaltyApplied: 0
    };
  }

  // Calculate penalty: up to 30% reduction for extremely cheap towns
  // Penalty increases as town gets cheaper relative to budget
  const MAX_PENALTY_PERCENT = 0.30;
  const penaltyFactor = 1 - (ratio / EXTREME_CHEAP_THRESHOLD); // 0.0 to 1.0
  const penaltyPercent = MAX_PENALTY_PERCENT * penaltyFactor;
  const penalty = baseScore * penaltyPercent;
  const adjustedScore = baseScore - penalty;

  return {
    score: Math.round(adjustedScore),
    description: `Luxury budget mismatch (town $${townCost} vs budget $${userBudget})`,
    penaltyApplied: Math.round(penalty)
  };
}

// 6. COST MATCHING (20% of total)
export function calculateCostScore(preferences, town) {
  let score = 0
  let factors = []

  // Parse and normalize preferences using centralized parser
  const parsed = parsePreferences(preferences)

  // If user has NO cost preferences at all, they're flexible - give perfect score
  if (!parsed.cost.hasAnyPreferences) {
    score = 100
    factors.push({ factor: 'Open to any cost situation', score: 100 })
    return { score, factors, category: 'Costs' }
  }
  
  // Overall cost fit (40 points)
  // Use cost_of_living_usd (actual USD amount), NOT cost_index (relative scale)
  // CRITICAL FIX (2025-10-16): Added input validation for numeric types
  const townCost = Number(town.cost_of_living_usd || town.typical_monthly_living_cost) || 0
  const userCost = Number(parsed.cost.totalMonthlyCost) || 0

  // Validate data exists and is valid
  if (!townCost || !userCost || isNaN(townCost) || isNaN(userCost)) {
    // If we don't have valid cost data, give neutral score
    score += 20
    factors.push({ factor: 'Cost data not available', score: 20 })
    return { score, factors, category: 'Costs' }
  }

  // ============================================================================
  // COST SCORING V1 vs V2 BRANCHING
  // ============================================================================

  if (FEATURE_FLAGS.ENABLE_COST_V2_SCORING) {
    // ========================================================================
    // COST V2: ASYMMETRIC SCORING (cheaper = good, expensive = penalized)
    // ========================================================================

    // Step 1: Compute base cost score using V2 algorithm
    const costResult = computeCostScoreV2(townCost, userCost, 70);
    let baseCostScore = costResult.score;

    // Step 2: Apply luxury underbudget adjustment (only for high-budget users)
    const luxuryAdjustment = applyLuxuryUnderbudgetAdjustment(baseCostScore, townCost, userCost);
    baseCostScore = luxuryAdjustment.score;

    // Add factors
    score += baseCostScore;
    factors.push({ factor: costResult.description, score: baseCostScore });

    // Add luxury penalty note if applied
    if (luxuryAdjustment.penaltyApplied > 0) {
      factors.push({
        factor: luxuryAdjustment.description,
        score: -luxuryAdjustment.penaltyApplied
      });
    }

  } else {
    // ========================================================================
    // COST V1: ORIGINAL SCORING (symmetrical penalty for over/under budget)
    // ========================================================================

    const costRatio = userCost / townCost

    // CRITICAL FIX (2025-10-17): REMOVED POWER USER PENALTY
    // OLD BROKEN LOGIC: Penalized users for setting rent/healthcare costs (50% penalty!)
    // NEW LOGIC: Everyone gets same base points, bonus points awarded if rent/healthcare also match
    // This ensures filling in more cost fields = MORE points, not LESS

    // Base cost ratio scoring (same for everyone - no penalty for being thorough)
    if (costRatio >= 2.0) {
      // User cost is 2x or more than cost - excellent value
      score += 70
      factors.push({ factor: `Excellent value (cost $${userCost} vs actual $${townCost})`, score: 70 })
    } else if (costRatio >= 1.5) {
      // User cost is 1.5x cost - very comfortable margin
      score += 65
      factors.push({ factor: `Very comfortable (cost $${userCost} vs actual $${townCost})`, score: 65 })
    } else if (costRatio >= 1.2) {
      // User cost is 1.2x cost - comfortable fit
      score += 60
      factors.push({ factor: `Comfortable fit (cost $${userCost} vs actual $${townCost})`, score: 60 })
    } else if (costRatio >= 1.0) {
      // User cost EXACTLY meets cost - good match
      score += 55
      factors.push({ factor: `Matches cost (cost $${userCost} vs actual $${townCost})`, score: 55 })
    } else if (costRatio >= 0.9) {
      // User cost is 90% of cost - slightly tight
      score += 45
      factors.push({ factor: `Slightly tight (cost $${userCost} vs actual $${townCost})`, score: 45 })
    } else if (costRatio >= 0.8) {
      // User cost is 80% of cost - challenging but possible
      score += 30
      factors.push({ factor: `Challenging (cost $${userCost} vs actual $${townCost})`, score: 30 })
    } else if (costRatio >= 0.7) {
      // User cost is 70% of cost - very tight
      score += 15
      factors.push({ factor: `Very tight (cost $${userCost} vs actual $${townCost})`, score: 15 })
    } else {
      // Cost too low
      score += 5
      factors.push({ factor: `Over cost limit (cost $${userCost} vs actual $${townCost})`, score: 5 })
    }
  }

  // Get rent and healthcare costs for bonus scoring
  const userRentCost = parsed.cost.maxMonthlyRent
  const userHealthcareCost = parsed.cost.monthlyHealthcareCost

  // Rent cost match (20 points BONUS) - ONLY if user set it AND data available
  if (userRentCost && town.typical_rent_1bed) {
    if (userRentCost >= town.typical_rent_1bed) {
      score += 20
      factors.push({ factor: 'Rent within cost (bonus)', score: 20 })
    } else if (userRentCost >= town.typical_rent_1bed * 0.8) {
      score += 10
      factors.push({ factor: 'Rent slightly over cost (partial bonus)', score: 10 })
    }
  }

  // Healthcare cost match (10 points BONUS) - ONLY if user set it AND data available
  if (userHealthcareCost && town.healthcare_cost_monthly) {
    if (userHealthcareCost >= town.healthcare_cost_monthly) {
      score += 10
      factors.push({ factor: 'Healthcare affordable (bonus)', score: 10 })
    }
  }
  
  // Comprehensive tax scoring (15 points)
  const taxResult = calculateTaxScore(preferences, town, 15)
  score += taxResult.score
  factors.push(...taxResult.factors)
  
  // Add tax data availability warning if needed
  if (!taxResult.hasTaxData && (parsed.cost.incomeTaxSensitive || parsed.cost.propertyTaxSensitive || parsed.cost.salesTaxSensitive)) {
    factors.push({ factor: 'Limited tax data available', score: -1 })
    score -= 1
  }
  
  return {
    score: Math.max(0, Math.min(score, 100)),
    factors,
    category: 'Costs'
  }
}

// Calculate data completeness score (0-5 bonus points)
function calculateDataCompleteness(town) {
  const importantFields = [
    'cost_index',
    'healthcare_score',
    'safety_score',
    'climate_description',
    'summer_climate_actual',
    'winter_climate_actual',
    'humidity_level_actual',
    'sunshine_level_actual',
    'primary_language',
    'english_proficiency_level',
    'expat_community_size',
    'pace_of_life_actual',
    'activities_available',
    'interests_supported',
    'typical_monthly_living_cost',
    'income_tax_rate_pct',
    'visa_on_arrival_countries',
    'geographic_features_actual'
  ]
  
  let completedFields = 0
  importantFields.forEach(field => {
    const value = town[field]
    if (value !== null && value !== undefined && value !== '' && 
        (!Array.isArray(value) || value.length > 0)) {
      completedFields++
    }
  })
  
  const completenessRatio = completedFields / importantFields.length
  return completenessRatio * 5 // 0-5 points based on completeness
}
