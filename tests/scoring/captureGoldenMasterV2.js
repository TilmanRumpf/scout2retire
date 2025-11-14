/**
 * Golden Master V2 Preview Baseline Capture Script
 *
 * This script captures the scoring behavior WITH Culture V2 enabled.
 * This is a preview baseline to review score changes before promoting V2 to default.
 *
 * To capture V2 preview:
 *   node tests/scoring/captureGoldenMasterV2.js
 *
 * The output file (golden-master-culture-v2-preview.json) is separate from
 * the main golden master baseline to allow comparison.
 *
 * Created: November 14, 2025 (Phase 2 Step 2.3)
 */

// MUST import setup first to configure environment
import './setup.js';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { calculateEnhancedMatch } from '../../src/utils/scoring/core/calculateMatch.js';
import { testCases } from './fixtures/testData.js';
import { FEATURE_FLAGS } from '../../src/utils/scoring/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function captureV2Baseline() {
  console.log('📸 Capturing Culture V2 Preview Baseline...\n');

  // Temporarily enable V2 feature flag
  const originalFlagValue = FEATURE_FLAGS.ENABLE_CULTURE_V2_SCORING;
  FEATURE_FLAGS.ENABLE_CULTURE_V2_SCORING = true;

  console.log('🔧 Feature Flag: ENABLE_CULTURE_V2_SCORING = true (V2 mode)\n');

  const baseline = [];
  let successCount = 0;
  let errorCount = 0;

  for (const testCase of testCases) {
    try {
      console.log(`  Testing: ${testCase.name}`);
      console.log(`    User: ${testCase.user.region_preferences?.country || 'No country'}`);
      console.log(`    Town: ${testCase.town.town_name}, ${testCase.town.country}`);

      const result = await calculateEnhancedMatch(testCase.user, testCase.town);

      const baselineEntry = {
        test_name: testCase.name,
        user_summary: {
          citizenship: testCase.user.current_status?.citizenship,
          country: testCase.user.region_preferences?.country,
          has_climate_prefs: !!(testCase.user.climate_preferences?.summer_climate?.length),
          has_culture_prefs: !!(testCase.user.culture_preferences?.urban_rural_character?.length),
          has_hobbies: !!(testCase.user.hobbies_preferences?.hobbies?.length),
          has_cost_prefs: !!(testCase.user.cost_preferences?.budget_monthly)
        },
        town_summary: {
          id: testCase.town.id,
          name: testCase.town.town_name,
          country: testCase.town.country,
          region: testCase.town.region
        },
        scoring_result: {
          match_score: result.match_score,
          match_quality: result.match_quality,
          category_scores: result.category_scores,
          // V2-specific: Include culture factors breakdown for analysis
          culture_factors: result.breakdown?.culture?.factors || []
        },
        expected_range: testCase.expectedRange,
        captured_at: new Date().toISOString(),
        version: 'V2'  // Mark as V2 baseline
      };

      baseline.push(baselineEntry);
      successCount++;

      console.log(`    ✅ Score: ${result.match_score}% (${result.match_quality})`);
      console.log(`       Region: ${result.category_scores.region}, Climate: ${result.category_scores.climate}, Culture: ${result.category_scores.culture} (V2)`);
      console.log(`       Hobbies: ${result.category_scores.hobbies}, Admin: ${result.category_scores.administration}, Cost: ${result.category_scores.cost}`);

      // Check if V2 fields contributed
      const cultureFactors = result.breakdown?.culture?.factors || [];
      const hasV2Factors = cultureFactors.some(f =>
        f.factor.includes('traditional/progressive') ||
        f.factor.includes('social atmosphere')
      );
      if (hasV2Factors) {
        console.log(`    🆕 V2 fields detected in culture breakdown`);
      }

      // Verify score is in expected range (may differ from V1)
      const inRange = result.match_score >= testCase.expectedRange.min &&
                      result.match_score <= testCase.expectedRange.max;
      if (!inRange) {
        console.log(`    ⚠️  Warning: Score ${result.match_score} outside V1 expected range [${testCase.expectedRange.min}-${testCase.expectedRange.max}]`);
        console.log(`    ℹ️  This is normal for V2 - point reallocation may change scores`);
      }

      console.log('');
    } catch (error) {
      console.error(`    ❌ Error: ${error.message}`);
      console.error(`       Stack: ${error.stack}`);
      errorCount++;
      console.log('');
    }
  }

  // Restore original flag value
  FEATURE_FLAGS.ENABLE_CULTURE_V2_SCORING = originalFlagValue;
  console.log(`🔧 Feature Flag restored to: ${originalFlagValue}\n`);

  // Write V2 baseline to separate file
  const outputPath = path.join(__dirname, 'golden-master-culture-v2-preview.json');
  fs.writeFileSync(outputPath, JSON.stringify(baseline, null, 2));

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Culture V2 Preview Baseline captured!`);
  console.log(`   Output: ${outputPath}`);
  console.log(`   Test cases: ${successCount} successful, ${errorCount} errors`);
  console.log(`   Timestamp: ${new Date().toISOString()}`);
  console.log(`   Version: V2 (with traditional_progressive_lean + social_atmosphere)`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (errorCount > 0) {
    console.error('\n⚠️  Some test cases failed. Review errors above.');
    process.exit(1);
  }

  // Load V1 baseline for comparison
  try {
    const v1BaselinePath = path.join(__dirname, 'golden-master-baseline.json');
    const v1Baseline = JSON.parse(fs.readFileSync(v1BaselinePath, 'utf-8'));

    console.log('\n📊 V1 vs V2 Score Comparison:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    for (let i = 0; i < baseline.length; i++) {
      const v2Entry = baseline[i];
      const v1Entry = v1Baseline.find(b => b.test_name === v2Entry.test_name);

      if (v1Entry) {
        const v1Score = v1Entry.scoring_result.match_score;
        const v2Score = v2Entry.scoring_result.match_score;
        const diff = v2Score - v1Score;
        const diffSymbol = diff > 0 ? '+' : '';

        console.log(`  ${v2Entry.test_name}:`);
        console.log(`    V1: ${v1Score}%  →  V2: ${v2Score}%  (${diffSymbol}${diff})`);

        // Show culture score changes specifically
        const v1Culture = v1Entry.scoring_result.category_scores.culture;
        const v2Culture = v2Entry.scoring_result.category_scores.culture;
        const cultureDiff = v2Culture - v1Culture;
        const cultureDiffSymbol = cultureDiff > 0 ? '+' : '';
        console.log(`    Culture: ${v1Culture} → ${v2Culture} (${cultureDiffSymbol}${cultureDiff})`);
        console.log('');
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (error) {
    console.log(`\nℹ️  Could not load V1 baseline for comparison: ${error.message}`);
  }

  return baseline;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  captureV2Baseline()
    .then(() => {
      console.log('\n✅ Done! Review the V2 preview baseline before promoting to default.');
      console.log('   To promote V2: Set ENABLE_CULTURE_V2_SCORING = true in config.js');
    })
    .catch(error => {
      console.error('\n❌ Failed to capture V2 baseline:', error);
      process.exit(1);
    });
}

export { captureV2Baseline };
