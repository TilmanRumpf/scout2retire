/**
 * Culture data mapping utilities
 * Maps legacy/wrong town data values to golden onboarding values
 * CRITICAL: All mappings MUST match OnboardingCulture.jsx exactly!
 */

/**
 * Map town culture values to GOLDEN onboarding values
 * @param {string} value - Original town value
 * @param {string} category - Culture category (pace, urban_rural, expat)
 * @returns {string} - Standardized value
 */
export function mapCultureValue(value, category) {
  if (!value) return null;

  // Normalize to lowercase for comparison
  const normalizedValue = String(value).toLowerCase().trim();

  const mappings = {
    pace: {
      // GOLDEN: ['relaxed', 'moderate', 'fast'] from OnboardingCulture.jsx lines 440-444
      'relaxed': 'relaxed',
      'moderate': 'moderate',
      'fast': 'fast',
      // Map WRONG old values from TownsManager
      'very slow': 'relaxed',
      'slow': 'relaxed',
      'very fast': 'fast'
    },
    urban_rural: {
      // GOLDEN: ['rural', 'suburban', 'urban'] from OnboardingCulture.jsx lines 454-458
      'rural': 'rural',
      'suburban': 'suburban',
      'urban': 'urban',
      // Map WRONG old values from TownsManager
      'small town': 'suburban',
      'small city': 'suburban',
      'medium city': 'urban',
      'large city': 'urban',
      'metropolis': 'urban'
    },
    expat: {
      // GOLDEN: ['small', 'moderate', 'large'] from OnboardingCulture.jsx lines 433-437
      'small': 'small',
      'moderate': 'moderate',
      'large': 'large',
      // Map WRONG old values from TownsManager (case mismatch + extra values)
      'none': 'small',  // If no expat community, map to small
      'very large': 'large'
    }
  };

  // Return mapped value or original if no mapping exists
  return mappings[category]?.[normalizedValue] || value;
}

/**
 * Get effective culture value with mapping
 * @param {Object} town - Town data
 * @param {string} category - Culture category
 * @returns {Object} { value: string, wasMapped: boolean, originalValue: string }
 */
export function getEffectiveCultureValue(town, category) {
  let originalValue = null;
  let fieldName = null;

  switch (category) {
    case 'pace':
      fieldName = 'pace_of_life_actual';
      originalValue = town.pace_of_life_actual || town.pace_of_life;
      break;

    case 'urban_rural':
      fieldName = 'urban_rural_character';
      originalValue = town.urban_rural_character;
      break;

    case 'expat':
      fieldName = 'expat_community_size';
      originalValue = town.expat_community_size;
      break;
  }

  if (!originalValue) {
    return { value: null, wasMapped: false, originalValue: null, fieldName };
  }

  const mappedValue = mapCultureValue(originalValue, category);
  const wasMapped = mappedValue !== originalValue;

  return {
    value: mappedValue,
    wasMapped,
    originalValue,
    fieldName
  };
}