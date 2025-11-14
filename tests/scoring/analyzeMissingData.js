/**
 * Missing Data & No-Preference Behavior Analysis
 *
 * This script systematically analyzes how each scoring category handles:
 * 1. Users with NO preferences in that category
 * 2. Towns with MISSING data for key fields
 * 3. Fallback percentages and baseline scores
 *
 * Purpose: Generate data for missing data behavior documentation
 */

import './setup.js';
import { calculateRegionScore } from '../../src/utils/scoring/categories/regionScoring.js';
import { calculateClimateScore } from '../../src/utils/scoring/categories/climateScoring.js';
import { calculateCultureScore } from '../../src/utils/scoring/categories/cultureScoring.js';
import { calculateHobbiesScore } from '../../src/utils/scoring/categories/hobbiesScoring.js';
import { calculateAdminScore } from '../../src/utils/scoring/categories/adminScoring.js';
import { calculateCostScore } from '../../src/utils/scoring/categories/costScoring.js';

// ============================================================================
// TEST SCENARIOS
// ============================================================================

const emptyUser = {
  // No preferences whatsoever
};

const minimalUser = {
  region_preferences: {
    country: 'Spain'  // Only country, nothing else
  }
};

const emptyTown = {
  // Minimal required fields only
  id: 1,
  town_name: 'Empty Town',
  country: 'Spain'
};

const partialTown = {
  id: 2,
  town_name: 'Partial Town',
  country: 'Spain',
  region: 'Valencia',
  // Some fields but not all
  summer_climate_actual: 'warm',
  urban_rural_character: 'suburban',
  restaurants_rating: 7
};

const completeTown = {
  id: 3,
  town_name: 'Complete Town',
  country: 'Spain',
  region: 'Valencia',
  regions: ['Mediterranean', 'Southern Europe'],
  geographic_features_actual: ['coastal'],
  vegetation_type_actual: ['mediterranean'],
  summer_climate_actual: 'warm',
  winter_climate_actual: 'mild',
  humidity_level_actual: 'balanced',
  sunshine_level_actual: 'often_sunny',
  precipitation_level_actual: 'mostly_dry',
  seasonal_variation_level_actual: 'low',
  urban_rural_character: 'urban',
  pace_of_life_actual: 'moderate',
  primary_language: 'Spanish',
  english_proficiency_level: 'moderate',
  expat_community_size: 'moderate',
  restaurants_rating: 8,
  nightlife_rating: 7,
  cultural_events_frequency: 'regular',
  museums_rating: 8,
  crime_rate_description: 'low',
  crime_rate_value: 2,
  healthcare_quality_rating: 8,
  healthcare_access_rating: 8,
  doctor_english_percentage: 60,
  public_transport_quality: 8,
  government_efficiency_rating: 7,
  corruption_index: 65,
  visa_friendliness_for_retirees: 'moderate',
  natural_disaster_risk_level: 'low',
  environmental_health_quality: 8,
  political_stability_rating: 8,
  cost_of_living_index: 65,
  rent_1bedroom_usd: 800,
  healthcare_cost_description: 'moderate',
  tax_burden_level: 'moderate'
};

// ============================================================================
// ANALYSIS FUNCTIONS
// ============================================================================

function analyzeCategory(categoryName, scorer, user, town) {
  try {
    const result = scorer(user, town);
    return {
      score: result.score,
      factors: result.factors,
      rawScore: result.rawScore,
      maxScore: result.maxScore
    };
  } catch (error) {
    return {
      score: null,
      error: error.message
    };
  }
}

