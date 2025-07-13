import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxNzEzMDYxNSwiZXhwIjoyMDMyNzA2NjE1fQ.E53vBWehfcXl1PbWjVKgYuQd0_8DfSUzFHYaF1GKJXY'
);

async function fixImageUrls() {
  console.log('Fixing St Tropez and other image URLs...\n');
  
  // Get towns with double slashes
  const { data: towns, error } = await supabase
    .from('towns')
    .select('id, name, country, image_url_1')
    .like('image_url_1', '%town-images//%');
    
  if (error) {
    console.error('Error fetching:', error);
    return;
  }
  
  console.log(`Found ${towns.length} towns with double slashes\n`);
  
  // Fix each one
  for (const town of towns) {
    const fixedUrl = town.image_url_1.replace('town-images//', 'town-images/');
    
    const { error: updateError } = await supabase
      .from('towns')
      .update({ image_url_1: fixedUrl })
      .eq('id', town.id);
      
    if (updateError) {
      console.error(`Error updating ${town.name}:`, updateError);
    } else {
      console.log(`✅ Fixed ${town.name}, ${town.country}`);
      console.log(`   ${fixedUrl}\n`);
    }
  }
  
  console.log('Done! St Tropez and Medellin should now display images.');
  process.exit(0);
}

fixImageUrls();