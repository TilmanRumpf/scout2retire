import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function analyzePropertyPrices() {
  console.log('🏠 Analyzing property price data...\n');
  
  const { data: towns, error } = await supabase
    .from('towns')
    .select('id, name, country, purchase_apartment_sqm_usd, purchase_house_avg_usd, typical_home_price, cost_of_living_usd, rent_1bed')
    .order('country, name');
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  // Analyze what we have
  const withAptPrice = towns.filter(t => t.purchase_apartment_sqm_usd !== null);
  const withHousePrice = towns.filter(t => t.purchase_house_avg_usd !== null);
  const withTypicalPrice = towns.filter(t => t.typical_home_price !== null);
  
  console.log('📊 Property Price Data Coverage:\n');
  console.log(`purchase_apartment_sqm_usd: ${withAptPrice.length}/341 (${(withAptPrice.length/341*100).toFixed(1)}%)`);
  console.log(`purchase_house_avg_usd: ${withHousePrice.length}/341 (${(withHousePrice.length/341*100).toFixed(1)}%)`);
  console.log(`typical_home_price: ${withTypicalPrice.length}/341 (${(withTypicalPrice.length/341*100).toFixed(1)}%)`);
  
  // Show sample of existing data
  console.log('\n💰 Sample property prices per sqm:');
  withAptPrice.slice(0, 10).forEach(t => {
    console.log(`${t.name}, ${t.country}: $${t.purchase_apartment_sqm_usd}/sqm`);
  });
  
  // Analyze relationship between rent and purchase prices
  console.log('\n🔍 Analyzing rent-to-buy ratios for estimation...');
  const ratios = towns
    .filter(t => t.rent_1bed && t.purchase_apartment_sqm_usd)
    .map(t => ({
      name: t.name,
      country: t.country,
      ratio: t.purchase_apartment_sqm_usd / t.rent_1bed
    }));
  
  if (ratios.length > 0) {
    const avgRatio = ratios.reduce((sum, r) => sum + r.ratio, 0) / ratios.length;
    console.log(`\nAverage price/rent ratio: ${avgRatio.toFixed(1)}`);
    console.log('(Can estimate purchase price = rent × ratio × 60 sqm for 1-bed apt)');
  }
  
  // Group by country
  const byCountry = {};
  towns.forEach(t => {
    if (!byCountry[t.country]) {
      byCountry[t.country] = { total: 0, withPrice: 0 };
    }
    byCountry[t.country].total++;
    if (t.purchase_apartment_sqm_usd) byCountry[t.country].withPrice++;
  });
  
  console.log('\n🌍 Countries with most missing data:');
  Object.entries(byCountry)
    .filter(([_, data]) => data.withPrice === 0 && data.total >= 3)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 10)
    .forEach(([country, data]) => {
      console.log(`${country}: 0/${data.total} towns have price data`);
    });
    
  console.log('\n📱 FREE DATA SOURCES FOR PROPERTY PRICES:\n');
  
  console.log('🌍 GLOBAL SOURCES:');
  console.log('1. **Property Portals with APIs/Data:**');
  console.log('   - Idealista (Spain, Portugal, Italy) - has public data');
  console.log('   - Rightmove/Zoopla (UK) - scrapeable');
  console.log('   - Remax/Century21 (Global) - franchise data\n');
  
  console.log('2. **Government Housing Statistics:**');
  console.log('   - US: Zillow Research Data (free CSV downloads)');
  console.log('   - EU: Eurostat house price index');
  console.log('   - Many countries publish housing stats\n');
  
  console.log('3. **Alternative Estimation Methods:**');
  console.log('   - Use rent × price-to-rent ratio (15-25 years typical)');
  console.log('   - Use cost_of_living correlation');
  console.log('   - Regional averages from nearby towns\n');
  
  console.log('🎯 RECOMMENDED APPROACH:');
  console.log('1. Fill US cities using Zillow data (41 cities)');
  console.log('2. Use rent-based estimation for towns with rent data');
  console.log('3. Use regional averages for remaining towns');
  console.log('4. Manual research for top retirement destinations');
}

analyzePropertyPrices();