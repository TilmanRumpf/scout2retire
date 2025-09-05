import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function addNotesColumn() {
  console.log('Adding notes column to towns_hobbies table...');
  
  const { data, error } = await supabase.rpc('exec_sql', {
    query: 'ALTER TABLE towns_hobbies ADD COLUMN IF NOT EXISTS notes TEXT;'
  });
  
  if (error) {
    // Try alternative approach
    console.log('RPC failed, trying alternative...');
    
    // Check if column already exists
    const { data: cols, error: colError } = await supabase
      .from('towns_hobbies')
      .select('*')
      .limit(1);
    
    if (cols && cols[0] && 'notes' in cols[0]) {
      console.log('✅ Notes column already exists!');
    } else {
      console.log('❌ Cannot add column programmatically. Please run this SQL manually:');
      console.log('ALTER TABLE towns_hobbies ADD COLUMN IF NOT EXISTS notes TEXT;');
    }
  } else {
    console.log('✅ Notes column added successfully!');
  }
}

addNotesColumn().catch(console.error);