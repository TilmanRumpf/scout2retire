import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Round UP to nearest 50 (conservative)
function roundUpToNearest50(value) {
  return Math.ceil(value / 50) * 50;
}

// Conservative transport costs by country/city size
function getTransportCost(town) {
  const pop = town.population || 50000;
  const country = town.country;
  
  // US cities need cars - higher transport costs
  if (country === 'United States') {
    if (pop > 500000) return 250;  // Some public transport
    return 400;  // Need car, insurance, gas
  }
  
  // European cities with good public transport
  if (['Netherlands', 'Germany', 'France', 'Belgium', 'Austria', 'Czech Republic'].includes(country)) {
    if (pop > 200000) return 100;  // Good public transport
    return 150;  // Mix of public/occasional taxi
  }
  
  // Countries where cars are essential
  if (['Australia', 'Canada', 'New Zealand'].includes(country)) {
    return 350;  // Car needed
  }
  
  // Latin America - cheaper transport
  if (['Mexico', 'Colombia', 'Argentina', 'Chile', 'Peru', 'Ecuador'].includes(country)) {
    return 80;  // Cheap public transport/taxis
  }
  
  // Asia - very cheap transport
  if (['Thailand', 'Vietnam', 'Philippines', 'Malaysia', 'Indonesia'].includes(country)) {
    return 60;  // Very cheap
  }
  
  // Small islands - minimal transport
  if (town.geographic_features?.includes('island') && pop < 50000) {
    return 50;  // Walking/minimal transport
  }
  
  // Default
  return 120;
}

// Entertainment/social costs based on lifestyle ratings
function getEntertainmentCost(town) {
  const restaurants = town.restaurants_rating || 3;
  const nightlife = town.nightlife_rating || 3;
  const cultural = town.cultural_rating || 3;
  const shopping = town.shopping_rating || 3;
  
  const avgLifestyle = (restaurants + nightlife + cultural + shopping) / 4;
  
  // Higher lifestyle ratings = higher entertainment spending
  if (avgLifestyle >= 7) return 400;  // Active social life
  if (avgLifestyle >= 5) return 250;  // Moderate social life
  if (avgLifestyle >= 3) return 150;  // Quiet social life
  return 100;  // Minimal social activities
}

// Personal/household items cost
function getPersonalCost(town) {
  const country = town.country;
  
  // Expensive countries
  if (['Switzerland', 'Norway', 'Iceland', 'Singapore', 'Luxembourg'].includes(country)) {
    return 250;
  }
  
  // High-cost countries
  if (['United States', 'Canada', 'Australia', 'United Kingdom', 'Ireland', 'Netherlands', 'Denmark', 'Sweden'].includes(country)) {
    return 200;
  }
  
  // Medium-cost countries
  if (['France', 'Germany', 'Belgium', 'Austria', 'Italy', 'Spain', 'New Zealand', 'Japan'].includes(country)) {
    return 150;
  }
  
  // Lower-cost countries
  return 100;
}

// Insurance needs (beyond healthcare)
function getInsuranceCost(town) {
  const country = town.country;
  
  // Countries where you need various insurances
  if (['United States', 'Canada', 'Australia'].includes(country)) {
    return 150;  // Home/renters, liability, etc.
  }
  
  // European countries with mandatory insurances
  if (['Germany', 'Netherlands', 'Switzerland', 'Austria'].includes(country)) {
    return 100;  // Various mandatory insurances
  }
  
  // Most other countries
  return 50;  // Basic insurance
}

// Calculate conservative total monthly cost
function calculateConservativeCostOfLiving(town) {
  // Core costs (already in database)
  const rent = town.rent_1bed || 800;
  const groceries = town.groceries_cost || 300;
  const utilities = town.utilities_cost || 100;
  const healthcare = town.healthcare_cost_monthly || 200;
  
  // Dining out (conservative: 10 meals per month)
  const dining = (town.meal_cost || 20) * 10;
  
  // Additional costs
  const transport = getTransportCost(town);
  const entertainment = getEntertainmentCost(town);
  const personal = getPersonalCost(town);
  const insurance = getInsuranceCost(town);
  
  // Sum all costs
  let total = rent + groceries + utilities + healthcare + dining + transport + entertainment + personal + insurance;
  
  // Add 10% contingency buffer for unexpected costs
  total = total * 1.1;
  
  // Round UP to nearest 50 (conservative)
  return roundUpToNearest50(total);
}

