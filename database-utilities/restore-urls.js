import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3MDYzNDUsImV4cCI6MjA2NDI4MjM0NX0.52Jn2n8sRH5TniQ1LqvOw68YOgpRLdK8FL5_ZV2SPe4'
);

async function restoreUrls() {
  console.log('🔧 RESTORING the URLs I stupidly cleared...\n');
  
  // The correct URLs based on the bucket
  const updates = [
    {
      name: 'Saint-Tropez',
      url: 'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/fr-saint-tropez-depositphotos-216005330-L.jpg'
    },
    {
      name: 'Medellin',
      url: 'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/co-medellin-depositphotos-514358048-XL.jpg'
    }
  ];
  
  for (const town of updates) {
    const { error } = await supabase
      .from('towns')
      .update({ image_url_1: town.url })
      .eq('name', town.name);
      
    if (!error) {
      console.log(`✅ Restored ${town.name}`);
      console.log(`   URL: ${town.url}`);
    } else {
      console.log(`❌ Error restoring ${town.name}:`, error);
    }
  }
  
  // Test the URLs
  console.log('\n🧪 Testing restored URLs:');
  for (const town of updates) {
    try {
      const response = await fetch(town.url);
      console.log(`${town.name}: ${response.status} ${response.statusText}`);
    } catch (err) {
      console.log(`${town.name}: ERROR - ${err.message}`);
    }
  }
}

restoreUrls();