/**
 * Match Display Helpers
 * Functions to format and display matching details between towns and user preferences
 * NO HARDCODING - Everything calculated dynamically from actual data
 */

/**
 * Format user's region preferences for display
 */
export function formatUserRegionPrefs(regionPrefs) {
  if (!regionPrefs) return { text: 'No location preferences', items: [] };

  const items = [];

  if (regionPrefs.countries?.length > 0) {
    items.push(`Countries: ${regionPrefs.countries.join(', ')}`);
  }
  if (regionPrefs.regions?.length > 0) {
    items.push(`Regions: ${regionPrefs.regions.join(', ')}`);
  }
  if (regionPrefs.geographic_features?.length > 0) {
    items.push(`Features: ${regionPrefs.geographic_features.join(', ')}`);
  }
  if (regionPrefs.vegetation_types?.length > 0) {
    items.push(`Vegetation: ${regionPrefs.vegetation_types.join(', ')}`);
  }

  return {
    text: items.length > 0 ? items.join(' • ') : 'Open to any location',
    items
  };
}

/**
 * Format user's climate preferences for display
 */
export function formatUserClimatePrefs(climatePrefs) {
  if (!climatePrefs) return { text: 'No climate preferences', items: [] };

  const items = [];

  if (climatePrefs.summer_climate) {
    items.push(`Summer: ${climatePrefs.summer_climate}`);
  }
  if (climatePrefs.winter_climate) {
    items.push(`Winter: ${climatePrefs.winter_climate}`);
  }
  if (climatePrefs.humidity_level) {
    items.push(`Humidity: ${climatePrefs.humidity_level}`);
  }
  if (climatePrefs.sunshine_level) {
    items.push(`Sunshine: ${climatePrefs.sunshine_level}`);
  }
  if (climatePrefs.precipitation_level) {
    items.push(`Precipitation: ${climatePrefs.precipitation_level}`);
  }

  return {
    text: items.length > 0 ? items.join(' • ') : 'Open to any climate',
    items
  };
}

/**
 * Format user's culture preferences for display
 */
export function formatUserCulturePrefs(culturePrefs) {
  if (!culturePrefs) return { text: 'No culture preferences', items: [] };

  const items = [];

  if (culturePrefs.pace_of_life) {
    items.push(`Pace: ${culturePrefs.pace_of_life}`);
  }
  if (culturePrefs.expat_community) {
    items.push(`Expat community: ${culturePrefs.expat_community}`);
  }
  if (culturePrefs.language_comfort) {
    items.push(`Language: ${culturePrefs.language_comfort}`);
  }
  if (culturePrefs.social_atmosphere) {
    items.push(`Social: ${culturePrefs.social_atmosphere}`);
  }

  return {
    text: items.length > 0 ? items.join(' • ') : 'Open to any culture',
    items
  };
}

/**
 * Format user's hobbies for display
 */
export function formatUserHobbiesPrefs(hobbiesPrefs) {
  if (!hobbiesPrefs || hobbiesPrefs.length === 0) {
    return { text: 'No specific hobbies', items: [] };
  }

  // Group hobbies by category if needed
  const items = Array.isArray(hobbiesPrefs)
    ? hobbiesPrefs.slice(0, 5) // Show first 5
    : [];

  const remaining = hobbiesPrefs.length > 5 ? ` +${hobbiesPrefs.length - 5} more` : '';

  return {
    text: items.join(', ') + remaining,
    items
  };
}

/**
 * Format user's administration preferences for display
 */
export function formatUserAdminPrefs(adminPrefs) {
  if (!adminPrefs) return { text: 'No admin preferences', items: [] };

  const items = [];

  if (adminPrefs.healthcare_quality) {
    items.push(`Healthcare: ${adminPrefs.healthcare_quality}`);
  }
  if (adminPrefs.safety_level) {
    items.push(`Safety: ${adminPrefs.safety_level}`);
  }
  if (adminPrefs.visa_preference) {
    items.push(`Visa: ${adminPrefs.visa_preference}`);
  }

  return {
    text: items.length > 0 ? items.join(' • ') : 'No specific requirements',
    items
  };
}

/**
 * Format user's cost preferences for display
 */
export function formatUserCostPrefs(costPrefs) {
  if (!costPrefs) return { text: 'No budget constraints', items: [] };

  const items = [];

  if (costPrefs.monthly_budget) {
    items.push(`Budget: $${costPrefs.monthly_budget}/mo`);
  }
  if (costPrefs.rent_budget) {
    items.push(`Rent max: $${costPrefs.rent_budget}/mo`);
  }

  return {
    text: items.length > 0 ? items.join(' • ') : 'No budget constraints',
    items
  };
}

/**
 * Format town's region attributes for display
 */
export function formatTownRegionAttrs(town) {
  if (!town) return { text: 'No location data', items: [] };

  const items = [];

  items.push(`Country: ${town.country}`);

  if (town.region) {
    items.push(`Region: ${town.region}`);
  }

  if (town.geographic_features_actual?.length > 0) {
    items.push(`Features: ${town.geographic_features_actual.join(', ')}`);
  }

  if (town.vegetation_type_actual?.length > 0) {
    items.push(`Vegetation: ${town.vegetation_type_actual.join(', ')}`);
  }

  return {
    text: items.join(' • '),
    items
  };
}

/**
 * Format town's climate attributes for display
 */