async function updateCostOfLiving() {
  console.log('💰 CALCULATING CONSERVATIVE COST OF LIVING (USD)\n');
  console.log('⚠️  Using conservative estimates - rounding UP to nearest $50\n');
  console.log('Including: rent, food, utilities, healthcare, transport, entertainment, insurance\n');
  
  // Get all towns
  const { data: towns, error } = await supabase
    .from('towns')
    .select('*')
    .order('country', { ascending: true });
    
  if (error) {
    console.error('Error fetching towns:', error);
    return;
  }
  
  console.log(`Processing ${towns.length} towns...\n`);
  
  let updateCount = 0;
  let errorCount = 0;
  const samples = [];
  const changes = [];
  
  for (const town of towns) {
    const oldCost = town.cost_of_living_usd;
    const newCost = calculateConservativeCostOfLiving(town);
    
    // Track changes
    if (oldCost !== newCost) {
      changes.push({
        name: town.name,
        country: town.country,
        old: oldCost,
        new: newCost,
        difference: newCost - (oldCost || 0)
      });
    }
    
    // Collect samples
    if (samples.length < 20) {
      samples.push({
        name: town.name,
        country: town.country,
        cost: newCost,
        rent: town.rent_1bed,
        population: town.population
      });
    }
    
    // Update database
    const { error: updateError } = await supabase
      .from('towns')
      .update({ cost_of_living_usd: newCost })
      .eq('id', town.id);
      
    if (updateError) {
      console.log(`❌ Failed to update ${town.name}: ${updateError.message}`);
      errorCount++;
    } else {
      updateCount++;
      if (updateCount % 50 === 0) {
        console.log(`  Updated ${updateCount} towns...`);
      }
    }
  }
  
  // Show distribution
  console.log('\n📊 COST DISTRIBUTION:');
  const distribution = {};
  towns.forEach(t => {
    const cost = calculateConservativeCostOfLiving(t);
    const bracket = `$${Math.floor(cost/500)*500}-${Math.floor(cost/500)*500 + 500}`;
    distribution[bracket] = (distribution[bracket] || 0) + 1;
  });
  
  Object.keys(distribution).sort().forEach(bracket => {
    console.log(`  ${bracket}: ${distribution[bracket]} towns`);
  });
  
  // Show samples by cost level
  console.log('\n💵 SAMPLE COSTS BY LEVEL:\n');
  
  // Low cost
  const lowCost = samples.filter(s => s.cost <= 1500).slice(0, 5);
  console.log('Low Cost (≤$1500/month):');
  lowCost.forEach(s => {
    console.log(`  ${s.name}, ${s.country}: $${s.cost}/month (rent: $${s.rent})`);
  });
  
  // Medium cost
  const midCost = samples.filter(s => s.cost > 1500 && s.cost <= 3000).slice(0, 5);
  console.log('\nMedium Cost ($1500-3000/month):');
  midCost.forEach(s => {
    console.log(`  ${s.name}, ${s.country}: $${s.cost}/month (rent: $${s.rent})`);
  });
  
  // High cost
  const highCost = samples.filter(s => s.cost > 3000).slice(0, 5);
  console.log('\nHigh Cost (>$3000/month):');
  highCost.forEach(s => {
    console.log(`  ${s.name}, ${s.country}: $${s.cost}/month (rent: $${s.rent})`);
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('COST OF LIVING UPDATE COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Updated: ${updateCount} towns`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📈 Average change: $${Math.round(changes.reduce((sum, c) => sum + c.difference, 0) / changes.length || 0)}`);
  
  // Verify specific towns
  console.log('\n🔍 VERIFICATION OF KEY TOWNS:');
  const keyTowns = ['Paris', 'Mexico City', 'Bangkok', 'Sydney', 'Buenos Aires', 'Lisbon'];
  for (const name of keyTowns) {
    const { data: town } = await supabase
      .from('towns')
      .select('name, country, cost_of_living_usd, rent_1bed')
      .ilike('name', name)
      .limit(1)
      .single();
    if (town) {
      console.log(`  ${town.name}, ${town.country}: $${town.cost_of_living_usd}/month (rent: $${town.rent_1bed})`);
    }
  }
  
  console.log('\n⚠️  All costs are CONSERVATIVE estimates rounded UP to nearest $50');
}

// Run update
updateCostOfLiving().catch(console.error);