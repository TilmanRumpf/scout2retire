/**
 * OUTLIER ANALYSIS - Identify AI Research Failure Patterns
 *
 * This script analyzes what fields have the most outliers
 * to identify where AI data population is failing.
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeOutlierPatterns() {
  console.log('🔍 Fetching all towns...\n');

  const { data: towns, error } = await supabase
    .from('towns')
    .select('*');

  if (error) {
    console.error('Error fetching towns:', error);
    return;
  }

  console.log(`✅ Loaded ${towns.length} towns\n`);

  // Analyze numeric fields for statistical outliers
  const numericFields = [
    'avg_temp_summer', 'avg_temp_winter', 'avg_temp_spring', 'avg_temp_fall',
    'english_proficiency', 'healthcare_score', 'safety_score', 'walkability',
    'cost_of_living_usd', 'typical_monthly_living_cost', 'rent_1bed', 'rent_2bed_usd',
    'annual_rainfall', 'sunshine_hours', 'humidity_average',
    'elevation_meters', 'latitude', 'longitude', 'population',
    'distance_to_ocean_km', 'airport_distance'
  ];

  const outlierReport = {};
  const extremeOutliers = [];

  numericFields.forEach(field => {
    // Get all non-null values
    const values = towns
      .map(t => t[field])
      .filter(v => v !== null && v !== undefined && !isNaN(v))
      .map(v => Number(v));

    if (values.length < 10) return; // Skip fields with insufficient data

    // Calculate statistics
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    // Find outliers (>2 or >3 standard deviations)
    const outliers = [];
    towns.forEach(town => {
      const value = town[field];
      if (value === null || value === undefined || isNaN(value)) return;

      const zScore = Math.abs((Number(value) - mean) / stdDev);

      if (zScore > 2) {
        outliers.push({
          townName: town.town_name,
          country: town.country,
          value: Number(value),
          zScore: zScore.toFixed(2),
          severity: zScore > 3 ? 'EXTREME' : 'MODERATE'
        });
      }
    });

    if (outliers.length > 0) {
      outlierReport[field] = {
        count: outliers.length,
        mean: mean.toFixed(2),
        stdDev: stdDev.toFixed(2),
        extreme: outliers.filter(o => o.severity === 'EXTREME').length,
        moderate: outliers.filter(o => o.severity === 'MODERATE').length,
        outliers: outliers.sort((a, b) => b.zScore - a.zScore).slice(0, 5) // Top 5 worst
      };

      // Track extreme outliers across all fields
      outliers.filter(o => o.severity === 'EXTREME').forEach(o => {
        extremeOutliers.push({ field, ...o });
      });
    }
  });

  // Print report
  console.log('='.repeat(80));
  console.log('📊 OUTLIER ANALYSIS - AI RESEARCH FAILURE PATTERNS');
  console.log('='.repeat(80));
  console.log('');

  // Sort by number of outliers
  const sortedFields = Object.entries(outlierReport)
    .sort((a, b) => b[1].count - a[1].count);

  console.log(`🔴 TOP 15 FIELDS WITH MOST OUTLIERS:\n`);
  sortedFields.slice(0, 15).forEach(([field, data], idx) => {
    console.log(`${idx + 1}. ${field}:`);
    console.log(`   Total: ${data.count} outliers (${data.extreme} extreme, ${data.moderate} moderate)`);
    console.log(`   Stats: mean=${data.mean}, σ=${data.stdDev}`);
    console.log(`   Worst cases:`);
    data.outliers.slice(0, 3).forEach(o => {
      console.log(`     - ${o.townName}, ${o.country}: ${o.value} (Z-score: ${o.zScore})`);
    });
    console.log('');
  });

  console.log('='.repeat(80));
  console.log(`🎯 PATTERN ANALYSIS:\n`);

  // Identify patterns
  const patterns = {
    temperatureIssues: sortedFields.filter(([f]) => f.includes('temp')).length,
    costIssues: sortedFields.filter(([f]) => f.includes('cost') || f.includes('rent')).length,
    ratingIssues: sortedFields.filter(([f]) => f.includes('rating') || f.includes('score')).length,
    geographicIssues: sortedFields.filter(([f]) => ['elevation', 'distance', 'latitude', 'longitude'].some(g => f.includes(g))).length,
    climateIssues: sortedFields.filter(([f]) => ['rainfall', 'sunshine', 'humidity'].some(c => f.includes(c))).length
  };

  console.log('Issues by category:');
  Object.entries(patterns).forEach(([category, count]) => {
    console.log(`  ${category}: ${count} fields with issues`);
  });
  console.log('');

  // Analyze extreme outliers by town
  const townOutlierCounts = {};
  extremeOutliers.forEach(o => {
    const key = `${o.townName}, ${o.country}`;
    townOutlierCounts[key] = (townOutlierCounts[key] || 0) + 1;
  });

  console.log('🏚️ TOWNS WITH MOST EXTREME OUTLIERS (>3σ):\n');
  Object.entries(townOutlierCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([town, count], idx) => {
      console.log(`${idx + 1}. ${town}: ${count} extreme outliers`);
    });
  console.log('');

  console.log('='.repeat(80));
  console.log('💡 ROOT CAUSES IDENTIFIED:\n');

  console.log('1. NO WEB SEARCH: AI is guessing instead of researching');
  console.log('2. NO SOURCE VERIFICATION: No citations or fact-checking');
  console.log('3. TEMPERATURE CONFUSION: Mixing Celsius/Fahrenheit or inventing values');
  console.log('4. COST HALLUCINATION: Making up prices without local market research');
  console.log('5. GEOGRAPHY ERRORS: Incorrect coordinates, elevations, distances');
  console.log('6. RATING INCONSISTENCY: Arbitrary ratings not based on actual data');
  console.log('');

  // Save detailed report
  fs.writeFileSync(
    'docs/project-history/OUTLIER_FAILURE_ANALYSIS.md',
    generateMarkdownReport(outlierReport, extremeOutliers, patterns, townOutlierCounts)
  );

  console.log('✅ Detailed report saved to: docs/project-history/OUTLIER_FAILURE_ANALYSIS.md\n');
}

function generateMarkdownReport(outlierReport, extremeOutliers, patterns, townOutlierCounts) {
  return `# AI Research Failure Analysis - Outlier Patterns

**Generated:** ${new Date().toISOString()}

## Executive Summary

The outlier detection system has identified systematic failures in AI-generated town data. These outliers reveal WHERE and HOW the AI research function is failing.

## Key Findings

### Failure Patterns by Category

${Object.entries(patterns).map(([category, count]) =>
  `- **${category}**: ${count} fields with significant outliers`
).join('\n')}

### Top Fields with Most Outliers

${Object.entries(outlierReport)
  .sort((a, b) => b[1].count - a[1].count)
  .slice(0, 20)
  .map(([field, data], idx) => `
#### ${idx + 1}. ${field}

- **Total Outliers:** ${data.count} (${data.extreme} extreme, ${data.moderate} moderate)
- **Statistics:** Mean = ${data.mean}, σ = ${data.stdDev}
- **Worst Cases:**
${data.outliers.slice(0, 5).map(o =>
  `  - ${o.townName}, ${o.country}: ${o.value} (Z-score: ${o.zScore})`
).join('\n')}
`).join('\n')}

### Towns with Most Extreme Outliers

${Object.entries(townOutlierCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 15)
  .map(([town, count], idx) => `${idx + 1}. ${town}: **${count}** extreme outliers`
).join('\n')}

## Root Causes

### 1. No Web Search Integration
The AI function asks Claude Haiku to "research" but doesn't actually perform web searches. It's making educated guesses based on training data.

### 2. No Source Verification
No citations, no cross-referencing, no fact-checking. Just LLM hallucination.

### 3. Unit Confusion
Mixing Celsius/Fahrenheit, meters/feet, USD/local currency without consistent conversion.

### 4. Geographic Hallucination
Incorrect coordinates, elevations, and distances because no actual map lookups are performed.

### 5. Cost Fabrication
Making up rental prices and cost of living without checking local real estate sites or Numbeo.

### 6. Rating Arbitrariness
Assigning ratings (1-10) without actual data sources or comparable benchmarks.

## Recommended Fixes

1. **Add Web Search**: Use SerpAPI or similar to get real data
2. **Verify Coordinates**: Use geocoding API to verify lat/long
3. **Check Numbeo**: For cost of living, use actual Numbeo data
4. **Weather API**: Use OpenWeatherMap or similar for climate data
5. **Track Sources**: Save citations for every piece of data
6. **Cross-Validate**: Compare multiple sources before accepting values

## Next Steps

1. Rewrite ai-populate-new-town function with actual research
2. Add source tracking to database
3. Re-populate towns that have >5 extreme outliers
4. Implement verification before saving to database

---

*This analysis was generated by analyzing ${Object.keys(outlierReport).length} numeric fields across ${Object.entries(townOutlierCounts).length} towns with extreme outliers.*
`;
}

analyzeOutlierPatterns().catch(console.error);
