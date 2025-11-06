import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function auditNovaScotia() {
  console.log('🔍 NOVA SCOTIA DATA AUDIT - INVESTOR QUALITY CHECK\n');
  console.log('='.repeat(70) + '\n');

  // Get all Nova Scotia towns
  const { data: towns, error } = await supabase
    .from('towns')
    .select('*')
    .eq('region', 'Nova Scotia')
    .order('town_name');

  if (error) {
    console.error('❌ ERROR:', error.message);
    return;
  }

  if (!towns || towns.length === 0) {
    console.log('⚠️  NO NOVA SCOTIA TOWNS FOUND IN DATABASE');
    console.log('Cannot create inspiration without towns!');
    return;
  }

  console.log(`📊 Total Nova Scotia towns: ${towns.length}\n`);

  // Critical checks
  const withImages = towns.filter(t => t.image_url_1 && t.image_url_1 !== '' && t.image_url_1.toLowerCase() !== 'null');
  const withDescription = towns.filter(t => t.description && t.description.length > 100);
  const withClimate = towns.filter(t => t.summer_climate_actual && t.winter_climate_actual);
  const withCost = towns.filter(t => t.typical_monthly_living_cost);
  const withHealthcare = towns.filter(t => t.healthcare_score);

  console.log('🎨 IMAGE STATUS (CRITICAL - inspiration requires images):');
  console.log(`   ✅ With images: ${withImages.length} / ${towns.length}`);
  console.log(`   ❌ Missing images: ${towns.length - withImages.length}`);

  if (withImages.length === 0) {
    console.log('\n⚠️  BLOCKER: NO TOWNS HAVE IMAGES!');
    console.log('   Cannot create inspiration - towns won\'t display!\n');
  }

  console.log('\n📝 DATA COMPLETENESS:');
  console.log(`   Descriptions: ${withDescription.length} / ${towns.length}`);
  console.log(`   Climate data: ${withClimate.length} / ${towns.length}`);
  console.log(`   Cost data: ${withCost.length} / ${towns.length}`);
  console.log(`   Healthcare: ${withHealthcare.length} / ${towns.length}`);

  console.log('\n📋 TOWN INVENTORY:\n');
  towns.forEach((town, i) => {
    const hasImage = town.image_url_1 && town.image_url_1 !== '' && town.image_url_1.toLowerCase() !== 'null';
    console.log(`${i + 1}. ${town.town_name}`);
    console.log(`   Image: ${hasImage ? '✅ YES' : '❌ NO'}`);
    console.log(`   Description: ${town.description ? `✅ ${town.description.substring(0, 80)}...` : '❌ Missing'}`);
    console.log(`   Climate: ${town.summer_climate_actual ? '✅' : '❌'} Summer: ${town.summer_climate_actual || 'N/A'}, Winter: ${town.winter_climate_actual || 'N/A'}`);
    console.log(`   Cost: ${town.typical_monthly_living_cost ? `✅ $${town.typical_monthly_living_cost}` : '❌ Missing'}`);
    console.log('');
  });

  console.log('\n' + '='.repeat(70));
  console.log('🎯 RECOMMENDATION:\n');

  if (withImages.length === 0) {
    console.log('❌ DO NOT CREATE INSPIRATION YET');
    console.log('   Need to add images to at least 3-4 towns first');
  } else if (withImages.length < 3) {
    console.log('⚠️  RISKY - Only ' + withImages.length + ' town(s) with images');
    console.log('   Inspiration will work but show very few towns');
    console.log('   Recommend adding more images first');
  } else {
    console.log('✅ SAFE TO CREATE INSPIRATION');
    console.log(`   ${withImages.length} towns with images will display`);
    console.log('\n📝 Suggested towns to highlight:');
    withImages.slice(0, 5).forEach(t => console.log(`   • ${t.town_name}`));
  }

  console.log('\n' + '='.repeat(70));
}

auditNovaScotia();
