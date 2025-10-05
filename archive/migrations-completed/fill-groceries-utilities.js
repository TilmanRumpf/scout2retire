import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function fillGroceriesUtilities() {
  console.log('🛒⚡ Filling groceries and utilities cost data...\n');
  console.log('Groceries: Monthly cost for 1 person (USD)');
  console.log('Utilities: Monthly basic utilities for 85m² apartment (USD)\n');
  
  const { data: towns, error } = await supabase
    .from('towns')
    .select('*')
    .order('country, name');
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  // Cost patterns by country (based on COL and regional data)
  const COUNTRY_COSTS = {
    // Very expensive countries
    'Switzerland': { groceries: 450, utilities: 180 },
    'Norway': { groceries: 400, utilities: 170 },
    'Iceland': { groceries: 380, utilities: 160 },
    'Denmark': { groceries: 350, utilities: 150 },
    'Luxembourg': { groceries: 340, utilities: 145 },
    
    // Expensive countries
    'Singapore': { groceries: 320, utilities: 140 },
    'Hong Kong': { groceries: 310, utilities: 130 },
    'Australia': { groceries: 300, utilities: 120 },
    'New Zealand': { groceries: 290, utilities: 110 },
    'United States': { groceries: 280, utilities: 115 },
    'Canada': { groceries: 270, utilities: 105 },
    'United Kingdom': { groceries: 260, utilities: 140 },
    'Ireland': { groceries: 250, utilities: 130 },
    'Japan': { groceries: 280, utilities: 125 },
    'South Korea': { groceries: 260, utilities: 110 },
    'Israel': { groceries: 270, utilities: 120 },
    'United Arab Emirates': { groceries: 250, utilities: 90 },
    
    // Moderate cost countries
    'France': { groceries: 240, utilities: 115 },
    'Germany': { groceries: 230, utilities: 125 },
    'Netherlands': { groceries: 225, utilities: 120 },
    'Belgium': { groceries: 220, utilities: 115 },
    'Austria': { groceries: 235, utilities: 110 },
    'Italy': { groceries: 210, utilities: 105 },
    'Spain': { groceries: 200, utilities: 95 },
    'Portugal': { groceries: 180, utilities: 85 },
    'Greece': { groceries: 175, utilities: 80 },
    'Cyprus': { groceries: 190, utilities: 90 },
    'Malta': { groceries: 195, utilities: 85 },
    
    // Lower cost developed
    'Czech Republic': { groceries: 170, utilities: 80 },
    'Slovenia': { groceries: 175, utilities: 85 },
    'Estonia': { groceries: 165, utilities: 90 },
    'Poland': { groceries: 150, utilities: 75 },
    'Hungary': { groceries: 145, utilities: 70 },
    'Croatia': { groceries: 155, utilities: 75 },
    'Chile': { groceries: 160, utilities: 65 },
    'Uruguay': { groceries: 170, utilities: 70 },
    'Costa Rica': { groceries: 180, utilities: 60 },
    
    // Lower cost countries
    'Mexico': { groceries: 140, utilities: 50 },
    'Panama': { groceries: 150, utilities: 55 },
    'Ecuador': { groceries: 120, utilities: 40 },
    'Colombia': { groceries: 110, utilities: 45 },
    'Peru': { groceries: 105, utilities: 40 },
    'Brazil': { groceries: 125, utilities: 50 },
    'Argentina': { groceries: 130, utilities: 35 },
    'Paraguay': { groceries: 100, utilities: 35 },
    'Bolivia': { groceries: 95, utilities: 30 },
    
    // Southeast Asia
    'Thailand': { groceries: 130, utilities: 55 },
    'Malaysia': { groceries: 120, utilities: 50 },
    'Vietnam': { groceries: 100, utilities: 45 },
    'Philippines': { groceries: 110, utilities: 40 },
    'Indonesia': { groceries: 95, utilities: 35 },
    'Cambodia': { groceries: 90, utilities: 35 },
    'Laos': { groceries: 85, utilities: 30 },
    
    // Other regions
    'Turkey': { groceries: 125, utilities: 55 },
    'Morocco': { groceries: 110, utilities: 40 },
    'Tunisia': { groceries: 105, utilities: 35 },
    'Egypt': { groceries: 95, utilities: 30 },
    'South Africa': { groceries: 140, utilities: 60 },
    'India': { groceries: 80, utilities: 35 },
    'Nepal': { groceries: 70, utilities: 25 },
    
    // Small/Island nations
    'Barbados': { groceries: 220, utilities: 100 },
    'Bahamas': { groceries: 210, utilities: 110 },
    'Jamaica': { groceries: 180, utilities: 80 },
    'Trinidad and Tobago': { groceries: 170, utilities: 75 },
    'Mauritius': { groceries: 160, utilities: 70 },
    'Fiji': { groceries: 150, utilities: 65 },
    'Samoa': { groceries: 140, utilities: 60 },
    'Tonga': { groceries: 135, utilities: 55 }
  };
  
  // Default if country not listed
  const DEFAULT_COSTS = { groceries: 150, utilities: 60 };
  
  const missingData = towns.filter(t => t.groceries_cost === null || t.utilities_cost === null);
  console.log(`🎯 Found ${missingData.length} towns missing groceries/utilities data\n`);
  
  const updates = [];
  
  missingData.forEach(town => {
    const countryCosts = COUNTRY_COSTS[town.country] || DEFAULT_COSTS;
    let groceries = countryCosts.groceries;
    let utilities = countryCosts.utilities;
    let adjustment = 1.0;
    let source = town.country in COUNTRY_COSTS ? 'country data' : 'default';
    
    // Adjust for city size and characteristics
    if (town.population > 5000000) {
      adjustment = 1.15; // Major cities more expensive
      source += ' + major city';
    }
    else if (town.population > 1000000) {
      adjustment = 1.10; // Large cities
      source += ' + large city';
    }
    else if (town.population > 500000) {
      adjustment = 1.05; // Medium cities
      source += ' + medium city';
    }
    else if (town.population < 50000) {
      adjustment = 0.90; // Small towns cheaper
      source += ' + small town';
    }
    
    // Tourist areas more expensive
    if (town.geographic_features?.includes('Island') || 
        town.expat_community_size === 'large') {
      adjustment *= 1.10;
      source += ' + tourist area';
    }
    
    // Capital cities tend to be more expensive
    if (town.name === town.country || town.name.includes('City')) {
      adjustment *= 1.08;
      source += ' + capital';
    }
    
    // Apply adjustments
    groceries = Math.round(groceries * adjustment);
    utilities = Math.round(utilities * adjustment);
    
    // Use known COL relationships if available
    if (town.cost_of_living_usd && town.typical_monthly_living_cost) {
      // Groceries typically 15-20% of total living costs
      const estimatedGroceries = Math.round(town.typical_monthly_living_cost * 0.175);
      // Utilities typically 4-6% of total living costs
      const estimatedUtilities = Math.round(town.typical_monthly_living_cost * 0.05);
      
      // Use average of country-based and COL-based estimates
      groceries = Math.round((groceries + estimatedGroceries) / 2);
      utilities = Math.round((utilities + estimatedUtilities) / 2);
      source += ' + COL adjusted';
    }
    
    console.log(`${town.name}, ${town.country}: $${groceries} groceries, $${utilities} utilities (${source})`);
    
    updates.push({
      id: town.id,
      groceries_cost: groceries,
      utilities_cost: utilities
    });
  });
  
  console.log(`\n💾 Ready to update ${updates.length} towns`);
  
  // Update in batches
  const BATCH_SIZE = 10;
  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE);
    
    for (const update of batch) {
      const { error } = await supabase
        .from('towns')
        .update({ 
          groceries_cost: update.groceries_cost,
          utilities_cost: update.utilities_cost
        })
        .eq('id', update.id);
        
      if (error) {
        console.error(`❌ Error updating ${update.id}:`, error);
      }
    }
    
    console.log(`✅ Updated batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(updates.length/BATCH_SIZE)}`);
  }
  
  console.log('\n🎉 Groceries and utilities cost update complete!');
  
  // Summary statistics
  const { data: allTowns } = await supabase
    .from('towns')
    .select('groceries_cost, utilities_cost');
    
  const groceriesCosts = allTowns.map(t => t.groceries_cost).filter(c => c !== null);
  const utilitiesCosts = allTowns.map(t => t.utilities_cost).filter(c => c !== null);
  
  const avgGroceries = Math.round(groceriesCosts.reduce((a, b) => a + b, 0) / groceriesCosts.length);
  const avgUtilities = Math.round(utilitiesCosts.reduce((a, b) => a + b, 0) / utilitiesCosts.length);
  
  const minGroceries = Math.min(...groceriesCosts);
  const maxGroceries = Math.max(...groceriesCosts);
  const minUtilities = Math.min(...utilitiesCosts);
  const maxUtilities = Math.max(...utilitiesCosts);
  
  console.log('\n📊 Cost Distribution:');
  console.log(`\nGroceries (monthly):`)
  console.log(`  Average: $${avgGroceries}`);
  console.log(`  Range: $${minGroceries} - $${maxGroceries}`);
  console.log(`  Low (<$150): ${groceriesCosts.filter(c => c < 150).length} towns`);
  console.log(`  Medium ($150-250): ${groceriesCosts.filter(c => c >= 150 && c <= 250).length} towns`);
  console.log(`  High (>$250): ${groceriesCosts.filter(c => c > 250).length} towns`);
  
  console.log(`\nUtilities (monthly):`);
  console.log(`  Average: $${avgUtilities}`);
  console.log(`  Range: $${minUtilities} - $${maxUtilities}`);
  console.log(`  Low (<$60): ${utilitiesCosts.filter(c => c < 60).length} towns`);
  console.log(`  Medium ($60-100): ${utilitiesCosts.filter(c => c >= 60 && c <= 100).length} towns`);
  console.log(`  High (>$100): ${utilitiesCosts.filter(c => c > 100).length} towns`);
}

fillGroceriesUtilities();