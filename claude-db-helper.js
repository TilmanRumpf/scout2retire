#!/usr/bin/env node

// SCORING IMPACT ANALYSIS FOR SHABNAMNEDA - NOVA SCOTIA TOWNS

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Budget scoring function from costScoring.js
function calculateBudgetScore(userBudget, townCost) {
  if (!userBudget || !townCost || userBudget <= 0 || townCost <= 0) {
    return 0;
  }

  const budgetRatio = userBudget / townCost;

  // Scoring thresholds
  if (budgetRatio >= 2.0) return 85;  // Excellent
  if (budgetRatio >= 1.5) return 75;  // Comfortable
  if (budgetRatio >= 1.2) return 65;  // Good
  if (budgetRatio >= 1.0) return 55;  // Adequate
  if (budgetRatio >= 0.9) return 40;  // Slightly tight
  if (budgetRatio >= 0.8) return 25;  // Challenging
  if (budgetRatio >= 0.7) return 12;  // Very tight
  return 5;                            // Over budget
}

function getScoreCategory(score) {
  if (score >= 85) return 'EXCELLENT';
  if (score >= 75) return 'COMFORTABLE';
  if (score >= 65) return 'GOOD';
  if (score >= 55) return 'ADEQUATE';
  if (score >= 40) return 'SLIGHTLY TIGHT';
  if (score >= 25) return 'CHALLENGING';
  if (score >= 12) return 'VERY TIGHT';
  return 'OVER BUDGET';
}

