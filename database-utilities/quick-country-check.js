#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.VITE_SUPABASE_ANON_KEY'
);

async function quickCheck() {
  console.log('Checking town-country associations...\n');

  // Get all towns grouped by country
  const { data: towns, error } = await supabase
    .from('towns')
    .select('town_name, country, state_code')
    .order('country, name');

  if (error) {
    console.error('Error:', error);
    return;
  }

  // Group by country
  const byCountry = {};
  let noCountry = [];
  
  towns.forEach(town => {
    if (!town.country || town.country.trim() === '') {
      noCountry.push(town.town_name);
    } else {
      if (!byCountry[town.country]) byCountry[town.country] = [];
      byCountry[town.country].push(town.town_name);
    }
  });

  // Show results
  console.log(`Total towns: ${towns.length}\n`);
  
  if (noCountry.length > 0) {
    console.log(`❌ Towns without country (${noCountry.length}):`);
    noCountry.forEach(name => console.log(`  - ${name}`));
    console.log('');
  }

  console.log('Towns by country:');
  Object.keys(byCountry).sort().forEach(country => {
    console.log(`\n${country} (${byCountry[country].length} towns):`);
    byCountry[country].forEach(name => console.log(`  - ${name}`));
  });

  // Check specific known issues
  console.log('\n\nChecking for known issues:');
  
  // Check if US cities have correct country
  const usCities = ['New Port Richey', 'Gainesville, FL'];
  usCities.forEach(city => {
    const town = towns.find(t => t.town_name === city);
    if (town && town.country !== 'United States') {
      console.log(`❌ ${city} is listed as ${town.country}, should be United States`);
    }
  });

  // Check cities with FL state code
  const flCities = towns.filter(t => t.state_code === 'FL');
  flCities.forEach(town => {
    if (town.country !== 'United States') {
      console.log(`❌ ${town.town_name} has FL state code but country is ${town.country}`);
    }
  });
}

quickCheck().catch(console.error);
