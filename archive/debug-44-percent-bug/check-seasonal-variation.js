import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSeasonalVariation() {
  console.log('🌡️ CHECKING SEASONAL_VARIATION_ACTUAL DATA\n');
  console.log('==========================================\n');
  
  // Get all towns with their seasonal data
  const { data: towns, error } = await supabase
    .from('towns')
    .select('id, name, country, seasonal_variation_actual, climate')
    .order('country, name');
    
  if (error) {
    console.error('Error fetching towns:', error);
    return;
  }
  
  console.log(`Total towns: ${towns.length}\n`);
  
  // Analyze seasonal variation data
  const stats = {
    total: towns.length,
    hasData: 0,
    nullData: 0,
    uniqueValues: new Set(),
    byValue: {}
  };
  
  for (const town of towns) {
    if (town.seasonal_variation_actual !== null && town.seasonal_variation_actual !== undefined && town.seasonal_variation_actual !== '') {
      stats.hasData++;
      stats.uniqueValues.add(town.seasonal_variation_actual);
      
      if (!stats.byValue[town.seasonal_variation_actual]) {
        stats.byValue[town.seasonal_variation_actual] = [];
      }
      stats.byValue[town.seasonal_variation_actual].push(`${town.name}, ${town.country}`);
    } else {
      stats.nullData++;
    }
  }
  
  console.log('📊 STATISTICS:\n');
  console.log(`Towns with seasonal data: ${stats.hasData}`);
  console.log(`Towns without seasonal data: ${stats.nullData}`);
  console.log(`Unique values: ${stats.uniqueValues.size}\n`);
  
  if (stats.uniqueValues.size > 0) {
    console.log('🔍 UNIQUE VALUES:\n');
    const sortedValues = Array.from(stats.uniqueValues).sort();
    for (const value of sortedValues) {
      console.log(`"${value}" - ${stats.byValue[value].length} towns`);
    }
  }
  
  // Show sample of missing data
  console.log('\n❌ SAMPLE OF TOWNS WITHOUT SEASONAL DATA:\n');
  const noData = towns.filter(t => !t.seasonal_variation_actual);
  for (let i = 0; i < Math.min(30, noData.length); i++) {
    const town = noData[i];
    console.log(`${town.name}, ${town.country} - Climate: "${town.climate}"`);
  }
  
  // Check for patterns
  console.log('\n🌍 BY COUNTRY (showing countries with most missing data):\n');
  const byCountry = {};
  noData.forEach(t => {
    byCountry[t.country] = (byCountry[t.country] || 0) + 1;
  });
  
  Object.entries(byCountry)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .forEach(([country, count]) => {
      console.log(`${country}: ${count} towns missing data`);
    });
}

// Run check
checkSeasonalVariation().catch(console.error);