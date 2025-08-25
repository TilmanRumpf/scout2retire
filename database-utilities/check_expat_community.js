import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function getExpatCommunityValues() {
  const { data, error } = await supabase
    .from('towns')
    .select('expat_community_size')
    .not('expat_community_size', 'is', null);
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  // Get unique values
  const uniqueValues = [...new Set(data.map(row => row.expat_community_size))];
  
  console.log('Unique values in expat_community_size:');
  uniqueValues.forEach(value => {
    const count = data.filter(row => row.expat_community_size === value).length;
    console.log(`  "${value}" - ${count} towns`);
  });
}

getExpatCommunityValues();