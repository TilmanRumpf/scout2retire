import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function verifyBackfill() {
  console.log('🔍 VERIFYING BACKFILL RESULTS FOR ANNAPOLIS ROYAL\n');

  const { data, error } = await supabase
    .from('towns')
    .select('name, activity_infrastructure, travel_connectivity_rating, social_atmosphere, traditional_progressive_lean, residency_path_info, emergency_services_quality, typical_rent_1bed, cost_index, climate, description')
    .eq('name', 'Annapolis Royal')
    .limit(1);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.error('❌ Town not found');
    return;
  }

  const town = data[0];

  console.log('📊 ANNAPOLIS ROYAL VERIFICATION:\n');
  console.log(`activity_infrastructure: ${town.activity_infrastructure || '❌ NULL'}`);
  console.log(`travel_connectivity_rating: ${town.travel_connectivity_rating || '❌ NULL'}`);
  console.log(`social_atmosphere: ${town.social_atmosphere || '❌ NULL'}`);
  console.log(`traditional_progressive_lean: ${town.traditional_progressive_lean || '❌ NULL'}`);
  console.log(`residency_path_info: ${town.residency_path_info ? '✅ HAS VALUE' : '❌ NULL'}`);
  console.log(`emergency_services_quality: ${town.emergency_services_quality || '❌ NULL'}`);
  console.log(`typical_rent_1bed: ${town.typical_rent_1bed || '❌ NULL'}`);
  console.log(`cost_index: ${town.cost_index || '❌ NULL'}`);
  console.log(`climate: ${town.climate || '❌ NULL'}`);
  console.log(`description: ${town.description ? '✅ HAS VALUE' : '❌ NULL'}`);

  console.log('\n' + '='.repeat(80));

  if (town.activity_infrastructure) {
    console.log('\n✅ BACKFILL SUCCESSFUL - Data is present!');
  } else {
    console.log('\n❌ BACKFILL FAILED - Data is still NULL!');
    console.log('\n⚠️  Possible causes:');
    console.log('   1. RLS preventing anon_key from reading these columns');
    console.log('   2. Update failed but no error was thrown');
    console.log('   3. SELECT query is filtering out these columns');
  }
}

verifyBackfill();
