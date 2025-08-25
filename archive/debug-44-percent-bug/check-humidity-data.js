import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkHumidityData() {
  console.log('🌡️ CHECKING HUMIDITY_LEVEL_ACTUAL DATA\n');
  console.log('=========================================\n');
  
  // Get all towns with their humidity data
  const { data: towns, error } = await supabase
    .from('towns')
    .select('id, name, country, humidity_level_actual, climate')
    .order('country, name');
    
  if (error) {
    console.error('Error fetching towns:', error);
    return;
  }
  
  console.log(`Total towns: ${towns.length}\n`);
  
  // Analyze humidity data
  const stats = {
    total: towns.length,
    hasHumidity: 0,
    nullHumidity: 0,
    uniqueValues: new Set(),
    byValue: {}
  };
  
  for (const town of towns) {
    if (town.humidity_level_actual !== null && town.humidity_level_actual !== undefined) {
      stats.hasHumidity++;
      stats.uniqueValues.add(town.humidity_level_actual);
      
      if (!stats.byValue[town.humidity_level_actual]) {
        stats.byValue[town.humidity_level_actual] = [];
      }
      stats.byValue[town.humidity_level_actual].push(`${town.name}, ${town.country}`);
    } else {
      stats.nullHumidity++;
    }
  }
  
  console.log('📊 STATISTICS:\n');
  console.log(`Towns with humidity data: ${stats.hasHumidity}`);
  console.log(`Towns without humidity data: ${stats.nullHumidity}`);
  console.log(`Unique humidity values: ${stats.uniqueValues.size}\n`);
  
  console.log('🔍 UNIQUE VALUES:\n');
  const sortedValues = Array.from(stats.uniqueValues).sort();
  for (const value of sortedValues) {
    console.log(`"${value}" - ${stats.byValue[value].length} towns`);
  }
  
  // Show sample of current data
  console.log('\n📋 SAMPLE DATA (first 20 towns):\n');
  for (let i = 0; i < Math.min(20, towns.length); i++) {
    const town = towns[i];
    console.log(`${town.name}, ${town.country}: humidity="${town.humidity_level_actual}" climate="${town.climate}"`);
  }
  
  // Check for inconsistencies
  console.log('\n⚠️ POTENTIAL ISSUES:\n');
  
  // Check tropical places without high humidity
  const tropicalNoHumidity = towns.filter(t => 
    t.climate && t.climate.toLowerCase().includes('tropical') && 
    (!t.humidity_level_actual || !t.humidity_level_actual.toLowerCase().includes('high'))
  );
  
  if (tropicalNoHumidity.length > 0) {
    console.log(`Tropical places without high humidity (${tropicalNoHumidity.length}):`);
    tropicalNoHumidity.slice(0, 5).forEach(t => 
      console.log(`  - ${t.name}, ${t.country}: humidity="${t.humidity_level_actual}"`));
  }
  
  // Check desert places with high humidity
  const desertHighHumidity = towns.filter(t => 
    t.climate && t.climate.toLowerCase().includes('desert') && 
    t.humidity_level_actual && t.humidity_level_actual.toLowerCase().includes('high')
  );
  
  if (desertHighHumidity.length > 0) {
    console.log(`\nDesert places with high humidity (${desertHighHumidity.length}):`);
    desertHighHumidity.forEach(t => 
      console.log(`  - ${t.name}, ${t.country}`));
  }
}

// Run check
checkHumidityData().catch(console.error);