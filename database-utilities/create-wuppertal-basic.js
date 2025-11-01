import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function create() {
  const { data, error} = await supabase
    .from('towns')
    .insert([{
      name: 'Wuppertal',
      country: 'Germany',
      region: null,
      // Set rating fields to NULL to avoid check constraint violations
      bike_infrastructure: null,
      internet_reliability: null,
      public_transport_quality: null,
      road_quality: null,
      walkability: null,
      outdoor_activities_rating: null,
      restaurants_rating: null,
      nightlife_rating: null,
      shopping_rating: null,
      lgbtq_friendly_rating: null,
      pet_friendly_rating: null,
      insurance_availability_rating: null,
      emergency_services_quality: null,
      political_stability_rating: null,
      environmental_health_rating: null
    }])
    .select()
    .single();

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('✅ Created Wuppertal:', data.id);
  }
}

create();
