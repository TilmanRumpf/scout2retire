import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfc3JvbGUiLCJpYXQiOjE3NDg3MDYzNDUsImV4cCI6MjA2NDI4MjM0NX0.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

console.log('ANALYZING EUROPEAN TOWNS WITH CONFLICTING CLIMATE DATA\n');

// Get all towns first
const { data: allTowns } = await supabase
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
  `);

// Filter for European countries manually
const europeanCountries = [
  'Spain', 'France', 'Italy', 'Greece', 'Portugal',
  'Netherlands', 'Germany', 'Switzerland', 'Austria',
  'Belgium', 'United Kingdom', 'Ireland', 'Malta',
  'Croatia', 'Poland', 'Czech Republic', 'Hungary'
];

const europeanTowns = allTowns?.filter(town => 
  europeanCountries.includes(town.country)
);

console.log(`Found ${europeanTowns?.length} European towns out of ${allTowns?.length} total towns\n`);

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

// Find conflicts among European towns
const conflicts = [];

europeanTowns?.forEach(town => {
  if (!town.avg_temp_summer && !town.avg_temp_winter) return; // Skip if no temperature data
  
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
    console.log(`  Database label: "${town.summer_climate_actual}"`);
    console.log(`  Should be: "${town.summerInferred}"`);
    
    // Analyze discrepancy
    const tempDiff = Math.abs(town.avg_temp_summer - 
      (town.summer_climate_actual === 'hot' ? 32 :
       town.summer_climate_actual === 'warm' ? 26 :
       town.summer_climate_actual === 'mild' ? 20 : 10));
    console.log(`  Discrepancy: ~${Math.round(tempDiff)}°C difference from expected range`);
    
    if (town.avg_temp_summer >= 22 && town.avg_temp_summer <= 24) {
      console.log(`  ⚠️  Note: Temperature in overlap zone (22-24°C) between mild/warm`);
    } else if (town.avg_temp_summer >= 28 && town.avg_temp_summer <= 32) {
      console.log(`  ⚠️  Note: Temperature in overlap zone (28-32°C) between warm/hot`);
    }
  }
  
  if (town.winterConflict) {
    console.log(`\nWINTER CONFLICT:`);
    console.log(`  Temperature: ${town.avg_temp_winter}°C`);
    console.log(`  Database label: "${town.winter_climate_actual}"`);
    console.log(`  Should be: "${town.winterInferred}"`);
    
    // Analyze discrepancy
    const tempDiff = Math.abs(town.avg_temp_winter - 
      (town.winter_climate_actual === 'mild' ? 15 :
       town.winter_climate_actual === 'cool' ? 8 : 2));
    console.log(`  Discrepancy: ~${Math.round(tempDiff)}°C difference from expected range`);
    
    if (town.avg_temp_winter >= 3 && town.avg_temp_winter <= 5) {
      console.log(`  ⚠️  Note: Temperature in overlap zone (3-5°C) between cold/cool`);
    } else if (town.avg_temp_winter >= 12 && town.avg_temp_winter <= 15) {
      console.log(`  ⚠️  Note: Temperature in overlap zone (12-15°C) between cool/mild`);
    }
  }
  
  // Add geographic context
  if (town.geographic_features_actual?.length > 0) {
    console.log(`\n  Geographic context: ${town.geographic_features_actual.join(', ')}`);
  }
  
  // Add climate description snippet
  if (town.climate_description) {
    const desc = town.climate_description.substring(0, 100);
    console.log(`  Climate description: "${desc}${desc.length < town.climate_description.length ? '...' : ''}"`);
  }
});

// Summary statistics
console.log('\n\nSUMMARY STATISTICS:');
console.log('='.repeat(80));
const summerConflicts = conflicts.filter(c => c.summerConflict).length;
const winterConflicts = conflicts.filter(c => c.winterConflict).length;
const bothConflicts = conflicts.filter(c => c.summerConflict && c.winterConflict).length;

console.log(`Total European towns analyzed: ${europeanTowns?.length}`);
console.log(`European towns with temperature data: ${europeanTowns?.filter(t => t.avg_temp_summer || t.avg_temp_winter).length}`);
console.log(`Towns with conflicts: ${conflicts.length} (${Math.round(conflicts.length/europeanTowns?.length*100)}%)`);
console.log(`  - Summer conflicts only: ${summerConflicts - bothConflicts}`);
console.log(`  - Winter conflicts only: ${winterConflicts - bothConflicts}`);
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
    const total = europeanTowns?.filter(t => t.country === country).length || 0;
    console.log(`  ${country}: ${count}/${total} towns (${Math.round(count/total*100)}%)`);
  });

// Most common mismatches
console.log('\nMost common mismatches:');
const mismatches = {};
conflicts.forEach(c => {
  if (c.summerConflict) {
    const key = `Summer: "${c.summer_climate_actual}" → "${c.summerInferred.split('/')[0]}"`;
    mismatches[key] = (mismatches[key] || 0) + 1;
  }
  if (c.winterConflict) {
    const key = `Winter: "${c.winter_climate_actual}" → "${c.winterInferred.split('/')[0]}"`;
    mismatches[key] = (mismatches[key] || 0) + 1;
  }
});

Object.entries(mismatches)
  .sort((a, b) => b[1] - a[1])
  .forEach(([mismatch, count]) => {
    console.log(`  ${mismatch}: ${count} occurrences`);
  });

process.exit(0);