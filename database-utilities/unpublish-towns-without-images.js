/**
 * Unpublish all towns that don't have a primary image
 * Towns without images should not be visible to users
 * Run with: node database-utilities/unpublish-towns-without-images.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function unpublishTownsWithoutImages() {
  console.log('🔍 Finding towns without images...\n');

  // Find all towns without image_url_1
  const { data: townsWithoutImages, error: fetchError } = await supabase
    .from('towns')
    .select('id, town_name, image_url_1, is_published')
    .or('image_url_1.is.null,image_url_1.eq.');

  if (fetchError) {
    console.error('❌ Error fetching towns:', fetchError);
    return;
  }

  console.log(`Found ${townsWithoutImages.length} towns without images:\n`);

  const currentlyPublished = townsWithoutImages.filter(t => t.is_published === true);

  if (currentlyPublished.length === 0) {
    console.log('✅ All towns without images are already unpublished!');
    return;
  }

  console.log(`📝 ${currentlyPublished.length} are currently published (will unpublish):`);
  currentlyPublished.forEach(t => console.log(`  - ${t.town_name}`));

  console.log(`\n🔧 Unpublishing ${currentlyPublished.length} towns...`);

  // Unpublish all towns without images
  const { error: updateError } = await supabase
    .from('towns')
    .update({
      is_published: false,
      published_at: null,
      published_by: null
    })
    .or('image_url_1.is.null,image_url_1.eq.');

  if (updateError) {
    console.error('❌ Error updating:', updateError);
    return;
  }

  console.log('\n✅ Successfully unpublished all towns without images!');
  console.log('\n📊 Summary:');
  console.log(`- Total towns without images: ${townsWithoutImages.length}`);
  console.log(`- Unpublished: ${currentlyPublished.length}`);
  console.log(`- Already unpublished: ${townsWithoutImages.length - currentlyPublished.length}`);
  console.log('\n💡 These towns will become visible once they have an image uploaded.');
}

unpublishTownsWithoutImages().then(() => process.exit(0));
