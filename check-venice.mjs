import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMDc5NTMsImV4cCI6MjA3MjY4Mzk1M30.-VRSBZu7cElt4LXPVT_tm3ilsuj_UojDOvOP_UVCVHs'
);

console.log('Checking Venice, FL data...\n');

const { data, error } = await supabase
  .from('towns')
  .select('*')
  .eq('town_name', 'Venice')
  .eq('country', 'United States')
  .single();

if (error) {
  console.log('ERROR:', error);
} else {
  console.log('FOUND Venice with ID:', data.id);
  console.log('\n=== SCORING FIELDS ===');
  console.log('overall_score:', data.overall_score);
  console.log('healthcare_score:', data.healthcare_score);
  console.log('safety_score:', data.safety_score);
  console.log('cost_of_living_usd:', data.cost_of_living_usd);
  console.log('population:', data.population);

  console.log('\n=== CLIMATE FIELDS ===');
  console.log('climate:', data.climate);
  console.log('climate_description:', data.climate_description);
  console.log('avg_temp_summer:', data.avg_temp_summer);
  console.log('avg_temp_winter:', data.avg_temp_winter);
  console.log('annual_rainfall:', data.annual_rainfall);
  console.log('geographic_features:', data.geographic_features);

  console.log('\n=== IMAGES ===');
  console.log('image_url_1:', data.image_url_1);
  console.log('photos:', data.photos);

  console.log('\n=== DESCRIPTIONS ===');
  console.log('description length:', data.description?.length || 0);
  console.log('verbose_description length:', data.verbose_description?.length || 0);

  // Count null fields
  const nullFields = Object.entries(data).filter(([key, value]) => value === null);
  console.log('\n=== NULL FIELDS COUNT:', nullFields.length, '===');
  console.log('First 20 null fields:', nullFields.slice(0, 20).map(([key]) => key).join(', '));
}

console.log('\nDone.');
