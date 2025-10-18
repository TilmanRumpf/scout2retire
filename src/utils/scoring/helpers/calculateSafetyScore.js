/**
 * DYNAMIC SAFETY SCORE CALCULATOR
 *
 * Calculates safety score (0-10.0) from three independent components:
 * - Base Safety (0-7.0): Admin baseline rating
 * - Crime Impact (0-2.0): Crime rate penalty/bonus
 * - Environmental Safety (0-1.0): Natural disaster/health risks
 *
 * Formula: Final Score = Base + Crime Impact + Environmental (max 10.0)
 *
 * Created: 2025-10-17
 * Purpose: Complement healthcare with dynamic safety scoring
 */

/**
 * COMPONENT 1: BASE SAFETY (0-7.0)
 * Admin-set baseline safety rating
 *
 * @param {Object} town - Town object
 * @returns {number} Base safety score 0.0-7.0
 */
function calculateBaseSafety(town) {
  // Admin baseline (0-7.0): Base safety rating from executive admin
  // safety_score is on 0-10 scale, cap contribution at 7.0 to leave room for bonuses
  const adminBase = town.safety_score || 5.0; // Default to 5.0 (neutral) for new towns

  return Math.min(Math.round(adminBase * 10) / 10, 7.0);
}

/**
 * COMPONENT 2: CRIME IMPACT (-1.0 to +2.0)
 * Crime rate can penalize or bonus the score
 *
 * @param {Object} town - Town object
 * @returns {number} Crime impact -1.0 to +2.0
 */
function calculateCrimeImpact(town) {
  if (town.crime_rate === null || town.crime_rate === undefined) {
    return 0; // No data = neutral impact
  }

  // Crime rate is 0-100 scale (lower is better)
  // 0-20: Extremely safe (+2.0)
  // 21-40: Very safe (+1.0)
  // 41-60: Moderately safe (0.0)
  // 61-80: Some concerns (-0.5)
  // 81-100: Significant concerns (-1.0)

  const crimeRate = town.crime_rate;

  if (crimeRate <= 20) {
    return 2.0; // Extremely safe - bonus points
  } else if (crimeRate <= 40) {
    return 1.0; // Very safe - small bonus
  } else if (crimeRate <= 60) {
    return 0.0; // Moderate - neutral
  } else if (crimeRate <= 80) {
    return -0.5; // Some concerns - small penalty
  } else {
    return -1.0; // Significant concerns - penalty
  }
}

/**
 * COMPONENT 3: ENVIRONMENTAL SAFETY (0-1.0)
 * Natural disasters, air quality, water safety
 *
 * @param {Object} town - Town object
 * @returns {number} Environmental safety 0.0-1.0
 */
function calculateEnvironmentalSafety(town) {
  let envScore = 0.0;

  // Environmental health rating (0-10 scale)
  if (town.environmental_health_rating !== null && town.environmental_health_rating !== undefined) {
    // Convert 0-10 to 0-0.6 contribution
    envScore += Math.min((town.environmental_health_rating / 10) * 0.6, 0.6);
  } else {
    // No data = assume neutral (0.3)
    envScore += 0.3;
  }

  // Natural disaster risk (bonus for low risk)
  // Support both text field and numeric score (0-10)
  if (town.natural_disaster_risk_score !== null && town.natural_disaster_risk_score !== undefined) {
    // Numeric score: 0 = high risk, 10 = low risk
    // Convert to 0-0.4 scale (inverse)
    const riskScore = town.natural_disaster_risk_score;
    envScore += Math.min((riskScore / 10) * 0.4, 0.4);
  } else if (town.natural_disaster_risk) {
    const disasterRisk = String(town.natural_disaster_risk).toLowerCase();
    if (disasterRisk === 'low' || disasterRisk === 'minimal') {
      envScore += 0.4; // Very safe from natural disasters
    } else if (disasterRisk === 'moderate' || disasterRisk === 'medium') {
      envScore += 0.2; // Some risk but manageable
    } else if (disasterRisk === 'high' || disasterRisk === 'severe') {
      envScore += 0.0; // Significant natural disaster concerns
    } else {
      // Unknown value = assume moderate (0.2)
      envScore += 0.2;
    }
  } else {
    // No data = assume moderate (0.2)
    envScore += 0.2;
  }

  return Math.min(Math.round(envScore * 10) / 10, 1.0);
}

