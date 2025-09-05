#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://axlruvvsjepsulcbqlho.supabase.co';
const supabaseKey = 'process.env.SUPABASE_SERVICE_ROLE_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function finalAudit() {
  console.log('📊 FINAL HOBBY DATA QUALITY AUDIT\n');
  
  // Get all towns with their hobby counts
  const { data: towns } = await supabase
    .from('towns')
    .select('name, country, population, top_hobbies, distance_to_ocean_km, distance_to_urban_center')
    .order('population', { ascending: false });
  
  // Analyze hobby distribution
  const stats = {
    total: towns.length,
    withHobbies: 0,
    withoutHobbies: 0,
    hobbyCountDistribution: {},
    avgHobbiesPerTown: 0,
    topUrbanCities: [],
    coastalCities: [],
    limitedData: []
  };
  
  let totalHobbies = 0;
  
  for (const town of towns) {
    if (town.top_hobbies && town.top_hobbies.length > 0) {
      stats.withHobbies++;
      const count = town.top_hobbies.length;
      totalHobbies += count;
      
      // Track distribution
      if (!stats.hobbyCountDistribution[count]) {
        stats.hobbyCountDistribution[count] = 0;
      }
      stats.hobbyCountDistribution[count]++;
      
      // Track limited data (5 or fewer hobbies)
      if (count <= 5) {
        stats.limitedData.push({
          name: town.name,
          country: town.country,
          hobbies: count,
          population: town.population
        });
      }
      
      // Track top urban cities
      if (town.population >= 100000 && stats.topUrbanCities.length < 10) {
        stats.topUrbanCities.push({
          name: town.name,
          country: town.country,
          population: town.population,
          hobbies: count
        });
      }
      
      // Track coastal cities
      if (town.distance_to_ocean_km === 0 && stats.coastalCities.length < 10) {
        stats.coastalCities.push({
          name: town.name,
          country: town.country,
          hobbies: count
        });
      }
    } else {
      stats.withoutHobbies++;
    }
  }
  
  stats.avgHobbiesPerTown = Math.round(totalHobbies / stats.withHobbies * 10) / 10;
  
  // Display results
  console.log('📈 OVERALL STATISTICS:');
  console.log(`Total towns: ${stats.total}`);
  console.log(`With hobbies: ${stats.withHobbies} (${Math.round(stats.withHobbies/stats.total*100)}%)`);
  console.log(`Without hobbies: ${stats.withoutHobbies} (${Math.round(stats.withoutHobbies/stats.total*100)}%)`);
  console.log(`Average hobbies per town: ${stats.avgHobbiesPerTown}\n`);
  
  console.log('🎯 HOBBY COUNT DISTRIBUTION:');
  const sortedCounts = Object.keys(stats.hobbyCountDistribution).sort((a, b) => a - b);
  for (const count of sortedCounts) {
    const num = stats.hobbyCountDistribution[count];
    const bar = '█'.repeat(Math.min(num / 5, 20));
    console.log(`  ${count.padStart(2)} hobbies: ${bar} ${num} towns`);
  }
  
  console.log('\n🏙️ TOP URBAN CITIES (100k+ population):');
  for (const city of stats.topUrbanCities) {
    console.log(`  ${city.name}, ${city.country}: ${city.population.toLocaleString()} pop, ${city.hobbies} hobbies`);
  }
  
  console.log('\n🏖️ SAMPLE COASTAL CITIES:');
  for (const city of stats.coastalCities) {
    console.log(`  ${city.name}, ${city.country}: ${city.hobbies} hobbies`);
  }
  
  if (stats.limitedData.length > 0) {
    console.log('\n⚠️ TOWNS WITH LIMITED HOBBY DATA (≤5):');
    console.log(`Found ${stats.limitedData.length} towns with 5 or fewer hobbies`);
    if (stats.limitedData.length <= 20) {
      for (const town of stats.limitedData) {
        console.log(`  ${town.name}, ${town.country}: only ${town.hobbies} hobbies (pop: ${town.population?.toLocaleString() || 'N/A'})`);
      }
    } else {
      // Show first 10
      for (const town of stats.limitedData.slice(0, 10)) {
        console.log(`  ${town.name}, ${town.country}: only ${town.hobbies} hobbies`);
      }
      console.log(`  ... and ${stats.limitedData.length - 10} more`);
    }
  }
  
  // Check Spanish cities specifically
  console.log('\n🇪🇸 SPANISH PRIORITY CITIES CHECK:');
  const spanishCities = ['Alicante', 'Valencia', 'Barcelona', 'Malaga', 'Marbella', 'Granada'];
  
  for (const cityName of spanishCities) {
    const { data: city } = await supabase
      .from('towns')
      .select('name, population, top_hobbies')
      .eq('name', cityName)
      .eq('country', 'Spain')
      .single();
    
    if (city) {
      console.log(`  ✅ ${city.name}: ${city.top_hobbies.length} hobbies (pop: ${city.population?.toLocaleString()})`);
    }
  }
  
  console.log('\n✅ AUDIT COMPLETE!');
  
  // Final assessment
  if (stats.avgHobbiesPerTown >= 8 && stats.limitedData.length < 20) {
    console.log('\n🎉 EXCELLENT DATA QUALITY!');
    console.log('Most towns have comprehensive hobby data.');
  } else if (stats.avgHobbiesPerTown >= 6) {
    console.log('\n👍 GOOD DATA QUALITY');
    console.log('Towns have reasonable hobby coverage.');
  } else {
    console.log('\n⚠️ DATA NEEDS IMPROVEMENT');
    console.log('Many towns need more hobby data.');
  }
}

// Run the audit
finalAudit().catch(console.error);