import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfc3JvbGUiLCJpYXQiOjE3NDg3MDYzNDUsImV4cCI6MjA2NDI4MjM0NX0.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

console.log('ANALYZING EUROPEAN TOWNS WITH CONFLICTING CLIMATE DATA\n');

// Get European towns with both temperature and climate label data
const { data: towns } = await supabase
  .from('towns')
  .select(`
    name,
    country,
    region,
    summer_climate_actual,
    winter_climate_actual,
    avg_temp_summer,
    avg_temp_winter,
    climate_description,
    geographic_features_actual
  `)
  .in('country', [
    'Portugal', 'Spain', 'France', 'Italy', 'Greece', 
    'Netherlands', 'Germany', 'Switzerland', 'Austria',
    'Belgium', 'United Kingdom', 'Ireland', 'Malta'
  ]);

// Helper functions for inference
function inferSummerClimate(temp) {
  if (temp < 15) return 'cool';
  if (temp >= 15 && temp < 22) return 'mild';
  if (temp >= 22 && temp <= 24) return 'mild/warm boundary';
  if (temp > 24 && temp < 28) return 'warm';
  if (temp >= 28 && temp <= 32) return 'warm/hot boundary';
  if (temp > 32) return 'hot';
}

function inferWinterClimate(temp) {
  if (temp < 3) return 'cold';
  if (temp >= 3 && temp < 5) return 'cold/cool boundary';
  if (temp >= 5 && temp < 12) return 'cool';
  if (temp >= 12 && temp <= 15) return 'cool/mild boundary';
  if (temp > 15) return 'mild';
}

// Find conflicts
const conflicts = [];

towns?.forEach(town => {
  const summerConflict = town.avg_temp_summer && town.summer_climate_actual && 
    inferSummerClimate(town.avg_temp_summer).split('/')[0] !== town.summer_climate_actual;
  
  const winterConflict = town.avg_temp_winter && town.winter_climate_actual && 
    inferWinterClimate(town.avg_temp_winter).split('/')[0] !== town.winter_climate_actual;
  
  if (summerConflict || winterConflict) {
    conflicts.push({
      ...town,
      summerInferred: town.avg_temp_summer ? inferSummerClimate(town.avg_temp_summer) : null,
      winterInferred: town.avg_temp_winter ? inferWinterClimate(town.avg_temp_winter) : null,
      summerConflict,
      winterConflict
    });
  }
});

// Show first 10 European conflicts with detailed analysis
console.log(`Found ${conflicts.length} European towns with climate conflicts\n`);
console.log('DETAILED ANALYSIS OF 10 EUROPEAN TOWNS:\n');
console.log('='.repeat(80));

conflicts.slice(0, 10).forEach((town, idx) => {
  console.log(`\n${idx + 1}. ${town.name}, ${town.country}`);
  console.log('-'.repeat(60));
  
  if (town.summerConflict) {
    console.log(`SUMMER CONFLICT:`);
    console.log(`  Temperature: ${town.avg_temp_summer}°C`);
    console.log(`  Database says: "${town.summer_climate_actual}"`);
    console.log(`  Should be: "${town.summerInferred}"`);
    
    // Analyze why this might be
    if (town.avg_temp_summer >= 22 && town.avg_temp_summer <= 24) {
      console.log(`  Note: Temperature in overlap zone (22-24°C) between mild/warm`);
    } else if (town.avg_temp_summer >= 28 && town.avg_temp_summer <= 32) {
      console.log(`  Note: Temperature in overlap zone (28-32°C) between warm/hot`);
    }
  }
  
  if (town.winterConflict) {
    console.log(`WINTER CONFLICT:`);
    console.log(`  Temperature: ${town.avg_temp_winter}°C`);
    console.log(`  Database says: "${town.winter_climate_actual}"`);
    console.log(`  Should be: "${town.winterInferred}"`);
    
    // Analyze why this might be
    if (town.avg_temp_winter >= 3 && town.avg_temp_winter <= 5) {
      console.log(`  Note: Temperature in overlap zone (3-5°C) between cold/cool`);
    } else if (town.avg_temp_winter >= 12 && town.avg_temp_winter <= 15) {
      console.log(`  Note: Temperature in overlap zone (12-15°C) between cool/mild`);
    }
  }
  
  // Add geographic context
  if (town.geographic_features_actual?.length > 0) {
    console.log(`  Geographic features: ${town.geographic_features_actual.join(', ')}`);
  }
  
  // Add climate description snippet
  if (town.climate_description) {
    console.log(`  Climate notes: "${town.climate_description.substring(0, 80)}..."`);
  }
});

// Summary statistics
console.log('\n\nSUMMARY STATISTICS:');
console.log('='.repeat(80));
const summerConflicts = conflicts.filter(c => c.summerConflict).length;
const winterConflicts = conflicts.filter(c => c.winterConflict).length;
const bothConflicts = conflicts.filter(c => c.summerConflict && c.winterConflict).length;

console.log(`Total European towns analyzed: ${towns?.length}`);
console.log(`Towns with conflicts: ${conflicts.length} (${Math.round(conflicts.length/towns?.length*100)}%)`);
console.log(`  - Summer conflicts: ${summerConflicts}`);
console.log(`  - Winter conflicts: ${winterConflicts}`);
console.log(`  - Both seasons conflicting: ${bothConflicts}`);

// Analyze patterns
console.log('\n\nCONFLICT PATTERNS:');
console.log('='.repeat(80));

// Group by country
const byCountry = {};
conflicts.forEach(c => {
  byCountry[c.country] = (byCountry[c.country] || 0) + 1;
});

console.log('Conflicts by country:');
Object.entries(byCountry)
  .sort((a, b) => b[1] - a[1])
  .forEach(([country, count]) => {
    console.log(`  ${country}: ${count} towns`);
  });

// Most common mismatches
console.log('\nMost common mismatches:');
const mismatches = {};
conflicts.forEach(c => {
  if (c.summerConflict) {
    const key = `Summer: ${c.summer_climate_actual} → ${c.summerInferred}`;
    mismatches[key] = (mismatches[key] || 0) + 1;
  }
  if (c.winterConflict) {
    const key = `Winter: ${c.winter_climate_actual} → ${c.winterInferred}`;
    mismatches[key] = (mismatches[key] || 0) + 1;
  }
});

Object.entries(mismatches)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .forEach(([mismatch, count]) => {
    console.log(`  ${mismatch}: ${count} occurrences`);
  });

process.exit(0);