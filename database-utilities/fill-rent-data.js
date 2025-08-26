import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function fillRentData() {
  console.log('🏠 Filling missing rent data...\n');
  
  const { data: towns, error } = await supabase
    .from('towns')
    .select('*')
    .order('country, name');
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  // Calculate rent ratios by country from existing data
  const countryRatios = {};
  const countryRents = {};
  
  towns.forEach(t => {
    if (t.rent_1bed && t.cost_of_living_usd) {
      if (!countryRatios[t.country]) {
        countryRatios[t.country] = [];
        countryRents[t.country] = [];
      }
      countryRatios[t.country].push(t.rent_1bed / t.cost_of_living_usd);
      countryRents[t.country].push(t.rent_1bed);
    }
  });
  
  // Calculate averages
  const countryAvgRatio = {};
  const countryAvgRent = {};
  
  for (const country in countryRatios) {
    countryAvgRatio[country] = countryRatios[country].reduce((a,b) => a+b, 0) / countryRatios[country].length;
    countryAvgRent[country] = Math.round(countryRents[country].reduce((a,b) => a+b, 0) / countryRents[country].length);
  }
  
  console.log('📊 Country rent patterns:\n');
  Object.entries(countryAvgRatio)
    .sort((a,b) => a[0].localeCompare(b[0]))
    .slice(0, 10)
    .forEach(([country, ratio]) => {
      console.log(`${country}: Rent is ${(ratio * 100).toFixed(0)}% of COL, avg rent: $${countryAvgRent[country]}`);
    });
  
  // Default ratios for countries without data
  const DEFAULT_RATIOS = {
    // Expensive countries
    'United States': 0.40,
    'Canada': 0.38,
    'Australia': 0.42,
    'New Zealand': 0.40,
    'United Kingdom': 0.45,
    'Switzerland': 0.45,
    'Singapore': 0.50,
    
    // Moderate countries
    'France': 0.38,
    'Germany': 0.35,
    'Netherlands': 0.40,
    'Belgium': 0.35,
    'Italy': 0.35,
    'Spain': 0.33,
    'Portugal': 0.30,
    'Greece': 0.28,
    
    // Affordable countries
    'Mexico': 0.25,
    'Thailand': 0.28,
    'Vietnam': 0.30,
    'Philippines': 0.25,
    'Malaysia': 0.25,
    'Ecuador': 0.22,
    'Colombia': 0.25,
    
    // Default
    'default': 0.35
  };
  
  // Find towns missing rent
  const missingRent = towns.filter(t => !t.rent_1bed);
  console.log(`\n🎯 Found ${missingRent.length} towns missing rent data\n`);
  
  const updates = [];
  let method1Count = 0, method2Count = 0, method3Count = 0;
  
  missingRent.forEach(town => {
    let rent;
    let method;
    
    // Method 1: Use cost_of_living with ratio
    if (town.cost_of_living_usd) {
      const ratio = countryAvgRatio[town.country] || DEFAULT_RATIOS[town.country] || DEFAULT_RATIOS.default;
      rent = Math.round(town.cost_of_living_usd * ratio);
      method = `COL × ${(ratio * 100).toFixed(0)}%`;
      method1Count++;
    }
    // Method 2: Use country average
    else if (countryAvgRent[town.country]) {
      rent = countryAvgRent[town.country];
      // Adjust for city size
      if (town.population > 1000000) rent = Math.round(rent * 1.2);
      else if (town.population < 50000) rent = Math.round(rent * 0.8);
      method = 'country avg';
      method2Count++;
    }
    // Method 3: Regional estimates
    else {
      // Base estimates by region
      const regionalEstimates = {
        'United States': 1200,
        'Canada': 1000,
        'Australia': 1100,
        'New Zealand': 900,
        'United Kingdom': 1000,
        'Western Europe': 800,
        'Southern Europe': 600,
        'Eastern Europe': 400,
        'Southeast Asia': 400,
        'Latin America': 500,
        'Caribbean': 800,
        'Middle East': 700,
        'Africa': 600,
        'Pacific Islands': 700
      };
      
      // Determine region
      let region = 'default';
      if (['United States', 'Canada', 'Australia', 'New Zealand', 'United Kingdom'].includes(town.country)) {
        region = town.country;
      } else if (['France', 'Germany', 'Netherlands', 'Belgium', 'Austria', 'Switzerland'].includes(town.country)) {
        region = 'Western Europe';
      } else if (['Spain', 'Portugal', 'Italy', 'Greece', 'Croatia', 'Malta'].includes(town.country)) {
        region = 'Southern Europe';
      } else if (['Thailand', 'Vietnam', 'Malaysia', 'Philippines', 'Cambodia', 'Laos'].includes(town.country)) {
        region = 'Southeast Asia';
      } else if (['Mexico', 'Ecuador', 'Colombia', 'Chile', 'Argentina', 'Uruguay', 'Costa Rica'].includes(town.country)) {
        region = 'Latin America';
      }
      
      rent = regionalEstimates[region] || 600;
      // Adjust for city size
      if (town.population > 1000000) rent = Math.round(rent * 1.3);
      else if (town.population < 50000) rent = Math.round(rent * 0.7);
      method = 'regional est';
      method3Count++;
    }
    
    console.log(`${town.name}, ${town.country}: $${rent}/mo (${method})`);
    
    updates.push({
      id: town.id,
      rent_1bed: rent
    });
  });
  
  console.log(`\n📊 Estimation methods used:`);
  console.log(`- From cost_of_living: ${method1Count}`);
  console.log(`- Country average: ${method2Count}`);
  console.log(`- Regional estimate: ${method3Count}`);
  
  console.log(`\n💾 Ready to update ${updates.length} towns with rent estimates`);
  
  // Update in batches
  const BATCH_SIZE = 10;
  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE);
    
    for (const update of batch) {
      const { error } = await supabase
        .from('towns')
        .update({ rent_1bed: update.rent_1bed })
        .eq('id', update.id);
        
      if (error) {
        console.error(`❌ Error updating ${update.id}:`, error);
      }
    }
    
    console.log(`✅ Updated batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(updates.length/BATCH_SIZE)}`);
  }
  
  console.log('\n🎉 Rent data update complete!');
  
  // Verify
  const { data: verification } = await supabase
    .from('towns')
    .select('rent_1bed')
    .is('rent_1bed', null);
    
  console.log(`\n📊 Remaining towns without rent: ${verification?.length || 0}`);
}

fillRentData();