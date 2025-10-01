/**
 * Scoring Snapshot Tests
 *
 * PURPOSE: Capture current scoring behavior BEFORE refactoring
 * These tests create a baseline to ensure no unintended changes after integration
 *
 * RUN: node tests/scoring-snapshot.test.js
 *
 * IMPORTANT: These snapshots represent the CURRENT behavior as of October 1, 2025
 * Any changes to these results after refactoring indicate a behavioral change
 */

// Direct imports of scoring functions to avoid supabaseClient dependency
import {
  calculateRegionScore,
  calculateClimateScore,
  calculateCultureScore,
  calculateHobbiesScore,
  calculateAdminScore,
  calculateCostScore,
  calculateEnhancedMatch
} from '../src/utils/scoring/enhancedMatchingAlgorithm.js';

// ==================== TEST FIXTURES ====================

// Fixture 1: Granada - Mediterranean mountain town
const TOWN_GRANADA = {
  id: '9d2a6679-49c2-4e55-b53e-ca187b2370b9',
  name: 'Granada',
  country: 'Spain',
  region: 'Andalusia',
  regions: ['EU', 'Schengen', 'Mediterranean', 'Mountainous'],
  cost_of_living_usd: 950,
  avg_temp_summer: 29,
  avg_temp_winter: 11,
  summer_climate_actual: 'hot',
  winter_climate_actual: 'cool',
  humidity_level_actual: 'balanced',
  sunshine_level_actual: 'often_sunny',
  precipitation_level_actual: 'balanced',
  healthcare_score: 8,
  safety_score: 8,
  expat_community_size: 'moderate',
  english_proficiency_level: 'moderate',
  pace_of_life_actual: 'moderate',
  urban_rural_character: 'suburban',
  geographic_features_actual: ['mountain'],
  vegetation_type_actual: ['mediterranean'],
  income_tax_rate_pct: 24,
  sales_tax_rate_pct: 21,
  property_tax_rate_pct: 1.1,
  activities_available: ['hiking', 'skiing', 'photography', 'cultural_events'],
  interests_supported: ['outdoor_adventure', 'history', 'arts', 'food'],
  primary_language: 'Spanish',
  restaurants_rating: 4,
  cultural_events_rating: 4,
  museums_rating: 3,
  typical_monthly_living_cost: 950,
  typical_rent_1bed: 500,
  government_efficiency_rating: 72,
  political_stability_rating: 78
};

// Fixture 2: Lisbon - Large coastal city
const TOWN_LISBON = {
  id: '286843dc-1919-4bf3-bbf6-79b751b20e8a',
  name: 'Lisbon',
  country: 'Portugal',
  region: 'Lisbon District',
  regions: ['EU', 'Schengen', 'Atlantic', 'Coastal'],
  cost_of_living_usd: 1559,
  avg_temp_summer: 28,
  avg_temp_winter: 11,
  summer_climate_actual: 'warm',
  winter_climate_actual: 'mild',
  humidity_level_actual: 'balanced',
  sunshine_level_actual: 'often_sunny',
  precipitation_level_actual: 'balanced',
  healthcare_score: 8,
  safety_score: 9,
  expat_community_size: 'large',
  english_proficiency_level: 'high',
  pace_of_life_actual: 'moderate',
  urban_rural_character: 'urban',
  social_atmosphere: 'vibrant',
  geographic_features_actual: ['coastal', 'river'],
  vegetation_type_actual: ['mediterranean'],
  income_tax_rate_pct: 10,
  sales_tax_rate_pct: 23,
  property_tax_rate_pct: 0.8,
  activities_available: ['surfing', 'sailing', 'cultural_events', 'nightlife'],
  interests_supported: ['beach_lifestyle', 'digital_nomad', 'arts', 'food'],
  primary_language: 'Portuguese',
  restaurants_rating: 7,
  nightlife_rating: 8,
  cultural_events_rating: 5,
  museums_rating: 6,
  typical_monthly_living_cost: 1559,
  typical_rent_1bed: 900,
  government_efficiency_rating: 70,
  political_stability_rating: 85
};

