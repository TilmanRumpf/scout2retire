import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://axlruvvsjepsulcbqlho.supabase.co';
const supabaseKey = 'process.env.SUPABASE_SERVICE_ROLE_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function querySpanishTowns() {
  console.log('Querying Spanish towns...\n');
  
  const { data, error } = await supabase
    .from('towns')
    .select('name, country, region, regions, geo_region, geographic_features_actual, vegetation_type_actual')
    .eq('country', 'Spain')
    .limit(5);
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('Spanish Towns Data Structure:');
  console.log('================================\n');
  
  data.forEach((town, index) => {
    console.log(`${index + 1}. ${town.name}`);
    console.log('   Country:', town.country);
    console.log('   Region:', town.region);
    console.log('   Regions array:', JSON.stringify(town.regions));
    console.log('   Geo_region:', town.geo_region);
    console.log('   Geographic features:', JSON.stringify(town.geographic_features_actual));
    console.log('   Vegetation types:', JSON.stringify(town.vegetation_type_actual));
    console.log('');
  });
  
  // Check if any have empty geographic features
  const { data: allSpain, error: error2 } = await supabase
    .from('towns')
    .select('name')
    .eq('country', 'Spain');
    
  const { data: withFeatures, error: error3 } = await supabase
    .from('towns')
    .select('name')
    .eq('country', 'Spain')
    .not('geographic_features_actual', 'is', null);
    
  const { data: withVeg, error: error4 } = await supabase
    .from('towns')
    .select('name')
    .eq('country', 'Spain')
    .not('vegetation_type_actual', 'is', null);
  
  console.log('\nStatistics:');
  console.log(`Total Spanish towns: ${allSpain?.length || 0}`);
  console.log(`With geographic features: ${withFeatures?.length || 0}`);
  console.log(`With vegetation types: ${withVeg?.length || 0}`);
}

querySpanishTowns();
