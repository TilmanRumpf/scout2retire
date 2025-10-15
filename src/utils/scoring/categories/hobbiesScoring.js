/**
 * HOBBIES SCORING - Category 4 of 6
 * Weight: 10% of total match score
 *
 * Scores how well a town supports user's hobbies and activities.
 * Uses geographic inference to determine hobby availability.
 */

import { calculateHobbiesScore as calculateNormalizedHobbiesScore } from '../helpers/hobbiesMatching.js';

/**
 * Calculate hobbies match score
 *
 * @param {Object} preferences - User's hobby preferences
 * @param {Object} town - Town data
 * @returns {Promise<Object>} Score result with factors
 */
export async function calculateHobbiesScore(preferences, town) {
  // Use the normalized hobbies matching system
  // This uses geographic inference instead of storing 865,000 town_hobby relationships
  const result = await calculateNormalizedHobbiesScore(preferences, town);
  return result;
}
