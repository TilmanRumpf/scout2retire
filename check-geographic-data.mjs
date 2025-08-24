import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function checkData() {
  // Check Spanish towns specifically
  const { data: spanishTowns, error } = await supabase
    .from('towns')
    .select('id, name, country, geographic_features_actual, vegetation_type_actual')
    .eq('country', 'Spain')
    .limit(5);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Spanish Towns Data:');
  console.log('==================');
  spanishTowns.forEach(town => {
    console.log(`\n${town.name}, ${town.country}:`);
    console.log('  Geographic:', JSON.stringify(town.geographic_features_actual));
    console.log('  Vegetation:', JSON.stringify(town.vegetation_type_actual));
  });

  // Count populated vs empty
  const { data: allTowns } = await supabase
    .from('towns')
    .select('id, geographic_features_actual, vegetation_type_actual');

  const withGeo = allTowns.filter(t => t.geographic_features_actual && t.geographic_features_actual.length > 0);
  const withVeg = allTowns.filter(t => t.vegetation_type_actual && t.vegetation_type_actual.length > 0);

  console.log('\n\nData Coverage:');
  console.log('==============');
  console.log('Total towns:', allTowns.length);
  console.log('Towns with geographic_features_actual:', withGeo.length);
  console.log('Towns with vegetation_type_actual:', withVeg.length);
}

checkData();
