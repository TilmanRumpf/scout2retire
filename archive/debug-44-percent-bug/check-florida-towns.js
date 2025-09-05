import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function checkStateTracking() {
  console.log('=== CHECKING HOW STATES ARE TRACKED IN TOWNS TABLE ===\n');
  
  // First, let's look at specific towns
  const testTowns = ['Gainesville', 'Jacksonville', 'Miami', 'Orlando'];
  
  for (const townName of testTowns) {
    const { data: town, error } = await supabase
      .from('towns')
      .select('id, name, country, region, regions, state_code')
      .ilike('name', `%${townName}%`)
      .eq('country', 'United States')
      .single();
    
    if (town) {
      console.log(`\n${town.name}:`);
      console.log(`- Country: ${town.country}`);
      console.log(`- Region: ${town.region}`);
      console.log(`- Regions: ${town.regions}`);
      console.log(`- State Code: ${town.state_code || 'NOT FOUND'}`);
    }
  }
  
  // Now let's check the table structure
  console.log('\n=== CHECKING ALL COLUMNS ===');
  const { data: sample, error } = await supabase
    .from('towns')
    .select('*')
    .eq('name', 'Jacksonville')
    .single();
  
  if (sample) {
    const columns = Object.keys(sample);
    const stateRelatedColumns = columns.filter(col => 
      col.toLowerCase().includes('state') || 
      col.toLowerCase().includes('region') ||
      col.toLowerCase().includes('location')
    );
    
    console.log('\nState/Region related columns found:');
    stateRelatedColumns.forEach(col => {
      console.log(`- ${col}: ${sample[col]}`);
    });
  }
  
  // Check how many US towns have state_code filled
  const { count: withState } = await supabase
    .from('towns')
    .select('*', { count: 'exact', head: true })
    .eq('country', 'United States')
    .not('state_code', 'is', null);
    
  const { count: totalUS } = await supabase
    .from('towns')
    .select('*', { count: 'exact', head: true })
    .eq('country', 'United States');
    
  console.log(`\n=== STATE CODE COVERAGE ===`);
  console.log(`US towns with state_code: ${withState} / ${totalUS}`);
  
  // Get all Florida towns using state_code
  console.log('\n=== FLORIDA TOWNS (using state_code) ===');
  const { data: floridaTowns, error: flError } = await supabase
    .from('towns')
    .select('name, state_code, region, population')
    .eq('state_code', 'FL')
    .order('population', { ascending: false });
    
  if (floridaTowns && floridaTowns.length > 0) {
    console.log(`Found ${floridaTowns.length} Florida towns with state_code='FL':`);
    floridaTowns.slice(0, 10).forEach(town => {
      console.log(`- ${town.name} (pop: ${town.population?.toLocaleString() || 'unknown'})`);
    });
  }
}

checkStateTracking();