function analyzeAllCategories(scenarioName, user, town) {
  console.log(`\n${'═'.repeat(80)}`);
  console.log(`📋 Scenario: ${scenarioName}`);
  console.log(`${'═'.repeat(80)}`);

  const results = {};

  // Region
  const regionResult = analyzeCategory('Region', calculateRegionScore, user.region_preferences || {}, town);
  console.log(`\n🌍 REGION: ${regionResult.score}%`);
  if (regionResult.factors) {
    regionResult.factors.forEach(f => console.log(`   - ${f.factor}: ${f.score}`));
  }
  results.region = regionResult;

  // Climate
  const climateResult = analyzeCategory('Climate', calculateClimateScore, user.climate_preferences || {}, town);
  console.log(`\n🌡️  CLIMATE: ${climateResult.score}%`);
  if (climateResult.factors) {
    climateResult.factors.slice(0, 5).forEach(f => console.log(`   - ${f.factor}: ${f.score}`));
    if (climateResult.factors.length > 5) console.log(`   ... and ${climateResult.factors.length - 5} more`);
  }
  results.climate = climateResult;

  // Culture
  const cultureResult = analyzeCategory('Culture', calculateCultureScore, user, town);
  console.log(`\n🎭 CULTURE: ${cultureResult.score}%`);
  if (cultureResult.factors) {
    cultureResult.factors.slice(0, 5).forEach(f => console.log(`   - ${f.factor}: ${f.score}`));
    if (cultureResult.factors.length > 5) console.log(`   ... and ${cultureResult.factors.length - 5} more`);
  }
  results.culture = cultureResult;

  // Hobbies
  const hobbiesResult = analyzeCategory('Hobbies', calculateHobbiesScore, user.hobbies_preferences || {}, town);
  console.log(`\n🎨 HOBBIES: ${hobbiesResult.score}%`);
  if (hobbiesResult.factors) {
    hobbiesResult.factors.slice(0, 3).forEach(f => console.log(`   - ${f.factor}: ${f.score}`));
  }
  results.hobbies = hobbiesResult;

  // Admin
  const adminResult = analyzeCategory('Administration', calculateAdminScore, user.administration_preferences || {}, town);
  console.log(`\n🏛️  ADMINISTRATION: ${adminResult.score}%`);
  if (adminResult.factors) {
    adminResult.factors.slice(0, 5).forEach(f => console.log(`   - ${f.factor}: ${f.score}`));
    if (adminResult.factors.length > 5) console.log(`   ... and ${adminResult.factors.length - 5} more`);
  }
  results.administration = adminResult;

  // Cost
  const costResult = analyzeCategory('Cost', calculateCostScore, user.cost_preferences || {}, town);
  console.log(`\n💰 COST: ${costResult.score}%`);
  if (costResult.factors) {
    costResult.factors.slice(0, 5).forEach(f => console.log(`   - ${f.factor}: ${f.score}`));
  }
  results.cost = costResult;

  return results;
}

// ============================================================================
// RUN ANALYSIS
// ============================================================================

console.log('🔍 Missing Data & No-Preference Behavior Analysis\n');

// Scenario 1: Empty user + Empty town
const scenario1 = analyzeAllCategories(
  'Empty User + Empty Town (Absolute Minimum)',
  emptyUser,
  emptyTown
);

// Scenario 2: Minimal user + Empty town
const scenario2 = analyzeAllCategories(
  'Minimal User (Country Only) + Empty Town',
  minimalUser,
  emptyTown
);

// Scenario 3: Empty user + Partial town
const scenario3 = analyzeAllCategories(
  'Empty User + Partial Town (Some Data)',
  emptyUser,
  partialTown
);

// Scenario 4: Empty user + Complete town
const scenario4 = analyzeAllCategories(
  'Empty User + Complete Town (All Data)',
  emptyUser,
  completeTown
);

// ============================================================================
// SUMMARY MATRIX
// ============================================================================

console.log(`\n\n${'═'.repeat(80)}`);
console.log('📊 SUMMARY MATRIX: Missing Data Behavior');
console.log(`${'═'.repeat(80)}\n`);

console.log('Category         | No Prefs, No Data | No Prefs, Has Data | Has Prefs, No Data');
console.log('-----------------|-------------------|--------------------|-----------------');
console.log(`Region           | ${scenario1.region.score}%             | ${scenario4.region.score}%              | (see notes)`);
console.log(`Climate          | ${scenario1.climate.score}%             | ${scenario4.climate.score}%              | (see notes)`);
console.log(`Culture          | ${scenario1.culture.score}%            | ${scenario4.culture.score}%             | (see notes)`);
console.log(`Hobbies          | ${scenario1.hobbies.score}%             | ${scenario4.hobbies.score}%              | (see notes)`);
console.log(`Administration   | ${scenario1.administration.score}%             | ${scenario4.administration.score}%              | (see notes)`);
console.log(`Cost             | ${scenario1.cost.score}%             | ${scenario4.cost.score}%              | (see notes)`);

console.log(`\n${'═'.repeat(80)}`);
console.log('✅ Analysis complete!');
console.log('   Results ready for documentation\n');

// Export results
export { scenario1, scenario2, scenario3, scenario4 };
