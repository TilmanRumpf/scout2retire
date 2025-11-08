/**
 * Preference Contradiction Detection for Scotty AI
 * Helps users identify when their preferences don't align with reality
 * and guides them toward making informed decisions
 */

/**
 * Climate compatibility rules
 * Maps countries/regions to their actual climate characteristics
 */
const CLIMATE_PROFILES = {
  // North America
  'Canada': {
    climates: ['continental', 'subarctic', 'temperate', 'oceanic'],
    excludes: ['tropical', 'subtropical', 'hot'],
    exceptions: {
      'British Columbia': ['temperate', 'mild', 'oceanic'],
      'Southern Ontario': ['temperate', 'humid continental']
    },
    note: 'Most of Canada has cold winters except coastal BC'
  },

  'United States': {
    climates: ['varied'], // Too diverse to generalize
    byRegion: {
      'Florida': ['subtropical', 'tropical', 'hot', 'humid'],
      'Arizona': ['desert', 'hot', 'dry', 'sunny'],
      'California': ['mediterranean', 'mild', 'varied'],
      'Pacific Northwest': ['oceanic', 'mild', 'rainy']
    }
  },

  'Mexico': {
    climates: ['tropical', 'subtropical', 'hot', 'warm'],
    byRegion: {
      'Yucatan Peninsula': ['tropical', 'hot', 'humid'],
      'Pacific Coast': ['tropical', 'hot', 'humid'],
      'Central Highlands': ['temperate', 'mild', 'moderate']
    },
    note: 'Most of Mexico is warm to hot year-round'
  },

  // Europe - Mediterranean
  'Portugal': {
    climates: ['mediterranean', 'mild', 'temperate', 'warm'],
    byRegion: {
      'Algarve': ['mediterranean', 'hot summers', 'mild winters'],
      'Lisbon': ['mediterranean', 'mild'],
      'Porto': ['oceanic', 'mild', 'rainy']
    },
    note: 'Generally mild year-round, hot summers in the south'
  },

  'Spain': {
    climates: ['mediterranean', 'continental', 'oceanic', 'warm'],
    byRegion: {
      'Costa del Sol': ['mediterranean', 'hot', 'sunny'],
      'Valencia': ['mediterranean', 'hot summers', 'mild winters'],
      'Basque Country': ['oceanic', 'mild', 'rainy'],
      'Central Spain': ['continental', 'hot summers', 'cold winters']
    },
    note: 'Climate varies greatly - Mediterranean coast is warmest'
  },

  'France': {
    climates: ['temperate', 'oceanic', 'mediterranean', 'continental'],
    byRegion: {
      'Provence': ['mediterranean', 'hot summers', 'mild winters'],
      'Côte d\'Azur': ['mediterranean', 'warm', 'sunny'],
      'Brittany': ['oceanic', 'mild', 'rainy'],
      'Paris Region': ['oceanic', 'temperate']
    },
    note: 'Southern France is Mediterranean, rest is temperate/oceanic'
  },

  'Italy': {
    climates: ['mediterranean', 'continental', 'alpine'],
    byRegion: {
      'Sicily': ['mediterranean', 'hot', 'dry'],
      'Tuscany': ['mediterranean', 'warm'],
      'Northern Italy': ['continental', 'humid']
    }
  },

  // Latin America
  'Costa Rica': {
    climates: ['tropical', 'hot', 'humid', 'warm'],
    note: 'Tropical year-round, cooler in highlands'
  },

  'Panama': {
    climates: ['tropical', 'hot', 'humid'],
    note: 'Hot and humid year-round'
  },

  'Ecuador': {
    climates: ['tropical', 'varied', 'equatorial'],
    byRegion: {
      'Coastal': ['tropical', 'hot', 'humid'],
      'Highlands': ['temperate', 'mild', 'spring-like'],
      'Amazon': ['tropical', 'hot', 'humid']
    },
    note: 'Highlands (like Cuenca) have eternal spring climate'
  },

  // Southeast Asia
  'Thailand': {
    climates: ['tropical', 'hot', 'humid'],
    note: 'Hot year-round, monsoon seasons'
  },

  'Malaysia': {
    climates: ['tropical', 'hot', 'humid'],
    note: 'Hot and humid year-round'
  }
};

/**
 * Cost compatibility rules
 * Helps identify when cost doesn't match country/region expectations
 */
const COST_PROFILES = {
  'very_low': { max: 1500, suitable: ['Thailand', 'Malaysia', 'Ecuador', 'Mexico (some areas)'] },
  'low': { max: 2000, suitable: ['Portugal', 'Spain', 'Mexico', 'Costa Rica', 'Panama'] },
  'moderate': { max: 3000, suitable: ['Portugal', 'Spain', 'France (some)', 'Italy (some)', 'Canada (some)'] },
  'high': { max: 4500, suitable: ['France', 'Italy', 'Canada', 'United States'] },
  'very_high': { max: 999999, suitable: ['Any location'] }
};

