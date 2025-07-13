import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '../.env') });

// Use service role key to bypass RLS
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function fixImageUrls() {
  console.log('🔧 Fixing image URLs with double slashes...\n');
  
  try {
    // Get all towns with double slash issues
    const { data: towns, error: fetchError } = await supabase
      .from('towns')
      .select('id, name, country, image_url_1, image_url_2, image_url_3')
      .or('image_url_1.like.%town-images//%,image_url_2.like.%town-images//%,image_url_3.like.%town-images//%');
    
    if (fetchError) throw fetchError;
    
    console.log(`Found ${towns.length} towns to fix:\n`);
    
    // Fix each town
    for (const town of towns) {
      const updates = {};
      
      if (town.image_url_1?.includes('town-images//')) {
        updates.image_url_1 = town.image_url_1.replace('town-images//', 'town-images/');
      }
      if (town.image_url_2?.includes('town-images//')) {
        updates.image_url_2 = town.image_url_2.replace('town-images//', 'town-images/');
      }
      if (town.image_url_3?.includes('town-images//')) {
        updates.image_url_3 = town.image_url_3.replace('town-images//', 'town-images/');
      }
      
      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
          .from('towns')
          .update(updates)
          .eq('id', town.id);
        
        if (updateError) {
          console.error(`❌ Failed to update ${town.name}:`, updateError);
        } else {
          console.log(`✅ Fixed ${town.name}, ${town.country}`);
          if (updates.image_url_1) {
            console.log(`   New URL: ${updates.image_url_1}`);
          }
        }
      }
    }
    
    console.log('\n✅ All image URLs fixed!');
    console.log('\nSt Tropez and Medellin images should now display correctly.');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

fixImageUrls();