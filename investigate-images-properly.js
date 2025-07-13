import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3MDYzNDUsImV4cCI6MjA2NDI4MjM0NX0.52Jn2n8sRH5TniQ1LqvOw68YOgpRLdK8FL5_ZV2SPe4'
);

async function investigate() {
  console.log('🔍 PROPER INVESTIGATION of St Tropez and Medellin\n');
  
  // 1. Check what I just cleared
  console.log('1️⃣ What did I just clear?');
  const { data: clearedTowns } = await supabase
    .from('towns')
    .select('*')
    .or('name.eq.Saint-Tropez,name.eq.Medellin,name.ilike.%tropez%,name.ilike.%medellin%');
    
  clearedTowns?.forEach(t => {
    console.log(`\n${t.name}, ${t.country}`);
    console.log(`  ID: ${t.id}`);
    console.log(`  Image 1: ${t.image_url_1 || 'NULL (CLEARED)'}`);
    console.log(`  Image 2: ${t.image_url_2 || 'NULL'}`);
    console.log(`  Image 3: ${t.image_url_3 || 'NULL'}`);
  });
  
  // 2. Check bucket more carefully
  console.log('\n2️⃣ Checking storage bucket with different search patterns:');
  
  const searchTerms = [
    'tropez', 'st-tropez', 'saint-tropez', 'Saint-Tropez',
    'medellin', 'Medellin', 'medellín', 'Medellín', 
    'colombia', 'Colombia', 'france', 'France'
  ];
  
  for (const term of searchTerms) {
    const { data: files } = await supabase
      .storage
      .from('town-images')
      .list('', {
        limit: 100,
        search: term
      });
      
    if (files && files.length > 0) {
      console.log(`\nFound files matching "${term}":`);
      files.forEach(f => {
        console.log(`  - ${f.name}`);
      });
    }
  }
  
  // 3. Check if images exist with country prefixes
  console.log('\n3️⃣ Testing various URL patterns:');
  const urlTests = [
    'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/fr-saint-tropez.jpg',
    'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/fr-st-tropez.jpg',
    'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/co-medellin.jpg',
    'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/col-medellin.jpg',
    // Original URLs without double slash
    'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/St-Tropez-Depositphotos-216005330-L.jpg',
    'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/Medellin-Depositphotos-514358048-XL.jpg'
  ];
  
  for (const url of urlTests) {
    try {
      const response = await fetch(url);
      console.log(`${response.status} - ${url}`);
    } catch (err) {
      console.log(`ERROR - ${url}`);
    }
  }
  
  // 4. List ALL files in bucket to see what's actually there
  console.log('\n4️⃣ Listing ALL files in bucket:');
  const { data: allFiles, error } = await supabase
    .storage
    .from('town-images')
    .list('', { limit: 1000 });
    
  if (error) {
    console.log('Error listing files:', error);
  } else if (allFiles) {
    console.log(`\nTotal files in bucket: ${allFiles.length}`);
    
    // Filter for relevant files
    const relevant = allFiles.filter(f => 
      f.name.toLowerCase().includes('tropez') ||
      f.name.toLowerCase().includes('medellin') ||
      f.name.toLowerCase().includes('fr-') ||
      f.name.toLowerCase().includes('co-')
    );
    
    if (relevant.length > 0) {
      console.log('\nRelevant files found:');
      relevant.forEach(f => {
        console.log(`  - ${f.name}`);
        console.log(`    Full URL: https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/${f.name}`);
      });
    } else {
      console.log('\nNo files found containing tropez, medellin, fr-, or co-');
    }
  }
}

investigate();