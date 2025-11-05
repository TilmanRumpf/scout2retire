import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSintra() {
  const { data, error } = await supabase
    .from('towns')
    .select(`
      id, name, country, region, created_at,
      summer_climate_actual, winter_climate_actual,
      geographic_features_actual, vegetation_type_actual,
      primary_language, pace_of_life_actual,
      cost_of_living_usd, description
    `)
    .ilike('name', 'sintra');
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  if (!data || data.length === 0) {
    console.log('❌ No Sintra found - town was NOT created');
    return;
  }
  
  console.log('\n✅ SINTRA FOUND! AI Population Status:');
  console.log('='.repeat(80));
  const town = data[0];
  console.log('ID:', town.id);
  console.log('Name:', town.name);
  console.log('Country:', town.country);
  console.log('Region:', town.region);
  console.log('Created:', town.created_at);
  console.log('\nAI-Populated Fields:');
  console.log('  summer_climate_actual:', town.summer_climate_actual);
  console.log('  winter_climate_actual:', town.winter_climate_actual);
  console.log('  geographic_features_actual:', town.geographic_features_actual);
  console.log('  vegetation_type_actual:', town.vegetation_type_actual);
  console.log('  primary_language:', town.primary_language);
  console.log('  pace_of_life_actual:', town.pace_of_life_actual);
  console.log('  cost_of_living_usd:', town.cost_of_living_usd);
  console.log('  description:', town.description ? town.description.substring(0, 100) + '...' : null);
  console.log('='.repeat(80));
  
  const populatedCount = [
    town.summer_climate_actual,
    town.winter_climate_actual,
    town.geographic_features_actual,
    town.vegetation_type_actual,
    town.primary_language,
    town.pace_of_life_actual,
    town.cost_of_living_usd,
    town.description
  ].filter(v => v !== null && v !== undefined).length;
  
  console.log('\n📊 AI Population Success: ' + populatedCount + '/8 fields populated');
  
  if (populatedCount === 8) {
    console.log('✅✅✅ COMPLETE SUCCESS! All fields populated!');
  } else if (populatedCount > 0) {
    console.log('⚠️  Partial success - some fields missing');
  } else {
    console.log('❌ AI population failed - no fields populated');
  }
}

checkSintra();
