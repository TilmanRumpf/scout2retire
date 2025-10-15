/**
 * CALCULATE MATCH - Main Orchestrator
 *
 * Combines all 6 category scores into final match score:
 * 1. Region (20%) - Geographic location match
 * 2. Climate (15%) - Weather preferences
 * 3. Culture (15%) - Lifestyle & language
 * 4. Hobbies (10%) - Activities & interests
 * 5. Administration (20%) - Healthcare, safety, visa
 * 6. Cost (20%) - Budget matching
 *
 * IMPORTANT LOGIC: Empty preferences = 100% match
 * - When a user has NO preferences in a category, they get 100% for that category
 * - This means "I don't care" = "I'm happy with anything"
 * - Only when users SELECT preferences do we filter/score based on matching
 *
 * Example: User with only budget preference gets:
 * - Cost: Scored based on their budget vs town cost
 * - All other categories: 100% (open to any option)
 *
 * This ensures users see many options unless they specifically narrow them down
 */

import { CATEGORY_WEIGHTS } from '../config.js';
import { calculateRegionScore } from '../categories/regionScoring.js';
import { calculateClimateScore } from '../categories/climateScoring.js';
import { calculateCultureScore } from '../categories/cultureScoring.js';
import { calculateHobbiesScore } from '../categories/hobbiesScoring.js';
import { calculateAdminScore } from '../categories/adminScoring.js';
import { calculateCostScore } from '../categories/costScoring.js';

/**
 * Calculate enhanced match score for a town
 *
 * @param {Object} userPreferences - User's preferences (all categories)
 * @param {Object} town - Town data to score
 * @returns {Promise<Object>} Match result with scores and factors
 */
export async function calculateEnhancedMatch(userPreferences, town) {
  // Calculate individual category scores
  const regionResult = calculateRegionScore(userPreferences.region_preferences || {}, town)
  const climateResult = calculateClimateScore(userPreferences.climate_preferences || {}, town)
  const cultureResult = calculateCultureScore(userPreferences.culture_preferences || {}, town)
  const hobbiesResult = await calculateHobbiesScore(userPreferences.hobbies_preferences || userPreferences.hobbies || {}, town)
  const adminResult = calculateAdminScore({
    ...userPreferences.admin_preferences || {},
    citizenship: userPreferences.current_status?.citizenship
  }, town)
  const costResult = calculateCostScore(userPreferences.cost_preferences || {}, town)


  // Calculate weighted total score
  let totalScore = (
    (regionResult.score * CATEGORY_WEIGHTS.region / 100) +
    (climateResult.score * CATEGORY_WEIGHTS.climate / 100) +
    (cultureResult.score * CATEGORY_WEIGHTS.culture / 100) +
    (hobbiesResult.score * CATEGORY_WEIGHTS.hobbies / 100) +
    (adminResult.score * CATEGORY_WEIGHTS.administration / 100) +
    (costResult.score * CATEGORY_WEIGHTS.cost / 100)
  )

  // No bonuses - pure weighted scoring only

  // Cap the total score at 100
  totalScore = Math.min(totalScore, 100)

  // Compile all factors
  const allFactors = [
    ...regionResult.factors,
    ...climateResult.factors,
    ...cultureResult.factors,
    ...hobbiesResult.factors,
    ...adminResult.factors,
    ...costResult.factors
  ]

  // No data completeness factors

  // Determine match quality
  let matchQuality = 'Poor'
  if (totalScore >= 85) matchQuality = 'Excellent'
  else if (totalScore >= 70) matchQuality = 'Very Good'
  else if (totalScore >= 55) matchQuality = 'Good'
  else if (totalScore >= 40) matchQuality = 'Fair'

  return {
    town_id: town.id,
    town_name: town.name,
    town_country: town.country,
    match_score: Math.min(100, Math.round(totalScore)),
    match_quality: matchQuality,
    category_scores: {
      region: Math.round(regionResult.score),
      climate: Math.round(climateResult.score),
      culture: Math.round(cultureResult.score),
      hobbies: Math.round(hobbiesResult.score),
      administration: Math.round(adminResult.score),
      cost: Math.round(costResult.score)
    },
    match_factors: allFactors,
    top_factors: allFactors
      .sort((a, b) => b.score - a.score)
      .slice(0, 5),
    warnings: allFactors
      .filter(f => f.score < 0)
      .map(f => f.factor)
  }
}