// Fixture 3: Puerto de la Cruz - Small coastal town
const TOWN_PUERTO = {
  id: '75a48b3f-d5b4-49e0-8fb3-0e0b9c8b5f5e',
  name: 'Puerto de la Cruz',
  country: 'Spain',
  region: 'Canary Islands',
  regions: ['EU', 'Schengen', 'Atlantic', 'Coastal'],
  cost_of_living_usd: 1100,
  avg_temp_summer: 26,
  avg_temp_winter: 19,
  summer_climate_actual: 'warm',
  winter_climate_actual: 'mild',
  humidity_level_actual: 'humid',
  sunshine_level_actual: 'often_sunny',
  precipitation_level_actual: 'balanced',
  healthcare_score: 7,
  safety_score: 9,
  expat_community_size: 'large',
  english_proficiency_level: 'high',
  pace_of_life_actual: 'relaxed',
  urban_rural_character: 'suburban',
  geographic_features_actual: ['coastal', 'volcanic'],
  vegetation_type_actual: ['subtropical'],
  income_tax_rate_pct: 24,
  sales_tax_rate_pct: 7,
  property_tax_rate_pct: 1.1,
  activities_available: ['swimming', 'beach_walking', 'hiking', 'cultural_events'],
  interests_supported: ['beach_lifestyle', 'retirement_friendly', 'wellness', 'nature'],
  primary_language: 'Spanish',
  restaurants_rating: 5,
  cultural_events_rating: 3,
  museums_rating: 2,
  typical_monthly_living_cost: 1100,
  typical_rent_1bed: 700,
  government_efficiency_rating: 72,
  political_stability_rating: 78
};

// ==================== USER PREFERENCE FIXTURES ====================

// Preference Set 1: Budget-conscious beach lover
const PREFS_BEACH_BUDGET = {
  region_preferences: {
    countries: ['Spain', 'Portugal'],
    regions: ['Mediterranean'],
    geographic_features: ['coastal'],
    vegetation_types: ['mediterranean', 'subtropical']
  },
  climate_preferences: {
    summer_climate_preference: ['warm'],
    winter_climate_preference: ['mild'],
    humidity_level: ['balanced'],
    sunshine: ['often_sunny'],
    precipitation: ['balanced']
  },
  culture_preferences: {
    expat_community_preference: ['large'],
    language_comfort: {
      preferences: ['willing_to_learn'],
      already_speak: ['English']
    },
    lifestyle_preferences: {
      urban_rural_preference: ['suburban'],
      pace_of_life_preference: ['relaxed']
    }
  },
  hobbies_preferences: {
    activities: ['swimming', 'beach_walking', 'photography'],
    interests: ['beach_lifestyle', 'wellness', 'nature']
  },
  admin_preferences: {
    healthcare_quality: ['functional'],
    safety_importance: ['good']
  },
  cost_preferences: {
    total_monthly_budget: 1500,
    max_monthly_rent: 800
  }
};

// Preference Set 2: Active mountain enthusiast with high budget
const PREFS_MOUNTAIN_ACTIVE = {
  region_preferences: {
    countries: ['Spain'],
    regions: ['Andalusia'],
    geographic_features: ['mountain'],
    vegetation_types: ['mediterranean']
  },
  climate_preferences: {
    summer_climate_preference: ['hot'],
    winter_climate_preference: ['cool'],
    humidity_level: ['balanced'],
    sunshine: ['often_sunny'],
    precipitation: ['balanced']
  },
  culture_preferences: {
    expat_community_preference: ['moderate'],
    language_comfort: {
      preferences: ['willing_to_learn'],
      already_speak: ['English', 'Spanish']
    },
    lifestyle_preferences: {
      urban_rural_preference: ['suburban'],
      pace_of_life_preference: ['moderate']
    }
  },
  hobbies_preferences: {
    activities: ['hiking', 'skiing', 'photography'],
    interests: ['outdoor_adventure', 'history', 'arts']
  },
  admin_preferences: {
    healthcare_quality: ['good'],
    safety_importance: ['good']
  },
  cost_preferences: {
    total_monthly_budget: 3000,
    max_monthly_rent: 1500,
    property_tax_sensitive: true,
    income_tax_sensitive: true
  }
};

