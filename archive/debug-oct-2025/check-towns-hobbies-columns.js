import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function checkColumns() {
  console.log('Checking towns_hobbies table columns...\n');
  
  // Get a sample row to see columns
  const { data, error } = await supabase
    .from('towns_hobbies')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  if (data && data.length > 0) {
    console.log('Current columns in towns_hobbies:');
    console.log(Object.keys(data[0]));
  } else {
    console.log('Table is empty, checking structure anyway...');
    // Insert a dummy row to see structure
    const { data: test, error: testError } = await supabase
      .from('towns_hobbies')
      .insert({ town_id: 1, hobby_id: 'test' })
      .select();
    
    if (test && test.length > 0) {
      console.log('Columns available:', Object.keys(test[0]));
      // Delete the test row
      await supabase.from('towns_hobbies').delete().eq('hobby_id', 'test');
    }
  }
}

checkColumns().catch(console.error);