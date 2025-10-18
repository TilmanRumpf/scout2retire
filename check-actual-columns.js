import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function checkColumns() {
  // Get one town to see all columns
  const { data: town, error } = await supabase
    .from('towns')
    .select('*')
    .eq('name', 'Bubaque')
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error:', error);
    return;
  }

  if (town) {
    console.log('Bubaque columns and values:\n');
    const keys = Object.keys(town).sort();

    // Look for infrastructure-related fields
    console.log('Infrastructure/Activity related fields:');
    keys.forEach(key => {
      if (key.includes('internet') || key.includes('mobile') ||
          key.includes('transport') || key.includes('infrastructure') ||
          key.includes('digital') || key.includes('beach') ||
          key.includes('water') || key.includes('mountain') ||
          key.includes('cultural') || key.includes('sports')) {
        console.log(`  ${key}: "${town[key]}"`);
      }
    });

    console.log('\n\nALL columns available:');
    keys.forEach(key => {
      if (town[key] !== null && town[key] !== '') {
        console.log(`  ${key}: ${typeof town[key] === 'object' ? JSON.stringify(town[key]) : `"${town[key]}"`}`);
      }
    });
  } else {
    console.log('Bubaque not found');
  }
}

checkColumns();