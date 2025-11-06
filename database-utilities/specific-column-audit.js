import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSpecificIssues() {
  console.log('🔍 SPECIFIC DATA QUALITY CHECKS\n');
  console.log('='.repeat(100));

  // 1. Check for humidity values of 30 (seems suspiciously low for many locations)
  console.log('\n1. HUMIDITY = 30 (Suspiciously Low)');
  console.log('-'.repeat(100));
  const { data: lowHumidity } = await supabase
    .from('towns')
    .select('town_name, country, humidity_average, climate_type')
    .eq('humidity_average', 30)
    .order('town_name');

  console.log(`Found ${lowHumidity?.length || 0} towns with humidity = 30%:`);
  lowHumidity?.forEach(t => {
    console.log(`  - ${t.town_name}, ${t.country} (climate: ${t.climate_type})`);
  });

  // 2. Check healthcare_cost_monthly = 0
  console.log('\n\n2. HEALTHCARE COST = $0 (Unrealistic)');
  console.log('-'.repeat(100));
  const { data: zeroHealthcare } = await supabase
    .from('towns')
    .select('town_name, country, healthcare_cost_monthly, healthcare_score')
    .eq('healthcare_cost_monthly', 0)
    .order('town_name');

  console.log(`Found ${zeroHealthcare?.length || 0} towns with $0 healthcare cost:`);
  zeroHealthcare?.forEach(t => {
    console.log(`  - ${t.town_name}, ${t.country} (score: ${t.healthcare_score})`);
  });

  // 3. Check for very high cost towns
  console.log('\n\n3. EXTREMELY HIGH COSTS (>$4000/month)');
  console.log('-'.repeat(100));
  const { data: highCost } = await supabase
    .from('towns')
    .select('town_name, country, cost_of_living_usd, rent_1bed, typical_monthly_living_cost')
    .gt('cost_of_living_usd', 4000)
    .order('cost_of_living_usd', { ascending: false });

  console.log(`Found ${highCost?.length || 0} towns with cost > $4000:`);
  highCost?.forEach(t => {
    console.log(`  - ${t.town_name}, ${t.country}: $${t.cost_of_living_usd}/mo (rent: $${t.rent_1bed})`);
  });

  // 4. Check for extremely low healthcare scores
  console.log('\n\n4. VERY LOW HEALTHCARE SCORES (<5)');
  console.log('-'.repeat(100));
  const { data: lowHealthcare } = await supabase
    .from('towns')
    .select('town_name, country, healthcare_score, healthcare_description')
    .lt('healthcare_score', 5)
    .order('healthcare_score');

  console.log(`Found ${lowHealthcare?.length || 0} towns with healthcare score < 5:`);
  lowHealthcare?.forEach(t => {
    console.log(`  - ${t.town_name}, ${t.country}: score ${t.healthcare_score}`);
  });

  // 5. Check for extreme populations (likely data entry errors)
  console.log('\n\n5. EXTREME POPULATIONS');
  console.log('-'.repeat(100));
  const { data: extremePop } = await supabase
    .from('towns')
    .select('town_name, country, population')
    .gt('population', 5000000)
    .order('population', { ascending: false });

  console.log(`Found ${extremePop?.length || 0} towns with >5M population (may be city regions):`);
  extremePop?.forEach(t => {
    console.log(`  - ${t.town_name}, ${t.country}: ${t.population.toLocaleString()}`);
  });

  // 6. Check for suspiciously high sunshine hours (>3500)
  console.log('\n\n6. EXTREMELY HIGH SUNSHINE (>3500 hours/year)');
  console.log('-'.repeat(100));
  const { data: highSun } = await supabase
    .from('towns')
    .select('town_name, country, sunshine_hours, climate_type')
    .gt('sunshine_hours', 3500)
    .order('sunshine_hours', { ascending: false });

  console.log(`Found ${highSun?.length || 0} towns with >3500 sunshine hours:`);
  highSun?.forEach(t => {
    console.log(`  - ${t.town_name}, ${t.country}: ${t.sunshine_hours} hrs/yr (${t.climate_type})`);
  });

  // 7. Check for very high rent outliers
  console.log('\n\n7. VERY HIGH RENT (>$2000/month for 1-bed)');
  console.log('-'.repeat(100));
  const { data: highRent } = await supabase
    .from('towns')
    .select('town_name, country, rent_1bed, cost_of_living_usd')
    .gt('rent_1bed', 2000)
    .order('rent_1bed', { ascending: false });

  console.log(`Found ${highRent?.length || 0} towns with rent >$2000:`);
  highRent?.forEach(t => {
    console.log(`  - ${t.town_name}, ${t.country}: $${t.rent_1bed}/mo (total cost: $${t.cost_of_living_usd})`);
  });

  // 8. Check for duplicate cost_of_living_usd values (may indicate copy-paste)
  console.log('\n\n8. MOST COMMON COST VALUES (Possible Copy-Paste)');
  console.log('-'.repeat(100));
  const { data: allCosts } = await supabase
    .from('towns')
    .select('cost_of_living_usd')
    .not('cost_of_living_usd', 'is', null);

  const costCounts = {};
  allCosts?.forEach(t => {
    costCounts[t.cost_of_living_usd] = (costCounts[t.cost_of_living_usd] || 0) + 1;
  });

  const topDuplicates = Object.entries(costCounts)
    .filter(([cost, count]) => count >= 10)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  console.log('Top 10 most duplicated cost values:');
  for (const [cost, count] of topDuplicates) {
    const { data: towns } = await supabase
      .from('towns')
      .select('town_name, country')
      .eq('cost_of_living_usd', cost)
      .limit(5);

    console.log(`\n  $${cost}/month appears ${count} times:`);
    towns?.forEach(t => console.log(`    - ${t.town_name}, ${t.country}`));
    if (count > 5) console.log(`    ... and ${count - 5} more`);
  }

  // 9. Check air quality outliers (very high pollution)
  console.log('\n\n9. VERY HIGH AIR POLLUTION (AQI > 100)');
  console.log('-'.repeat(100));
  const { data: highAQI } = await supabase
    .from('towns')
    .select('town_name, country, air_quality_index, population')
    .gt('air_quality_index', 100)
    .order('air_quality_index', { ascending: false });

  console.log(`Found ${highAQI?.length || 0} towns with AQI >100 (unhealthy):`);
  highAQI?.forEach(t => {
    console.log(`  - ${t.town_name}, ${t.country}: AQI ${t.air_quality_index}`);
  });

  // 10. Check for very high elevations
  console.log('\n\n10. VERY HIGH ELEVATION (>2000m)');
  console.log('-'.repeat(100));
  const { data: highElev } = await supabase
    .from('towns')
    .select('town_name, country, elevation_meters, temperature_avg_annual')
    .gt('elevation_meters', 2000)
    .order('elevation_meters', { ascending: false });

  console.log(`Found ${highElev?.length || 0} towns above 2000m elevation:`);
  highElev?.forEach(t => {
    console.log(`  - ${t.town_name}, ${t.country}: ${t.elevation_meters}m (avg temp: ${t.temperature_avg_annual}°C)`);
  });

  // 11. Check for extreme distances to ocean
  console.log('\n\n11. VERY FAR FROM OCEAN (>1000km)');
  console.log('-'.repeat(100));
  const { data: farOcean } = await supabase
    .from('towns')
    .select('town_name, country, distance_to_ocean_km, geographic_features_actual')
    .gt('distance_to_ocean_km', 1000)
    .order('distance_to_ocean_km', { ascending: false });

  console.log(`Found ${farOcean?.length || 0} towns >1000km from ocean:`);
  farOcean?.forEach(t => {
    console.log(`  - ${t.town_name}, ${t.country}: ${t.distance_to_ocean_km}km (features: ${t.geographic_features_actual})`);
  });

  // 12. Check categorical values that appear only once
  console.log('\n\n12. UNIQUE CATEGORICAL VALUES (Possible Typos)');
  console.log('-'.repeat(100));

  const categoricalColumns = [
    'pace_of_life_actual',
    'retirement_community_presence',
    'expat_community_size'
  ];

  for (const col of categoricalColumns) {
    const { data: values } = await supabase
      .from('towns')
      .select(`name, ${col}`)
      .not(col, 'is', null);

    const valueCounts = {};
    values?.forEach(v => {
      const val = v[col];
      valueCounts[val] = valueCounts[val] || [];
      valueCounts[val].push(v.name);
    });

    const rare = Object.entries(valueCounts)
      .filter(([val, towns]) => towns.length === 1)
      .map(([val, towns]) => `"${val}" (${towns[0]})`);

    if (rare.length > 0) {
      console.log(`\n  ${col}: ${rare.length} unique value(s)`);
      rare.forEach(r => console.log(`    - ${r}`));
    } else {
      console.log(`\n  ${col}: All values appear in multiple towns ✓`);
    }
  }

  console.log('\n' + '='.repeat(100));
  console.log('✅ SPECIFIC CHECKS COMPLETE');
  console.log('='.repeat(100));
}

checkSpecificIssues().catch(console.error);
