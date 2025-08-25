import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function analyzeFloridaTown() {
  // Get Jacksonville as example
  const { data: jacksonville, error } = await supabase
    .from('towns')
    .select('*')
    .eq('name', 'Jacksonville')
    .eq('country', 'United States')
    .single();
    
  if (jacksonville) {
    console.log('=== JACKSONVILLE FULL DATA ===\n');
    console.log('Location fields:');
    console.log(`- name: ${jacksonville.name}`);
    console.log(`- country: ${jacksonville.country}`);
    console.log(`- region: ${jacksonville.region}`);
    console.log(`- regions: ${jacksonville.regions}`);
    console.log(`- state_code: ${jacksonville.state_code}`);
    
    console.log('\nKey metrics:');
    console.log(`- population: ${jacksonville.population?.toLocaleString()}`);
    console.log(`- cost_index: ${jacksonville.cost_index}`);
    console.log(`- climate: ${jacksonville.climate}`);
    console.log(`- healthcare_score: ${jacksonville.healthcare_score}`);
    console.log(`- safety_score: ${jacksonville.safety_score}`);
    
    console.log('\nDescription sample:');
    console.log(jacksonville.description?.substring(0, 200) + '...');
    
    console.log('\nCost data:');
    console.log(`- cost_of_living_usd: ${jacksonville.cost_of_living_usd}`);
    console.log(`- rent_1bed_usd: ${jacksonville.rent_1bed_usd}`);
    console.log(`- typical_monthly_living_cost: ${jacksonville.typical_monthly_living_cost}`);
    
    console.log('\nClimate data:');
    console.log(`- climate_description: ${jacksonville.climate_description?.substring(0, 100)}...`);
    console.log(`- avg_temp_summer: ${jacksonville.avg_temp_summer}`);
    console.log(`- avg_temp_winter: ${jacksonville.avg_temp_winter}`);
  }
  
  // Now check all US towns with "Florida" in region
  console.log('\n\n=== ALL FLORIDA TOWNS (by region field) ===');
  const { data: floridaTowns, error: flError } = await supabase
    .from('towns')
    .select('name, region, population, cost_index')
    .eq('country', 'United States')
    .eq('region', 'Florida')
    .order('population', { ascending: false });
    
  if (floridaTowns) {
    console.log(`Found ${floridaTowns.length} towns in Florida region:`);
    floridaTowns.forEach(town => {
      console.log(`- ${town.name} (pop: ${town.population?.toLocaleString() || 'unknown'}, cost index: ${town.cost_index})`);
    });
  }
}

analyzeFloridaTown();