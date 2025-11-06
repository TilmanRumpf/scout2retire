/**
 * Final comprehensive quality check - ALL columns except photos
 * Ensure data is complete and high quality for retirees
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function finalQualityCheck() {
  console.log('🔍 FINAL COMPREHENSIVE QUALITY CHECK\n');
  console.log('=' .repeat(60));

  try {
    // Get all towns for analysis
    const { data: towns, error } = await supabase
      .from('towns')
      .select('*');

    if (error) {
      console.error('Error fetching towns:', error);
      return;
    }

    console.log(`📊 Analyzing ${towns.length} towns across all columns (except photos)\n`);

    const issues = [];
    const stats = {
      perfect: [],
      minor_issues: [],
      major_issues: [],
      critical_columns: {}
    };

    // Critical columns for retirees
    const CRITICAL_COLUMNS = [
      'english_proficiency',
      'visa_requirements',
      'visa_free_days',
      'cost_of_living_usd',
      'typical_monthly_living_cost',
      'healthcare_quality',
      'internet_quality',
      'safety_score',
      'quality_of_life',
      'healthcare_cost_local',
      'climate_zone_actual',
      'population_actual'
    ];

    // Check each critical column
    console.log('🎯 CRITICAL COLUMNS STATUS:\n');
    for (const col of CRITICAL_COLUMNS) {
      const nullCount = towns.filter(t => t[col] === null || t[col] === undefined).length;
      const percentage = Math.round((towns.length - nullCount) / towns.length * 100);
      stats.critical_columns[col] = percentage;

      const status = percentage === 100 ? '✅' : percentage >= 95 ? '🟡' : '❌';
      console.log(`${status} ${col}: ${percentage}% complete (${nullCount} missing)`);

      if (nullCount > 0) {
        const missing = towns.filter(t => !t[col]).slice(0, 3).map(t => `${t.town_name}, ${t.country}`);
        console.log(`   Missing in: ${missing.join(' | ')}${nullCount > 3 ? ` ... +${nullCount - 3} more` : ''}`);
      }
    }

    // Check for data quality issues
    console.log('\n📋 DATA QUALITY ISSUES:\n');

    // 1. Check for template/dummy data
    const templateCosts = towns.filter(t => t.cost_of_living_usd === 2793);
    if (templateCosts.length > 0) {
      issues.push(`❌ ${templateCosts.length} towns still have template cost $2,793`);
    }

    // 2. Check for unrealistic values
    const zeroCosts = towns.filter(t => t.cost_of_living_usd === 0);
    if (zeroCosts.length > 0) {
      issues.push(`⚠️ ${zeroCosts.length} towns have $0 cost of living`);
    }

    const zeroHealthcare = towns.filter(t => t.healthcare_cost_local === 0 && t.country !== 'Canada');
    if (zeroHealthcare.length > 0) {
      issues.push(`⚠️ ${zeroHealthcare.length} non-Canadian towns have $0 healthcare`);
    }

    // 3. Check quality scores
    const qualityScores = towns.map(t => t.quality_of_life).filter(q => q !== null);
    const uniqueScores = [...new Set(qualityScores)];
    console.log(`Quality score distribution: ${uniqueScores.length} unique values`);
    if (uniqueScores.length < 10) {
      issues.push(`⚠️ Only ${uniqueScores.length} unique quality scores - lacks granularity`);
    }

    // 4. Check English proficiency
    const englishStats = {
      native: towns.filter(t => t.english_proficiency >= 90).length,
      high: towns.filter(t => t.english_proficiency >= 60 && t.english_proficiency < 90).length,
      moderate: towns.filter(t => t.english_proficiency >= 40 && t.english_proficiency < 60).length,
      low: towns.filter(t => t.english_proficiency < 40 && t.english_proficiency !== null).length,
      missing: towns.filter(t => t.english_proficiency === null).length
    };

    console.log('\n🗣️ ENGLISH PROFICIENCY DISTRIBUTION:');
    console.log(`  Native (90-100%): ${englishStats.native} towns`);
    console.log(`  High (60-89%): ${englishStats.high} towns`);
    console.log(`  Moderate (40-59%): ${englishStats.moderate} towns`);
    console.log(`  Low (<40%): ${englishStats.low} towns`);
    if (englishStats.missing > 0) {
      console.log(`  ❌ Missing: ${englishStats.missing} towns`);
    }

    // 5. Check visa data
    const visaStats = {
      no_visa: towns.filter(t => t.visa_free_days === 999).length,
      long_term: towns.filter(t => t.visa_free_days >= 180 && t.visa_free_days < 999).length,
      medium: towns.filter(t => t.visa_free_days >= 90 && t.visa_free_days < 180).length,
      short: towns.filter(t => t.visa_free_days > 0 && t.visa_free_days < 90).length,
      visa_required: towns.filter(t => t.visa_free_days === 0).length,
      missing: towns.filter(t => t.visa_free_days === null).length
    };

    console.log('\n🛂 VISA-FREE DAYS DISTRIBUTION:');
    console.log(`  No visa (US/territory): ${visaStats.no_visa} towns`);
    console.log(`  180+ days: ${visaStats.long_term} towns`);
    console.log(`  90-179 days: ${visaStats.medium} towns`);
    console.log(`  <90 days: ${visaStats.short} towns`);
    console.log(`  Visa required: ${visaStats.visa_required} towns`);
    if (visaStats.missing > 0) {
      console.log(`  ❌ Missing: ${visaStats.missing} towns`);
    }

    // 6. Check for consistency within countries
    console.log('\n🌍 COUNTRY CONSISTENCY CHECK:');
    const countryIssues = [];
    const countries = [...new Set(towns.map(t => t.country))];

    for (const country of countries) {
      const countryTowns = towns.filter(t => t.country === country);

      // Check if visa requirements are consistent
      const visaReqs = [...new Set(countryTowns.map(t => t.visa_requirements))];
      if (visaReqs.length > 1) {
        countryIssues.push(`${country}: ${visaReqs.length} different visa requirements`);
      }

      // Check if healthcare costs vary reasonably
      const healthcareCosts = countryTowns.map(t => t.healthcare_cost_local).filter(c => c !== null);
      if (healthcareCosts.length > 1) {
        const min = Math.min(...healthcareCosts);
        const max = Math.max(...healthcareCosts);
        if (max > min * 3 && min > 0) {
          countryIssues.push(`${country}: Healthcare varies ${min}-${max} (${Math.round(max/min)}x difference)`);
        }
      }
    }

    if (countryIssues.length > 0) {
      console.log('Issues found:');
      countryIssues.slice(0, 10).forEach(issue => console.log(`  ⚠️ ${issue}`));
      if (countryIssues.length > 10) {
        console.log(`  ... and ${countryIssues.length - 10} more`);
      }
    } else {
      console.log('  ✅ All countries have consistent data');
    }

    // 7. Check completeness by town
    console.log('\n🏆 TOWN COMPLETENESS:');

    for (const town of towns) {
      let missingCount = 0;
      let missingCritical = 0;

      // Count missing critical fields
      for (const col of CRITICAL_COLUMNS) {
        if (town[col] === null || town[col] === undefined) {
          missingCritical++;
        }
      }

      // Count all missing fields (except photos)
      Object.keys(town).forEach(key => {
        if (!key.includes('photo') && !key.includes('image') &&
            (town[key] === null || town[key] === undefined)) {
          missingCount++;
        }
      });

      if (missingCritical === 0) {
        stats.perfect.push(town.town_name);
      } else if (missingCritical <= 2) {
        stats.minor_issues.push(town.town_name);
      } else {
        stats.major_issues.push(town.town_name);
      }
    }

    console.log(`  ✅ Perfect (no critical fields missing): ${stats.perfect.length} towns`);
    console.log(`  🟡 Minor issues (1-2 critical missing): ${stats.minor_issues.length} towns`);
    console.log(`  ❌ Major issues (3+ critical missing): ${stats.major_issues.length} towns`);

    if (stats.major_issues.length > 0) {
      console.log(`\n  Towns with major issues:`);
      stats.major_issues.slice(0, 5).forEach(name => {
        const town = towns.find(t => t.town_name === name);
        console.log(`    - ${name}, ${town.country}`);
      });
      if (stats.major_issues.length > 5) {
        console.log(`    ... and ${stats.major_issues.length - 5} more`);
      }
    }

    // Final summary
    console.log('\n' + '=' .repeat(60));
    console.log('📊 FINAL QUALITY SCORE:\n');

    const overallScore = Math.round(
      Object.values(stats.critical_columns).reduce((a, b) => a + b, 0) /
      Object.keys(stats.critical_columns).length
    );

    if (overallScore === 100) {
      console.log('🎉 PERFECT! All critical data is 100% complete!');
    } else if (overallScore >= 95) {
      console.log(`✅ EXCELLENT: ${overallScore}% complete for critical fields`);
    } else if (overallScore >= 90) {
      console.log(`🟡 GOOD: ${overallScore}% complete for critical fields`);
    } else {
      console.log(`❌ NEEDS WORK: Only ${overallScore}% complete for critical fields`);
    }

    if (issues.length > 0) {
      console.log('\n⚠️ Issues to address:');
      issues.forEach(issue => console.log(`  ${issue}`));
    } else {
      console.log('\n✅ No major data quality issues found!');
    }

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');

    if (stats.major_issues.length > 0) {
      console.log(`1. Fix ${stats.major_issues.length} towns with major data gaps`);
    }

    const lowComplete = Object.entries(stats.critical_columns)
      .filter(([col, pct]) => pct < 100)
      .sort((a, b) => a[1] - b[1]);

    if (lowComplete.length > 0) {
      console.log(`2. Complete missing data for:`);
      lowComplete.forEach(([col, pct]) => {
        console.log(`   - ${col}: ${100 - pct}% missing`);
      });
    }

    if (overallScore === 100 && issues.length === 0) {
      console.log('✅ Data quality is EXCELLENT! Ready for production use.');
    }

  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

finalQualityCheck();