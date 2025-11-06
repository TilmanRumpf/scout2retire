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
    // First, let's check all towns with double slashes
    const { data: townsWithIssue, error: fetchError } = await supabase
      .from('towns')
      .select('id, town_name, country, image_url_1, image_url_2, image_url_3')
      .or('image_url_1.like.%//%,image_url_2.like.%//%,image_url_3.like.%//%');
    
    if (fetchError) throw fetchError;
    
    console.log(`Found ${townsWithIssue.length} towns with double slash issues:\n`);
    
    // Show which towns have the issue
    townsWithIssue.forEach(town => {
      console.log(`- ${town.town_name}, ${town.country}`);
      if (town.image_url_1?.includes('//')) console.log(`  URL 1: ${town.image_url_1}`);
      if (town.image_url_2?.includes('//')) console.log(`  URL 2: ${town.image_url_2}`);
      if (town.image_url_3?.includes('//')) console.log(`  URL 3: ${town.image_url_3}`);
    });
    
    console.log('\n🔄 Fixing URLs...\n');
    
    // Fix each town
    for (const town of townsWithIssue) {
      const updates = {};
      
      // Fix each URL field
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
          console.error(`❌ Failed to update ${town.town_name}:`, updateError);
        } else {
          console.log(`✅ Fixed ${town.town_name}, ${town.country}`);
          Object.entries(updates).forEach(([key, value]) => {
            console.log(`   ${key}: ${value}`);
          });
        }
      }
    }
    
    // Verify the specific towns mentioned
    console.log('\n📋 Verifying St Tropez and Medellin specifically...\n');
    
    const { data: verifyTowns, error: verifyError } = await supabase
      .from('towns')
      .select('town_name, country, image_url_1')
      .or('name.eq.Saint-Tropez,name.eq.Medellin,name.eq.St Tropez');
    
    if (!verifyError && verifyTowns) {
      verifyTowns.forEach(town => {
        console.log(`${town.town_name}, ${town.country}:`);
        console.log(`  URL: ${town.image_url_1}`);
        console.log(`  Status: ${town.image_url_1?.includes('//') ? '❌ Still has double slash' : '✅ Fixed'}`);
      });
    }
    
    console.log('\n✅ URL fixing complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixImageUrls();