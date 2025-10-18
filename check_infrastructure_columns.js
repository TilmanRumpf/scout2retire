import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkColumns() {
  // Get a sample town to see what columns exist
  const { data, error } = await supabase
    .from('towns')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error:', error);
    return;
  }

  const columns = Object.keys(data[0]);
  
  // Filter for infrastructure-related columns
  const infraColumns = columns.filter(c => 
    c.includes('internet') || 
    c.includes('mobile') || 
    c.includes('transport') || 
    c.includes('bike') ||
    c.includes('road') ||
    c.includes('traffic') ||
    c.includes('parking') ||
    c.includes('government') ||
    c.includes('banking') ||
    c.includes('digital') ||
    c.includes('reliability') ||
    c.includes('coverage') ||
    c.includes('quality') ||
    c.includes('infrastructure') ||
    c.includes('congestion') ||
    c.includes('availability') ||
    c.includes('efficiency')
  );
  
  console.log('Infrastructure-related columns:');
  infraColumns.forEach(c => console.log(`  - ${c}`));
  
  // Also check for activities columns
  const activityColumns = columns.filter(c =>
    c.includes('sport') ||
    c.includes('mountain') ||
    c.includes('beach') ||
    c.includes('water') ||
    c.includes('cultural') ||
    c.includes('activities') ||
    c.includes('facilities')
  );
  
  console.log('\nActivity-related columns:');
  activityColumns.forEach(c => console.log(`  - ${c}`));
}

checkColumns();
