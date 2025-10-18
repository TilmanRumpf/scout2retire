import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function checkFieldTypes() {
  // Get a sample of towns to see what values are actually stored
  const { data: sample, error } = await supabase
    .from('towns')
    .select('name, public_transport_quality, bike_infrastructure, road_quality, traffic_congestion, parking_availability, banking_infrastructure, digital_services_availability')
    .not('public_transport_quality', 'is', null)
    .limit(10);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Sample of actual database values:');
  sample?.forEach(town => {
    console.log(`\nTown: ${town.name}`);
    console.log(`  public_transport_quality: ${town.public_transport_quality} (type: ${typeof town.public_transport_quality})`);
    console.log(`  bike_infrastructure: ${town.bike_infrastructure} (type: ${typeof town.bike_infrastructure})`);
    console.log(`  road_quality: ${town.road_quality} (type: ${typeof town.road_quality})`);
    console.log(`  traffic_congestion: ${town.traffic_congestion} (type: ${typeof town.traffic_congestion})`);
    console.log(`  parking_availability: ${town.parking_availability} (type: ${typeof town.parking_availability})`);
    console.log(`  banking_infrastructure: ${town.banking_infrastructure} (type: ${typeof town.banking_infrastructure})`);
    console.log(`  digital_services_availability: ${town.digital_services_availability} (type: ${typeof town.digital_services_availability})`);
  });

  // Also check for Nova Scotia and Bubaque specifically
  console.log('\n\n--- Checking Nova Scotia towns ---');
  const { data: nsTowns } = await supabase
    .from('towns')
    .select('name, public_transport_quality')
    .or('state_code.eq.NS,region.ilike.%nova scotia%')
    .limit(5);

  nsTowns?.forEach(town => {
    console.log(`${town.name}: public_transport_quality = ${town.public_transport_quality}`);
  });

  console.log('\n\n--- Checking Bubaque ---');
  const { data: bubaque } = await supabase
    .from('towns')
    .select('name, public_transport_quality')
    .eq('name', 'Bubaque')
    .single();

  if (bubaque) {
    console.log(`${bubaque.name}: public_transport_quality = ${bubaque.public_transport_quality}`);
  }
}

checkFieldTypes();