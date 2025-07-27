import { createClient } from '@supabase/supabase-js';
import { inferSummerClimate, inferWinterClimate } from './src/utils/climateInference.js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

console.log('TESTING UPDATED CLIMATE INFERENCE WITH MARKETING-FRIENDLY RANGES\n');

// Test cases from our European analysis
const testCases = [
  { name: 'Valencia, Spain', summerTemp: 30, summerLabel: 'hot', winterTemp: 12, winterLabel: 'mild' },
  { name: 'Athens, Greece', summerTemp: 28, summerLabel: 'hot', winterTemp: null, winterLabel: null },
  { name: 'Menton, France', summerTemp: 23, summerLabel: 'warm', winterTemp: null, winterLabel: null },
  { name: 'Lemmer, Netherlands', summerTemp: null, summerLabel: null, winterTemp: 3, winterLabel: 'cool' },
  { name: 'Chania, Greece', summerTemp: 29, summerLabel: 'hot', winterTemp: 15, winterLabel: 'mild' }
];

console.log('Testing specific cases:\n');
testCases.forEach(tc => {
  console.log(`${tc.name}:`);
  
  if (tc.summerTemp !== null) {
    const inferred = inferSummerClimate(tc.summerTemp);
    const match = inferred === tc.summerLabel;
    console.log(`  Summer: ${tc.summerTemp}°C → infers "${inferred}" vs label "${tc.summerLabel}" ${match ? '✅' : '❌'}`);
  }
  
  if (tc.winterTemp !== null) {
    const inferred = inferWinterClimate(tc.winterTemp);
    const match = inferred === tc.winterLabel;
    console.log(`  Winter: ${tc.winterTemp}°C → infers "${inferred}" vs label "${tc.winterLabel}" ${match ? '✅' : '❌'}`);
  }
});

// Now check all European towns
console.log('\n\nChecking all European towns for remaining conflicts...\n');

const { data: towns } = await supabase
  .from('towns')
  .select('name, country, avg_temp_summer, summer_climate_actual, avg_temp_winter, winter_climate_actual')
  .in('country', ['Spain', 'France', 'Italy', 'Greece', 'Portugal', 'Netherlands'])
  .not('avg_temp_summer', 'is', null);

let conflicts = 0;
let matches = 0;

towns?.forEach(town => {
  let hasConflict = false;
  
  if (town.avg_temp_summer && town.summer_climate_actual) {
    const inferred = inferSummerClimate(town.avg_temp_summer);
    if (inferred !== town.summer_climate_actual) {
      if (conflicts === 0) console.log('Remaining conflicts:');
      console.log(`  ${town.name}: Summer ${town.avg_temp_summer}°C infers "${inferred}" but labeled "${town.summer_climate_actual}"`);
      hasConflict = true;
      conflicts++;
    } else {
      matches++;
    }
  }
  
  if (town.avg_temp_winter && town.winter_climate_actual) {
    const inferred = inferWinterClimate(town.avg_temp_winter);
    if (inferred !== town.winter_climate_actual) {
      if (!hasConflict && conflicts === 0) console.log('Remaining conflicts:');
      console.log(`  ${town.name}: Winter ${town.avg_temp_winter}°C infers "${inferred}" but labeled "${town.winter_climate_actual}"`);
      conflicts++;
    } else {
      matches++;
    }
  }
});

console.log(`\nSummary:`);
console.log(`- Matches: ${matches}`);
console.log(`- Conflicts: ${conflicts}`);
console.log(`- Success rate: ${Math.round(matches/(matches+conflicts)*100)}%`);

// Show the new ranges clearly
console.log('\n\nNEW MARKETING-FRIENDLY TEMPERATURE RANGES:');
console.log('Summer:');
console.log('  Cool: < 15°C');
console.log('  Mild: 15-22°C');
console.log('  Warm: 22-28°C');
console.log('  Hot: ≥ 28°C');
console.log('\nWinter:');
console.log('  Cold: < 5°C');
console.log('  Cool: 5-12°C');
console.log('  Mild: ≥ 12°C');

process.exit(0);