async function analyzeScoring() {
  console.log('🎯 SCORING IMPACT ANALYSIS: SHABNAMNEDA × NOVA SCOTIA');
  console.log('='.repeat(80));
  console.log('');

  try {
    // Get user
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', 'shabnamneda@gmail.com');

    if (userError || !users || users.length === 0) {
      console.log('❌ User not found:', userError?.message);
      return;
    }

    const user = users[0];
    console.log(`✅ Found user: ${user.email} (ID: ${user.id})`);

    // Get user preferences
    const { data: prefs, error: prefsError } = await supabase
      .from('user_preferences')
      .select('user_id, total_monthly_budget, max_monthly_rent, max_home_price, housing_preference')
      .eq('user_id', user.id);

    if (prefsError || !prefs || prefs.length === 0) {
      console.log('❌ Preferences not found:', prefsError?.message);
      return;
    }

    const pref = prefs[0];
    console.log('\n📊 USER PREFERENCES:');

    // Budget is stored as an array
    const monthlyBudget = Array.isArray(pref.total_monthly_budget) && pref.total_monthly_budget.length > 0
      ? pref.total_monthly_budget[0]
      : null;
    const maxRent = Array.isArray(pref.max_monthly_rent) && pref.max_monthly_rent.length > 0
      ? pref.max_monthly_rent[0]
      : null;
    const maxHomePrice = Array.isArray(pref.max_home_price) && pref.max_home_price.length > 0
      ? pref.max_home_price[0]
      : null;

    console.log(`   Total Monthly Budget: $${monthlyBudget || 'N/A'} USD`);
    console.log(`   Max Monthly Rent: $${maxRent || 'N/A'} USD`);
    console.log(`   Max Home Price: $${maxHomePrice || 'N/A'} USD`);
    console.log(`   Housing Preference: ${pref.housing_preference}`);

    const userBudget = monthlyBudget || 2000; // Default to 2000 if not set
    console.log(`\n💰 Using budget for scoring: $${userBudget} USD/month`);

    // Get Nova Scotia towns
    const { data: allTowns, error: townsError } = await supabase
      .from('towns')
      .select('id, name, country, region, cost_of_living_usd, typical_rent_1bed, typical_home_price')
      .eq('country', 'Canada');

    if (townsError) {
      console.log('❌ Error querying towns:', townsError.message);
      return;
    }

    const nsTowns = allTowns.filter(t => {
      const region = (t.region || '').toLowerCase();
      return region.includes('nova scotia') || region.includes('maritime');
    });

    console.log(`\n🍁 Found ${nsTowns.length} Nova Scotia towns`);
    console.log('='.repeat(80));

    // Before fix: Assume costs were in CAD labeled as USD
    // CAD to USD exchange rate: ~1.35
    const CAD_TO_USD = 1.35;

    console.log('\n📈 SCORING IMPACT ANALYSIS:');
    console.log('-'.repeat(80));

    nsTowns.forEach((town, index) => {
      if (!town.cost_of_living_usd) {
        console.log(`\n${index + 1}. ${town.name}`);
        console.log(`   ⚠️ No cost data available`);
        return;
      }

      // BEFORE FIX: Cost was in CAD but labeled as USD
      const costBeforeFix = town.cost_of_living_usd * CAD_TO_USD; // Multiply to simulate what CAD would be
      const ratioBeforeFix = userBudget / costBeforeFix;
      const scoreBeforeFix = calculateBudgetScore(userBudget, costBeforeFix);

      // AFTER FIX: Cost correctly in USD
      const costAfterFix = town.cost_of_living_usd;
      const ratioAfterFix = userBudget / costAfterFix;
      const scoreAfterFix = calculateBudgetScore(userBudget, costAfterFix);

      const scoreDelta = scoreAfterFix - scoreBeforeFix;
      const percentImprovement = scoreBeforeFix > 0 ? ((scoreDelta / scoreBeforeFix) * 100) : 0;

      console.log(`\n${index + 1}. ${town.name}, ${town.region}`);
      console.log(`   Town Cost (current USD): $${costAfterFix}`);
      console.log(`   Typical Rent: $${town.typical_rent_1bed || 'N/A'}`);
      console.log(`   Typical Home Price: $${town.typical_home_price || 'N/A'}`);
      console.log('');
      console.log(`   ❌ BEFORE FIX (when CAD was mislabeled as USD):`);
      console.log(`      Effective cost: $${costBeforeFix.toFixed(2)} (CAD ${town.cost_of_living_usd} × 1.35)`);
      console.log(`      Budget ratio: ${ratioBeforeFix.toFixed(2)}x`);
      console.log(`      Score: ${scoreBeforeFix}/100 (${getScoreCategory(scoreBeforeFix)})`);
      console.log('');
      console.log(`   ✅ AFTER FIX (costs correctly in USD):`);
      console.log(`      Effective cost: $${costAfterFix.toFixed(2)} USD`);
      console.log(`      Budget ratio: ${ratioAfterFix.toFixed(2)}x`);
      console.log(`      Score: ${scoreAfterFix}/100 (${getScoreCategory(scoreAfterFix)})`);
      console.log('');

      if (scoreDelta > 0) {
        console.log(`   🎯 IMPROVEMENT: +${scoreDelta} points (+${percentImprovement.toFixed(1)}%)`);
      } else if (scoreDelta < 0) {
        console.log(`   📉 CHANGE: ${scoreDelta} points (${percentImprovement.toFixed(1)}%)`);
      } else {
        console.log(`   ➡️ NO CHANGE: Same category`);
      }
    });

    // Summary statistics
    console.log('\n\n📊 SUMMARY STATISTICS:');
    console.log('='.repeat(80));

    const townsWithData = nsTowns.filter(t => t.cost_of_living_usd);

    const avgScoreBefore = townsWithData.reduce((sum, t) => {
      const costBefore = t.cost_of_living_usd * CAD_TO_USD;
      return sum + calculateBudgetScore(userBudget, costBefore);
    }, 0) / townsWithData.length;

    const avgScoreAfter = townsWithData.reduce((sum, t) => {
      return sum + calculateBudgetScore(userBudget, t.cost_of_living_usd);
    }, 0) / townsWithData.length;

    const avgCostBefore = townsWithData.reduce((sum, t) => sum + (t.cost_of_living_usd * CAD_TO_USD), 0) / townsWithData.length;
    const avgCostAfter = townsWithData.reduce((sum, t) => sum + t.cost_of_living_usd, 0) / townsWithData.length;

    console.log(`\nTowns analyzed: ${townsWithData.length}`);
    console.log(`User budget: $${userBudget} USD/month`);
    console.log('');
    console.log(`Average town cost (BEFORE fix): $${avgCostBefore.toFixed(2)}`);
    console.log(`Average town cost (AFTER fix): $${avgCostAfter.toFixed(2)}`);
    console.log(`Cost reduction: -$${(avgCostBefore - avgCostAfter).toFixed(2)} (-${((1 - avgCostAfter/avgCostBefore) * 100).toFixed(1)}%)`);
    console.log('');
    console.log(`Average budget score (BEFORE fix): ${avgScoreBefore.toFixed(1)}/100`);
    console.log(`Average budget score (AFTER fix): ${avgScoreAfter.toFixed(1)}/100`);
    console.log(`Score improvement: +${(avgScoreAfter - avgScoreBefore).toFixed(1)} points`);

    // Count by category
    const categoriesBefore = {};
    const categoriesAfter = {};

    townsWithData.forEach(t => {
      const costBefore = t.cost_of_living_usd * CAD_TO_USD;
      const scoreBefore = calculateBudgetScore(userBudget, costBefore);
      const scoreAfter = calculateBudgetScore(userBudget, t.cost_of_living_usd);

      const catBefore = getScoreCategory(scoreBefore);
      const catAfter = getScoreCategory(scoreAfter);

      categoriesBefore[catBefore] = (categoriesBefore[catBefore] || 0) + 1;
      categoriesAfter[catAfter] = (categoriesAfter[catAfter] || 0) + 1;
    });

    console.log('\n📊 CATEGORY DISTRIBUTION:');
    console.log('-'.repeat(80));
    console.log('\nBEFORE FIX:');
    Object.entries(categoriesBefore).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count} towns (${(count/townsWithData.length*100).toFixed(1)}%)`);
    });

    console.log('\nAFTER FIX:');
    Object.entries(categoriesAfter).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count} towns (${(count/townsWithData.length*100).toFixed(1)}%)`);
    });

    // Recommendation
    console.log('\n\n🎯 RECOMMENDATION:');
    console.log('='.repeat(80));

    const goodMatchesBefore = townsWithData.filter(t => {
      const costBefore = t.cost_of_living_usd * CAD_TO_USD;
      return calculateBudgetScore(userBudget, costBefore) >= 55;
    }).length;

    const goodMatchesAfter = townsWithData.filter(t => {
      return calculateBudgetScore(userBudget, t.cost_of_living_usd) >= 55;
    }).length;

    console.log(`\nBEFORE FIX: ${goodMatchesBefore}/${townsWithData.length} towns scored 55+ (adequate or better)`);
    console.log(`AFTER FIX: ${goodMatchesAfter}/${townsWithData.length} towns scored 55+ (adequate or better)`);
    console.log(`\nImprovement: +${goodMatchesAfter - goodMatchesBefore} good matches`);

    if (goodMatchesAfter >= townsWithData.length * 0.7) {
      console.log('\n✅ YES! User should now see EXCELLENT matches in Nova Scotia');
      console.log(`   ${(goodMatchesAfter/townsWithData.length*100).toFixed(1)}% of NS towns are now adequate or better matches`);
    } else if (goodMatchesAfter >= townsWithData.length * 0.5) {
      console.log('\n✅ YES! User should now see GOOD matches in Nova Scotia');
      console.log(`   ${(goodMatchesAfter/townsWithData.length*100).toFixed(1)}% of NS towns are now adequate or better matches`);
    } else if (goodMatchesAfter > goodMatchesBefore) {
      console.log('\n⚠️ PARTIAL: User will see SOME improvement, but still limited matches');
      console.log(`   Only ${(goodMatchesAfter/townsWithData.length*100).toFixed(1)}% of NS towns are adequate or better matches`);
    } else {
      console.log('\n⚠️ User may still struggle to find good matches in Nova Scotia');
      console.log(`   Budget of $${userBudget} is still tight for NS cost of living`);
    }

    console.log('\n✅ ANALYSIS COMPLETE');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

analyzeScoring().catch(console.error);
