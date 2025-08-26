import { createClient } from '@supabase/supabase-js';
import { expandedTownData, insertExpandedTownData } from './src/data/expandedTownData.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importTowns() {
  console.log('=== Town Import Script ===\n');
  
  // 1. Check current town count
  const { count: currentCount, error: countError } = await supabase
    .from('towns')
    .select('*', { count: 'exact', head: true });
    
  if (countError) {
    console.error('Error counting towns:', countError);
    return;
  }
  
  console.log(`Current towns in database: ${currentCount}`);
  console.log(`Towns available in expandedTownData.js: ${expandedTownData.length}`);
  
  // 2. Show which towns we're about to import
  console.log('\nTowns to import:');
  expandedTownData.forEach((town, index) => {
    console.log(`${index + 1}. ${town.name}, ${town.country}`);
  });
  
  // 3. Import the towns
  console.log('\nStarting import...');
  const result = await insertExpandedTownData(supabase);
  
  if (result.success) {
    console.log('\n✅ Import completed successfully!');
    console.log('Results by batch:', result.results);
  } else {
    console.error('\n❌ Import failed:', result.error);
  }
  
  // 4. Check final count
  const { count: finalCount, error: finalError } = await supabase
    .from('towns')
    .select('*', { count: 'exact', head: true });
    
  if (!finalError) {
    console.log(`\nFinal town count: ${finalCount}`);
    console.log(`Towns added: ${finalCount - currentCount}`);
  }
  
  // 5. List all towns alphabetically
  const { data: allTowns, error: listError } = await supabase
    .from('towns')
    .select('name, country')
    .order('name');
    
  if (!listError && allTowns) {
    console.log('\n=== Complete Town List ===');
    allTowns.forEach((town, index) => {
      console.log(`${index + 1}. ${town.name}, ${town.country}`);
    });
  }
}

// Run the import
importTowns().catch(console.error);