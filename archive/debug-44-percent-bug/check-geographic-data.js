const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
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
    console.log('  Geographic:', town.geographic_features_actual);
    console.log('  Vegetation:', town.vegetation_type_actual);
  });

  // Count populated vs empty
  const { data: counts } = await supabase
    .from('towns')
    .select('id')
    .not('geographic_features_actual', 'is', null);

  const { data: vegCounts } = await supabase
    .from('towns')
    .select('id')
    .not('vegetation_type_actual', 'is', null);

  console.log('\n\nData Coverage:');
  console.log('==============');
  console.log('Towns with geographic_features_actual:', counts?.length || 0);
  console.log('Towns with vegetation_type_actual:', vegCounts?.length || 0);
}

checkData();