export function formatTownClimateAttrs(town) {
  if (!town) return { text: 'No climate data', items: [] };

  const items = [];

  if (town.summer_climate_actual) {
    items.push(`Summer: ${town.summer_climate_actual}`);
  }
  if (town.winter_climate_actual) {
    items.push(`Winter: ${town.winter_climate_actual}`);
  }
  if (town.humidity_level_actual) {
    items.push(`Humidity: ${town.humidity_level_actual}`);
  }
  if (town.sunshine_level_actual) {
    items.push(`Sunshine: ${town.sunshine_level_actual}`);
  }
  if (town.precipitation_level_actual) {
    items.push(`Precipitation: ${town.precipitation_level_actual}`);
  }

  return {
    text: items.length > 0 ? items.join(' • ') : 'Climate data not available',
    items
  };
}

/**
 * Format town's culture attributes for display
 */
export function formatTownCultureAttrs(town) {
  if (!town) return { text: 'No culture data', items: [] };

  const items = [];

  if (town.pace_of_life_actual) {
    items.push(`Pace: ${town.pace_of_life_actual}`);
  }
  if (town.expat_community_size) {
    items.push(`Expat community: ${town.expat_community_size}`);
  }
  if (town.primary_language) {
    items.push(`Language: ${town.primary_language}`);
  }
  if (town.english_proficiency_level) {
    items.push(`English: ${town.english_proficiency_level}`);
  }
  if (town.social_atmosphere) {
    items.push(`Social: ${town.social_atmosphere}`);
  }

  return {
    text: items.length > 0 ? items.join(' • ') : 'Culture data not available',
    items
  };
}

/**
 * Format town's hobbies/activities for display
 */
export function formatTownHobbiesAttrs(town) {
  if (!town) return { text: 'No activities data', items: [] };

  const items = [];

  if (town.top_hobbies?.length > 0) {
    const hobbies = Array.isArray(town.top_hobbies) ? town.top_hobbies : JSON.parse(town.top_hobbies);
    items.push(`Activities: ${hobbies.slice(0, 5).join(', ')}`);
  }

  if (town.outdoor_activities_rating) {
    items.push(`Outdoor rating: ${town.outdoor_activities_rating}/10`);
  }

  return {
    text: items.length > 0 ? items.join(' • ') : 'Activities data not available',
    items
  };
}

/**
 * Format town's admin attributes for display
 */
export function formatTownAdminAttrs(town) {
  if (!town) return { text: 'No admin data', items: [] };

  const items = [];

  if (town.healthcare_score) {
    items.push(`Healthcare: ${town.healthcare_score}/10`);
  }
  if (town.safety_score) {
    items.push(`Safety: ${town.safety_score}/10`);
  }
  if (town.visa_requirements) {
    items.push(`Visa: ${town.visa_requirements}`);
  }
  if (town.retirement_visa_available !== undefined) {
    items.push(`Retirement visa: ${town.retirement_visa_available ? 'Yes' : 'No'}`);
  }

  return {
    text: items.length > 0 ? items.join(' • ') : 'Admin data not available',
    items
  };
}

/**
 * Format town's cost attributes for display
 */
export function formatTownCostAttrs(town) {
  if (!town) return { text: 'No cost data', items: [] };

  const items = [];

  if (town.cost_of_living_usd) {
    items.push(`Total cost: $${town.cost_of_living_usd}/mo`);
  }
  if (town.rent_1bed) {
    items.push(`1BR rent: $${town.rent_1bed}/mo`);
  }
  if (town.rent_2bed_usd) {
    items.push(`2BR rent: $${town.rent_2bed_usd}/mo`);
  }

  return {
    text: items.length > 0 ? items.join(' • ') : 'Cost data not available',
    items
  };
}

/**
 * Get match indicator based on score
 */
export function getMatchIndicator(score) {
  if (score >= 80) return { symbol: '✅', color: 'text-green-600', label: 'Excellent match' };
  if (score >= 60) return { symbol: '✓', color: 'text-blue-600', label: 'Good match' };
  if (score >= 40) return { symbol: '⚠️', color: 'text-yellow-600', label: 'Partial match' };
  return { symbol: '✗', color: 'text-red-600', label: 'Poor match' };
}

/**
 * Get color class based on score
 */
export function getScoreColor(score) {
  if (score >= 85) return 'text-green-600 bg-green-50';
  if (score >= 70) return 'text-blue-600 bg-blue-50';
  if (score >= 55) return 'text-yellow-600 bg-yellow-50';
  if (score >= 40) return 'text-orange-600 bg-orange-50';
  return 'text-red-600 bg-red-50';
}

/**
 * Calculate section score from detailed scoring data
 * This extracts the actual subsection scores from the scoring engine results
 */
export function calculateSectionScore(categoryName, scoringDetails) {
  if (!scoringDetails || !scoringDetails.categoryScores) {
    return { score: 0, details: [] };
  }

  // The scoring engine already calculated this - just extract it
  const score = scoringDetails.categoryScores[categoryName] || 0;

  // Extract subsection details from factors if available
  const details = [];
  if (scoringDetails.factors) {
    scoringDetails.factors
      .filter(f => f.category === categoryName)
      .forEach(f => {
        details.push({
          name: f.factor,
          score: f.score,
          weight: f.weight || 0,
          matched: f.matched || false
        });
      });
  }

  return { score, details };
}

/**
 * Format the final calculation breakdown
 */
export function formatFinalCalculation(testResults, categoryWeights) {
  if (!testResults || !testResults.categoryScores) {
    return { total: 0, breakdown: [] };
  }

  const breakdown = [];
  let total = 0;

  Object.entries(testResults.categoryScores).forEach(([category, score]) => {
    const weight = categoryWeights[category] || 0;
    const contribution = (score * weight / 100);
    total += contribution;

    breakdown.push({
      category,
      score,
      weight,
      contribution: contribution.toFixed(1)
    });
  });

  return {
    total: total.toFixed(1),
    breakdown
  };
}