import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function checkStructure() {
  // First check table structure
  const { data: columns, error: colError } = await supabase
    .rpc('query', { 
      query_text: `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'onboarding_responses'
        ORDER BY ordinal_position
      ` 
    });

  if (!colError) {
    console.log('📋 onboarding_responses table structure:');
    console.log(columns);
  }

  // Get sample data
  const { data: responses, error } = await supabase
    .from('onboarding_responses')
    .select('*')
    .limit(5);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('\n📄 Sample records:');
  console.log(JSON.stringify(responses, null, 2));
}

checkStructure().catch(console.error);