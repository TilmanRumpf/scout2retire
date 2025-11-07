import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMDc5NTMsImV4cCI6MjA3MjY4Mzk1M30.-VRSBZu7cElt4LXPVT_tm3ilsuj_UojDOvOP_UVCVHs'
);

console.log('Simple town count check...\n');

// Try a super simple query
const { data, error, count } = await supabase
  .from('towns')
  .select('id, town_name, quality_of_life', { count: 'exact' })
  .limit(5);

if (error) {
  console.log('ERROR:', error);
} else {
  console.log('Total count:', count);
  console.log('\nSample towns:');
  data?.forEach(town => {
    console.log(`  - ${town.town_name}: quality_of_life = ${town.quality_of_life}`);
  });
}
