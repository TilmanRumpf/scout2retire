import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3MDYzNDUsImV4cCI6MjA2NDI4MjM0NX0.52Jn2n8sRH5TniQ1LqvOw68YOgpRLdK8FL5_ZV2SPe4'
);

async function fixMedellin() {
  console.log('🔧 Fixing Medellin with the CORRECT filename...\n');
  
  const correctUrl = 'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/mx-medellin-depositphotos-514358048-XL.jpg';
  
  const { error } = await supabase
    .from('towns')
    .update({ image_url_1: correctUrl })
    .eq('name', 'Medellin');
    
  if (!error) {
    console.log('✅ Fixed Medellin');
    console.log(`   URL: ${correctUrl}`);
    console.log('   (Yes, it has mx- prefix even though Medellin is in Colombia)');
  } else {
    console.log('❌ Error:', error);
  }
  
  // Test it
  const response = await fetch(correctUrl);
  console.log(`\n🧪 Test: ${response.status} ${response.statusText}`);
  
  if (response.status === 200) {
    console.log('\n✅ SUCCESS! Both St Tropez and Medellin should now display images!');
  }
}

fixMedellin();