import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkColumnTypes() {
  console.log('🔍 Querying database schema for AI-populated fields...\n');

  // Query using information_schema
  const { data, error } = await supabase
    .rpc('exec_sql', {
      sql: `
        SELECT
          column_name,
          data_type,
          udt_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'towns'
          AND column_name IN (
            'summer_climate_actual',
            'winter_climate_actual',
            'humidity_level_actual',
            'sunshine_level_actual',
            'precipitation_level_actual',
            'climate_description',
            'geographic_features_actual',
            'vegetation_type_actual',
            'elevation_meters',
            'primary_language',
            'pace_of_life_actual',
            'social_atmosphere',
            'cost_of_living_usd',
            'typical_monthly_living_cost',
            'rent_1bed',
            'description'
          )
        ORDER BY column_name;
      `
    });

  if (error) {
    console.error('❌ Error querying schema:', error);
    return;
  }

  console.log('Column Types:');
  console.log('='.repeat(80));

  if (!data || data.length === 0) {
    console.log('No data returned');
  } else {
    data.forEach(col => {
      const isInteger = col.data_type.includes('integer') || col.data_type.includes('int');
      const warning = isInteger ? ' ⚠️  INTEGER TYPE!' : '';
      console.log(`${col.column_name} | ${col.data_type} | ${col.udt_name}${warning}`);
    });
  }

  console.log('='.repeat(80));
}

checkColumnTypes();
