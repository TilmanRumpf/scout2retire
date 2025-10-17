/**
 * DYNAMIC HEALTHCARE SCORE CALCULATOR
 *
 * Calculates healthcare score (0-10.0) from:
 * - Admin-set baseline (stored in healthcare_score field)
 * - Dynamic bonuses calculated from raw town data
 *
 * Formula: Final Score = Admin Base + Auto Bonuses (max 10.0)
 *
 * Created: 2025-10-17
 * Purpose: Replace static healthcare_score with dynamic calculation
 */

/**
 * Calculate healthcare score with admin baseline + dynamic bonuses
 *
 * @param {Object} town - Town object with all data fields
 * @returns {number} Healthcare score 0.0-10.0 with 1 decimal precision
 */
export function calculateHealthcareScore(town) {
  // ADMIN-SET BASELINE (0-10.0)
  // This is the base quality rating set by Executive Admins
  // Defaults to 5.0 (neutral) for new towns
  const adminBase = town.healthcare_score || 5.0;

  // DYNAMIC BONUSES (0-3.0 max total)
  let autoBonus = 0.0;

  // 1. HOSPITAL AVAILABILITY BONUS (0-1.0 points)
  // More hospitals = better infrastructure
  if (town.hospital_count >= 10) {
    autoBonus += 1.0; // Major medical hub
  } else if (town.hospital_count >= 5) {
    autoBonus += 0.7; // Large city with good coverage
  } else if (town.hospital_count >= 2) {
    autoBonus += 0.5; // Multiple hospitals available
  } else if (town.hospital_count === 1) {
    autoBonus += 0.3; // Single hospital (like Bubaque)
  }
  // 0 hospitals = 0 bonus

  // 2. ACCESSIBILITY BONUS (0-1.0 points)
  // Distance to nearest major hospital matters
  const distance = town.nearest_major_hospital_km || 999;
  if (distance <= 5) {
    autoBonus += 1.0; // Hospital very close
  } else if (distance <= 15) {
    autoBonus += 0.7; // Reasonable distance
  } else if (distance <= 30) {
    autoBonus += 0.5; // Acceptable for non-emergency
  } else if (distance <= 50) {
    autoBonus += 0.3; // Remote but reachable
  }
  // >50km = 0 bonus (like Bubaque at 60km)

  // 3. EXPAT USABILITY BONUS (0-0.5 points)
  // English-speaking doctors make healthcare accessible for expats
  if (town.english_speaking_doctors_available === true) {
    autoBonus += 0.5;
  }

  // 4. EMERGENCY SERVICES BONUS (0-0.5 points)
  // Quality emergency response is critical
  if (town.emergency_services_quality >= 8) {
    autoBonus += 0.5; // Excellent emergency care
  } else if (town.emergency_services_quality >= 6) {
    autoBonus += 0.3; // Good emergency care
  } else if (town.emergency_services_quality >= 4) {
    autoBonus += 0.2; // Basic emergency care
  }
  // <4 = 0 bonus

  // FINAL SCORE
  // Combine admin base + auto bonuses, cap at 10.0
  const finalScore = adminBase + autoBonus;
  const cappedScore = Math.min(finalScore, 10.0);

  // Return with 1 decimal precision (e.g., 7.5, 8.2, 9.0)
  return Math.round(cappedScore * 10) / 10;
}

/**
 * Get breakdown of bonus components for admin UI transparency
 *
 * @param {Object} town - Town object
 * @returns {Object} Breakdown of each bonus component
 */
export function getHealthcareBonusBreakdown(town) {
  const breakdown = {
    hospitalBonus: 0,
    distanceBonus: 0,
    englishBonus: 0,
    emergencyBonus: 0
  };

  // Hospital bonus
  if (town.hospital_count >= 10) breakdown.hospitalBonus = 1.0;
  else if (town.hospital_count >= 5) breakdown.hospitalBonus = 0.7;
  else if (town.hospital_count >= 2) breakdown.hospitalBonus = 0.5;
  else if (town.hospital_count === 1) breakdown.hospitalBonus = 0.3;

  // Distance bonus
  const distance = town.nearest_major_hospital_km || 999;
  if (distance <= 5) breakdown.distanceBonus = 1.0;
  else if (distance <= 15) breakdown.distanceBonus = 0.7;
  else if (distance <= 30) breakdown.distanceBonus = 0.5;
  else if (distance <= 50) breakdown.distanceBonus = 0.3;

  // English bonus
  if (town.english_speaking_doctors_available === true) {
    breakdown.englishBonus = 0.5;
  }

  // Emergency bonus
  if (town.emergency_services_quality >= 8) breakdown.emergencyBonus = 0.5;
  else if (town.emergency_services_quality >= 6) breakdown.emergencyBonus = 0.3;
  else if (town.emergency_services_quality >= 4) breakdown.emergencyBonus = 0.2;

  breakdown.total = breakdown.hospitalBonus + breakdown.distanceBonus +
                    breakdown.englishBonus + breakdown.emergencyBonus;

  return breakdown;
}

/**
 * Example usage:
 *
 * // Bubaque, Guinea-Bissau
 * const bubaque = {
 *   healthcare_score: 2.0,  // Admin set (very limited island care)
 *   hospital_count: 1,
 *   nearest_major_hospital_km: 60,
 *   english_speaking_doctors_available: false,
 *   emergency_services_quality: 4
 * };
 * calculateHealthcareScore(bubaque);  // Returns 2.5 (2.0 base + 0.3 hospital + 0.2 emergency)
 *
 * // Porto, Portugal
 * const porto = {
 *   healthcare_score: 7.5,  // Admin set (excellent EU city)
 *   hospital_count: 9,
 *   nearest_major_hospital_km: 3,
 *   english_speaking_doctors_available: true,
 *   emergency_services_quality: 9
 * };
 * calculateHealthcareScore(porto);  // Returns 10.0 (7.5 + 2.5 bonuses, capped at 10)
 */
