import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

console.log('Testing database connection...\n');

try {
  // Simple count query
  const { data, error, count } = await supabase
    .from('towns')
    .select('*', { count: 'exact', head: true });
  
  if (error) {
    console.error('Database error:', error);
  } else {
    console.log(`Total towns in database: ${count}`);
  }
  
  // Get a few towns
  const { data: sampleTowns, error: sampleError } = await supabase
    .from('towns')
    .select('name, country')
    .limit(5);
  
  if (sampleError) {
    console.error('Sample query error:', sampleError);
  } else {
    console.log('\nSample towns:');
    sampleTowns?.forEach(t => console.log(`- ${t.name}, ${t.country}`));
  }
  
} catch (err) {
  console.error('Unexpected error:', err);
}

process.exit(0);