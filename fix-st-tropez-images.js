import { createClient } from '@supabase/supabase-js';

// Hardcode the values temporarily
const supabaseUrl = 'https://axlruvvsjepsulcbqlho.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.1LGk_ib8U3b7mqMmmc5aLdW4DNa5pbG6xXMFqSuPESI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixUrls() {
  console.log('Fixing image URLs...\n');
  
  // Get towns with double slashes
  const { data: towns, error } = await supabase
    .from('towns')
    .select('id, name, country, image_url_1')
    .or('image_url_1.like.%//%,image_url_2.like.%//%,image_url_3.like.%//%');
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log(`Found ${towns.length} towns to fix:\n`);
  
  for (const town of towns) {
    if (town.image_url_1?.includes('//')) {
      const fixed = town.image_url_1.replace('//', '/');
      
      const { error: updateError } = await supabase
        .from('towns')
        .update({ image_url_1: fixed })
        .eq('id', town.id);
        
      if (!updateError) {
        console.log(`✅ Fixed ${town.name}, ${town.country}`);
      } else {
        console.error(`Error fixing ${town.name}:`, updateError);
      }
    }
  }
  
  console.log('\nDone! St Tropez should now show images.');
}

fixUrls();