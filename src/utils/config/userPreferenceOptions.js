/**
 * USER PREFERENCE OPTIONS CONFIG
 *
 * Centralized configuration for user preference options used in onboarding
 * and scoring algorithms.
 *
 * These represent USER REQUIREMENTS (what quality/level they want),
 * NOT town categorical values (what the town has).
 *
 * Created: 2025-11-13
 * Reason: RULE #2 compliance - centralize values hardcoded in multiple places
 */

/**
 * Quality levels for admin services (healthcare, safety, government, etc.)
 * Used in:
 * - OnboardingAdministration.jsx (qualityOptions array)
 * - adminScoring.js (calculateGradualAdminScore function)
 *
 * Maps to scoring thresholds:
 * - 'good': User wants excellent quality (score ≥7.0)
 * - 'functional': User wants working quality (linear scoring)
 * - 'basic': User wants minimal quality (score ≥4.0)
 */
export const ADMIN_QUALITY_LEVELS = [
  {
    value: 'good',
    label: 'Good',
    threshold: 7.0,
    description: 'High quality, well-functioning services'
  },
  {
    value: 'functional',
    label: 'Functional',
    threshold: null, // Linear scoring from 0-10
    description: 'Working services, meets basic needs'
  },
  {
    value: 'basic',
    label: 'Basic',
    threshold: 4.0,
    description: 'Minimal acceptable quality'
  }
];

/**
 * Helper to get just the values array (for backward compatibility)
 */
export const ADMIN_QUALITY_VALUES = ADMIN_QUALITY_LEVELS.map(l => l.value);

/**
 * Helper to get scoring threshold for a quality level
 * @param {string} qualityLevel - 'good', 'functional', or 'basic'
 * @returns {number|null} Threshold score (0-10 scale) or null for linear
 */
export function getAdminQualityThreshold(qualityLevel) {
  const level = ADMIN_QUALITY_LEVELS.find(l => l.value === qualityLevel);
  return level ? level.threshold : null;
}

/**
 * Helper to get display label for a quality level
 * @param {string} qualityLevel - 'good', 'functional', or 'basic'
 * @returns {string} Display label
 */
export function getAdminQualityLabel(qualityLevel) {
  const level = ADMIN_QUALITY_LEVELS.find(l => l.value === qualityLevel);
  return level ? level.label : qualityLevel;
}