/**
 * Lifestyle compatibility rules
 */
const LIFESTYLE_PROFILES = {
  'fast_paced': {
    compatible: ['major cities', 'capitals', 'metropolitan areas'],
    incompatible: ['small towns', 'rural areas', 'villages']
  },
  'slow_paced': {
    compatible: ['small towns', 'villages', 'rural areas', 'coastal towns'],
    incompatible: ['major cities', 'capitals']
  }
};

/**
 * Detects contradictions between user preferences and geographic reality
 * @param {Object} userContext - Full user context from scottyContext.js
 * @param {Object} geographicInfo - Parsed geographic info from query
 * @returns {Array} Array of contradiction objects
 */
export function detectPreferenceContradictions(userContext, geographicInfo) {
  if (!userContext || !geographicInfo) return [];

  const contradictions = [];

  // Check climate contradictions
  const climateContradictions = checkClimateCompatibility(userContext, geographicInfo);
  if (climateContradictions.length > 0) {
    contradictions.push(...climateContradictions);
  }

  // Check cost contradictions
  const costContradictions = checkCostCompatibility(userContext, geographicInfo);
  if (costContradictions.length > 0) {
    contradictions.push(...costContradictions);
  }

  // Check lifestyle contradictions
  const lifestyleContradictions = checkLifestyleCompatibility(userContext, geographicInfo);
  if (lifestyleContradictions.length > 0) {
    contradictions.push(...lifestyleContradictions);
  }

  return contradictions;
}

/**
 * Check if climate preferences match the location's actual climate
 */
function checkClimateCompatibility(userContext, geographicInfo) {
  const contradictions = [];
  const locationName = geographicInfo.name;
  const country = geographicInfo.country || locationName;

  const climateProfile = CLIMATE_PROFILES[country];
  if (!climateProfile) return contradictions;

  const userClimate = userContext.climate || {};

  // Check for tropical preference in non-tropical locations
  if (userClimate.summer_temp === 'hot' || userClimate.winter_temp === 'hot') {
    if (!climateProfile.climates.includes('tropical') &&
        !climateProfile.climates.includes('subtropical') &&
        !climateProfile.climates.includes('hot')) {

      contradictions.push({
        type: 'climate',
        severity: 'high',
        preference: 'Hot/tropical climate',
        reality: `${locationName} has ${climateProfile.climates.join('/')} climate`,
        suggestion: `${locationName} ${climateProfile.note || 'may not meet your temperature preferences'}. Would you like me to suggest tropical alternatives?`,
        diplomaticPhrase: `I notice you prefer warm, tropical weather. ${locationName} is wonderful, but it tends to have ${climateProfile.climates[0]} climate. ${climateProfile.note || ''} Could you share what's more important to you - the tropical weather or the other aspects of ${locationName}?`
      });
    }
  }

  // Check for mild/cool preference in hot locations
  if (userClimate.summer_temp === 'mild' || userClimate.summer_temp === 'cool') {
    if (climateProfile.climates.includes('tropical') ||
        climateProfile.climates.includes('hot')) {

      contradictions.push({
        type: 'climate',
        severity: 'medium',
        preference: 'Mild/cool summers',
        reality: `${locationName} has hot summers`,
        suggestion: `${locationName} tends to be quite warm year-round. ${climateProfile.note || ''} Would you be open to warmer temperatures, or should I suggest cooler alternatives?`,
        diplomaticPhrase: `I see you prefer milder temperatures, while ${locationName} is known for its warm climate. ${climateProfile.note || ''} Are you flexible on temperature, or is staying cool a priority?`
      });
    }
  }

  // Check for low humidity preference in humid locations
  if (userClimate.humidity === 'low' || userClimate.humidity === 'dry') {
    if (climateProfile.climates.includes('humid') ||
        climateProfile.climates.includes('tropical')) {

      contradictions.push({
        type: 'climate',
        severity: 'medium',
        preference: 'Low humidity',
        reality: `${locationName} can be quite humid`,
        suggestion: `${locationName} tends to have higher humidity, especially in summer. Would this be a concern for you?`,
        diplomaticPhrase: `I notice you prefer drier air. ${locationName} can be humid, particularly during ${climateProfile.climates.includes('tropical') ? 'the wet season' : 'summer months'}. Is low humidity essential, or could you adapt?`
      });
    }
  }

  // Check for distinct seasons in year-round warm locations
  if (userClimate.seasonal === 'distinct_seasons' || userClimate.seasonal === 'high') {
    if (climateProfile.climates.includes('tropical') ||
        climateProfile.climates.includes('subtropical')) {

      contradictions.push({
        type: 'climate',
        severity: 'low',
        preference: 'Distinct four seasons',
        reality: `${locationName} has minimal seasonal variation`,
        suggestion: `${locationName} has fairly consistent weather year-round. If you're seeking four seasons, I could suggest alternatives?`,
        diplomaticPhrase: `You mentioned enjoying distinct seasons, while ${locationName} tends to be quite consistent year-round. Would you miss the changing seasons, or is the stable climate appealing?`
      });
    }
  }

  return contradictions;
}

