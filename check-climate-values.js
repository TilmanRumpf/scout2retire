import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function checkClimateValues() {
  // Check summer and winter climate actual values
  console.log('🌡️ Checking climate categorical values...\n');

  // Get unique values for summer_climate_actual
  const { data: summerValues } = await supabase
    .from('towns')
    .select('summer_climate_actual')
    .not('summer_climate_actual', 'is', null);

  const uniqueSummer = [...new Set(summerValues?.map(t => t.summer_climate_actual))].sort();
  console.log('Summer Climate Actual values found:');
  uniqueSummer.forEach(v => console.log(`  - "${v}"`));

  // Get unique values for winter_climate_actual
  const { data: winterValues } = await supabase
    .from('towns')
    .select('winter_climate_actual')
    .not('winter_climate_actual', 'is', null);

  const uniqueWinter = [...new Set(winterValues?.map(t => t.winter_climate_actual))].sort();
  console.log('\nWinter Climate Actual values found:');
  uniqueWinter.forEach(v => console.log(`  - "${v}"`));

  // Check humidity_level_actual
  const { data: humidityValues } = await supabase
    .from('towns')
    .select('humidity_level_actual')
    .not('humidity_level_actual', 'is', null);

  const uniqueHumidity = [...new Set(humidityValues?.map(t => t.humidity_level_actual))].sort();
  console.log('\nHumidity Level Actual values found:');
  uniqueHumidity.forEach(v => console.log(`  - "${v}"`));

  // Check Nova Scotia towns specifically
  console.log('\n\n--- Nova Scotia Towns ---');
  const { data: nsTowns } = await supabase
    .from('towns')
    .select('name, summer_climate_actual, winter_climate_actual')
    .or('state_code.eq.NS,region.ilike.%nova scotia%')
    .limit(5);

  nsTowns?.forEach(town => {
    console.log(`${town.name}:`);
    console.log(`  summer: "${town.summer_climate_actual}"`);
    console.log(`  winter: "${town.winter_climate_actual}"`);
  });

  // Check Bubaque
  console.log('\n--- Bubaque ---');
  const { data: bubaque } = await supabase
    .from('towns')
    .select('name, summer_climate_actual, winter_climate_actual')
    .eq('name', 'Bubaque')
    .single();

  if (bubaque) {
    console.log(`${bubaque.name}:`);
    console.log(`  summer: "${bubaque.summer_climate_actual}"`);
    console.log(`  winter: "${bubaque.winter_climate_actual}"`);
  }
}

checkClimateValues();