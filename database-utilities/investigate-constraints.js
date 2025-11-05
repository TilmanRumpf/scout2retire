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

async function investigate() {
  console.log('🔍 Investigating database constraints...\n');

  // Query to get all check constraints on towns table
  const { data: constraints, error } = await supabase
    .rpc('exec_sql', {
      sql: `
        SELECT
          conname AS constraint_name,
          pg_get_constraintdef(c.oid) AS constraint_definition
        FROM pg_constraint c
        JOIN pg_namespace n ON n.oid = c.connamespace
        JOIN pg_class cl ON cl.oid = c.conrelid
        WHERE
          cl.relname = 'towns'
          AND n.nspname = 'public'
          AND c.contype = 'c'
        ORDER BY conname;
      `
    });

  if (error) {
    console.log('❌ RPC not available, trying alternative method...\n');

    // Try to get column information instead
    const { data: columns, error: colError } = await supabase
      .from('towns')
      .select('*')
      .limit(1);

    if (columns && columns.length > 0) {
      const town = columns[0];

      console.log('📊 Analyzing rating fields:\n');
      const ratingFields = [
        'bike_infrastructure',
        'internet_reliability',
        'public_transport_quality',
        'road_quality',
        'walkability',
        'outdoor_activities_rating',
        'restaurants_rating',
        'nightlife_rating',
        'shopping_rating',
        'lgbtq_friendly_rating',
        'pet_friendly_rating',
        'insurance_availability_rating',
        'emergency_services_quality',
        'political_stability_rating',
        'environmental_health_rating'
      ];

      for (const field of ratingFields) {
        const value = town[field];
        console.log(`${field}: ${value} (${value === null ? 'null' : typeof value})`);
      }

      console.log('\n📊 Analyzing array fields:\n');
      const arrayFields = [
        'cultural_activities',
        'sports_facilities',
        'geographic_features_actual',
        'vegetation_type_actual'
      ];

      for (const field of arrayFields) {
        const value = town[field];
        console.log(`${field}: ${JSON.stringify(value)} (${Array.isArray(value) ? 'array' : typeof value})`);
      }

      console.log('\n📊 Analyzing natural_disaster_risk:\n');
      console.log(`natural_disaster_risk: ${town.natural_disaster_risk} (${town.natural_disaster_risk === null ? 'null' : typeof town.natural_disaster_risk})`);
    }

  } else {
    console.log('✅ Found constraints:\n');
    constraints?.forEach(c => {
      console.log(`${c.constraint_name}:`);
      console.log(`  ${c.constraint_definition}\n`);
    });
  }
}

investigate();
