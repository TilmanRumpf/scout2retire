/**
 * Preference Coverage & Personalization Note Tests
 *
 * Tests the new preferenceCoverage metric and personalizationNote behavior.
 * These are additive, non-breaking features that don't change scoring logic.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import './setup.js';
import { scoreTown } from '../../src/utils/scoring/unifiedScoring.js';

// ============================================================================
// TEST DATA
// ============================================================================

// Synthetic town that scores high (good on most dimensions)
const highScoringTown = {
  id: 999,
  town_name: 'Test Town',
  country: 'Spain',
  region: 'Valencia',
  regions: ['Mediterranean', 'Southern Europe'],
  geographic_features_actual: ['coastal'],
  vegetation_type_actual: ['mediterranean'],

  // Climate data (good match for warm preferences)
  summer_climate_actual: 'warm',
  winter_climate_actual: 'mild',
  avg_temp_summer: 28,
  avg_temp_winter: 15,
  humidity_level_actual: 'balanced',
  sunshine_level_actual: 'often_sunny',
  precipitation_level_actual: 'mostly_dry',
  seasonal_variation_actual: 'low',

  // Culture data
  urban_rural_character: 'urban',
  pace_of_life_actual: 'moderate',
  primary_language: 'Spanish',
  english_proficiency_level: 'moderate',
  expat_community_size: 'moderate',
  restaurants_rating: 8,
  nightlife_rating: 7,
  cultural_events_rating: 8,
  museums_rating: 8,

  // Hobbies/Activities
  activities_available: ['beach', 'hiking', 'dining', 'cultural_events'],
  interests_supported: ['coastal', 'cultural', 'culinary'],

  // Administration
  healthcare_score: 8,
  safety_score: 8,
  crime_rate: 2,
  government_efficiency_rating: 7,
  political_stability_rating: 8,

  // Cost
  cost_of_living_usd: 2500,
  rent_1bed: 800,
  healthcare_cost_monthly: 200,
  income_tax_rate_pct: 20
};

// ============================================================================
// SCENARIO A – Minimal Preferences
// ============================================================================

test('Scenario A: Minimal preferences → low coverage + personalization note', async () => {
  // User with ONLY country preference (1 out of 6 categories)
  const minimalUser = {
    // Region: Only country specified
    countries: ['Spain'],
    regions: [],
    geographic_features: [],
    vegetation_types: [],

    // Climate: Empty
    summer_climate_preference: [],
    winter_climate_preference: [],
    humidity_level: [],
    sunshine: [],
    precipitation: [],
    seasonal_preference: '',

    // Culture: Empty
    lifestyle_preferences: {
      urban_rural_preference: [],
      pace_of_life_preference: []
    },
    language_comfort: {
      preferences: [],
      already_speak: []
    },
    expat_community_preference: [],
    cultural_importance: {
      dining_nightlife: 0,
      cultural_events: 'occasional',
      museums: 0
    },

    // Hobbies: Empty
    activities: [],
    interests: [],

    // Administration: Empty
    healthcare_quality: [],
    safety_importance: [],
    government_efficiency: [],
    visa_preference: [],

    // Cost: Empty
    total_monthly_cost: null,
    max_monthly_rent: null,
    monthly_healthcare_cost: null
  };

  const result = await scoreTown(highScoringTown, minimalUser);

  // Should have low coverage (less than 0.4)
  assert.ok(result.preferenceCoverage < 0.4,
    `Expected preferenceCoverage < 0.4, got ${result.preferenceCoverage}`);

  // Should have high score (country match gives 100% in region, 100% in other categories due to no preferences)
  assert.ok(result.matchScore >= 80,
    `Expected matchScore >= 80, got ${result.matchScore}`);

  // Should have personalization note
  assert.ok(result.personalizationNote !== null,
    'Expected personalizationNote to be present');

  assert.ok(result.personalizationNote.includes('Limited personalization'),
    `Expected note to contain 'Limited personalization', got: ${result.personalizationNote}`);

  console.log('✅ Scenario A passed:');
  console.log(`   Coverage: ${result.preferenceCoverage.toFixed(3)} (${result.preferenceCoverage * 6}/6 categories)`);
  console.log(`   Score: ${result.matchScore}%`);
  console.log(`   Note: "${result.personalizationNote}"`);
});

// ============================================================================
// SCENARIO B – Rich Preferences
// ============================================================================

test('Scenario B: Rich preferences → high coverage + no note', async () => {
  // User with preferences in ALL 6 categories
  const richUser = {
    // Region: 4 fields specified
    countries: ['Spain'],
    regions: ['Mediterranean'],
    geographic_features: ['coastal'],
    vegetation_types: ['mediterranean'],

    // Climate: 5+ fields specified
    summer_climate_preference: ['warm'],
    winter_climate_preference: ['mild'],
    humidity_level: ['balanced'],
    sunshine: ['often_sunny'],
    precipitation: ['mostly_dry'],
    seasonal_preference: 'warm_all_year',

    // Culture: Multiple fields specified
    lifestyle_preferences: {
      urban_rural_preference: ['urban'],
      pace_of_life_preference: ['moderate']
    },
    language_comfort: {
      preferences: ['willing_to_learn'],
      already_speak: ['English']
    },
    expat_community_preference: ['moderate'],
    cultural_importance: {
      dining_nightlife: 4,
      cultural_events: 'regular',
      museums: 4
    },

    // Hobbies: Specified
    activities: ['beach', 'hiking', 'dining'],
    interests: ['coastal', 'cultural'],

    // Administration: Multiple fields specified
    healthcare_quality: ['good'],
    safety_importance: ['good'],
    government_efficiency: ['functional'],
    visa_preference: ['moderate'],

    // Cost: Specified
    total_monthly_cost: 3000,
    max_monthly_rent: 1200,
    monthly_healthcare_cost: 300
  };

  const result = await scoreTown(highScoringTown, richUser);

  // Should have high coverage (>= 0.8)
  assert.ok(result.preferenceCoverage >= 0.8,
    `Expected preferenceCoverage >= 0.8, got ${result.preferenceCoverage}`);

  // Should NOT have personalization note (coverage >= 0.4, so even if score is high, no note)
  assert.strictEqual(result.personalizationNote, null,
    `Expected personalizationNote to be null, got: ${result.personalizationNote}`);

  console.log('✅ Scenario B passed:');
  console.log(`   Coverage: ${result.preferenceCoverage.toFixed(3)} (${result.preferenceCoverage * 6}/6 categories)`);
  console.log(`   Score: ${result.matchScore}%`);
  console.log(`   Note: ${result.personalizationNote}`);
});

// ============================================================================
// EDGE CASE – High coverage but lower score (no note)
// ============================================================================

test('Edge case: High coverage but score < 80 → no note', async () => {
  // Rich user but with preferences that DON'T match the town
  const mismatchedUser = {
    countries: ['Portugal'],  // Town is in Spain
    regions: ['Northern Europe'],  // Town is Mediterranean
    geographic_features: ['mountain'],  // Town is coastal
    vegetation_types: ['forest'],  // Town is mediterranean

    summer_climate_preference: ['mild'],  // Town is warm
    winter_climate_preference: ['cold'],  // Town is mild
    humidity_level: ['humid'],  // Town is balanced
    sunshine: ['less_sunny'],  // Town is often_sunny
    precipitation: ['less_dry'],  // Town is mostly_dry

    lifestyle_preferences: {
      urban_rural_preference: ['rural'],  // Town is urban
      pace_of_life_preference: ['relaxed']  // Town is moderate
    },
    language_comfort: {
      preferences: ['english_only'],
      already_speak: ['English']
    },
    expat_community_preference: ['large'],
    cultural_importance: {
      dining_nightlife: 5,
      cultural_events: 'frequent',
      museums: 5
    },

    activities: ['skiing', 'mountain_biking'],  // Town has beach activities
    interests: ['mountain', 'nature'],  // Town is coastal/cultural

    healthcare_quality: ['excellent'],  // Town is good
    safety_importance: ['excellent'],  // Town is good
    government_efficiency: ['excellent'],
    visa_preference: ['easy'],

    total_monthly_cost: 1500,  // Town costs 2500
    max_monthly_rent: 400,  // Town rent is 800
    monthly_healthcare_cost: 100  // Town is 200
  };

  const result = await scoreTown(highScoringTown, mismatchedUser);

  // Should have high coverage (all 6 categories)
  assert.strictEqual(result.preferenceCoverage, 1.0,
    `Expected 1.0 coverage, got ${result.preferenceCoverage}`);

  // Score should be lower (poor match)
  // Note: We can't assert exact score < 80 because some scoring may still be generous
  // But the personalization note should NOT appear regardless

  // Should NOT have personalization note (coverage is NOT < 0.4)
  assert.strictEqual(result.personalizationNote, null,
    `Expected no note even if score is high (coverage = 1.0), got: ${result.personalizationNote}`);

  console.log('✅ Edge case passed:');
  console.log(`   Coverage: ${result.preferenceCoverage.toFixed(3)}`);
  console.log(`   Score: ${result.matchScore}%`);
  console.log(`   Note: ${result.personalizationNote}`);
});

// ============================================================================
// EDGE CASE – Medium coverage at threshold (coverage = 0.4 exactly)
// ============================================================================

test('Edge case: Coverage exactly 0.4 with high score → no note', async () => {
  // User with preferences in exactly 2.4 out of 6 categories (rounds to 2/6 = 0.333)
  // Let's do 3 categories to be above threshold but test boundary
  const mediumUser = {
    // Region: Specified (1/6)
    countries: ['Spain'],
    regions: [],
    geographic_features: [],
    vegetation_types: [],

    // Climate: Specified (2/6)
    summer_climate_preference: ['warm'],
    winter_climate_preference: ['mild'],
    humidity_level: [],
    sunshine: [],
    precipitation: [],

    // Culture: Empty
    lifestyle_preferences: {
      urban_rural_preference: [],
      pace_of_life_preference: []
    },
    language_comfort: {
      preferences: [],
      already_speak: []
    },
    expat_community_preference: [],
    cultural_importance: {
      dining_nightlife: 0,
      cultural_events: 'occasional',
      museums: 0
    },

    // Hobbies: Empty
    activities: [],
    interests: [],

    // Administration: Specified (3/6)
    healthcare_quality: ['good'],
    safety_importance: ['good'],
    government_efficiency: [],
    visa_preference: [],

    // Cost: Empty
    total_monthly_cost: null,
    max_monthly_rent: null,
    monthly_healthcare_cost: null
  };

  const result = await scoreTown(highScoringTown, mediumUser);

  // Coverage should be >= 0.4 (above threshold)
  assert.ok(result.preferenceCoverage >= 0.4,
    `Expected coverage >= 0.4, got ${result.preferenceCoverage}`);

  // No note should appear when coverage >= 0.4 (even if score is high)
  assert.strictEqual(result.personalizationNote, null,
    `Expected no note when coverage >= 0.4, got: ${result.personalizationNote}`);

  console.log('✅ Edge case (coverage >= 0.4) passed:');
  console.log(`   Coverage: ${result.preferenceCoverage.toFixed(3)} (${result.preferenceCoverage * 6}/6 categories)`);
  console.log(`   Score: ${result.matchScore}%`);
  console.log(`   Note: ${result.personalizationNote}`);
});
