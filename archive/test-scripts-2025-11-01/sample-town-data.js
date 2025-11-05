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

async function getSampleTownData() {
  console.log('Fetching sample town data to check field types...');

  const { data, error } = await supabase
    .from('towns')
    .select('id, name, country, pace_of_life_actual, social_atmosphere, primary_language, elevation_meters, cost_of_living_usd, typical_monthly_living_cost, rent_1bed')
    .limit(3);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('\nSample towns:');
  data.forEach(town => {
    console.log('\n' + '='.repeat(60));
    console.log('Town:', town.name + ', ' + town.country);
    console.log('  pace_of_life_actual:', town.pace_of_life_actual, '(type:', typeof town.pace_of_life_actual + ')');
    console.log('  social_atmosphere:', town.social_atmosphere, '(type:', typeof town.social_atmosphere + ')');
    console.log('  primary_language:', town.primary_language, '(type:', typeof town.primary_language + ')');
    console.log('  elevation_meters:', town.elevation_meters, '(type:', typeof town.elevation_meters + ')');
    console.log('  cost_of_living_usd:', town.cost_of_living_usd, '(type:', typeof town.cost_of_living_usd + ')');
    console.log('  typical_monthly_living_cost:', town.typical_monthly_living_cost, '(type:', typeof town.typical_monthly_living_cost + ')');
    console.log('  rent_1bed:', town.rent_1bed, '(type:', typeof town.rent_1bed + ')');
  });
  console.log('='.repeat(60));
}

getSampleTownData();
