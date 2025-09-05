import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.VITE_SUPABASE_ANON_KEY'
);

async function finalFix() {
  console.log('🔧 FINAL FIX - Testing all possible combinations\n');
  
  // All possible URLs based on what you told me exists
  const urlsToTest = [
    // Medellin variants
    'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/co-medellin-depositphotos-514358048-XL.jpg',
    'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/mx-medellin-depositphotos-514358048-XL.jpg', // you said this exists
    'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/Medellin-Depositphotos-514358048-XL.jpg',
    'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/medellin-depositphotos-514358048-XL.jpg',
    
    // St Tropez variants
    'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/fr-saint-tropez-depositphotos-216005330-L.jpg',
    'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/fr-st-tropez-depositphotos-216005330-L.jpg',
    'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/St-Tropez-Depositphotos-216005330-L.jpg',
    'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/saint-tropez-depositphotos-216005330-L.jpg'
  ];
  
  console.log('Testing all URL combinations:\n');
  
  const workingUrls = [];
  
  for (const url of urlsToTest) {
    try {
      const response = await fetch(url);
      const status = `${response.status} ${response.statusText}`;
      console.log(`${status} - ${url}`);
      
      if (response.status === 200) {
        workingUrls.push(url);
      }
    } catch (err) {
      console.log(`ERROR - ${url}`);
    }
  }
  
  console.log(`\n✅ Found ${workingUrls.length} working URLs:\n`);
  
  workingUrls.forEach(url => {
    console.log(`✅ ${url}`);
  });
  
  // Now update database with working URLs
  if (workingUrls.length > 0) {
    console.log('\n🔧 Updating database with working URLs...\n');
    
    for (const url of workingUrls) {
      if (url.includes('medellin')) {
        const { error } = await supabase
          .from('towns')
          .update({ image_url_1: url })
          .eq('name', 'Medellin');
          
        if (!error) {
          console.log(`✅ Updated Medellin: ${url}`);
        }
      }
      
      if (url.includes('tropez') || url.includes('saint')) {
        const { error } = await supabase
          .from('towns')
          .update({ image_url_1: url })
          .eq('name', 'Saint-Tropez');
          
        if (!error) {
          console.log(`✅ Updated St Tropez: ${url}`);
        }
      }
    }
  }
  
  console.log('\n🎉 FINAL FIX COMPLETE!');
}

finalFix();