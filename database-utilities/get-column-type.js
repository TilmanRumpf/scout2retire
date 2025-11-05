import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getColumnInfo() {
  const { data: columns, error } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type, column_default')
    .eq('table_name', 'towns')
    .like('column_name', '%cultural_events%');

  if (error) {
    console.log('Error:', error.message);

    // Try getting all column info
    const { data: allCols, error: err2 } = await supabase
      .rpc('get_column_info', { table_name_param: 'towns' });

    if (err2) {
      console.log('RPC also failed:', err2.message);
      console.log('\nLet me try to just INSERT the value directly...\n');
    } else {
      console.log('Columns:', JSON.stringify(allCols, null, 2));
    }
  } else {
    console.log('cultural_events column info:');
    console.log(JSON.stringify(columns, null, 2));
  }
}

getColumnInfo();
