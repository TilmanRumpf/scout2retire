import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function checkDuplicates() {
  console.log('🔍 Checking for duplicate towns...\n');

  const { data: towns } = await supabase
    .from('towns')
    .select('id, name, country')
    .order('name');

  // Group by name+country
  const townGroups = {};
  towns.forEach(t => {
    const key = `${t.name}, ${t.country}`;
    if (!townGroups[key]) townGroups[key] = [];
    townGroups[key].push(t);
  });

  // Find duplicates
  const duplicates = Object.entries(townGroups)
    .filter(([key, group]) => group.length > 1);

  if (duplicates.length > 0) {
    console.log(`Found ${duplicates.length} duplicate town entries:\n`);
    
    for (const [key, group] of duplicates.slice(0, 10)) {
      console.log(`${key}:`);
      for (const town of group) {
        // Check hobbies for each
        const { count } = await supabase
          .from('towns_hobbies')
          .select('*', { count: 'exact', head: true })
          .eq('town_id', town.id);
        
        console.log(`  ID: ${town.id} - ${count || 0} hobbies`);
      }
      console.log();
    }
  } else {
    console.log('No duplicate towns found!');
  }
  
  console.log(`\nTotal unique town names: ${Object.keys(townGroups).length}`);
  console.log(`Total town records: ${towns.length}`);
}

checkDuplicates().catch(console.error);