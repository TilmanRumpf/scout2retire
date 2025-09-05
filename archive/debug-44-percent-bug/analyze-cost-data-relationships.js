import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function analyzeCostDataRelationships() {
  console.log('💰 Analyzing cost data relationships...\n');
  
  const { data: towns, error } = await supabase
    .from('towns')
    .select(`
      id, name, country,
      cost_of_living_usd,
      rent_1bed,
      typical_monthly_living_cost,
      healthcare_cost_monthly,
      groceries_cost,
      meal_cost,
      utilities_cost
    `)
    .order('country, name');
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  // Count what we have
  const coverage = {
    cost_of_living_usd: towns.filter(t => t.cost_of_living_usd !== null).length,
    rent_1bed: towns.filter(t => t.rent_1bed !== null).length,
    typical_monthly_living_cost: towns.filter(t => t.typical_monthly_living_cost !== null).length,
    healthcare_cost_monthly: towns.filter(t => t.healthcare_cost_monthly !== null).length,
    groceries_cost: towns.filter(t => t.groceries_cost !== null).length,
    meal_cost: towns.filter(t => t.meal_cost !== null).length,
    utilities_cost: towns.filter(t => t.utilities_cost !== null).length
  };
  
  console.log('📊 COST DATA COVERAGE:\n');
  Object.entries(coverage).forEach(([col, count]) => {
    const pct = (count/341*100).toFixed(1);
    const bar = '█'.repeat(Math.floor(pct/10)) + '░'.repeat(10 - Math.floor(pct/10));
    console.log(`${col.padEnd(30)} ${bar} ${pct}% (${count}/341)`);
  });
  
  // Analyze relationships between columns
  console.log('\n🔍 ANALYZING RELATIONSHIPS:\n');
  
  // For towns with both cost_of_living and rent
  const withBoth = towns.filter(t => t.cost_of_living_usd && t.rent_1bed);
  if (withBoth.length > 0) {
    const rentPercentages = withBoth.map(t => (t.rent_1bed / t.cost_of_living_usd * 100));
    const avgRentPct = rentPercentages.reduce((a,b) => a+b, 0) / rentPercentages.length;
    console.log(`Rent as % of cost_of_living: ${avgRentPct.toFixed(1)}% average`);
    console.log(`(Based on ${withBoth.length} towns with both values)\n`);
  }
  
  // Show some examples
  console.log('💡 SAMPLE DATA PATTERNS:\n');
  const samples = towns.filter(t => 
    t.cost_of_living_usd && 
    t.rent_1bed && 
    t.healthcare_cost_monthly
  ).slice(0, 5);
  
  samples.forEach(t => {
    console.log(`${t.name}, ${t.country}:`);
    console.log(`  Cost of Living: $${t.cost_of_living_usd}`);
    console.log(`  Rent 1-bed: $${t.rent_1bed} (${(t.rent_1bed/t.cost_of_living_usd*100).toFixed(0)}% of COL)`);
    console.log(`  Healthcare: $${t.healthcare_cost_monthly} (${(t.healthcare_cost_monthly/t.cost_of_living_usd*100).toFixed(0)}% of COL)`);
    console.log(`  Groceries: $${t.groceries_cost || 'N/A'}`);
    console.log(`  Utilities: $${t.utilities_cost || 'N/A'}\n`);
  });
  
  // Identify which cost column to fill first
  console.log('🎯 RECOMMENDED APPROACH:\n');
  console.log('1. Fill rent_1bed FIRST because:');
  console.log('   - It\'s the most concrete/verifiable (rental listings)');
  console.log('   - Rent typically represents 30-50% of total living costs');
  console.log('   - Can estimate other costs from rent\n');
  
  console.log('2. Then derive typical_monthly_living_cost:');
  console.log('   - Formula: rent × 2.5 to 3 (depending on country)');
  console.log('   - Covers rent + food + utilities + transport + misc\n');
  
  console.log('3. Healthcare costs can be estimated by:');
  console.log('   - Country healthcare system (public/private)');
  console.log('   - Typical insurance costs for 65+ age group');
  
  // Group missing data by country
  console.log('\n🌍 COUNTRIES WITH MOST MISSING RENT DATA:\n');
  const byCountry = {};
  towns.forEach(t => {
    if (!byCountry[t.country]) {
      byCountry[t.country] = { total: 0, missingRent: 0 };
    }
    byCountry[t.country].total++;
    if (!t.rent_1bed) byCountry[t.country].missingRent++;
  });
  
  Object.entries(byCountry)
    .filter(([_, data]) => data.missingRent > 0)
    .sort((a, b) => b[1].missingRent - a[1].missingRent)
    .slice(0, 10)
    .forEach(([country, data]) => {
      console.log(`${country}: ${data.missingRent}/${data.total} missing rent data`);
    });
    
  console.log('\n📱 FREE SOURCES FOR RENT DATA:');
  console.log('- Numbeo (limited free lookups)');
  console.log('- Facebook Marketplace (real listings)');
  console.log('- Local classifieds websites by country');
  console.log('- Expat Facebook groups (ask for current rates)');
}

analyzeCostDataRelationships();