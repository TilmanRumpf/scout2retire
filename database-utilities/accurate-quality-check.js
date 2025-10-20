/**
 * Accurate quality check using ACTUAL column names
 * Check real data completeness for retirees
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function accurateQualityCheck() {
  console.log('🔍 ACCURATE DATA QUALITY CHECK (Using Real Column Names)\n');
  console.log('=' .repeat(60));

  try {
    // Get all towns
    const { data: towns, error } = await supabase
      .from('towns')
      .select('*');

    if (error) {
      console.error('Error fetching towns:', error);
      return;
    }

    console.log(`📊 Analyzing ${towns.length} towns\n`);

    // ACTUAL critical columns that exist
    const CRITICAL_COLUMNS = [
      'english_proficiency',
      'visa_requirements',
      'visa_free_days',
      'cost_of_living_usd',
      'typical_monthly_living_cost',
      'healthcare_score',          // not healthcare_quality
      'healthcare_cost',           // not healthcare_cost_local
      'healthcare_cost_monthly',
      'internet_speed',            // not internet_quality
      'internet_reliability',
      'safety_score',
      'quality_of_life',
      'climate',                   // not climate_zone_actual
      'population',                // not population_actual
      'summer_climate_actual',
      'winter_climate_actual'
    ];

    // Check each critical column
    console.log('🎯 CRITICAL COLUMNS STATUS:\n');
    const columnStats = {};

    for (const col of CRITICAL_COLUMNS) {
      const values = towns.map(t => t[col]);
      const nonNull = values.filter(v => v !== null && v !== undefined && v !== '');
      const percentage = Math.round(nonNull.length / towns.length * 100);
      columnStats[col] = percentage;

      const status = percentage === 100 ? '✅' :
                     percentage >= 95 ? '🟡' :
                     percentage >= 50 ? '🟠' : '❌';

      console.log(`${status} ${col}: ${percentage}% complete (${towns.length - nonNull.length} missing)`);

      // Show sample values for populated columns
      if (nonNull.length > 0 && nonNull.length < towns.length) {
        const samples = [...new Set(nonNull)].slice(0, 3);
        console.log(`   Sample values: ${samples.join(', ')}`);
      }
    }

    // Check additional important columns
    console.log('\n📋 ADDITIONAL IMPORTANT COLUMNS:\n');

    const ADDITIONAL_COLUMNS = [
      'walkability_score',
      'retirement_community_presence',
      'cultural_events_frequency',
      'social_atmosphere',
      'expat_community_size',
      'geographic_features_actual',
      'vegetation_type_actual',
      'humidity_level_actual',
      'sunshine_level_actual',
      'precipitation_level_actual'
    ];

    for (const col of ADDITIONAL_COLUMNS) {
      const values = towns.map(t => t[col]);
      const nonNull = values.filter(v => v !== null && v !== undefined && v !== '');
      const percentage = Math.round(nonNull.length / towns.length * 100);

      if (percentage > 0) {
        const status = percentage === 100 ? '✅' : percentage >= 95 ? '🟡' : '🟠';
        console.log(`${status} ${col}: ${percentage}% complete`);
      }
    }

    // Detailed analysis
    console.log('\n📊 DETAILED ANALYSIS:\n');

    // 1. English proficiency distribution
    const englishStats = {
      native: towns.filter(t => t.english_proficiency >= 90).length,
      high: towns.filter(t => t.english_proficiency >= 60 && t.english_proficiency < 90).length,
      moderate: towns.filter(t => t.english_proficiency >= 40 && t.english_proficiency < 60).length,
      low: towns.filter(t => t.english_proficiency < 40 && t.english_proficiency !== null).length,
      missing: towns.filter(t => !t.english_proficiency).length
    };

    console.log('🗣️ English Proficiency:');
    console.log(`  Native (90-100%): ${englishStats.native} towns`);
    console.log(`  High (60-89%): ${englishStats.high} towns`);
    console.log(`  Moderate (40-59%): ${englishStats.moderate} towns`);
    console.log(`  Low (<40%): ${englishStats.low} towns`);
    if (englishStats.missing > 0) {
      console.log(`  ⚠️ Missing: ${englishStats.missing} towns`);
    }

    // 2. Visa requirements
    const visaStats = {
      no_visa: towns.filter(t => t.visa_free_days === 999).length,
      long_term: towns.filter(t => t.visa_free_days >= 180 && t.visa_free_days < 999).length,
      standard: towns.filter(t => t.visa_free_days >= 90 && t.visa_free_days < 180).length,
      short: towns.filter(t => t.visa_free_days > 0 && t.visa_free_days < 90).length,
      visa_required: towns.filter(t => t.visa_free_days === 0).length,
      missing: towns.filter(t => t.visa_free_days === null || t.visa_free_days === undefined).length
    };

    console.log('\n🛂 Visa-Free Days:');
    console.log(`  No visa needed: ${visaStats.no_visa} towns`);
    console.log(`  180+ days: ${visaStats.long_term} towns`);
    console.log(`  90-179 days: ${visaStats.standard} towns`);
    console.log(`  <90 days: ${visaStats.short} towns`);
    console.log(`  Visa required: ${visaStats.visa_required} towns`);
    if (visaStats.missing > 0) {
      console.log(`  ⚠️ Missing: ${visaStats.missing} towns`);
    }

    // 3. Cost of living
    const costs = towns.map(t => t.cost_of_living_usd).filter(c => c > 0);
    if (costs.length > 0) {
      const avgCost = Math.round(costs.reduce((a, b) => a + b, 0) / costs.length);
      const minCost = Math.min(...costs);
      const maxCost = Math.max(...costs);

      console.log('\n💰 Cost of Living (USD):');
      console.log(`  Average: $${avgCost}/month`);
      console.log(`  Range: $${minCost} - $${maxCost}`);
      console.log(`  Under $1000: ${costs.filter(c => c < 1000).length} towns`);
      console.log(`  $1000-2000: ${costs.filter(c => c >= 1000 && c < 2000).length} towns`);
      console.log(`  $2000-3000: ${costs.filter(c => c >= 2000 && c < 3000).length} towns`);
      console.log(`  Over $3000: ${costs.filter(c => c >= 3000).length} towns`);
    }

    // 4. Healthcare costs
    const healthcareCosts = towns.map(t => t.healthcare_cost_monthly || t.healthcare_cost)
      .filter(c => c !== null && c !== undefined);

    if (healthcareCosts.length > 0) {
      console.log('\n🏥 Healthcare Costs:');
      console.log(`  Data available: ${healthcareCosts.length} towns (${Math.round(healthcareCosts.length/towns.length*100)}%)`);
      const nonZero = healthcareCosts.filter(c => c > 0);
      if (nonZero.length > 0) {
        console.log(`  Average: $${Math.round(nonZero.reduce((a,b) => a+b, 0) / nonZero.length)}/month`);
        console.log(`  Free/subsidized: ${healthcareCosts.filter(c => c === 0).length} towns`);
      }
    }

    // 5. Quality of life scores
    const qualityScores = towns.map(t => t.quality_of_life).filter(q => q !== null);
    const uniqueScores = [...new Set(qualityScores)];

    console.log('\n⭐ Quality of Life Scores:');
    console.log(`  Unique values: ${uniqueScores.length}`);
    if (uniqueScores.length < 10) {
      console.log(`  ⚠️ Low granularity - only ${uniqueScores.length} different scores`);
      console.log(`  Values: ${uniqueScores.sort((a,b) => b-a).join(', ')}`);
    }

    // Data quality issues
    console.log('\n⚠️ DATA QUALITY ISSUES:\n');

    const issues = [];

    // Check for template data
    const templateCosts = towns.filter(t => t.cost_of_living_usd === 2793);
    if (templateCosts.length > 0) {
      issues.push(`${templateCosts.length} towns still have template cost $2,793`);
    }

    // Check for suspiciously uniform data
    const countryCostVariance = {};
    [...new Set(towns.map(t => t.country))].forEach(country => {
      const countryTowns = towns.filter(t => t.country === country);
      if (countryTowns.length > 2) {
        const costs = countryTowns.map(t => t.cost_of_living_usd).filter(c => c > 0);
        const uniqueCosts = [...new Set(costs)];
        if (uniqueCosts.length === 1 && costs.length > 2) {
          countryCostVariance[country] = costs[0];
        }
      }
    });

    if (Object.keys(countryCostVariance).length > 0) {
      issues.push(`Countries with identical costs in all towns:`);
      Object.entries(countryCostVariance).forEach(([country, cost]) => {
        const count = towns.filter(t => t.country === country).length;
        issues.push(`  - ${country}: All ${count} towns have $${cost}`);
      });
    }

    if (issues.length === 0) {
      console.log('✅ No major data quality issues found!');
    } else {
      issues.forEach(issue => console.log(`❌ ${issue}`));
    }

    // Final summary
    console.log('\n' + '=' .repeat(60));
    console.log('📊 OVERALL DATA QUALITY SCORE:\n');

    const criticalComplete = Object.values(columnStats).filter(v => v === 100).length;
    const criticalPartial = Object.values(columnStats).filter(v => v >= 50 && v < 100).length;
    const criticalMissing = Object.values(columnStats).filter(v => v < 50).length;

    console.log(`✅ Complete: ${criticalComplete}/${CRITICAL_COLUMNS.length} critical columns`);
    console.log(`🟡 Partial: ${criticalPartial}/${CRITICAL_COLUMNS.length} critical columns`);
    console.log(`❌ Missing: ${criticalMissing}/${CRITICAL_COLUMNS.length} critical columns`);

    const avgCompleteness = Math.round(
      Object.values(columnStats).reduce((a, b) => a + b, 0) / Object.keys(columnStats).length
    );

    console.log(`\n📈 Average completeness: ${avgCompleteness}%`);

    if (avgCompleteness >= 90) {
      console.log('🎉 EXCELLENT data quality!');
    } else if (avgCompleteness >= 70) {
      console.log('✅ GOOD data quality');
    } else if (avgCompleteness >= 50) {
      console.log('🟡 MODERATE data quality - needs improvement');
    } else {
      console.log('❌ POOR data quality - significant work needed');
    }

    // Priority fixes
    const priorityFixes = Object.entries(columnStats)
      .filter(([col, pct]) => pct < 100)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 5);

    if (priorityFixes.length > 0) {
      console.log('\n🔧 PRIORITY FIXES:');
      priorityFixes.forEach(([col, pct]) => {
        console.log(`  ${col}: ${100 - pct}% missing`);
      });
    }

  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

accurateQualityCheck();