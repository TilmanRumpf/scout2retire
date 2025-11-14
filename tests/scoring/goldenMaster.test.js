/**
 * Golden Master Tests - Scoring Behavior Verification
 *
 * These tests ensure that refactoring does NOT change scoring behavior.
 *
 * IMPORTANT:
 * - For Category A refactors (behavior-preserving): ALL tests must pass exactly
 * - For Category B refactors (intentional changes): Update baseline AFTER verifying change is correct
 *
 * To regenerate baseline (only after intentional behavior changes):
 *   node tests/scoring/captureGoldenMaster.js
 *
 * To run these tests:
 *   node --test tests/scoring/goldenMaster.test.js
 */

// MUST import setup first to configure environment
import './setup.js';

import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { calculateEnhancedMatch } from '../../src/utils/scoring/core/calculateMatch.js';
import { testCases } from './fixtures/testData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASELINE_PATH = path.join(__dirname, 'golden-master-baseline.json');

// Helper for floating-point comparison
function assertCloseTo(actual, expected, tolerance = 1, message) {
  const diff = Math.abs(actual - expected);
  assert.ok(
    diff <= tolerance,
    message || `Expected ${actual} to be close to ${expected} (within ${tolerance}), but difference was ${diff}`
  );
}

describe('Golden Master - Scoring Behavior Verification', () => {
  let baseline;

  before(() => {
    // Load baseline
    if (!fs.existsSync(BASELINE_PATH)) {
      throw new Error(
        `Golden master baseline not found at: ${BASELINE_PATH}\n` +
        `Run: node tests/scoring/captureGoldenMaster.js`
      );
    }

    baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf-8'));
    console.log(`\n📖 Loaded golden master baseline with ${baseline.length} test cases`);
  });

  describe('Overall Match Scores', () => {
    testCases.forEach((testCase) => {
      it(`should match baseline for: ${testCase.name}`, async () => {
        const baselineEntry = baseline.find(b => b.test_name === testCase.name);

        if (!baselineEntry) {
          throw new Error(`No baseline found for test case: ${testCase.name}`);
        }

        // Compute current score
        const result = await calculateEnhancedMatch(testCase.user, testCase.town);

        // STRICT comparison - scores must match exactly (or within ±1 for rounding)
        assertCloseTo(
          result.match_score,
          baselineEntry.scoring_result.match_score,
          1,
          `Match score mismatch for ${testCase.name}`
        );

        // Match quality should also be identical
        assert.strictEqual(
          result.match_quality,
          baselineEntry.scoring_result.match_quality,
          `Match quality mismatch for ${testCase.name}`
        );
      });
    });
  });

  describe('Category Breakdowns', () => {
    testCases.forEach((testCase) => {
      it(`should match category scores for: ${testCase.name}`, async () => {
        const baselineEntry = baseline.find(b => b.test_name === testCase.name);

        if (!baselineEntry) {
          throw new Error(`No baseline found for test case: ${testCase.name}`);
        }

        const result = await calculateEnhancedMatch(testCase.user, testCase.town);

        // Each category score must match
        assertCloseTo(
          result.category_scores.region,
          baselineEntry.scoring_result.category_scores.region,
          1,
          `Region score mismatch for ${testCase.name}`
        );
        assertCloseTo(
          result.category_scores.climate,
          baselineEntry.scoring_result.category_scores.climate,
          1,
          `Climate score mismatch for ${testCase.name}`
        );
        assertCloseTo(
          result.category_scores.culture,
          baselineEntry.scoring_result.category_scores.culture,
          1,
          `Culture score mismatch for ${testCase.name}`
        );
        assertCloseTo(
          result.category_scores.hobbies,
          baselineEntry.scoring_result.category_scores.hobbies,
          1,
          `Hobbies score mismatch for ${testCase.name}`
        );
        assertCloseTo(
          result.category_scores.administration,
          baselineEntry.scoring_result.category_scores.administration,
          1,
          `Administration score mismatch for ${testCase.name}`
        );
        assertCloseTo(
          result.category_scores.cost,
          baselineEntry.scoring_result.category_scores.cost,
          1,
          `Cost score mismatch for ${testCase.name}`
        );
      });
    });
  });

  describe('Sanity Checks', () => {
    it('should have all expected test cases in baseline', () => {
      assert.strictEqual(baseline.length, testCases.length, 'Baseline should have same number of test cases');

      testCases.forEach(testCase => {
        const found = baseline.find(b => b.test_name === testCase.name);
        assert.ok(found, `Baseline should contain test case: ${testCase.name}`);
      });
    });

    it('should have scores within expected ranges', async () => {
      for (const testCase of testCases) {
        const result = await calculateEnhancedMatch(testCase.user, testCase.town);

        assert.ok(result.match_score >= 0, `Score should be >= 0 for ${testCase.name}`);
        assert.ok(result.match_score <= 100, `Score should be <= 100 for ${testCase.name}`);

        // Also check it's in the conceptual expected range
        // (This is a softer check - might fail if baseline was captured incorrectly)
        const inRange = result.match_score >= testCase.expectedRange.min &&
                        result.match_score <= testCase.expectedRange.max;

        if (!inRange) {
          console.warn(
            `⚠️  Score ${result.match_score} for ${testCase.name} ` +
            `outside expected range [${testCase.expectedRange.min}-${testCase.expectedRange.max}]`
          );
        }
      }
    });
  });

  describe('Monotonicity Checks', () => {
    it('perfect match (Valencia) should score higher than poor match (Bangkok) for complete user', async () => {
      const valenciaCase = testCases.find(t => t.name === 'complete_valencia_perfect_match');
      const bangkokCase = testCases.find(t => t.name === 'complete_bangkok_poor_match');

      const valenciaResult = await calculateEnhancedMatch(valenciaCase.user, valenciaCase.town);
      const bangkokResult = await calculateEnhancedMatch(bangkokCase.user, bangkokCase.town);

      assert.ok(
        valenciaResult.match_score > bangkokResult.match_score,
        `Valencia (${valenciaResult.match_score}) should score higher than Bangkok (${bangkokResult.match_score})`
      );
    });

    it('partial match (Porto) should score between perfect and poor for complete user', async () => {
      const valenciaCase = testCases.find(t => t.name === 'complete_valencia_perfect_match');
      const portoCase = testCases.find(t => t.name === 'complete_porto_partial_match');
      const bangkokCase = testCases.find(t => t.name === 'complete_bangkok_poor_match');

      const valenciaResult = await calculateEnhancedMatch(valenciaCase.user, valenciaCase.town);
      const portoResult = await calculateEnhancedMatch(portoCase.user, portoCase.town);
      const bangkokResult = await calculateEnhancedMatch(bangkokCase.user, bangkokCase.town);

      assert.ok(
        portoResult.match_score > bangkokResult.match_score,
        `Porto (${portoResult.match_score}) should score higher than Bangkok (${bangkokResult.match_score})`
      );
      // Allow Porto and Valencia to have similar scores (they're both excellent matches)
      assert.ok(
        portoResult.match_score <= valenciaResult.match_score,
        `Porto (${portoResult.match_score}) should score <= Valencia (${valenciaResult.match_score})`
      );
    });
  });
});