// Preference Set 3: City lover, culture focused
const PREFS_URBAN_CULTURE = {
  region_preferences: {
    countries: ['Portugal'],
    regions: [],
    geographic_features: ['coastal'],
    vegetation_types: []
  },
  climate_preferences: {
    summer_climate_preference: ['warm'],
    winter_climate_preference: ['mild'],
    humidity_level: ['balanced'],
    sunshine: ['often_sunny'],
    precipitation: ['balanced']
  },
  culture_preferences: {
    expat_community_preference: ['large'],
    language_comfort: {
      preferences: ['comfortable'],
      already_speak: ['English']
    },
    lifestyle_preferences: {
      urban_rural_preference: ['urban'],
      pace_of_life_preference: ['moderate', 'fast']
    },
    cultural_importance: {
      dining_nightlife: 4,
      cultural_events: 5,
      museums: 4
    }
  },
  hobbies_preferences: {
    activities: ['cultural_events', 'dining', 'museums'],
    interests: ['arts', 'food', 'nightlife', 'digital_nomad']
  },
  admin_preferences: {
    healthcare_quality: ['good'],
    safety_importance: ['good']
  },
  cost_preferences: {
    total_monthly_budget: 2500,
    max_monthly_rent: 1200,
    income_tax_sensitive: true
  }
};

// ==================== TEST RUNNER ====================

const TEST_RESULTS = {
  timestamp: new Date().toISOString(),
  tests: []
};

