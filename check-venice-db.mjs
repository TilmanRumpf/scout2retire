import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMDc5NTMsImV4cCI6MjA3MjY4Mzk1M30.-VRSBZu7cElt4LXPVT_tm3ilsuj_UojDOvOP_UVCVHs'
);

console.log('Searching for any town with "venice" in ANY field...\n');

// First, try searching by town_name
const { data: towns1, error: error1 } = await supabase
  .from('towns')
  .select('id, town_name, country, state_code, image_url_1, overall_score')
  .ilike('town_name', '%venice%');

console.log(`Search by town_name: Found ${towns1?.length || 0} results`);

// Also search by the 'name' field in case it exists
const { data: towns2, error: error2 } = await supabase
  .from('towns')
  .select('id, town_name, name, country, state_code, image_url_1, overall_score')
  .or('town_name.ilike.%venice%,name.ilike.%venice%');

console.log(`Search by town_name OR name: Found ${towns2?.length || 0} results\n`);

const towns = towns2 || towns1 || [];
const error = error2 || error1;

if (error) {
  console.error('Error:', error);
} else {
  console.log(`Total towns with "venice" found: ${towns.length}\n`);

  towns.forEach((town, i) => {
    console.log(`\n=== TOWN ${i + 1} ===`);
    console.log('ID:', town.id);
    console.log('town_name:', town.town_name || 'NULL');
    console.log('name (if exists):', town.name || 'N/A');
    console.log('Country:', town.country);
    console.log('State:', town.state_code);
    console.log('Image URL 1:', town.image_url_1 || '❌ NO PHOTO');
    console.log('Overall Score:', town.overall_score);
    console.log('');
    console.log('📸 HAS PHOTO:', !!town.image_url_1 ? '✅ YES' : '❌ NO');
  });
}

console.log('\n\nDone.');
