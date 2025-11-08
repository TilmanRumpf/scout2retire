#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testTrigger() {
  console.log('Testing trigger functionality...\n');
  
  // Get a test image
  const { data: testImage, error: fetchError } = await supabase
    .from('town_images')
    .select('id, town_id, image_url, display_order')
    .eq('display_order', 1)
    .limit(1)
    .single();

  if (fetchError || !testImage) {
    console.log('❌ No test image found');
    return;
  }

  console.log(`Test image: ${testImage.id}`);
  console.log(`Town: ${testImage.town_id}`);
  console.log(`Original URL: ${testImage.image_url}\n`);

  const testUrl = `https://trigger-test-${Date.now()}.jpg`;
  
  // Update image
  const { error: updateError } = await supabase
    .from('town_images')
    .update({ image_url: testUrl })
    .eq('id', testImage.id);

  if (updateError) {
    console.log('❌ Update FAILED:', updateError.message);
    console.log('\nThis error suggests the trigger function has a bug.');
    console.log('The error mentions "new" has no field "name"');
    console.log('This indicates the trigger is trying to access NEW.name which doesn\'t exist.');
    return;
  }

  console.log('✅ Update succeeded\n');
  
  // Wait for trigger
  await new Promise(r => setTimeout(r, 1500));
  
  // Check cache
  const { data: town } = await supabase
    .from('towns')
    .select('image_url_1')
    .eq('id', testImage.town_id)
    .single();

  console.log(`Cache after update: ${town.image_url_1}`);
  
  if (town.image_url_1 === testUrl) {
    console.log('✅ TRIGGER WORKING - Cache updated correctly!\n');
  } else {
    console.log('❌ TRIGGER NOT WORKING - Cache not updated\n');
  }

  // Restore original
  console.log('Restoring original URL...');
  await supabase
    .from('town_images')
    .update({ image_url: testImage.image_url })
    .eq('id', testImage.id);
  
  console.log('✅ Restored');
}

testTrigger().catch(console.error);
