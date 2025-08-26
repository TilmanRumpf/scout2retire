import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function updateRegionData() {
  console.log('=== UPDATING REGION DATA FOR ALL TOWNS ===\n');
  
  // Update US towns - region field contains state
  console.log('Updating US towns...');
  const { data: usTowns, error: usError } = await supabase
    .from('towns')
    .select('id, region')
    .eq('country', 'United States')
    .not('region', 'is', null);
    
  if (usTowns) {
    for (const town of usTowns) {
      if (town.region && town.region !== '–') {
        const { error } = await supabase
          .from('towns')
          .update({ region_lvl1: town.region })
          .eq('id', town.id);
          
        if (error) {
          console.error(`Error updating ${town.id}:`, error);
        }
      }
    }
    console.log(`Updated ${usTowns.length} US towns with state information`);
  }
  
  // Special case: Update New Port Richey when we add it
  console.log('\nNote: When adding New Port Richey, FL, set:');
  console.log('- region_lvl1: Florida');
  console.log('- region_lvl2: Pasco County');
  
  // Update other countries based on known patterns
  const countryMappings = [
    { country: 'Canada', useRegionAsLvl1: true },
    { country: 'Mexico', useRegionAsLvl1: true },
    { country: 'Australia', useRegionAsLvl1: true },
    { country: 'Brazil', useRegionAsLvl1: true },
    { country: 'Argentina', useRegionAsLvl1: true },
  ];
  
  for (const mapping of countryMappings) {
    const { data: towns, error } = await supabase
      .from('towns')
      .select('id, region')
      .eq('country', mapping.country)
      .not('region', 'is', null);
      
    if (towns && towns.length > 0) {
      console.log(`\nUpdating ${mapping.country} towns...`);
      for (const town of towns) {
        if (town.region && town.region !== '–') {
          const { error } = await supabase
            .from('towns')
            .update({ region_lvl1: town.region })
            .eq('id', town.id);
        }
      }
      console.log(`Updated ${towns.length} ${mapping.country} towns`);
    }
  }
  
  // Show summary
  const { data: summary, error: summaryError } = await supabase
    .from('towns')
    .select('country, region_lvl1, region_lvl2')
    .neq('region_lvl1', '–')
    .limit(10);
    
  console.log('\n=== SAMPLE OF UPDATED DATA ===');
  summary?.forEach(town => {
    console.log(`${town.country}: lvl1="${town.region_lvl1}", lvl2="${town.region_lvl2}"`);
  });
}

// Only run this after the columns have been added
updateRegionData();