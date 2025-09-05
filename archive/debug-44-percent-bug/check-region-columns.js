import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function checkColumns() {
  // Get one row to see all columns
  const { data: sampleRow, error } = await supabase
    .from('towns')
    .select('*')
    .limit(1)
    .single();
    
  if (sampleRow) {
    const columns = Object.keys(sampleRow);
    
    console.log('=== CHECKING FOR region_lvl1 AND region_lvl2 COLUMNS ===\n');
    
    const hasRegionLvl1 = columns.includes('region_lvl1');
    const hasRegionLvl2 = columns.includes('region_lvl2');
    
    console.log(`region_lvl1 column exists: ${hasRegionLvl1 ? 'YES' : 'NO'}`);
    console.log(`region_lvl2 column exists: ${hasRegionLvl2 ? 'YES' : 'NO'}`);
    
    console.log('\n=== ALL COLUMNS IN TOWNS TABLE ===');
    columns.forEach((col, index) => {
      console.log(`${index + 1}. ${col}`);
    });
    
    // Check where country and cost_index are
    const countryIndex = columns.indexOf('country');
    const costIndexIndex = columns.indexOf('cost_index');
    
    console.log(`\n=== COLUMN POSITIONS ===`);
    console.log(`'country' is at position: ${countryIndex + 1}`);
    console.log(`'cost_index' is at position: ${costIndexIndex + 1}`);
    
    if (hasRegionLvl1) {
      console.log(`'region_lvl1' is at position: ${columns.indexOf('region_lvl1') + 1}`);
    }
    if (hasRegionLvl2) {
      console.log(`'region_lvl2' is at position: ${columns.indexOf('region_lvl2') + 1}`);
    }
  }
}

checkColumns();