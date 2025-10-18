import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkColumns() {
  console.log('🔍 Checking climate-related columns in towns table...\n');

  const { data, error } = await supabase
    .from('towns')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error:', error);
    return;
  }

  const columns = Object.keys(data[0] || {});
  const climateColumns = columns.filter(col => 
    col.includes('temp') || 
    col.includes('summer') || 
    col.includes('winter') || 
    col.includes('climate') ||
    col.includes('sunshine') ||
    col.includes('precipitation') ||
    col.includes('rainfall') ||
    col.includes('humidity') ||
    col.includes('seasonal')
  );

  console.log('Climate-related columns found:');
  climateColumns.sort().forEach(col => console.log(`  - ${col}`));
}

checkColumns().catch(console.error);
