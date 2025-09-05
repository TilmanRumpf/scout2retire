import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function fillTaxRates() {
  console.log('💰 Filling tax rate data (income, property, sales)...\n');
  console.log('Note: These are approximate rates for general planning. Consult tax professionals for specifics.\n');
  
  const { data: towns, error } = await supabase
    .from('towns')
    .select('*')
    .order('country, name');
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  // Country tax rates (approximate top marginal rates for retirees)
  const COUNTRY_TAX_RATES = {
    // Zero/Low income tax countries
    'United Arab Emirates': { income: 0, property: 0, sales: 5 },
    'Bahamas': { income: 0, property: 1, sales: 12 },
    'Barbados': { income: 5.5, property: 0.5, sales: 17.5 }, // Retiree rate
    'Monaco': { income: 0, property: 0, sales: 20 },
    'Bermuda': { income: 0, property: 2, sales: 0 },
    'Cayman Islands': { income: 0, property: 0, sales: 0 },
    'British Virgin Islands': { income: 0, property: 1.5, sales: 0 },
    'Turks and Caicos': { income: 0, property: 0, sales: 0 },
    
    // Low tax countries
    'Singapore': { income: 22, property: 0.16, sales: 8 },
    'Malta': { income: 15, property: 0, sales: 18 }, // Retiree program
    'Cyprus': { income: 35, property: 0.2, sales: 19 },
    'Panama': { income: 0, property: 0.6, sales: 7 }, // Pensionado program
    'Costa Rica': { income: 0, property: 0.25, sales: 13 }, // Foreign income exempt
    'Malaysia': { income: 0, property: 0.3, sales: 0 }, // MM2H program
    'Thailand': { income: 35, property: 0.5, sales: 7 }, // But foreign pensions often exempt
    
    // Moderate tax countries
    'Portugal': { income: 10, property: 0.8, sales: 23 }, // NHR program
    'Spain': { income: 24, property: 1.1, sales: 21 },
    'Italy': { income: 7, property: 0.76, sales: 22 }, // Southern Italy program
    'Greece': { income: 7, property: 0.5, sales: 24 }, // Retiree program
    'France': { income: 30, property: 1.2, sales: 20 },
    'Mexico': { income: 30, property: 0.3, sales: 16 },
    'Ecuador': { income: 0, property: 0.1, sales: 12 }, // Foreign income exempt
    
    // Higher tax countries
    'United States': { income: 37, property: 1.2, sales: 7.5 }, // Federal + average state
    'Canada': { income: 33, property: 1.5, sales: 13 }, // Federal + provincial average
    'United Kingdom': { income: 45, property: 1.2, sales: 20 },
    'Germany': { income: 45, property: 0.35, sales: 19 },
    'Netherlands': { income: 49.5, property: 0.2, sales: 21 },
    'Belgium': { income: 50, property: 1.25, sales: 21 },
    'Austria': { income: 55, property: 0.2, sales: 20 },
    'Australia': { income: 45, property: 0.5, sales: 10 },
    'New Zealand': { income: 33, property: 0.5, sales: 15 },
    
    // Default rates by region
    'default_europe': { income: 35, property: 0.8, sales: 20 },
    'default_americas': { income: 25, property: 0.5, sales: 12 },
    'default_asia': { income: 20, property: 0.3, sales: 10 },
    'default_africa': { income: 30, property: 0.5, sales: 15 },
    'default': { income: 25, property: 0.5, sales: 15 }
  };
  
  // US state variations (some states have no income tax)
  const US_STATE_ADJUSTMENTS = {
    'Florida': { income: 0, sales: 6 },
    'Texas': { income: 0, sales: 6.25, property: 1.8 },
    'Nevada': { income: 0, sales: 6.85 },
    'Washington': { income: 0, sales: 6.5 },
    'Tennessee': { income: 0, sales: 7 },
    'Wyoming': { income: 0, sales: 4 },
    'Alaska': { income: 0, sales: 0 },
    'South Dakota': { income: 0, sales: 4.5 },
    'California': { income: 13.3, sales: 7.25, property: 0.75 },
    'New York': { income: 10.9, sales: 8, property: 1.7 },
    'Hawaii': { income: 11, sales: 4, property: 0.35 }
  };
  
  const missingIncome = towns.filter(t => t.income_tax_rate_pct === null);
  console.log(`🎯 Found ${missingIncome.length} towns missing tax data\n`);
  
  const updates = [];
  
  missingIncome.forEach(town => {
    let rates = COUNTRY_TAX_RATES[town.country];
    
    // Use regional defaults if country not found
    if (!rates) {
      if (['France', 'Germany', 'Italy', 'Spain', 'Portugal', 'Greece', 'Netherlands', 'Belgium'].includes(town.country)) {
        rates = COUNTRY_TAX_RATES.default_europe;
      } else if (['Mexico', 'Colombia', 'Peru', 'Chile', 'Argentina', 'Uruguay', 'Brazil'].includes(town.country)) {
        rates = COUNTRY_TAX_RATES.default_americas;
      } else if (['Thailand', 'Vietnam', 'Philippines', 'Cambodia', 'Laos', 'Indonesia'].includes(town.country)) {
        rates = COUNTRY_TAX_RATES.default_asia;
      } else {
        rates = COUNTRY_TAX_RATES.default;
      }
    }
    
    // US state adjustments
    if (town.country === 'United States') {
      // Determine state from town name or known locations
      let stateRates = null;
      if (['Miami', 'Orlando', 'Naples', 'Fort Myers', 'Clearwater', 'St. Petersburg', 'Jacksonville', 'Palm Beach', 'Venice (FL)'].some(city => town.name.includes(city))) {
        stateRates = US_STATE_ADJUSTMENTS.Florida;
      } else if (['Houston', 'Dallas', 'Austin', 'San Antonio'].some(city => town.name.includes(city))) {
        stateRates = US_STATE_ADJUSTMENTS.Texas;
      } else if (['Las Vegas', 'Reno'].some(city => town.name.includes(city))) {
        stateRates = US_STATE_ADJUSTMENTS.Nevada;
      } else if (['Honolulu'].includes(town.name)) {
        stateRates = US_STATE_ADJUSTMENTS.Hawaii;
      }
      
      if (stateRates) {
        rates = { ...rates, ...stateRates };
      }
    }
    
    updates.push({
      id: town.id,
      income_tax_rate_pct: rates.income,
      property_tax_rate_pct: rates.property,
      sales_tax_rate_pct: rates.sales
    });
  });
  
  console.log(`💾 Ready to update ${updates.length} towns with tax rates`);
  
  // Update in batches
  const BATCH_SIZE = 10;
  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE);
    
    for (const update of batch) {
      const { error } = await supabase
        .from('towns')
        .update({
          income_tax_rate_pct: update.income_tax_rate_pct,
          property_tax_rate_pct: update.property_tax_rate_pct,
          sales_tax_rate_pct: update.sales_tax_rate_pct
        })
        .eq('id', update.id);
        
      if (error) {
        console.error(`❌ Error updating ${update.id}:`, error);
      } else {
        const town = towns.find(t => t.id === update.id);
        console.log(`✅ ${town.name}, ${town.country}: Income ${update.income_tax_rate_pct}%, Property ${update.property_tax_rate_pct}%, Sales ${update.sales_tax_rate_pct}%`);
      }
    }
  }
  
  console.log('\n🎉 Tax rates update complete!');
  
  // Verify
  const { data: verification } = await supabase
    .from('towns')
    .select('income_tax_rate_pct, property_tax_rate_pct, sales_tax_rate_pct');
    
  const stillMissing = verification.filter(t => 
    t.income_tax_rate_pct === null || 
    t.property_tax_rate_pct === null || 
    t.sales_tax_rate_pct === null
  );
  
  console.log(`\n📊 Remaining towns without complete tax data: ${stillMissing.length}`);
}

fillTaxRates();