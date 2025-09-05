import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function addRegionColumns() {
  console.log('=== ADDING REGION COLUMNS TO TOWNS TABLE ===\n');
  
  // Since I can't execute DDL directly, I'll provide the SQL for you to run
  const ddlSQL = `
-- Add region_lvl1 and region_lvl2 columns after country column
ALTER TABLE towns 
ADD COLUMN IF NOT EXISTS region_lvl1 TEXT DEFAULT '–',
ADD COLUMN IF NOT EXISTS region_lvl2 TEXT DEFAULT '–';

-- Update column comments for clarity
COMMENT ON COLUMN towns.region_lvl1 IS 'First subnational division (State/Province/Region) if it exists, otherwise –';
COMMENT ON COLUMN towns.region_lvl2 IS 'Second division if needed (e.g., counties in UK, oblast in Russia), otherwise –';
`;

  console.log('Please execute this SQL in Supabase Dashboard:\n');
  console.log(ddlSQL);
  
  // After columns are added, let's prepare the update logic for US towns
  console.log('\n=== UPDATE LOGIC FOR EXISTING TOWNS ===\n');
  
  // Get all US towns to update region_lvl1 with state
  const { data: usTowns, error } = await supabase
    .from('towns')
    .select('id, name, country, region')
    .eq('country', 'United States');
    
  if (usTowns) {
    console.log(`Found ${usTowns.length} US towns to update\n`);
    
    // Generate UPDATE statements for US towns where region contains state info
    const updateStatements = usTowns
      .filter(town => town.region && town.region !== '–')
      .map(town => {
        // For US towns, region field contains the state
        return `UPDATE towns SET region_lvl1 = '${town.region}' WHERE id = ${town.id};`;
      });
    
    console.log('Sample UPDATE statements for US towns:');
    updateStatements.slice(0, 5).forEach(stmt => console.log(stmt));
    
    console.log(`\nTotal: ${updateStatements.length} towns to update with state information`);
  }
  
  // Check other countries
  const { data: countries, error: countryError } = await supabase
    .from('towns')
    .select('country')
    .neq('country', 'United States')
    .order('country');
    
  const uniqueCountries = [...new Set(countries?.map(c => c.country) || [])];
  
  console.log('\n=== OTHER COUNTRIES IN DATABASE ===');
  console.log('Countries that need region_lvl1 mapping:');
  uniqueCountries.forEach(country => console.log(`- ${country}`));
  
  console.log('\n=== EXAMPLES OF REGION MAPPING ===');
  console.log('United States: region_lvl1 = State (e.g., Florida), region_lvl2 = County (e.g., Pasco County)');
  console.log('Canada: region_lvl1 = Province (e.g., Ontario), region_lvl2 = –');
  console.log('United Kingdom: region_lvl1 = Country (e.g., England), region_lvl2 = County (e.g., Devon)');
  console.log('Mexico: region_lvl1 = State (e.g., Jalisco), region_lvl2 = –');
}

addRegionColumns();