async function runTest(testName, town, preferences) {
  console.log(`\n🧪 Running: ${testName}`);
  console.log(`   Town: ${town.name} (${town.country})`);

  try {
    const result = await calculateEnhancedMatch(preferences, town);

    const snapshot = {
      testName,
      town: {
        name: town.name,
        country: town.country,
        region: town.region
      },
      scores: {
        matchScore: result.match_score,
        categoryScores: result.category_scores,
        matchQuality: result.match_quality
      },
      topFactors: result.top_factors?.slice(0, 5) || [],
      warnings: result.warnings || []
    };

    TEST_RESULTS.tests.push({
      name: testName,
      status: 'PASS',
      snapshot
    });

    console.log(`   ✅ Match Score: ${result.match_score}%`);
    console.log(`   📊 Categories: R:${result.category_scores.region}% C:${result.category_scores.climate}% Cu:${result.category_scores.culture}% H:${result.category_scores.hobbies}% A:${result.category_scores.administration}% Co:${result.category_scores.cost}%`);

    return snapshot;
  } catch (error) {
    console.error(`   ❌ FAILED: ${error.message}`);
    console.error(`   Stack: ${error.stack}`);
    TEST_RESULTS.tests.push({
      name: testName,
      status: 'FAIL',
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

// ==================== TEST SCENARIOS ====================

async function runAllTests() {
  console.log('🎯 SCORING SNAPSHOT TESTS');
  console.log('='.repeat(80));
  console.log('Purpose: Capture baseline scoring behavior before refactoring');
  console.log('Date:', new Date().toISOString());
  console.log('='.repeat(80));

  try {
    // Test 1: Perfect match - Beach budget seeker finds Puerto de la Cruz
    await runTest(
      'T1: Budget beach lover → Puerto de la Cruz (Expected: High match)',
      TOWN_PUERTO,
      PREFS_BEACH_BUDGET
    );

    // Test 2: Perfect match - Mountain lover finds Granada
    await runTest(
      'T2: Mountain enthusiast → Granada (Expected: Very high match)',
      TOWN_GRANADA,
      PREFS_MOUNTAIN_ACTIVE
    );

    // Test 3: Perfect match - Urban culture seeker finds Lisbon
    await runTest(
      'T3: Urban culture lover → Lisbon (Expected: High match)',
      TOWN_LISBON,
      PREFS_URBAN_CULTURE
    );

    // Test 4: Mismatch - Mountain lover sees coastal town
    await runTest(
      'T4: Mountain enthusiast → Puerto de la Cruz (Expected: Lower match)',
      TOWN_PUERTO,
      PREFS_MOUNTAIN_ACTIVE
    );

    // Test 5: Mismatch - Beach lover sees mountain town
    await runTest(
      'T5: Beach lover → Granada (Expected: Medium-low match)',
      TOWN_GRANADA,
      PREFS_BEACH_BUDGET
    );

    // Test 6: Budget constraint - High cost city vs low budget
    await runTest(
      'T6: Budget seeker → Lisbon (Expected: Lower cost score)',
      TOWN_LISBON,
      PREFS_BEACH_BUDGET
    );

    // Test 7: Urban/Rural mismatch - Urban lover sees suburban town
    await runTest(
      'T7: Urban lover → Granada (Expected: Lower culture score)',
      TOWN_GRANADA,
      PREFS_URBAN_CULTURE
    );

    // Test 8: Language/Expat fit - English speaker with large expat community
    await runTest(
      'T8: Beach lover → Lisbon (Expected: Good culture/language match)',
      TOWN_LISBON,
      PREFS_BEACH_BUDGET
    );

    console.log('\n' + '='.repeat(80));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(80));

    const passed = TEST_RESULTS.tests.filter(t => t.status === 'PASS').length;
    const failed = TEST_RESULTS.tests.filter(t => t.status === 'FAIL').length;

    console.log(`Total Tests: ${TEST_RESULTS.tests.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);

    // Save results to file
    const fs = await import('fs');
    const snapshotPath = '/Users/tilmanrumpf/Desktop/scout2retire/tests/scoring-baseline-snapshot.json';
    fs.writeFileSync(snapshotPath, JSON.stringify(TEST_RESULTS, null, 2));

    console.log(`\n💾 Baseline snapshot saved to: ${snapshotPath}`);
    console.log('\n✨ This snapshot represents the CURRENT scoring behavior.');
    console.log('   Use this to verify no unintended changes after refactoring.');

    if (failed > 0) {
      console.log('\n⚠️  Some tests failed. Review errors above.');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n💥 Test suite failed:', error);
    process.exit(1);
  }
}

// ==================== SNAPSHOT COMPARISON UTILITY ====================

/**
 * Compare current scores against baseline snapshot
 * Usage: node tests/scoring-snapshot.test.js --compare
 */
async function compareWithBaseline() {
  console.log('🔍 COMPARING WITH BASELINE SNAPSHOT');
  console.log('='.repeat(80));

  try {
    const fs = await import('fs');
    const snapshotPath = '/Users/tilmanrumpf/Desktop/scout2retire/tests/scoring-baseline-snapshot.json';

    if (!fs.existsSync(snapshotPath)) {
      console.error('❌ No baseline snapshot found. Run tests first to create baseline.');
      process.exit(1);
    }

    const baseline = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
    console.log(`📅 Baseline created: ${baseline.timestamp}`);
    console.log(`📅 Current run: ${new Date().toISOString()}\n`);

    // Run current tests silently by capturing original console.log
    const originalLog = console.log;
    const logs = [];
    console.log = (...args) => logs.push(args.join(' '));

    await runAllTests();

    console.log = originalLog; // Restore console.log

    // Compare results
    let differencesFound = false;
    const differences = [];

    for (let i = 0; i < baseline.tests.length; i++) {
      const baseTest = baseline.tests[i];
      const currentTest = TEST_RESULTS.tests[i];

      if (!currentTest) {
        const diff = `Missing test: ${baseTest.name}`;
        console.log(`\n⚠️  ${diff}`);
        differences.push(diff);
        differencesFound = true;
        continue;
      }

      const baseScore = baseTest.snapshot?.scores?.matchScore;
      const currentScore = currentTest.snapshot?.scores?.matchScore;

      if (Math.abs(baseScore - currentScore) > 2) { // Allow 2% tolerance
        const diff = `${baseTest.name}: ${baseScore}% → ${currentScore}% (Δ ${currentScore - baseScore}%)`;
        console.log(`\n🚨 DIFFERENCE DETECTED: ${diff}`);
        differences.push(diff);
        differencesFound = true;

        // Show category breakdowns
        const baseCat = baseTest.snapshot?.scores?.categoryScores;
        const currCat = currentTest.snapshot?.scores?.categoryScores;

        console.log('   Category Breakdown:');
        Object.keys(baseCat || {}).forEach(cat => {
          const delta = currCat[cat] - baseCat[cat];
          if (Math.abs(delta) > 2) {
            console.log(`   - ${cat}: ${baseCat[cat]}% → ${currCat[cat]}% (${delta > 0 ? '+' : ''}${delta}%)`);
          }
        });
      }
    }

    if (!differencesFound) {
      console.log('\n✅ All scores match baseline (within 2% tolerance)');
      console.log('   Scoring behavior is consistent after changes.');
    } else {
      console.log('\n⚠️  Summary of differences:');
      differences.forEach(diff => console.log(`   - ${diff}`));
      console.log('\n   If changes are intentional, update baseline with: node tests/scoring-snapshot.test.js');
    }

  } catch (error) {
    console.error('\n💥 Comparison failed:', error);
    process.exit(1);
  }
}

// ==================== MAIN ====================

const args = process.argv.slice(2);

if (args.includes('--compare')) {
  compareWithBaseline();
} else {
  runAllTests();
}