/**
 * Check if cost aligns with location's typical costs
 */
function checkCostCompatibility(userContext, geographicInfo) {
  const contradictions = [];
  const locationName = geographicInfo.name;
  const country = geographicInfo.country || locationName;

  const userCost = userContext.costs?.total_monthly;
  if (!userCost) return contradictions;

  // High-cost countries
  const highCostCountries = ['United States', 'Canada', 'France', 'Switzerland', 'Norway'];
  const moderateCostCountries = ['Portugal', 'Spain', 'Italy'];
  const lowCostCountries = ['Mexico', 'Thailand', 'Malaysia', 'Ecuador', 'Costa Rica', 'Panama'];

  if (userCost < 2000 && highCostCountries.includes(country)) {
    contradictions.push({
      type: 'cost',
      severity: 'high',
      preference: `$${userCost.toLocaleString()}/month cost`,
      reality: `${locationName} typically requires $3,000-4,500+/month`,
      suggestion: `With a $${userCost.toLocaleString()}/month cost, ${locationName} might be challenging. Some smaller towns could work, but it would be tight. Would you like me to suggest more affordable alternatives, or focus on cost-friendly areas within ${locationName}?`,
      diplomaticPhrase: `I see your cost is around $${userCost.toLocaleString()}/month. ${locationName} is wonderful, but it tends to be on the higher cost side - most retirees there spend $3,000-4,500+/month. Are you flexible on cost, or should we explore more affordable options that match your other preferences?`
    });
  }

  if (userCost > 4000 && lowCostCountries.includes(country)) {
    // This is actually good - they can live very well
    // No contradiction, maybe a positive note
  }

  return contradictions;
}

/**
 * Check lifestyle compatibility
 */
function checkLifestyleCompatibility(userContext, geographicInfo) {
  const contradictions = [];
  const locationName = geographicInfo.name;

  const userPace = userContext.culture?.pace;
  const locationType = geographicInfo.type;

  // Check for fast-paced preference in small town/province
  if (userPace === 'fast' && locationType === 'province') {
    contradictions.push({
      type: 'lifestyle',
      severity: 'low',
      preference: 'Fast-paced lifestyle',
      reality: `${locationName} provinces tend to be more relaxed`,
      suggestion: `Most towns in ${locationName} have a slower, more relaxed pace. Would you be open to this, or is an urban, fast-paced environment important?`,
      diplomaticPhrase: `You mentioned preferring a faster pace, while ${locationName} is known for its relaxed, laid-back lifestyle. Could you see yourself enjoying a slower pace, or is the energy of a city essential for you?`
    });
  }

  return contradictions;
}

/**
 * Formats contradictions into a friendly, conversational prompt for Scotty
 */
export function formatContradictionsForScotty(contradictions) {
  if (!contradictions || contradictions.length === 0) return '';

  const parts = [];

  parts.push(`\n🔍 PREFERENCE CONTRADICTION ALERT:\n`);
  parts.push(`The user's stated preferences may not align with their location interest. Gently address these contradictions:\n`);

  contradictions.forEach((c, index) => {
    parts.push(`\n${index + 1}. ${c.type.toUpperCase()} MISMATCH (${c.severity} priority):`);
    parts.push(`   User wants: ${c.preference}`);
    parts.push(`   Reality: ${c.reality}`);
    parts.push(`   \n   DIPLOMATIC PHRASING TO USE:`);
    parts.push(`   "${c.diplomaticPhrase}"\n`);
  });

  parts.push(`\nIMPORTANT: Use these diplomatic phrases VERBATIM in your response. Be friendly and curious, not critical. Frame it as helping them clarify what matters most.`);

  return parts.join('\n');
}

/**
 * Main function to check and format contradictions
 */
export function checkAndFormatContradictions(userContext, geographicInfo) {
  const contradictions = detectPreferenceContradictions(userContext, geographicInfo);

  if (contradictions.length === 0) {
    return { hasContradictions: false, formattedPrompt: '' };
  }

  return {
    hasContradictions: true,
    contradictions: contradictions,
    formattedPrompt: formatContradictionsForScotty(contradictions),
    highSeverity: contradictions.some(c => c.severity === 'high')
  };
}
