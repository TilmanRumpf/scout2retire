import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMDc5NTMsImV4cCI6MjA3MjY4Mzk1M30.-VRSBZu7cElt4LXPVT_tm3ilsuj_UojDOvOP_UVCVHs'
);

console.log('Checking if there are ANY towns...\n');

const { data, error, count } = await supabase
  .from('towns')
  .select('id, town_name, country, region', { count: 'exact' })
  .limit(10);

if (error) {
  console.log('ERROR:', error);
} else {
  console.log('Total towns count:', count);
  console.log('\nFirst 10 towns:');
  data.forEach(town => {
    console.log('  -', town.town_name, ',', town.region || '(no region)', ',', town.country);
  });
}
