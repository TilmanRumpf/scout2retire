import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function checkCostCoverage() {
  // Get all towns first
  const { data: allTowns, error } = await supabase
    .from('towns')
    .select('cost_of_living_usd, typical_monthly_living_cost, rent_1bed, cost_data');
    
  if (error) {
    console.error('Error fetching towns:', error);
    return;
  }
  
  const total_count = allTowns.length;
  const col_count = allTowns.filter(t => t.cost_of_living_usd !== null).length;
  const monthly_count = allTowns.filter(t => t.typical_monthly_living_cost !== null).length;
  const rent_count = allTowns.filter(t => t.rent_1bed !== null).length;
  const cost_data_count = allTowns.filter(t => t.cost_data !== null).length;
    
  console.log('📊 COST DATA COVERAGE:\n');
  console.log(`cost_of_living_usd: ${col_count}/${total_count} towns (${Math.round(col_count/total_count*100)}%)`);
  console.log(`typical_monthly_living_cost: ${monthly_count}/${total_count} towns (${Math.round(monthly_count/total_count*100)}%)`);
  console.log(`rent_1bed: ${rent_count}/${total_count} towns (${Math.round(rent_count/total_count*100)}%)`);
  console.log(`cost_data (JSON): ${cost_data_count}/${total_count} towns (${Math.round(cost_data_count/total_count*100)}%)`);
  console.log(`\nTotal towns: ${total_count}`);
}

checkCostCoverage().catch(console.error);