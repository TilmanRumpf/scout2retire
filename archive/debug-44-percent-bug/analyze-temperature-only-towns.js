import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

console.log('ANALYZING TEMPERATURE-ONLY TOWNS\n');

// Get towns with temperature data but missing climate labels
const { data: towns } = await supabase
  .from('towns')
  .select(`
    name,
    country,
    summer_climate_actual,
    winter_climate_actual,
    avg_temp_summer,
    avg_temp_winter,
    climate_description
  `);

// Categorize towns
const temperatureOnlyTowns = [];
const conflictingData = [];
const perfectData = [];
const noClimateData = [];

towns?.forEach(town => {
  const hasSummerTemp = town.avg_temp_summer !== null;
  const hasWinterTemp = town.avg_temp_winter !== null;
  const hasSummerLabel = town.summer_climate_actual !== null;
  const hasWinterLabel = town.winter_climate_actual !== null;
  
  if ((hasSummerTemp || hasWinterTemp) && (!hasSummerLabel || !hasWinterLabel)) {
    temperatureOnlyTowns.push(town);
  }
  
  // Check for conflicts between temperature and label
  if (hasSummerTemp && hasSummerLabel) {
    const inferredFromTemp = inferSummerClimate(town.avg_temp_summer);
    if (inferredFromTemp !== town.summer_climate_actual) {
      conflictingData.push({
        name: town.name,
        country: town.country,
        temp: town.avg_temp_summer,
        label: town.summer_climate_actual,
        shouldBe: inferredFromTemp,
        season: 'summer'
      });
    }
  }
  
  if (hasWinterTemp && hasWinterLabel) {
    const inferredFromTemp = inferWinterClimate(town.avg_temp_winter);
    if (inferredFromTemp !== town.winter_climate_actual) {
      conflictingData.push({
        name: town.name,
        country: town.country,
        temp: town.avg_temp_winter,
        label: town.winter_climate_actual,
        shouldBe: inferredFromTemp,
        season: 'winter'
      });
    }
  }
  
  if (hasSummerTemp && hasWinterTemp && hasSummerLabel && hasWinterLabel) {
    perfectData.push(town);
  }
  
  if (!hasSummerTemp && !hasWinterTemp && !hasSummerLabel && !hasWinterLabel) {
    noClimateData.push(town);
  }
});

// Helper functions for inference
function inferSummerClimate(temp) {
  if (temp < 15) return 'cool';
  if (temp <= 24) return 'mild';
  if (temp <= 32) return 'warm';
  return 'hot';
}

function inferWinterClimate(temp) {
  if (temp < 5) return 'cold';
  if (temp <= 15) return 'cool';
  return 'mild';
}

console.log('TEMPERATURE DATA ANALYSIS:');
console.log('='.repeat(50));
console.log(`Total towns: ${towns?.length}`);
console.log(`Towns with complete data: ${perfectData.length}`);
console.log(`Towns with temperature but missing labels: ${temperatureOnlyTowns.length}`);
console.log(`Towns with conflicting data: ${conflictingData.length}`);
console.log(`Towns with no climate data: ${noClimateData.length}`);

console.log('\n\nTEMPERATURE-ONLY TOWNS:');
console.log('='.repeat(50));
temperatureOnlyTowns.forEach(town => {
  console.log(`\n${town.name}, ${town.country}:`);
  if (town.avg_temp_summer !== null) {
    const inferred = inferSummerClimate(town.avg_temp_summer);
    console.log(`  Summer: ${town.avg_temp_summer}°C → should be "${inferred}" (currently: ${town.summer_climate_actual || 'missing'})`);
  }
  if (town.avg_temp_winter !== null) {
    const inferred = inferWinterClimate(town.avg_temp_winter);
    console.log(`  Winter: ${town.avg_temp_winter}°C → should be "${inferred}" (currently: ${town.winter_climate_actual || 'missing'})`);
  }
  if (town.climate_description) {
    console.log(`  Description: "${town.climate_description.substring(0, 60)}..."`);
  }
});

console.log('\n\nCONFLICTING DATA (Temperature vs Label):');
console.log('='.repeat(50));
conflictingData.slice(0, 10).forEach(conflict => {
  console.log(`\n${conflict.name}, ${conflict.country}:`);
  console.log(`  ${conflict.season}: ${conflict.temp}°C labeled as "${conflict.label}" but should be "${conflict.shouldBe}"`);
});

console.log('\n\nTEMPERATURE RANGES FOR REFERENCE:');
console.log('='.repeat(50));
console.log('Summer Climate:');
console.log('  Cool: < 15°C');
console.log('  Mild: 15-24°C');
console.log('  Warm: 25-32°C');
console.log('  Hot: > 32°C');
console.log('\nWinter Climate:');
console.log('  Cold: < 5°C');
console.log('  Cool: 5-15°C');
console.log('  Mild: > 15°C');

// Analyze overlap zones
console.log('\n\nOVERLAP ZONE ANALYSIS:');
console.log('='.repeat(50));
const summerOverlap = towns?.filter(t => 
  t.avg_temp_summer >= 22 && t.avg_temp_summer <= 24
);
const winterOverlap = towns?.filter(t => 
  t.avg_temp_winter >= 12 && t.avg_temp_winter <= 15
);

console.log(`Summer overlap (22-24°C): ${summerOverlap?.length} towns`);
console.log(`Winter overlap (12-15°C): ${winterOverlap?.length} towns`);

console.log('\n\nRECOMMENDATIONS:');
console.log('='.repeat(50));
console.log('1. For temperature-only towns: Use temperature ranges to infer climate labels');
console.log('2. For conflicting data: Prioritize temperature data over labels');
console.log('3. For overlap zones: Consider geographic location or climate description');
console.log('4. Document when climate is inferred vs actual');

process.exit(0);