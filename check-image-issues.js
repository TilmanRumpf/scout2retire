import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3MDYzNDUsImV4cCI6MjA2NDI4MjM0NX0.52Jn2n8sRH5TniQ1LqvOw68YOgpRLdK8FL5_ZV2SPe4'
);

async function checkImageIssues() {
  console.log('🔍 CHECKING FOR TOWNS WITH IMAGE ISSUES\n');
  
  // Check towns with null image_url_1
  console.log('1️⃣ Towns with NULL image_url_1:');
  const { data: nullTowns } = await supabase
    .from('towns')
    .select('id, name, country, image_url_1')
    .is('image_url_1', null);
    
  console.log(`Found ${nullTowns?.length || 0} towns with NULL image_url_1`);
  if (nullTowns && nullTowns.length > 0) {
    nullTowns.slice(0, 5).forEach(town => {
      console.log(`- ${town.name}, ${town.country} (ID: ${town.id})`);
    });
  }
  
  // Check towns with empty string image_url_1
  console.log('\n2️⃣ Towns with EMPTY STRING image_url_1:');
  const { data: emptyTowns } = await supabase
    .from('towns')
    .select('id, name, country, image_url_1')
    .eq('image_url_1', '');
    
  console.log(`Found ${emptyTowns?.length || 0} towns with EMPTY STRING image_url_1`);
  if (emptyTowns && emptyTowns.length > 0) {
    emptyTowns.slice(0, 5).forEach(town => {
      console.log(`- ${town.name}, ${town.country} (ID: ${town.id})`);
    });
  }
  
  // Check for towns with broken image URLs (very short)
  console.log('\n3️⃣ Towns with suspiciously short image URLs:');
  const { data: shortUrlTowns } = await supabase
    .from('towns')
    .select('id, name, country, image_url_1')
    .not('image_url_1', 'is', null);
    
  const suspiciousUrls = shortUrlTowns?.filter(town => 
    town.image_url_1 && town.image_url_1.length < 20
  ) || [];
  
  console.log(`Found ${suspiciousUrls.length} towns with short URLs`);
  suspiciousUrls.slice(0, 5).forEach(town => {
    console.log(`- ${town.name}, ${town.country}: "${town.image_url_1}"`);
  });
  
  // Total count check
  console.log('\n4️⃣ TOTAL COUNTS:');
  const { count: allTowns } = await supabase
    .from('towns')
    .select('*', { count: 'exact', head: true });
    
  const { count: townsWithImages } = await supabase
    .from('towns')
    .select('*', { count: 'exact', head: true })
    .not('image_url_1', 'is', null);
    
  console.log(`Total towns: ${allTowns}`);
  console.log(`Towns with images: ${townsWithImages}`);
  console.log(`Towns WITHOUT images: ${allTowns - townsWithImages}`);
  
  if (allTowns - townsWithImages > 0) {
    console.log('\n❌ PROBLEM FOUND: Towns without images are in database');
    console.log('   The filter .not("image_url_1", "is", null) should catch these');
    console.log('   but check if empty strings are slipping through');
  } else {
    console.log('\n✅ All towns have image_url_1 values');
    console.log('   The issue might be elsewhere');
  }
}

checkImageIssues();