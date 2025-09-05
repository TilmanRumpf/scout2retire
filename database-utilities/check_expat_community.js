import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
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