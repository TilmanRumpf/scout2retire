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

async function checkWuppertal() {
  const { data, error } = await supabase
    .from('towns')
    .select('*')
    .ilike('town_name', 'wuppertal')
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('\n📊 WUPPERTAL COMPLETE DATA:');
  console.log('='.repeat(80));
  console.log('Created:', data.created_at);
  console.log('\n🎯 FIELDS AI SHOULD HAVE POPULATED:');

  const aiFields = {
    'summer_climate_actual': data.summer_climate_actual,
    'winter_climate_actual': data.winter_climate_actual,
    'humidity_level_actual': data.humidity_level_actual,
    'sunshine_level_actual': data.sunshine_level_actual,
    'precipitation_level_actual': data.precipitation_level_actual,
    'climate_description': data.climate_description,
    'geographic_features_actual': data.geographic_features_actual,
    'vegetation_type_actual': data.vegetation_type_actual,
    'elevation_meters': data.elevation_meters,
    'primary_language': data.primary_language,
    'pace_of_life_actual': data.pace_of_life_actual,
    'social_atmosphere': data.social_atmosphere,
    'cost_of_living_usd': data.cost_of_living_usd,
    'typical_monthly_living_cost': data.typical_monthly_living_cost,
    'rent_1bed': data.rent_1bed,
    'description': data.description ? data.description.substring(0, 100) + '...' : null
  };

  let populated = 0;
  let missing = [];

  for (const [field, value] of Object.entries(aiFields)) {
    const display = typeof value === 'object' ? JSON.stringify(value) : value;
    if (value !== null && value !== undefined && value !== '') {
      console.log('  ✅', field + ':', display);
      populated++;
    } else {
      console.log('  ❌', field + ':', 'NULL/EMPTY');
      missing.push(field);
    }
  }

  console.log('='.repeat(80));
  console.log('\n📈 SUCCESS RATE:', populated + '/' + Object.keys(aiFields).length, 'fields populated (' + Math.round(populated/Object.keys(aiFields).length*100) + '%)');

  if (missing.length > 0) {
    console.log('\n❌ MISSING FIELDS:');
    missing.forEach(f => console.log('   -', f));
  }
}

checkWuppertal();
