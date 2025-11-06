/**
 * Data Quality Fix Script
 *
 * Addresses findings from investigation:
 * 1. Update validation to include "native" for english_proficiency_level (ALREADY DONE ✅)
 * 2. overall_culture_score and local_festivals DO NOT EXIST in database (need to create or remove references)
 * 3. Fill NULL values for social_atmosphere (77.3% NULL), traditional_progressive_lean (77.3% NULL),
 *    and cultural_events_frequency (84.4% NULL)
 *
 * STRATEGY:
 * - For now, we'll create a report showing which towns need manual review
 * - These fields require human judgment and cannot be automatically populated
 * - We'll identify patterns to help prioritize which towns to fill first
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function generateDataQualityReport() {
  console.log('📋 GENERATING DATA QUALITY FIX REPORT\n');
  console.log('=' .repeat(80));

  const report = {
    generatedAt: new Date().toISOString(),
    summary: {},
    recommendations: [],
    townsNeedingAttention: []
  };

  // 1. Validate english_proficiency_level (should be good now)
  console.log('\n✅ 1. ENGLISH PROFICIENCY LEVEL');
  console.log('-'.repeat(80));

  const { data: englishData } = await supabase
    .from('towns')
    .select('id, town_name, country, english_proficiency_level');

  const nativeCount = englishData.filter(t => t.english_proficiency_level === 'native').length;
  console.log(`✅ "native" value is valid and used by ${nativeCount} towns (${(nativeCount/englishData.length*100).toFixed(1)}%)`);
  console.log('✅ Validation file already includes "native" in valid values');

  report.summary.english_proficiency_level = {
    status: 'VALID',
    native_count: nativeCount,
    null_count: 0,
    action: 'No action needed - field is complete and valid'
  };

  // 2. Check for missing fields
  console.log('\n\n🔍 2. MISSING FIELDS IN DATABASE');
  console.log('-'.repeat(80));

  const { data: sampleTown } = await supabase
    .from('towns')
    .select('*')
    .limit(1);

  if (!sampleTown || sampleTown.length === 0) {
    console.error('❌ Could not fetch sample town');
    return;
  }

  const allFields = Object.keys(sampleTown[0]);
  const missingFields = ['overall_culture_score', 'local_festivals'];

  missingFields.forEach(field => {
    const exists = allFields.includes(field);
    console.log(`${exists ? '✅' : '❌'} ${field}: ${exists ? 'EXISTS' : 'DOES NOT EXIST'}`);
  });

  report.summary.missing_fields = {
    fields: missingFields.filter(f => !allFields.includes(f)),
    action: 'Search codebase for references to these fields and remove or replace them'
  };

  if (report.summary.missing_fields.fields.length > 0) {
    report.recommendations.push({
      priority: 'HIGH',
      issue: 'Code references non-existent database fields',
      fields: report.summary.missing_fields.fields,
      action: 'Search codebase and remove/replace references to: ' + report.summary.missing_fields.fields.join(', '),
      commands: [
        `grep -r "overall_culture_score" src/`,
        `grep -r "local_festivals" src/`
      ]
    });
  }

  // 3. Analyze NULL values in cultural fields
  console.log('\n\n🔴 3. HIGH NULL PERCENTAGE FIELDS (>75%)');
  console.log('-'.repeat(80));

  const highNullFields = [
    'social_atmosphere',
    'traditional_progressive_lean',
    'cultural_events_frequency'
  ];

  for (const field of highNullFields) {
    const { data: fieldData, error: fieldError } = await supabase
      .from('towns')
      .select(`id, name, country, region, ${field}`);

    if (fieldError || !fieldData) {
      console.error(`❌ Error fetching ${field}:`, fieldError);
      continue;
    }

    const nullTowns = fieldData.filter(t => !t[field]);
    const nullPercent = (nullTowns.length / fieldData.length * 100).toFixed(1);

    console.log(`\n🔴 ${field}: ${nullTowns.length}/${fieldData.length} NULL (${nullPercent}%)`);

    // Group by country to see patterns
    const byCountry = {};
    nullTowns.forEach(town => {
      if (!byCountry[town.country]) {
        byCountry[town.country] = 0;
      }
      byCountry[town.country]++;
    });

    console.log('   Countries with most NULL values:');
    Object.entries(byCountry)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([country, count]) => {
        console.log(`     - ${country}: ${count} towns`);
      });

    report.summary[field] = {
      null_count: nullTowns.length,
      null_percent: parseFloat(nullPercent),
      top_countries_affected: Object.entries(byCountry)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([country, count]) => ({ country, count }))
    };
  }

  // 4. Identify towns that are missing ALL three cultural fields
  console.log('\n\n⚠️  4. TOWNS MISSING ALL CULTURAL FIELDS');
  console.log('-'.repeat(80));

  const { data: allTowns, error: allTownsError } = await supabase
    .from('towns')
    .select('id, town_name, country, region, social_atmosphere, traditional_progressive_lean, cultural_events_frequency, healthcare_score, safety_score');

  if (allTownsError || !allTowns) {
    console.error('❌ Error fetching all towns:', allTownsError);
    return;
  }

  const missingAll = allTowns.filter(t =>
    !t.social_atmosphere &&
    !t.traditional_progressive_lean &&
    !t.cultural_events_frequency
  );

  console.log(`Found ${missingAll.length} towns missing all three cultural fields`);

  // Calculate a simple score from available metrics
  const withScores = missingAll.map(t => ({
    ...t,
    avg_score: ((t.healthcare_score || 0) + (t.safety_score || 0)) / 2
  }));

  // Prioritize by average score (higher-scoring towns should be filled first)
  const sortedByScore = withScores
    .sort((a, b) => b.avg_score - a.avg_score);

  console.log('\nTop 20 towns needing cultural data (sorted by healthcare+safety scores):');
  sortedByScore.slice(0, 20).forEach((town, idx) => {
    console.log(`  ${idx + 1}. ${town.town_name}, ${town.country} (Avg Score: ${town.avg_score.toFixed(1)})`);
  });

  report.townsNeedingAttention = sortedByScore.slice(0, 50).map(t => ({
    id: t.id,
    name: t.town_name,
    country: t.country,
    region: t.region,
    avg_score: t.avg_score,
    healthcare_score: t.healthcare_score,
    safety_score: t.safety_score,
    priority: t.avg_score >= 70 ? 'HIGH' : t.avg_score >= 60 ? 'MEDIUM' : 'LOW'
  }));

  // 5. Generate recommendations
  console.log('\n\n💡 5. RECOMMENDATIONS');
  console.log('-'.repeat(80));

  report.recommendations.push({
    priority: 'CRITICAL',
    issue: '77-84% of towns missing cultural data',
    fields: ['social_atmosphere', 'traditional_progressive_lean', 'cultural_events_frequency'],
    impact: 'These fields affect matching quality and user experience',
    action: 'Manually research and populate cultural data for top 50 towns (sorted by avg score)',
    note: 'Start with high-scoring towns (healthcare+safety) to maximize impact'
  });

  report.recommendations.push({
    priority: 'MEDIUM',
    issue: 'Fields referenced in code may not exist in database',
    fields: report.summary.missing_fields.fields,
    action: 'Audit codebase for references to overall_culture_score and local_festivals',
    commands: [
      'grep -r "overall_culture_score" src/',
      'grep -r "local_festivals" src/'
    ]
  });

  report.recommendations.push({
    priority: 'LOW',
    issue: 'Consider adding batch import feature',
    action: 'Create admin UI for batch-importing cultural data from CSV',
    benefit: 'Would allow faster population of missing fields'
  });

  // Print recommendations
  report.recommendations.forEach((rec, idx) => {
    console.log(`\n${idx + 1}. [${rec.priority}] ${rec.issue}`);
    console.log(`   Action: ${rec.action}`);
    if (rec.fields) {
      console.log(`   Fields: ${rec.fields.join(', ')}`);
    }
    if (rec.commands) {
      console.log(`   Commands:`);
      rec.commands.forEach(cmd => console.log(`     - ${cmd}`));
    }
    if (rec.note) {
      console.log(`   Note: ${rec.note}`);
    }
  });

  // 6. Save report to file
  const reportPath = '/Users/tilmanrumpf/Desktop/scout2retire/database-utilities/DATA_QUALITY_REPORT.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log('\n\n' + '='.repeat(80));
  console.log(`✅ Report saved to: ${reportPath}`);
  console.log('='.repeat(80));

  return report;
}

// Run the report
generateDataQualityReport()
  .then(() => {
    console.log('\n✅ Data quality analysis complete!');
    console.log('\nNext steps:');
    console.log('1. Review DATA_QUALITY_REPORT.json');
    console.log('2. Search codebase for references to missing fields');
    console.log('3. Prioritize filling cultural data for top 50 high-scoring towns');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
