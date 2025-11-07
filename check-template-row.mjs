import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMDc5NTMsImV4cCI6MjA3MjY4Mzk1M30.-VRSBZu7cElt4LXPVT_tm3ilsuj_UojDOvOP_UVCVHs'
);

console.log('Checking for template row...');

const { data, error } = await supabase
  .from('towns')
  .select('id, town_name, audit_data')
  .eq('id', 'ffffffff-ffff-ffff-ffff-ffffffffffff')
  .single();

if (error) {
  console.log('ERROR:', error);
} else {
  console.log('FOUND:', data);
}

console.log('\nDone.');