/**
 * Calculate final safety score from all components
 *
 * @param {Object} town - Town object with all data fields
 * @returns {number} Safety score 0.0-10.0 with 1 decimal precision
 */
export function calculateSafetyScore(town) {
  const baseSafety = calculateBaseSafety(town);
  const crimeImpact = calculateCrimeImpact(town);
  const environmental = calculateEnvironmentalSafety(town);

  const finalScore = baseSafety + crimeImpact + environmental;

  // Ensure score stays within 0-10 range
  const cappedScore = Math.max(0, Math.min(finalScore, 10.0));

  // Return with 1 decimal precision (e.g., 7.5, 8.2, 9.0)
  return Math.round(cappedScore * 10) / 10;
}

/**
 * Get breakdown of all scoring components for transparency
 *
 * @param {Object} town - Town object
 * @returns {Object} Complete breakdown of all components and sub-components
 */
export function getSafetyScoreBreakdown(town) {
  const baseSafety = calculateBaseSafety(town);
  const crimeImpact = calculateCrimeImpact(town);
  const environmental = calculateEnvironmentalSafety(town);

  const total = Math.max(0, Math.min(baseSafety + crimeImpact + environmental, 10.0));

  return {
    // Component scores
    baseSafety,
    crimeImpact,
    environmental,
    total,

    // Sub-component details for admin UI
    components: {
      base: {
        adminRating: town.safety_score || 5.0
      },
      crime: {
        crimeRate: town.crime_rate,
        impact: crimeImpact,
        description: (() => {
          const rate = town.crime_rate;
          if (rate === null || rate === undefined) return 'No data';
          if (rate <= 20) return 'Extremely safe';
          if (rate <= 40) return 'Very safe';
          if (rate <= 60) return 'Moderately safe';
          if (rate <= 80) return 'Some concerns';
          return 'Significant concerns';
        })()
      },
      environmental: {
        healthRating: town.environmental_health_rating,
        disasterRisk: town.natural_disaster_risk,
        totalScore: environmental
      }
    }
  };
}

/**
 * Example usage:
 *
 * // Tokyo, Japan (very safe, low crime)
 * const tokyo = {
 *   safety_score: 8.5,
 *   crime_rate: 15,
 *   environmental_health_rating: 7.0,
 *   natural_disaster_risk: 'moderate'  // Earthquakes
 * };
 * calculateSafetyScore(tokyo);
 * // Base: 7.0 (admin capped)
 * // Crime: +2.0 (extremely safe)
 * // Environmental: 0.6 (good health + moderate disaster risk)
 * // Total: 9.6
 *
 * // Mexico City, Mexico (moderate safety)
 * const mexicoCity = {
 *   safety_score: 5.0,
 *   crime_rate: 65,
 *   environmental_health_rating: 4.0,
 *   natural_disaster_risk: 'high'  // Earthquakes
 * };
 * calculateSafetyScore(mexicoCity);
 * // Base: 5.0 (admin baseline)
 * // Crime: -0.5 (some concerns)
 * // Environmental: 0.2 (poor health + high disaster risk)
 * // Total: 4.7
 *
 * // Reykjavik, Iceland (extremely safe)
 * const reykjavik = {
 *   safety_score: 9.0,
 *   crime_rate: 10,
 *   environmental_health_rating: 9.5,
 *   natural_disaster_risk: 'low'
 * };
 * calculateSafetyScore(reykjavik);
 * // Base: 7.0 (admin capped)
 * // Crime: +2.0 (extremely safe)
 * // Environmental: 1.0 (excellent health + low disaster risk)
 * // Total: 10.0
 */
