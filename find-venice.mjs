import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMDc5NTMsImV4cCI6MjA3MjY4Mzk1M30.-VRSBZu7cElt4LXPVT_tm3ilsuj_UojDOvOP_UVCVHs'
);

console.log('Searching for Venice...');

const { data, error } = await supabase
  .from('towns')
  .select('id, town_name, country, region, quality_of_life, healthcare_score, safety_score, cost_index, description, image_url_1, population, cost_of_living_usd, summer_climate_actual, winter_climate_actual')
  .ilike('town_name', '%venice%');

if (error) {
  console.log('ERROR:', error);
} else {
  console.log('Found', data.length, 'results:\n');
  data.forEach(town => {
    console.log('===================');
    console.log('Town:', town.town_name);
    console.log('Location:', town.region, town.country);
    console.log('ID:', town.id);
    console.log('\nSCORES:');
    console.log('  quality_of_life:', town.quality_of_life);
    console.log('  healthcare_score:', town.healthcare_score);
    console.log('  safety_score:', town.safety_score);
    console.log('  cost_index:', town.cost_index);
    console.log('\nDATA:');
    console.log('  population:', town.population);
    console.log('  cost_of_living_usd:', town.cost_of_living_usd);
    console.log('  summer_climate:', town.summer_climate_actual);
    console.log('  winter_climate:', town.winter_climate_actual);
    console.log('  image_url_1:', town.image_url_1 ? 'YES' : 'NO');
    console.log('  description:', town.description ? 'YES (' + town.description.length + ' chars)' : 'NO');
  });
}
