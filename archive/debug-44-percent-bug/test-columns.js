import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.VITE_SUPABASE_ANON_KEY'
);

async function getColumns() {
  const { data, error } = await supabase
    .from('towns')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  if (data && data.length > 0) {
    console.log('Available columns in towns table:');
    console.log('=====================================');
    Object.keys(data[0]).forEach(col => {
      const value = data[0][col];
      const type = value === null ? 'null' : typeof value;
      console.log(`${col}: ${type}`);
    });
  }
}

getColumns();