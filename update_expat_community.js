import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function updateExpatCommunity() {
  console.log('Updating expat_community_size: "medium" → "moderate"...\n');
  
  // Update all "medium" values to "moderate"
  const { data, error } = await supabase
    .from('towns')
    .update({ expat_community_size: 'moderate' })
    .eq('expat_community_size', 'medium');
  
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  console.log('✅ Update successful');
  
  // Verify the changes
  const { data: verifyData, error: verifyError } = await supabase
    .from('towns')
    .select('expat_community_size')
    .not('expat_community_size', 'is', null);
  
  if (!verifyError) {
    const uniqueValues = [...new Set(verifyData.map(row => row.expat_community_size))];
    console.log('\nNew distribution:');
    uniqueValues.forEach(value => {
      const count = verifyData.filter(row => row.expat_community_size === value).length;
      console.log(`  "${value}" - ${count} towns`);
    });
  }
}

updateExpatCommunity();