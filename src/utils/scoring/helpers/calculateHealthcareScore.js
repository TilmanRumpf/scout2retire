/**
 * DYNAMIC HEALTHCARE SCORE CALCULATOR
 *
 * Calculates healthcare score (0-10.0) from three independent components:
 * - Quality Score (0-4.0): Admin base + facility bonuses
 * - Accessibility Score (0-3.0): Distance + emergency services
 * - Cost Score (0-3.0): Insurance + affordability
 *
 * Formula: Final Score = Quality + Accessibility + Cost (max 10.0)
 *
 * Created: 2025-10-17
 * Updated: 2025-10-17 (Phase 2: Component-based architecture)
 */

/**
 * COMPONENT 1: QUALITY SCORE (0-4.0)
 * Measures healthcare infrastructure quality
 *
 * @param {Object} town - Town object
 * @returns {number} Quality score 0.0-4.0
 */
function calculateQualityScore(town) {
  // Admin baseline (0-3.0): Base quality rating
  // healthcare_score is now interpreted on 0-10 scale, normalize to 0-3
  const adminBase = town.healthcare_score
    ? Math.min((town.healthcare_score / 10) * 3.0, 3.0)
    : 1.5; // Default to 1.5 (neutral) for new towns

  // Hospital count bonus (0-1.0): Facility availability
  let hospitalBonus = 0.0;
  if (town.hospital_count >= 10) {
    hospitalBonus = 1.0; // Major medical hub
  } else if (town.hospital_count >= 5) {
    hospitalBonus = 0.7; // Large city with good coverage
  } else if (town.hospital_count >= 2) {
    hospitalBonus = 0.5; // Multiple hospitals available
  } else if (town.hospital_count === 1) {
    hospitalBonus = 0.3; // Single hospital (like Bubaque)
  }
  // 0 hospitals = 0 bonus

  const qualityScore = adminBase + hospitalBonus;
  return Math.min(Math.round(qualityScore * 10) / 10, 4.0);
}

/**
 * COMPONENT 2: ACCESSIBILITY SCORE (0-3.0)
 * Measures how easily healthcare can be accessed
 *
 * @param {Object} town - Town object
 * @returns {number} Accessibility score 0.0-3.0
 */
function calculateAccessibilityScore(town) {
  let accessScore = 0.0;

  // Distance to hospital (0-1.5): Geographic access
  const distance = town.nearest_major_hospital_km || 999;
  if (distance <= 5) {
    accessScore += 1.5; // Hospital very close
  } else if (distance <= 15) {
    accessScore += 1.0; // Reasonable distance
  } else if (distance <= 30) {
    accessScore += 0.7; // Acceptable for non-emergency
  } else if (distance <= 50) {
    accessScore += 0.4; // Remote but reachable
  }
  // >50km = 0 bonus (like Bubaque at 60km)

  // Emergency services quality (0-1.0): Response capability
  if (town.emergency_services_quality >= 8) {
    accessScore += 1.0; // Excellent emergency care
  } else if (town.emergency_services_quality >= 6) {
    accessScore += 0.7; // Good emergency care
  } else if (town.emergency_services_quality >= 4) {
    accessScore += 0.4; // Basic emergency care
  } else if (town.emergency_services_quality >= 2) {
    accessScore += 0.2; // Minimal emergency care
  }
  // <2 = 0 bonus

  // English-speaking doctors (0-0.5): Language accessibility
  // Support both field names for backwards compatibility
  const hasEnglishDoctors = town.english_speaking_doctors_available === true ||
                           town.english_speaking_doctors === true;
  if (hasEnglishDoctors) {
    accessScore += 0.5;
  }

  return Math.min(Math.round(accessScore * 10) / 10, 3.0);
}

/**
 * COMPONENT 3: COST SCORE (0-3.0)
 * Measures healthcare affordability and insurance
 *
 * @param {Object} town - Town object
 * @returns {number} Cost score 0.0-3.0
 */
function calculateCostScore(town) {
  let costScore = 0.0;

  // International insurance acceptance (0-1.5): Insurance flexibility
  // Use insurance_availability_rating if available, fallback to text field
  if (town.insurance_availability_rating !== null && town.insurance_availability_rating !== undefined) {
    // Convert 0-10 rating to 0-1.5 scale
    costScore += Math.min((town.insurance_availability_rating / 10) * 1.5, 1.5);
  } else {
    const acceptance = (town.international_insurance_acceptance || '').toLowerCase();
    if (acceptance === 'widely_accepted' || acceptance === 'universal') {
      costScore += 1.5; // Most insurances work
    } else if (acceptance === 'commonly_accepted' || acceptance === 'common') {
      costScore += 1.0; // Many insurances work
    } else if (acceptance === 'limited' || acceptance === 'some') {
      costScore += 0.5; // Few insurances work
    }
  }
  // none/rare = 0 bonus

  // Healthcare cost level (0-1.5): Affordability
  // Use healthcare_cost field or healthcare_cost_monthly if available
  if (town.healthcare_cost || town.healthcare_cost_monthly) {
    const cost = town.healthcare_cost || town.healthcare_cost_monthly;
    // Lower cost is better - inverse scale
    if (cost <= 200) {
      costScore += 1.5; // Very affordable
    } else if (cost <= 400) {
      costScore += 1.2; // Affordable
    } else if (cost <= 800) {
      costScore += 0.8; // Moderate
    } else if (cost <= 1500) {
      costScore += 0.4; // Expensive but manageable
    }
    // > 1500 = 0 bonus
  } else {
    const costLevel = (town.healthcare_cost_level || '').toLowerCase();
    if (costLevel === 'very_low' || costLevel === 'minimal') {
      costScore += 1.5; // Very affordable
    } else if (costLevel === 'low' || costLevel === 'cheap') {
      costScore += 1.2; // Affordable
    } else if (costLevel === 'moderate' || costLevel === 'medium') {
      costScore += 0.8; // Average cost
    } else if (costLevel === 'high' || costLevel === 'expensive') {
      costScore += 0.4; // Expensive but manageable
    }
  }
  // very_high/prohibitive = 0 bonus

  return Math.min(Math.round(costScore * 10) / 10, 3.0);
}

