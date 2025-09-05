#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.VITE_SUPABASE_ANON_KEY'
);

async function checkTownCountries() {
  console.log('🔍 Checking town-country associations in the database...\n');

  // 1. First, get all towns with their countries
  const { data: allTowns, error } = await supabase
    .from('towns')
    .select('id, name, country, state_code, region_lvl2')
    .order('country', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching towns:', error);
    return;
  }

  console.log(`Total towns in database: ${allTowns.length}\n`);

  // 2. Check for null or empty countries
  const townsWithoutCountry = allTowns.filter(town => !town.country || town.country.trim() === '');
  if (townsWithoutCountry.length > 0) {
    console.log('❌ Towns WITHOUT a country:');
    townsWithoutCountry.forEach(town => {
      console.log(`  - ${town.name} (ID: ${town.id})`);
    });
    console.log('');
  } else {
    console.log('✅ All towns have a country assigned\n');
  }

  // 3. Group towns by country to see distribution
  const townsByCountry = {};
  allTowns.forEach(town => {
    if (town.country) {
      if (!townsByCountry[town.country]) {
        townsByCountry[town.country] = [];
      }
      townsByCountry[town.country].push(town);
    }
  });

  console.log('📊 Towns by Country:');
  Object.keys(townsByCountry).sort().forEach(country => {
    console.log(`  ${country}: ${townsByCountry[country].length} towns`);
  });
  console.log('');

  // 4. Check for potential mismatches based on common knowledge
  console.log('🔍 Checking for potential country mismatches:');
  
  const potentialMismatches = [];
  
  // Known US cities that should be in United States
  const knownUSCities = ['New Port Richey', 'Gainesville, FL', 'Charleston', 'San Diego', 'Portland'];
  knownUSCities.forEach(cityName => {
    const town = allTowns.find(t => t.name === cityName || t.name.includes(cityName));
    if (town && town.country !== 'United States') {
      potentialMismatches.push({
        name: town.name,
        currentCountry: town.country,
        expectedCountry: 'United States'
      });
    }
  });

  // Check for cities with state codes that don't match their country
  allTowns.forEach(town => {
    // US state codes
    const usStateCodes = ['FL', 'CA', 'TX', 'NY', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI', 'NJ', 'VA', 'WA', 'AZ', 'MA', 'TN', 'IN', 'MO', 'MD', 'WI', 'CO', 'MN', 'SC', 'AL', 'LA', 'KY', 'OR', 'OK', 'CT', 'UT', 'IA', 'NV', 'AR', 'MS', 'KS', 'NM', 'NE', 'WV', 'ID', 'HI', 'NH', 'ME', 'MT', 'RI', 'DE', 'SD', 'ND', 'AK', 'VT', 'WY'];
    
    if (town.state_code && usStateCodes.includes(town.state_code) && town.country !== 'United States') {
      potentialMismatches.push({
        name: town.name,
        currentCountry: town.country,
        expectedCountry: 'United States',
        reason: `Has US state code: ${town.state_code}`
      });
    }
  });

  // Check specific known towns
  const knownTownCountries = {
    'London': 'United Kingdom',
    'Paris': 'France',
    'Rome': 'Italy',
    'Athens': 'Greece',
    'Lisbon': 'Portugal',
    'Porto': 'Portugal',
    'Valencia': 'Spain',
    'Alicante': 'Spain',
    'Split': 'Croatia',
    'Edinburgh': 'United Kingdom',
    'Chiang Mai': 'Thailand',
    'George Town': 'Malaysia',
    'Da Nang': 'Vietnam',
    'Medellin': 'Colombia',
    'Cuenca': 'Ecuador',
    'Ljubljana': 'Slovenia',
    'Riga': 'Latvia',
    'Valletta': 'Malta',
    'Lake Chapala': 'Mexico',
    'San Miguel de Allende': 'Mexico',
    'Merida': 'Mexico',
    'Lemmer': 'Netherlands',
    'Boquete': 'Panama'
  };

  Object.entries(knownTownCountries).forEach(([townName, expectedCountry]) => {
    const town = allTowns.find(t => t.name === townName || t.name.includes(townName));
    if (town && town.country !== expectedCountry) {
      potentialMismatches.push({
        name: town.name,
        currentCountry: town.country,
        expectedCountry: expectedCountry,
        reason: 'Known city-country association'
      });
    }
  });

  if (potentialMismatches.length > 0) {
    console.log('❌ Potential country mismatches found:');
    potentialMismatches.forEach(mismatch => {
      console.log(`  - ${mismatch.name}: currently "${mismatch.currentCountry}", expected "${mismatch.expectedCountry}"`);
      if (mismatch.reason) {
        console.log(`    Reason: ${mismatch.reason}`);
      }
    });
  } else {
    console.log('✅ No obvious country mismatches found');
  }
  console.log('');

  // 5. Check for duplicate country names or variations
  console.log('🔍 Checking for country name variations:');
  const countryVariations = {};
  
  Object.keys(townsByCountry).forEach(country => {
    const normalized = country.toLowerCase().trim();
    if (!countryVariations[normalized]) {
      countryVariations[normalized] = [];
    }
    countryVariations[normalized].push(country);
  });

  const hasVariations = Object.values(countryVariations).some(variations => variations.length > 1);
  if (hasVariations) {
    console.log('⚠️  Country name variations found:');
    Object.entries(countryVariations).forEach(([normalized, variations]) => {
      if (variations.length > 1) {
        console.log(`  - Variations of "${normalized}": ${variations.join(', ')}`);
      }
    });
  } else {
    console.log('✅ No country name variations found');
  }
  console.log('');

  // 6. List any unusual or potentially incorrect country names
  const commonCountries = ['United States', 'Canada', 'Mexico', 'United Kingdom', 'France', 'Spain', 'Italy', 'Germany', 'Netherlands', 'Portugal', 'Greece', 'Croatia', 'Montenegro', 'Slovenia', 'Latvia', 'Malta', 'Thailand', 'Vietnam', 'Malaysia', 'Colombia', 'Ecuador', 'Panama', 'Australia', 'New Zealand'];
  
  const unusualCountries = Object.keys(townsByCountry).filter(country => !commonCountries.includes(country));
  if (unusualCountries.length > 0) {
    console.log('⚠️  Unusual country names (may need verification):');
    unusualCountries.forEach(country => {
      console.log(`  - "${country}" (${townsByCountry[country].length} towns)`);
      // Show first few towns as examples
      townsByCountry[country].slice(0, 3).forEach(town => {
        console.log(`    • ${town.name}`);
      });
    });
  }

  // 7. Final summary
  console.log('\n📊 Summary:');
  console.log(`  - Total towns: ${allTowns.length}`);
  console.log(`  - Total countries: ${Object.keys(townsByCountry).length}`);
  console.log(`  - Towns without country: ${townsWithoutCountry.length}`);
  console.log(`  - Potential mismatches: ${potentialMismatches.length}`);
}

// Run the check
checkTownCountries().catch(console.error);
