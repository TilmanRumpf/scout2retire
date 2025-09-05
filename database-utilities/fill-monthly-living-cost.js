import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function fillMonthlyLivingCost() {
  console.log('💰 Filling typical monthly living costs...\n');
  
  const { data: towns, error } = await supabase
    .from('towns')
    .select('*')
    .order('country, name');
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  // Analyze rent-to-total-cost multipliers by country
  const countryMultipliers = {};
  
  towns.forEach(t => {
    if (t.rent_1bed && t.typical_monthly_living_cost) {
      if (!countryMultipliers[t.country]) {
        countryMultipliers[t.country] = [];
      }
      countryMultipliers[t.country].push(t.typical_monthly_living_cost / t.rent_1bed);
    }
  });
  
  // Calculate average multipliers
  const avgMultipliers = {};
  for (const country in countryMultipliers) {
    avgMultipliers[country] = countryMultipliers[country].reduce((a,b) => a+b, 0) / countryMultipliers[country].length;
  }
  
  console.log('📊 Living cost multipliers (total cost / rent):\n');
  Object.entries(avgMultipliers)
    .sort((a,b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([country, mult]) => {
      console.log(`${country}: ${mult.toFixed(1)}x rent = total living cost`);
    });
  
  // Default multipliers based on country characteristics
  const DEFAULT_MULTIPLIERS = {
    // High cost countries (expensive food, transport, healthcare)
    'United States': 2.8,
    'Canada': 2.6,
    'Australia': 2.5,
    'United Kingdom': 2.4,
    'Switzerland': 2.8,
    'Singapore': 2.2,
    'Israel': 2.5,
    'United Arab Emirates': 2.4,
    
    // Moderate cost countries
    'France': 2.3,
    'Germany': 2.3,
    'Netherlands': 2.2,
    'Belgium': 2.2,
    'Austria': 2.3,
    'Italy': 2.2,
    'Spain': 2.1,
    'Portugal': 2.0,
    'Greece': 2.0,
    'New Zealand': 2.4,
    'Ireland': 2.3,
    
    // Lower cost countries (cheaper food, local transport)
    'Mexico': 2.0,
    'Thailand': 1.8,
    'Vietnam': 1.8,
    'Philippines': 1.8,
    'Malaysia': 1.9,
    'Ecuador': 1.8,
    'Colombia': 1.9,
    'Peru': 1.8,
    'India': 1.7,
    'Cambodia': 1.7,
    'Laos': 1.7,
    
    // Island nations (higher import costs)
    'Fiji': 2.3,
    'Bahamas': 2.5,
    'Barbados': 2.4,
    'Malta': 2.2,
    'Mauritius': 2.1,
    
    // Default
    'default': 2.2
  };
  
  // Find towns missing typical_monthly_living_cost
  const missingCost = towns.filter(t => !t.typical_monthly_living_cost);
  console.log(`\n🎯 Found ${missingCost.length} towns missing typical monthly living cost\n`);
  
  const updates = [];
  
  missingCost.forEach(town => {
    let livingCost;
    let method;
    
    // Use rent with multiplier
    if (town.rent_1bed) {
      const multiplier = avgMultipliers[town.country] || DEFAULT_MULTIPLIERS[town.country] || DEFAULT_MULTIPLIERS.default;
      livingCost = Math.round(town.rent_1bed * multiplier);
      method = `rent × ${multiplier.toFixed(1)}`;
    }
    // Use cost_of_living_usd if available
    else if (town.cost_of_living_usd) {
      livingCost = town.cost_of_living_usd;
      method = 'from COL';
    }
    // Shouldn't happen since we filled all rent, but just in case
    else {
      livingCost = 2000; // Conservative default
      method = 'default';
    }
    
    console.log(`${town.name}, ${town.country}: $${livingCost}/mo (${method})`);
    
    updates.push({
      id: town.id,
      typical_monthly_living_cost: livingCost
    });
  });
  
  console.log(`\n💾 Ready to update ${updates.length} towns with typical monthly living costs`);
  
  // Update in batches
  const BATCH_SIZE = 10;
  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE);
    
    for (const update of batch) {
      const { error } = await supabase
        .from('towns')
        .update({ typical_monthly_living_cost: update.typical_monthly_living_cost })
        .eq('id', update.id);
        
      if (error) {
        console.error(`❌ Error updating ${update.id}:`, error);
      }
    }
    
    console.log(`✅ Updated batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(updates.length/BATCH_SIZE)}`);
  }
  
  console.log('\n🎉 Typical monthly living cost update complete!');
  
  // Verify
  const { data: verification } = await supabase
    .from('towns')
    .select('typical_monthly_living_cost')
    .is('typical_monthly_living_cost', null);
    
  console.log(`\n📊 Remaining towns without typical monthly living cost: ${verification?.length || 0}`);
}

fillMonthlyLivingCost();