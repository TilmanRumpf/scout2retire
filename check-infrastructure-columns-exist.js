import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function checkColumns() {
  // Get one town to see all columns
  const { data: town, error } = await supabase
    .from('towns')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  const infrastructureFields = [
    'internet_speed',
    'internet_reliability',
    'mobile_coverage',
    'coworking_spaces_count',
    'digital_services_availability',
    'public_transport_quality',
    'airport_distance',
    'international_airport_distance',
    'regional_airport_distance',
    'walkability',
    'bike_infrastructure',
    'road_quality',
    'traffic_congestion',
    'parking_availability',
    'government_efficiency_rating',
    'banking_infrastructure'
  ];

  console.log('Infrastructure fields existence check:\n');
  infrastructureFields.forEach(field => {
    const exists = field in town;
    const value = town[field];
    const type = typeof value;

    if (exists) {
      console.log(`✅ ${field}: EXISTS (value: ${value}, type: ${type})`);
    } else {
      console.log(`❌ ${field}: MISSING`);
    }
  });

  // Show all columns that contain 'transport', 'infrastructure', 'internet', etc.
  console.log('\n\nAll columns related to infrastructure:');
  const keys = Object.keys(town);
  const relatedFields = keys.filter(key =>
    key.includes('transport') ||
    key.includes('infrastructure') ||
    key.includes('internet') ||
    key.includes('mobile') ||
    key.includes('walkab') ||
    key.includes('parking') ||
    key.includes('traffic') ||
    key.includes('government') ||
    key.includes('banking') ||
    key.includes('digital')
  );

  relatedFields.forEach(field => {
    console.log(`  ${field}: ${town[field]} (${typeof town[field]})`);
  });
}

checkColumns();