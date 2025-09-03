import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
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