import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function fillHealthcareCosts() {
  console.log('🏥 Filling healthcare costs for retirees (65+)...\n');
  
  const { data: towns, error } = await supabase
    .from('towns')
    .select('*')
    .order('country, name');
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  // Healthcare cost estimates by country (monthly for 65+ retiree)
  // Includes insurance + out-of-pocket typical expenses
  const HEALTHCARE_COSTS = {
    // Countries with public healthcare (low cost)
    'Portugal': 150,           // SNS + private insurance supplement
    'Spain': 100,             // Public system + small copays
    'France': 200,            // Carte Vitale + mutuelle
    'Italy': 80,              // SSN + minimal costs
    'Greece': 120,            // ESY + private supplement
    'Malta': 100,             // Free public + private option
    'United Kingdom': 50,     // NHS free at point of use
    'Canada': 150,            // Provincial health + supplements
    'Australia': 200,         // Medicare + private cover
    'New Zealand': 100,       // Public system + GP fees
    'Austria': 150,           // Social insurance
    'Germany': 250,           // Statutory insurance
    'Netherlands': 200,       // Mandatory insurance
    'Belgium': 150,           // Mutuelle/Ziekenfonds
    
    // Countries with affordable private healthcare
    'Mexico': 200,            // IMSS or private insurance
    'Thailand': 150,          // Private insurance typical
    'Malaysia': 150,          // MM2H insurance requirement
    'Philippines': 100,       // PhilHealth + private
    'Vietnam': 80,            // Basic insurance + cash
    'Ecuador': 120,           // IESS or private
    'Colombia': 150,          // EPS system
    'Costa Rica': 200,        // Caja + private option
    'Panama': 250,            // CSS + private common
    'Uruguay': 200,           // Mutualista system
    'Argentina': 150,         // Obra social + prepaga
    'Chile': 200,             // FONASA or ISAPRE
    
    // Expensive healthcare countries
    'United States': 800,     // Medicare + supplements + drugs
    'Switzerland': 400,       // Mandatory insurance high
    'Singapore': 300,         // Medisave + insurance
    'Israel': 250,            // Kupat Holim + private
    'United Arab Emirates': 350, // Mandatory insurance
    
    // Island nations (limited facilities = higher cost)
    'Bahamas': 400,           // Private only
    'Barbados': 300,          // Mix public/private
    'Fiji': 200,              // Basic public + private
    'Mauritius': 250,         // Public + private common
    'Seychelles': 300,        // Limited facilities
    
    // Countries with basic/limited healthcare
    'India': 100,             // Mixed quality
    'Cambodia': 150,          // Expats use private
    'Laos': 150,              // Limited, cash-based
    'Guatemala': 180,         // Private for expats
    'Belize': 200,            // Limited public system
    'Honduras': 150,          // Private recommended
    'Egypt': 100,             // Variable quality
    'Morocco': 120,           // CNSS + private
    'Tunisia': 100,           // CNAM + private
    'Turkey': 150,            // SGK + private supplement
    'Albania': 80,            // Basic public system
    'Montenegro': 100,        // Public + private
    'Croatia': 120,           // HZZO + supplements
    
    // Default estimates by region
    'default_europe': 150,
    'default_americas': 200,
    'default_asia': 150,
    'default_africa': 150,
    'default_oceania': 200,
    'default': 180
  };
  
  // Find towns missing healthcare costs
  const missingHealthcare = towns.filter(t => !t.healthcare_cost_monthly);
  console.log(`🎯 Found ${missingHealthcare.length} towns missing healthcare costs\n`);
  
  // Calculate existing averages by country
  const countryAverages = {};
  towns.forEach(t => {
    if (t.healthcare_cost_monthly) {
      if (!countryAverages[t.country]) {
        countryAverages[t.country] = [];
      }
      countryAverages[t.country].push(t.healthcare_cost_monthly);
    }
  });
  
  const avgByCountry = {};
  for (const country in countryAverages) {
    avgByCountry[country] = Math.round(
      countryAverages[country].reduce((a,b) => a+b, 0) / countryAverages[country].length
    );
  }
  
  console.log('📊 Existing healthcare cost averages:\n');
  Object.entries(avgByCountry)
    .sort((a,b) => a[1] - b[1])
    .slice(0, 10)
    .forEach(([country, avg]) => {
      console.log(`${country}: $${avg}/month`);
    });
  
  const updates = [];
  
  missingHealthcare.forEach(town => {
    let healthcareCost;
    let method;
    
    // Use country average if available
    if (avgByCountry[town.country]) {
      healthcareCost = avgByCountry[town.country];
      method = 'country avg';
    }
    // Use country-specific estimate
    else if (HEALTHCARE_COSTS[town.country]) {
      healthcareCost = HEALTHCARE_COSTS[town.country];
      // Adjust for major cities (usually more expensive)
      if (town.population > 1000000) {
        healthcareCost = Math.round(healthcareCost * 1.2);
      }
      method = 'country est';
    }
    // Use regional default
    else {
      // Determine region
      if (['France', 'Germany', 'Italy', 'Spain', 'Portugal', 'Greece', 'Netherlands', 'Belgium', 'Austria', 'Switzerland', 'United Kingdom', 'Ireland', 'Czech Republic', 'Poland', 'Hungary', 'Croatia', 'Slovenia', 'Malta', 'Cyprus', 'Estonia', 'Latvia', 'Iceland', 'Norway', 'Sweden', 'Denmark', 'Finland'].includes(town.country)) {
        healthcareCost = HEALTHCARE_COSTS.default_europe;
      } else if (['United States', 'Canada', 'Mexico', 'Guatemala', 'Belize', 'Honduras', 'Costa Rica', 'Panama', 'Colombia', 'Ecuador', 'Peru', 'Chile', 'Argentina', 'Uruguay', 'Brazil', 'Paraguay', 'Dominican Republic', 'Puerto Rico', 'Bahamas', 'Barbados', 'Trinidad and Tobago', 'Jamaica'].includes(town.country)) {
        healthcareCost = HEALTHCARE_COSTS.default_americas;
      } else if (['Thailand', 'Vietnam', 'Malaysia', 'Philippines', 'Singapore', 'Indonesia', 'Cambodia', 'Laos', 'Myanmar', 'India', 'Nepal', 'Sri Lanka', 'Taiwan', 'South Korea', 'Japan', 'China'].includes(town.country)) {
        healthcareCost = HEALTHCARE_COSTS.default_asia;
      } else if (['Australia', 'New Zealand', 'Fiji', 'Samoa', 'Tonga', 'Vanuatu', 'Solomon Islands', 'French Polynesia', 'New Caledonia', 'Cook Islands', 'Palau', 'Marshall Islands', 'Micronesia'].includes(town.country)) {
        healthcareCost = HEALTHCARE_COSTS.default_oceania;
      } else if (['Morocco', 'Tunisia', 'Egypt', 'South Africa', 'Kenya', 'Tanzania', 'Ethiopia', 'Ghana', 'Nigeria', 'Senegal', 'Rwanda', 'Mauritius', 'Seychelles', 'Namibia', 'Botswana'].includes(town.country)) {
        healthcareCost = HEALTHCARE_COSTS.default_africa;
      } else {
        healthcareCost = HEALTHCARE_COSTS.default;
      }
      method = 'regional';
    }
    
    console.log(`${town.name}, ${town.country}: $${healthcareCost}/mo (${method})`);
    
    updates.push({
      id: town.id,
      healthcare_cost_monthly: healthcareCost
    });
  });
  
  console.log(`\n💾 Ready to update ${updates.length} towns with healthcare costs`);
  console.log('\nNote: These are estimates for 65+ retirees including insurance and typical out-of-pocket expenses.');
  
  // Update in batches
  const BATCH_SIZE = 10;
  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE);
    
    for (const update of batch) {
      const { error } = await supabase
        .from('towns')
        .update({ healthcare_cost_monthly: update.healthcare_cost_monthly })
        .eq('id', update.id);
        
      if (error) {
        console.error(`❌ Error updating ${update.id}:`, error);
      }
    }
    
    console.log(`✅ Updated batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(updates.length/BATCH_SIZE)}`);
  }
  
  console.log('\n🎉 Healthcare cost update complete!');
  
  // Verify
  const { data: verification } = await supabase
    .from('towns')
    .select('healthcare_cost_monthly')
    .is('healthcare_cost_monthly', null);
    
  console.log(`\n📊 Remaining towns without healthcare costs: ${verification?.length || 0}`);
}

fillHealthcareCosts();