import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function verifyNSBackfill() {
  console.log('🔍 VERIFYING NOVA SCOTIA TOWNS BACKFILL\n');
  console.log('='.repeat(80) + '\n');

  const { data: towns, error } = await supabase
    .from('towns')
    .select('town_name, image_url_1, description, regions, activities_available, interests_supported, summer_climate_actual, winter_climate_actual, pace_of_life_actual, typical_monthly_living_cost, water_bodies')
    .eq('region', 'Nova Scotia')
    .order('town_name');

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  console.log(`📊 Found ${towns.length} Nova Scotia towns\n`);

  towns.forEach((town, i) => {
    console.log(`${i + 1}. ${town.town_name}`);
    console.log(`   Image: ${town.image_url_1 ? '✅ YES' : '❌ NO'}`);
    console.log(`   Description: ${town.description ? '✅ YES' : '❌ NO'}`);
    console.log(`   Regions array: ${town.regions && town.regions.length > 0 ? `✅ ${town.regions.length} items` : '❌ EMPTY'}`);
    console.log(`   Activities: ${town.activities_available && town.activities_available.length > 0 ? `✅ ${town.activities_available.length} items` : '❌ EMPTY'}`);
    console.log(`   Interests: ${town.interests_supported && town.interests_supported.length > 0 ? `✅ ${town.interests_supported.length} items` : '❌ EMPTY'}`);
    console.log(`   Climate: ${town.summer_climate_actual ? '✅' : '❌'} Summer: ${town.summer_climate_actual || 'N/A'}, Winter: ${town.winter_climate_actual || 'N/A'}`);
    console.log(`   Pace of life: ${town.pace_of_life_actual || '❌ NOT SET'}`);
    console.log(`   Cost: ${town.typical_monthly_living_cost ? `✅ $${town.typical_monthly_living_cost}` : '❌ NOT SET'}`);
    console.log(`   Water bodies: ${town.water_bodies && town.water_bodies.length > 0 ? `✅ ${town.water_bodies.join(', ')}` : '❌ NOT SET'}`);
    console.log('');
  });

  // Summary
  const withImages = towns.filter(t => t.image_url_1).length;
  const withDesc = towns.filter(t => t.description).length;
  const withRegions = towns.filter(t => t.regions && t.regions.length > 0).length;
  const withActivities = towns.filter(t => t.activities_available && t.activities_available.length > 0).length;
  const withClimate = towns.filter(t => t.summer_climate_actual).length;
  const withCost = towns.filter(t => t.typical_monthly_living_cost).length;

  console.log('='.repeat(80));
  console.log('\n📋 SUMMARY:\n');
  console.log(`Images: ${withImages}/${towns.length}`);
  console.log(`Descriptions: ${withDesc}/${towns.length}`);
  console.log(`Regions arrays: ${withRegions}/${towns.length}`);
  console.log(`Activities arrays: ${withActivities}/${towns.length}`);
  console.log(`Climate data: ${withClimate}/${towns.length}`);
  console.log(`Cost data: ${withCost}/${towns.length}`);

  console.log('\n' + '='.repeat(80));

  if (withRegions === towns.length && withActivities === towns.length && withClimate === towns.length && withCost === towns.length) {
    console.log('\n✅ ALL NOVA SCOTIA TOWNS FULLY BACKFILLED!\n');
  } else {
    console.log('\n⚠️  SOME TOWNS MISSING DATA - Check above for details\n');
  }
}

verifyNSBackfill();
