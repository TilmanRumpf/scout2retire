import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkAllBuckets() {
  console.log('🔍 Checking all storage buckets...\n');
  
  try {
    // List all buckets
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
      
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
    } else if (buckets) {
      console.log('Available buckets:');
      buckets.forEach(b => {
        console.log(`  - ${b.name} (${b.public ? 'public' : 'private'})`);
      });
    }
    
    // Try different variations
    const bucketNames = ['town-images', 'townimages', 'town_images', 'images'];
    
    for (const bucketName of bucketNames) {
      console.log(`\nChecking bucket: ${bucketName}`);
      
      const { data: files, error } = await supabase
        .storage
        .from(bucketName)
        .list('', { limit: 5 });
        
      if (error) {
        console.log(`  ❌ Error: ${error.message}`);
      } else if (files && files.length > 0) {
        console.log(`  ✅ Found ${files.length} files`);
        files.slice(0, 3).forEach(f => {
          console.log(`     - ${f.name}`);
        });
      } else {
        console.log(`  📁 Empty or not accessible`);
      }
    }
    
    // Check a known working image
    console.log('\n🖼️ Checking a known working town (Porto):');
    const { data: porto } = await supabase
      .from('towns')
      .select('name, image_url_1')
      .eq('name', 'Porto')
      .single();
      
    if (porto) {
      console.log(`Porto URL: ${porto.image_url_1}`);
      
      // Test if Porto image loads
      const portoUrl = porto.image_url_1;
      const response = await fetch(portoUrl);
      console.log(`Porto image status: ${response.status} ${response.statusText}`);
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkAllBuckets();