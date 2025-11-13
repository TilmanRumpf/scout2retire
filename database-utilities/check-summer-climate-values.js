require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSummerClimateValues() {
  console.log('Checking summer_climate_actual values in database...\n');

  const { data, error } = await supabase
    .from('towns')
    .select('id, town_name, summer_climate_actual')
    .not('summer_climate_actual', 'is', null);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  const valueCounts = {};
  data.forEach(town => {
    const val = town.summer_climate_actual;
    valueCounts[val] = (valueCounts[val] || 0) + 1;
  });

  console.log('📊 Summer Climate Value Distribution:');
  console.log('=====================================');
  Object.entries(valueCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([value, count]) => {
      console.log(`  ${value}: ${count} towns`);
    });

  const coldOrCool = data.filter(t => 
    t.summer_climate_actual === 'cold' || t.summer_climate_actual === 'cool'
  );

  console.log('');
  if (coldOrCool.length > 0) {
    console.log('⚠️  Towns using "cold" or "cool":');
    coldOrCool.forEach(t => {
      console.log(`  - ${t.town_name}: ${t.summer_climate_actual}`);
    });
  } else {
    console.log('✅ No towns use "cold" or "cool" values - SAFE TO REMOVE FROM CONFIG');
  }

  console.log(`\n📈 Total towns with summer climate data: ${data.length}`);
}

checkSummerClimateValues().catch(console.error);
