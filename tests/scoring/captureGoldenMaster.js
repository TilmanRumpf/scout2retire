/**
 * Golden Master Baseline Capture Script
 *
 * This script captures the current scoring behavior as a baseline.
 * Run this BEFORE making any refactoring changes to establish the
 * expected behavior.
 *
 * To regenerate the golden master (only when intentionally changing behavior):
 *   node tests/scoring/captureGoldenMaster.js
 *
 * The output file (golden-master-baseline.json) is used by goldenMaster.test.js
 * to verify that refactors don't change scoring behavior.
 */

// MUST import setup first to configure environment
import './setup.js';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { calculateEnhancedMatch } from '../../src/utils/scoring/core/calculateMatch.js';
import { testCases } from './fixtures/testData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function captureBaseline() {
  console.log('📸 Capturing golden master baseline...\n');

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
          category_scores: result.category_scores
        },
        expected_range: testCase.expectedRange,
        captured_at: new Date().toISOString()
      };

      baseline.push(baselineEntry);
      successCount++;

      console.log(`    ✅ Score: ${result.match_score}% (${result.match_quality})`);
      console.log(`       Region: ${result.category_scores.region}, Climate: ${result.category_scores.climate}, Culture: ${result.category_scores.culture}`);
      console.log(`       Hobbies: ${result.category_scores.hobbies}, Admin: ${result.category_scores.administration}, Cost: ${result.category_scores.cost}`);

      // Verify score is in expected range
      const inRange = result.match_score >= testCase.expectedRange.min &&
                      result.match_score <= testCase.expectedRange.max;
      if (!inRange) {
        console.log(`    ⚠️  Warning: Score ${result.match_score} outside expected range [${testCase.expectedRange.min}-${testCase.expectedRange.max}]`);
      }

      console.log('');
    } catch (error) {
      console.error(`    ❌ Error: ${error.message}`);
      console.error(`       Stack: ${error.stack}`);
      errorCount++;
      console.log('');
    }
  }

  // Write baseline to file
  const outputPath = path.join(__dirname, 'golden-master-baseline.json');
  fs.writeFileSync(outputPath, JSON.stringify(baseline, null, 2));

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Golden master baseline captured!`);
  console.log(`   Output: ${outputPath}`);
  console.log(`   Test cases: ${successCount} successful, ${errorCount} errors`);
  console.log(`   Timestamp: ${new Date().toISOString()}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (errorCount > 0) {
    console.error('\n⚠️  Some test cases failed. Review errors above.');
    process.exit(1);
  }

  return baseline;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  captureBaseline()
    .then(() => {
      console.log('\n✅ Done! You can now run: npm test tests/scoring/goldenMaster.test.js');
    })
    .catch(error => {
      console.error('\n❌ Failed to capture baseline:', error);
      process.exit(1);
    });
}

export { captureBaseline };
