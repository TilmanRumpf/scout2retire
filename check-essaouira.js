import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3MDYzNDUsImV4cCI6MjA2NDI4MjM0NX0.52Jn2n8sRH5TniQ1LqvOw68YOgpRLdK8FL5_ZV2SPe4'
);

async function checkEssaouira() {
  console.log('🔍 CHECKING ESSAOUIRA IMAGE DATA\n');
  
  // Find Essaouira
  const { data: towns } = await supabase
    .from('towns')
    .select('*')
    .ilike('name', '%essaouira%');
    
  if (!towns || towns.length === 0) {
    console.log('❌ Essaouira not found in database');
    return;
  }
  
  towns.forEach(town => {
    console.log(`Town: ${town.name}, ${town.country}`);
    console.log(`ID: ${town.id}`);
    console.log(`image_url_1: ${town.image_url_1}`);
    console.log(`Is NULL: ${town.image_url_1 === null}`);
    console.log(`Is empty string: ${town.image_url_1 === ''}`);
    console.log(`Length: ${town.image_url_1 ? town.image_url_1.length : 'N/A'}`);
    console.log('---');
  });
  
  // Check if it would be filtered
  const { data: filtered } = await supabase
    .from('towns')
    .select('*')
    .ilike('name', '%essaouira%')
    .not('image_url_1', 'is', null)
    .not('image_url_1', 'eq', '');
    
  console.log(`\nWould be shown with current filters: ${filtered && filtered.length > 0 ? 'YES' : 'NO'}`);
  
  if (filtered && filtered.length > 0) {
    console.log('⚠️  ESSAOUIRA HAS AN IMAGE URL AND PASSES THE FILTERS');
    console.log('   But the image might be broken or incorrect');
  }
}

checkEssaouira();