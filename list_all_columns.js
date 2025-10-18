import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function listColumns() {
  const response = await supabase
    .from('towns')
    .select('*')
    .limit(1);
  
  const columns = Object.keys(response.data[0]).sort();
  
  console.log('=== ALL COLUMNS IN TOWNS TABLE (' + columns.length + ' total) ===\n');
  columns.forEach((col, i) => {
    console.log((i + 1) + '. ' + col);
  });
}

listColumns();
