import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function fixMissingImages() {
  console.log('🔍 Checking for missing images...\n');
  
  // Get all towns with images
  const { data: towns, error } = await supabase
    .from('towns')
    .select('id, name, country, image_url_1')
    .not('image_url_1', 'is', null)
    .order('name');
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log(`Checking ${towns.length} towns...\n`);
  
  const missingImages = [];
  const workingImages = [];
  
  // Test each image URL
  for (const town of towns) {
    try {
      const response = await fetch(town.image_url_1);
      if (response.status === 200) {
        workingImages.push(town);
      } else {
        missingImages.push({ ...town, status: response.status });
        console.log(`❌ ${town.name}, ${town.country} - Status: ${response.status}`);
      }
    } catch (err) {
      missingImages.push({ ...town, status: 'Error' });
      console.log(`❌ ${town.name}, ${town.country} - Error: ${err.message}`);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`✅ Working images: ${workingImages.length}`);
  console.log(`❌ Missing images: ${missingImages.length}`);
  
  if (missingImages.length > 0) {
    console.log('\n🚨 Towns with missing images:');
    missingImages.forEach(t => {
      console.log(`  - ${t.name}, ${t.country}`);
      console.log(`    URL: ${t.image_url_1}`);
    });
    
    // Clear the URLs for towns with missing images
    console.log('\n🧹 Clearing URLs for towns with missing images...');
    
    for (const town of missingImages) {
      const { error: updateError } = await supabase
        .from('towns')
        .update({ 
          image_url_1: null,
          image_url_2: null,
          image_url_3: null 
        })
        .eq('id', town.id);
        
      if (!updateError) {
        console.log(`  ✅ Cleared ${town.name}`);
      } else {
        console.log(`  ❌ Error clearing ${town.name}:`, updateError);
      }
    }
  }
}

fixMissingImages();