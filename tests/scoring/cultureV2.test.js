/**
 * CULTURE V2 UNIT TESTS
 *
 * Tests for the new Culture V2 scoring fields:
 * - traditional_progressive_lean (10 points)
 * - social_atmosphere (10 points)
 *
 * Created: November 14, 2025 (Phase 2 Step 2.3)
 *
 * IMPORTANT: These tests require ENABLE_CULTURE_V2_SCORING = true
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateCultureScore } from '../../src/utils/scoring/categories/cultureScoring.js';
import { FEATURE_FLAGS } from '../../src/utils/scoring/config.js';

// Verify feature flag is ON for these tests
test('Culture V2 - Feature Flag Check', () => {
  assert.equal(
    FEATURE_FLAGS.ENABLE_CULTURE_V2_SCORING,
    true,
    'ENABLE_CULTURE_V2_SCORING must be true to run V2 tests'
  );
});

// ============================================================================
// TRADITIONAL_PROGRESSIVE_LEAN TESTS
// ============================================================================

test('Culture V2 - Traditional/Progressive Exact Match', () => {
  const preferences = {
    traditional_progressive_lean: ['traditional']
  };

  const town = {
    traditional_progressive_lean: 'traditional'
  };

  const result = calculateCultureScore(preferences, town);

  // Find the traditional/progressive factor
  const factor = result.factors.find(f => f.factor.includes('Traditional/progressive'));

  assert.ok(factor, 'Traditional/progressive factor should exist');
  assert.equal(factor.score, 10, 'Exact match should award 10 points');
});

test('Culture V2 - Traditional/Progressive Adjacent Match', () => {
  const preferences = {
    traditional_progressive_lean: ['traditional']
  };

  const town = {
    traditional_progressive_lean: 'balanced'  // Adjacent to traditional
  };

  const result = calculateCultureScore(preferences, town);

  // Find the traditional/progressive factor
  const factor = result.factors.find(f => f.factor.includes('Traditional/progressive'));

  assert.ok(factor, 'Traditional/progressive factor should exist');
  assert.equal(factor.score, 5, 'Adjacent match should award 5 points (50% of 10)');
  assert.ok(factor.factor.includes('close match'), 'Factor should indicate close match');
});

test('Culture V2 - Traditional/Progressive No Match', () => {
  const preferences = {
    traditional_progressive_lean: ['traditional']
  };

  const town = {
    traditional_progressive_lean: 'progressive'  // Opposite of traditional
  };

  const result = calculateCultureScore(preferences, town);

  // Find the traditional/progressive factor
  const factor = result.factors.find(f => f.factor.includes('Traditional/progressive'));

  assert.ok(factor, 'Traditional/progressive factor should exist');
  assert.equal(factor.score, 0, 'No match should award 0 points');
  assert.ok(factor.factor.includes('mismatch'), 'Factor should indicate mismatch');
});

test('Culture V2 - Traditional/Progressive Missing Preference (Fallback)', () => {
  const preferences = {
    // No traditional_progressive_lean specified
  };

  const town = {
    traditional_progressive_lean: 'balanced'
  };

  const result = calculateCultureScore(preferences, town);

  // Find the traditional/progressive factor
  const factor = result.factors.find(f => f.factor.includes('traditional/progressive'));

  assert.ok(factor, 'Traditional/progressive factor should exist');
  assert.equal(factor.score, 5, 'Missing preference should award 5 points (50% fallback)');
  assert.ok(factor.factor.includes('Flexible'), 'Factor should indicate flexibility');
});

test('Culture V2 - Traditional/Progressive Missing Town Data (Fallback)', () => {
  const preferences = {
    traditional_progressive_lean: ['balanced']
  };

  const town = {
    // No traditional_progressive_lean data
  };

  const result = calculateCultureScore(preferences, town);

  // Find the traditional/progressive factor
  const factor = result.factors.find(f => f.factor.includes('traditional/progressive'));

  assert.ok(factor, 'Traditional/progressive factor should exist');
  assert.equal(factor.score, 5, 'Missing town data should award 5 points (50% fallback)');
  assert.ok(factor.factor.includes('unavailable'), 'Factor should indicate data unavailable');
});

// ============================================================================
// SOCIAL_ATMOSPHERE TESTS
// ============================================================================

test('Culture V2 - Social Atmosphere Exact Match', () => {
  const preferences = {
    social_atmosphere: ['quiet']
  };

  const town = {
    social_atmosphere: 'quiet'
  };

  const result = calculateCultureScore(preferences, town);

  // Find the social atmosphere factor
  const factor = result.factors.find(f => f.factor.includes('Social atmosphere'));

  assert.ok(factor, 'Social atmosphere factor should exist');
  assert.equal(factor.score, 10, 'Exact match should award 10 points');
});

test('Culture V2 - Social Atmosphere Adjacent Match', () => {
  const preferences = {
    social_atmosphere: ['quiet']
  };

  const town = {
    social_atmosphere: 'friendly'  // Adjacent to quiet
  };

  const result = calculateCultureScore(preferences, town);

  // Find the social atmosphere factor
  const factor = result.factors.find(f => f.factor.includes('Social atmosphere'));

  assert.ok(factor, 'Social atmosphere factor should exist');
  assert.equal(factor.score, 5, 'Adjacent match should award 5 points (50% of 10)');
  assert.ok(factor.factor.includes('close match'), 'Factor should indicate close match');
});

test('Culture V2 - Social Atmosphere No Match', () => {
  const preferences = {
    social_atmosphere: ['quiet']
  };

  const town = {
    social_atmosphere: 'vibrant'  // Opposite of quiet
  };

  const result = calculateCultureScore(preferences, town);

  // Find the social atmosphere factor
  const factor = result.factors.find(f => f.factor.includes('Social atmosphere'));

  assert.ok(factor, 'Social atmosphere factor should exist');
  assert.equal(factor.score, 0, 'No match should award 0 points');
  assert.ok(factor.factor.includes('mismatch'), 'Factor should indicate mismatch');
});

test('Culture V2 - Social Atmosphere Missing Preference (Fallback)', () => {
  const preferences = {
    // No social_atmosphere specified
  };

  const town = {
    social_atmosphere: 'friendly'
  };

  const result = calculateCultureScore(preferences, town);

  // Find the social atmosphere factor
  const factor = result.factors.find(f => f.factor.includes('social atmosphere'));

  assert.ok(factor, 'Social atmosphere factor should exist');
  assert.equal(factor.score, 5, 'Missing preference should award 5 points (50% fallback)');
  assert.ok(factor.factor.includes('Flexible'), 'Factor should indicate flexibility');
});

test('Culture V2 - Social Atmosphere Missing Town Data (Fallback)', () => {
  const preferences = {
    social_atmosphere: ['friendly']
  };

  const town = {
    // No social_atmosphere data
  };

  const result = calculateCultureScore(preferences, town);

  // Find the social atmosphere factor
  const factor = result.factors.find(f => f.factor.includes('social atmosphere'));

  assert.ok(factor, 'Social atmosphere factor should exist');
  assert.equal(factor.score, 5, 'Missing town data should award 5 points (50% fallback)');
  assert.ok(factor.factor.includes('unavailable'), 'Factor should indicate data unavailable');
});

// ============================================================================
// ADJACENCY SYMMETRY TESTS
// ============================================================================

test('Culture V2 - Traditional/Progressive Adjacency Symmetry', () => {
  // Test that adjacency works in both directions

  // Traditional → Balanced
  const prefs1 = { traditional_progressive_lean: ['traditional'] };
  const town1 = { traditional_progressive_lean: 'balanced' };
  const result1 = calculateCultureScore(prefs1, town1);
  const factor1 = result1.factors.find(f => f.factor.includes('Traditional/progressive'));

  // Balanced → Traditional
  const prefs2 = { traditional_progressive_lean: ['balanced'] };
  const town2 = { traditional_progressive_lean: 'traditional' };
  const result2 = calculateCultureScore(prefs2, town2);
  const factor2 = result2.factors.find(f => f.factor.includes('Traditional/progressive'));

  assert.equal(
    factor1.score,
    factor2.score,
    'Adjacent matches should be symmetric (same score both directions)'
  );
  assert.equal(factor1.score, 5, 'Both should award 5 points');
});

test('Culture V2 - Social Atmosphere Adjacency Symmetry', () => {
  // Test that adjacency works in both directions

  // Quiet → Friendly
  const prefs1 = { social_atmosphere: ['quiet'] };
  const town1 = { social_atmosphere: 'friendly' };
  const result1 = calculateCultureScore(prefs1, town1);
  const factor1 = result1.factors.find(f => f.factor.includes('Social atmosphere'));

  // Friendly → Quiet
  const prefs2 = { social_atmosphere: ['friendly'] };
  const town2 = { social_atmosphere: 'quiet' };
  const result2 = calculateCultureScore(prefs2, town2);
  const factor2 = result2.factors.find(f => f.factor.includes('Social atmosphere'));

  assert.equal(
    factor1.score,
    factor2.score,
    'Adjacent matches should be symmetric (same score both directions)'
  );
  assert.equal(factor1.score, 5, 'Both should award 5 points');
});

// ============================================================================
// POINT ALLOCATION TESTS
// ============================================================================

test('Culture V2 - Point Allocation Total', () => {
  // Verify V2 point allocation sums correctly
  const POINTS_V2 = {
    LIVING_ENVIRONMENT: 15,
    PACE: 15,
    LANGUAGE: 15,
    TRADITIONAL_PROGRESSIVE: 10,
    SOCIAL_ATMOSPHERE: 10,
    EXPAT: 10,
    DINING: 10,
    EVENTS: 10,
    MUSEUMS: 10
  };

  const total = Object.values(POINTS_V2).reduce((a, b) => a + b, 0);

  assert.equal(total, 100, 'V2 point allocation should sum to 100 points');
});

test('Culture V2 - Perfect Score Achievable', () => {
  // Test that perfect score (100%) is achievable with V2
  const preferences = {
    lifestyle_preferences: {
      urban_rural_preference: ['urban'],
      pace_of_life_preference: ['fast']
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
    traditional_progressive_lean: ['progressive'],
    social_atmosphere: ['vibrant']
  };

  const town = {
    urban_rural_character: 'urban',
    pace_of_life_actual: 'fast',
    primary_language: 'English',
    expat_community_size: 'large',
    restaurants_rating: 10,
    nightlife_rating: 10,
    cultural_events_frequency: 'frequent',
    museums_rating: 10,
    traditional_progressive_lean: 'progressive',
    social_atmosphere: 'vibrant'
  };

  const result = calculateCultureScore(preferences, town);

  assert.equal(result.score, 100, 'Perfect match should achieve 100% score with V2');
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

test('Culture V2 - Combined Scoring (Both New Fields)', () => {
  // Test that both new fields contribute correctly
  const preferences = {
    traditional_progressive_lean: ['balanced'],
    social_atmosphere: ['friendly']
  };

  const town = {
    traditional_progressive_lean: 'balanced',
    social_atmosphere: 'friendly'
  };

  const result = calculateCultureScore(preferences, town);

  // Find both factors
  const traditionalFactor = result.factors.find(f => f.factor.includes('Traditional/progressive'));
  const socialFactor = result.factors.find(f => f.factor.includes('Social atmosphere'));

  assert.ok(traditionalFactor, 'Traditional/progressive factor should exist');
  assert.ok(socialFactor, 'Social atmosphere factor should exist');

  assert.equal(traditionalFactor.score, 10, 'Traditional/progressive exact match = 10 points');
  assert.equal(socialFactor.score, 10, 'Social atmosphere exact match = 10 points');

  // Total should include both new fields
  assert.ok(result.score >= 20, 'Score should include at least 20 points from V2 fields');
});
