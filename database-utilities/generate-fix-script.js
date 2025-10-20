import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function generateFixScript() {
  console.log('📝 GENERATING DATA FIX SCRIPT\n');
  console.log('='.repeat(100));

  const fixes = [];

  // Fix 1: Canadian Healthcare Costs
  console.log('\n1. FIXING CANADIAN HEALTHCARE COSTS ($0 → $75)');
  console.log('-'.repeat(100));

  const { data: canadianTowns } = await supabase
    .from('towns')
    .select('id, name, country, healthcare_cost_monthly, healthcare_cost')
    .eq('country', 'Canada')
    .eq('healthcare_cost_monthly', 0);

  if (canadianTowns && canadianTowns.length > 0) {
    console.log(`Found ${canadianTowns.length} Canadian towns with $0 healthcare cost:\n`);

    fixes.push({
      issue: 'Canadian Healthcare Cost',
      count: canadianTowns.length,
      sql: `-- Fix Canadian healthcare costs (universal healthcare ≠ zero cost)\nUPDATE towns\nSET healthcare_cost_monthly = 75,\n    healthcare_cost = 75\nWHERE country = 'Canada'\n  AND healthcare_cost_monthly = 0;\n`,
      towns: canadianTowns.map(t => t.name)
    });

    canadianTowns.forEach(t => {
      console.log(`  - ${t.name}: $${t.healthcare_cost_monthly} → $75`);
    });
  }

  // Fix 2: Check for suspiciously identical costs
  console.log('\n\n2. CHECKING FOR DUPLICATE COST VALUES');
  console.log('-'.repeat(100));

  const { data: allCosts } = await supabase
    .from('towns')
    .select('name, country, cost_of_living_usd')
    .not('cost_of_living_usd', 'is', null);

  const costCounts = {};
  allCosts?.forEach(t => {
    costCounts[t.cost_of_living_usd] = costCounts[t.cost_of_living_usd] || [];
    costCounts[t.cost_of_living_usd].push(`${t.name}, ${t.country}`);
  });

  const suspiciousDuplicates = Object.entries(costCounts)
    .filter(([cost, towns]) => towns.length >= 20)
    .sort((a, b) => b[1].length - a[1].length);

  if (suspiciousDuplicates.length > 0) {
    console.log(`Found ${suspiciousDuplicates.length} cost values appearing in 20+ towns:\n`);

    suspiciousDuplicates.forEach(([cost, towns]) => {
      console.log(`  $${cost}/month - ${towns.length} towns:`);
      console.log(`    ${towns.slice(0, 5).join('; ')}`);
      if (towns.length > 5) {
        console.log(`    ... and ${towns.length - 5} more`);
      }
      console.log('');
    });

    console.log('⚠️  RECOMMENDATION: Manual review needed - these may be templated values');
  }

  // Fix 3: Quality of Life Score Distribution
  console.log('\n\n3. QUALITY OF LIFE SCORE DISTRIBUTION');
  console.log('-'.repeat(100));

  const { data: qolScores } = await supabase
    .from('towns')
    .select('quality_of_life')
    .not('quality_of_life', 'is', null);

  const qolCounts = {};
  qolScores?.forEach(t => {
    qolCounts[t.quality_of_life] = (qolCounts[t.quality_of_life] || 0) + 1;
  });

  console.log('Score distribution:');
  Object.entries(qolCounts)
    .sort((a, b) => a[0] - b[0])
    .forEach(([score, count]) => {
      const pct = ((count / qolScores.length) * 100).toFixed(1);
      const bar = '█'.repeat(Math.floor(pct / 2));
      console.log(`  ${score}: ${count.toString().padStart(3)} towns (${pct.toString().padStart(5)}%) ${bar}`);
    });

  const highScores = (qolCounts[8] || 0) + (qolCounts[9] || 0);
  const highPct = ((highScores / qolScores.length) * 100).toFixed(1);

  if (highPct > 90) {
    console.log(`\n⚠️  ISSUE: ${highPct}% of towns have score 8-9 (lack of granularity)`);
    console.log('   RECOMMENDATION: Implement decimal scoring (7.5, 8.2, 8.7, etc.)');
  }

  // Fix 4: Missing data summary
  console.log('\n\n4. COLUMNS TO DROP (100% EMPTY)');
  console.log('-'.repeat(100));

  const emptyColumns = [
    'image_url_3',
    'image_urls',
    'expat_groups',
    'international_flights_direct',
    'regional_airport_distance',
    'international_airport_distance',
    'internet_reliability',
    'mobile_coverage',
    'bike_infrastructure',
    'road_quality',
    'traffic_congestion',
    'parking_availability',
    'banking_infrastructure',
    'digital_services_availability',
    'sports_facilities',
    'mountain_activities',
    'water_sports_available',
    'cultural_activities',
    'nearest_major_city',
    'timezone'
  ];

  console.log(`Found ${emptyColumns.length} completely empty columns:\n`);
  console.log(emptyColumns.map(c => `  - ${c}`).join('\n'));

  const dropSQL = `-- Drop completely empty columns (100% missing data)\nALTER TABLE towns\n${emptyColumns.map((c, i) => `  DROP COLUMN ${c}${i < emptyColumns.length - 1 ? ',' : ';'}`).join('\n')}\n`;

  fixes.push({
    issue: 'Empty Columns',
    count: emptyColumns.length,
    sql: dropSQL,
    columns: emptyColumns
  });

  // Generate final SQL script
  console.log('\n\n' + '='.repeat(100));
  console.log('📋 COMPLETE FIX SCRIPT');
  console.log('='.repeat(100));
  console.log('\n-- Data Quality Fixes Generated: ' + new Date().toISOString());
  console.log('-- Total fixes: ' + fixes.length);
  console.log('\n-- ============================================');
  console.log('-- IMPORTANT: Review each fix before running!');
  console.log('-- ============================================\n');

  fixes.forEach((fix, i) => {
    console.log(`-- Fix ${i + 1}: ${fix.issue} (${fix.count} ${fix.count === 1 ? 'item' : 'items'})`);
    console.log(fix.sql);
  });

  console.log('\n-- ============================================');
  console.log('-- END OF FIX SCRIPT');
  console.log('-- ============================================\n');

  // Summary
  console.log('='.repeat(100));
  console.log('✅ FIX SCRIPT GENERATION COMPLETE');
  console.log('='.repeat(100));
  console.log('\nSUMMARY:');
  fixes.forEach(fix => {
    console.log(`  ✓ ${fix.issue}: ${fix.count} ${fix.count === 1 ? 'item' : 'items'}`);
  });

  console.log('\nNEXT STEPS:');
  console.log('  1. Review generated SQL above');
  console.log('  2. Test on development database first');
  console.log('  3. Create database snapshot before production run');
  console.log('  4. Execute fixes one at a time');
  console.log('  5. Verify results after each fix');
}

generateFixScript().catch(console.error);
