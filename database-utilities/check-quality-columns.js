import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkColumns() {
  const { data, error } = await supabase
    .from('towns')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error:', error);
  } else if (data && data[0]) {
    const columns = Object.keys(data[0]);
    console.log('Available quality-related columns:');
    columns.forEach(col => {
      if (col.includes('cost') || col.includes('quality') || col.includes('rating') ||
          col.includes('score') || col.includes('index') || col.includes('speed') ||
          col.includes('safety') || col.includes('climate') || col.includes('friendly')) {
        const value = data[0][col];
        const hasData = value !== null;
        console.log(`  - ${col}: ${typeof value} ${hasData ? '(has data)' : '(null)'}`);
      }
    });
  }
}

checkColumns();