/**
 * Calculate final healthcare score from all components
 *
 * @param {Object} town - Town object with all data fields
 * @returns {number} Healthcare score 0.0-10.0 with 1 decimal precision
 */
export function calculateHealthcareScore(town) {
  const quality = calculateQualityScore(town);
  const accessibility = calculateAccessibilityScore(town);
  const cost = calculateCostScore(town);

  const finalScore = quality + accessibility + cost;
  const cappedScore = Math.min(finalScore, 10.0);

  // Return with 1 decimal precision (e.g., 7.5, 8.2, 9.0)
  return Math.round(cappedScore * 10) / 10;
}

/**
 * Get breakdown of all scoring components for transparency
 *
 * @param {Object} town - Town object
 * @returns {Object} Complete breakdown of all components and sub-components
 */
export function getHealthcareBonusBreakdown(town) {
  const quality = calculateQualityScore(town);
  const accessibility = calculateAccessibilityScore(town);
  const cost = calculateCostScore(town);

  return {
    // Component scores
    quality,
    accessibility,
    cost,
    total: Math.min(quality + accessibility + cost, 10.0),

    // Sub-component details for admin UI
    components: {
      quality: {
        adminBase: town.healthcare_score
          ? Math.min((town.healthcare_score / 10) * 3.0, 3.0)
          : 1.5,
        hospitalBonus: town.hospital_count >= 10 ? 1.0 :
                       town.hospital_count >= 5 ? 0.7 :
                       town.hospital_count >= 2 ? 0.5 :
                       town.hospital_count === 1 ? 0.3 : 0
      },
      accessibility: {
        distanceScore: (() => {
          const d = town.nearest_major_hospital_km || 999;
          if (d <= 5) return 1.5;
          if (d <= 15) return 1.0;
          if (d <= 30) return 0.7;
          if (d <= 50) return 0.4;
          return 0;
        })(),
        emergencyScore: town.emergency_services_quality >= 8 ? 1.0 :
                       town.emergency_services_quality >= 6 ? 0.7 :
                       town.emergency_services_quality >= 4 ? 0.4 :
                       town.emergency_services_quality >= 2 ? 0.2 : 0,
        englishBonus: town.english_speaking_doctors_available === true ? 0.5 : 0
      },
      cost: {
        insuranceScore: (() => {
          const a = (town.international_insurance_acceptance || '').toLowerCase();
          if (a === 'widely_accepted' || a === 'universal') return 1.5;
          if (a === 'commonly_accepted' || a === 'common') return 1.0;
          if (a === 'limited' || a === 'some') return 0.5;
          return 0;
        })(),
        affordabilityScore: (() => {
          const c = (town.healthcare_cost_level || '').toLowerCase();
          if (c === 'very_low' || c === 'minimal') return 1.5;
          if (c === 'low' || c === 'cheap') return 1.2;
          if (c === 'moderate' || c === 'medium') return 0.8;
          if (c === 'high' || c === 'expensive') return 0.4;
          return 0;
        })()
      }
    }
  };
}

/**
 * Example usage:
 *
 * // Bubaque, Guinea-Bissau (remote island)
 * const bubaque = {
 *   healthcare_score: 2.0,  // Admin baseline
 *   hospital_count: 1,
 *   nearest_major_hospital_km: 60,
 *   english_speaking_doctors_available: false,
 *   emergency_services_quality: 4,
 *   international_insurance_acceptance: 'limited',
 *   healthcare_cost_level: 'low'
 * };
 * calculateHealthcareScore(bubaque);
 * // Quality: 0.9 (admin 0.6 + hospital 0.3)
 * // Accessibility: 0.4 (emergency 0.4)
 * // Cost: 1.7 (insurance 0.5 + cost 1.2)
 * // Total: 3.0
 *
 * // Porto, Portugal (EU city with excellent healthcare)
 * const porto = {
 *   healthcare_score: 7.5,  // Admin baseline
 *   hospital_count: 9,
 *   nearest_major_hospital_km: 3,
 *   english_speaking_doctors_available: true,
 *   emergency_services_quality: 9,
 *   international_insurance_acceptance: 'widely_accepted',
 *   healthcare_cost_level: 'moderate'
 * };
 * calculateHealthcareScore(porto);
 * // Quality: 3.0 (admin 2.25 + hospital 0.7 = capped at 3.0)
 * // Accessibility: 3.0 (distance 1.5 + emergency 1.0 + english 0.5)
 * // Cost: 2.3 (insurance 1.5 + cost 0.8)
 * // Total: 8.3
 *
 * // Chiang Mai, Thailand (affordable expat hub)
 * const chiangMai = {
 *   healthcare_score: 6.0,
 *   hospital_count: 6,
 *   nearest_major_hospital_km: 8,
 *   english_speaking_doctors_available: true,
 *   emergency_services_quality: 7,
 *   international_insurance_acceptance: 'commonly_accepted',
 *   healthcare_cost_level: 'very_low'
 * };
 * calculateHealthcareScore(chiangMai);
 * // Quality: 2.5 (admin 1.8 + hospital 0.7)
 * // Accessibility: 2.2 (distance 1.0 + emergency 0.7 + english 0.5)
 * // Cost: 2.5 (insurance 1.0 + cost 1.5)
 * // Total: 7.2
 */
